"""Travel route planning: distance, pace, cost, k-shortest paths by travel time."""

from __future__ import annotations

import json
import math

import networkx as nx
from sqlmodel import Session, select

from app.models.waypoint import MapScale, RouteSegment, RouteTipo, Waypoint
from app.schemas.routes import Point, RoutePlanItem

HORAS_POR_DIA: dict[str, float] = {
    "normal": 6.0,
    "intenso": 8.0,
}

TIPO_MOD: dict[RouteTipo, float] = {
    RouteTipo.estrada: 1.0,
    RouteTipo.rio: 1.4,
    RouteTipo.trilha: 0.8,
}

# Absolute mi/h when velocidade_media_mph is omitted (table mode)
ABS_SPEED_MPH: dict[RouteTipo, float] = {
    RouteTipo.estrada: 6.0,
    RouteTipo.rio: 8.0,
    RouteTipo.trilha: 4.8,  # 6 × 0.8
}

# bp per mile (Dentro / Fora); trilha = unpaid
CUSTO_BP_POR_MILHA: dict[RouteTipo, tuple[float, float]] = {
    RouteTipo.estrada: (2.0, 1.0),
    RouteTipo.rio: (5.0, 2.0),
    RouteTipo.trilha: (0.0, 0.0),
}

K_MAX = 5


def parse_pontos(raw: str) -> list[Point]:
    try:
        data = json.loads(raw or "[]")
    except json.JSONDecodeError:
        return []
    out: list[Point] = []
    for p in data:
        if isinstance(p, dict) and "x" in p and "y" in p:
            out.append(Point(x=float(p["x"]), y=float(p["y"])))
    return out


def dump_pontos(pontos: list[Point]) -> str:
    return json.dumps([{"x": p.x, "y": p.y} for p in pontos])


def polyline_map_units(points: list[tuple[float, float]]) -> float:
    if len(points) < 2:
        return 0.0
    total = 0.0
    for i in range(1, len(points)):
        dx = points[i][0] - points[i - 1][0]
        dy = points[i][1] - points[i - 1][1]
        total += math.hypot(dx, dy)
    return total


def segment_points(a: Waypoint, b: Waypoint, mid: list[Point]) -> list[tuple[float, float]]:
    return [(a.x, a.y), *[(p.x, p.y) for p in mid], (b.x, b.y)]


def compute_distancia_milhas(
    a: Waypoint,
    b: Waypoint,
    mid: list[Point],
    miles_per_map_unit: float,
) -> float:
    units = polyline_map_units(segment_points(a, b, mid))
    return round(units * miles_per_map_unit, 4)


def get_or_create_scale(session: Session) -> MapScale:
    scale = session.get(MapScale, 1)
    if scale is None:
        scale = MapScale(id=1, miles_per_map_unit=100.0, notas="Default seed scale")
        session.add(scale)
        session.commit()
        session.refresh(scale)
    return scale


def edge_mod(seg: RouteSegment) -> float:
    if seg.modificador_velocidade is not None:
        return float(seg.modificador_velocidade)
    return TIPO_MOD.get(seg.tipo, 1.0)


def segment_speed(seg: RouteSegment, velocidade_media_mph: float | None) -> float:
    """Table mode (None): baseline 6 × edge_mod (= 6/8/4.8). Override (V): V × edge_mod."""
    if velocidade_media_mph is not None and velocidade_media_mph <= 0:
        raise ValueError("velocidade_media_mph deve ser > 0")
    base = ABS_SPEED_MPH[RouteTipo.estrada] if velocidade_media_mph is None else velocidade_media_mph
    return base * edge_mod(seg)


def segment_cost_bp(tipo: RouteTipo | str, distancia_milhas: float) -> tuple[float, float]:
    if isinstance(tipo, str):
        try:
            tipo = RouteTipo(tipo)
        except ValueError:
            return 0.0, 0.0
    dentro_rate, fora_rate = CUSTO_BP_POR_MILHA.get(tipo, (0.0, 0.0))
    return distancia_milhas * dentro_rate, distancia_milhas * fora_rate


def format_tempo_texto(tempo_horas: float, horas_por_dia: float) -> tuple[int, float, str]:
    if tempo_horas < 0:
        tempo_horas = 0.0
    if horas_por_dia <= 0:
        horas_por_dia = 6.0
    dias = int(math.floor(tempo_horas / horas_por_dia + 1e-9))
    resto = round(tempo_horas - dias * horas_por_dia, 2)
    if resto < 0:
        resto = 0.0
    # Absorb floating dust into a full day
    if resto >= horas_por_dia - 1e-6:
        dias += 1
        resto = 0.0

    parts: list[str] = []
    if dias > 0:
        parts.append(f"{dias} dia" if dias == 1 else f"{dias} dias")
    if resto > 1e-6 or dias == 0:
        # Show hours; use int when whole
        if abs(resto - round(resto)) < 1e-6:
            h = int(round(resto))
            parts.append(f"{h} h")
        else:
            parts.append(f"{resto:g} h")
    texto = " e ".join(parts) if parts else "0 h"
    return dias, resto, texto


def build_graph(
    session: Session,
    velocidade_media_mph: float | None,
) -> tuple[nx.Graph, dict[int, Waypoint], dict[int, RouteSegment], dict[tuple[int, int], list[dict]]]:
    """Simple Graph for k-shortest (min tempo per pair) + parallel edge lists for variants."""
    if velocidade_media_mph is not None and velocidade_media_mph <= 0:
        raise ValueError("velocidade_media_mph deve ser > 0")

    waypoints = {w.id: w for w in session.exec(select(Waypoint)).all() if w.id is not None}
    segments = list(session.exec(select(RouteSegment)).all())
    g: nx.Graph = nx.Graph()
    g.add_nodes_from(waypoints.keys())
    by_id: dict[int, RouteSegment] = {}
    parallels: dict[tuple[int, int], list[dict]] = {}

    for seg in segments:
        if seg.id is None:
            continue
        a, b = seg.waypoint_a_id, seg.waypoint_b_id
        if a not in waypoints or b not in waypoints:
            continue
        speed = segment_speed(seg, velocidade_media_mph)
        tempo = seg.distancia_milhas / speed if speed > 0 else float("inf")
        custo_d, custo_f = segment_cost_bp(seg.tipo, seg.distancia_milhas)
        attrs = {
            "tempo": tempo,
            "distancia": seg.distancia_milhas,
            "tipo": seg.tipo.value,
            "seg_id": seg.id,
            "custo_dentro_bp": custo_d,
            "custo_fora_bp": custo_f,
        }
        by_id[seg.id] = seg
        key = (min(a, b), max(a, b))
        parallels.setdefault(key, []).append(attrs)

    for (u, v), edges in parallels.items():
        edges.sort(key=lambda d: float(d["tempo"]))
        best = edges[0]
        g.add_edge(
            u,
            v,
            tempo=best["tempo"],
            distancia=best["distancia"],
            tipo=best["tipo"],
            seg_id=best["seg_id"],
            custo_dentro_bp=best["custo_dentro_bp"],
            custo_fora_bp=best["custo_fora_bp"],
        )

    return g, waypoints, by_id, parallels


def hops_for_pair(parallels: dict[tuple[int, int], list[dict]], u: int, v: int) -> list[dict]:
    key = (min(u, v), max(u, v))
    hops = list(parallels.get(key, []))
    hops.sort(key=lambda d: float(d["tempo"]))
    return hops


def edge_variants_for_path(
    parallels: dict[tuple[int, int], list[dict]],
    path: list[int],
) -> list[list[dict]]:
    """Primary = min tempo per hop; plus single-hop swaps to slower parallel edges."""
    if len(path) < 2:
        return []
    hop_opts = [hops_for_pair(parallels, path[i], path[i + 1]) for i in range(len(path) - 1)]
    if any(not opts for opts in hop_opts):
        return []
    primary = [opts[0] for opts in hop_opts]
    variants: list[list[dict]] = [primary]
    for i, opts in enumerate(hop_opts):
        for alt in opts[1:]:
            swapped = list(primary)
            swapped[i] = alt
            variants.append(swapped)
    return variants


def geometry_for_edges(
    path: list[int],
    edge_attrs: list[dict],
    waypoints: dict[int, Waypoint],
    by_id: dict[int, RouteSegment],
) -> list[Point]:
    if not path:
        return []
    geom: list[Point] = []
    for i, wid in enumerate(path):
        w = waypoints[wid]
        if i == 0:
            geom.append(Point(x=w.x, y=w.y))
            continue
        prev = path[i - 1]
        attrs = edge_attrs[i - 1]
        seg = by_id.get(int(attrs["seg_id"]))
        mid = parse_pontos(seg.pontos_intermediarios) if seg else []
        if seg and seg.waypoint_a_id != prev:
            mid = list(reversed(mid))
        for p in mid:
            geom.append(p)
        geom.append(Point(x=w.x, y=w.y))
    return geom


def item_from_edges(
    path: list[int],
    edge_attrs: list[dict],
    waypoints: dict[int, Waypoint],
    by_id: dict[int, RouteSegment],
    horas_por_dia: float,
) -> RoutePlanItem:
    dist = 0.0
    tempo = 0.0
    custo_dentro = 0.0
    custo_fora = 0.0
    tipos: list[str] = []
    for data in edge_attrs:
        dist += float(data["distancia"])
        tempo += float(data["tempo"])
        custo_dentro += float(data.get("custo_dentro_bp", 0.0))
        custo_fora += float(data.get("custo_fora_bp", 0.0))
        t = str(data["tipo"])
        if t not in tipos:
            tipos.append(t)
    dias, resto, texto = format_tempo_texto(tempo, horas_por_dia)
    return RoutePlanItem(
        waypoint_ids=path,
        distancia_milhas=round(dist, 2),
        tempo_horas=round(tempo, 2),
        tempo_dias=dias,
        tempo_horas_resto=resto,
        tempo_texto=texto,
        tipos=tipos,
        geometria=geometry_for_edges(path, edge_attrs, waypoints, by_id),
        custo_dentro_bp=round(custo_dentro, 2),
        custo_fora_bp=round(custo_fora, 2),
    )


def plan_routes(
    session: Session,
    origem_waypoint_id: int,
    destino_waypoint_id: int,
    ritmo: str,
    velocidade_media_mph: float | None = None,
    k: int = K_MAX,
) -> list[RoutePlanItem]:
    horas_por_dia = HORAS_POR_DIA.get(ritmo)
    if horas_por_dia is None:
        raise ValueError(f"Ritmo inválido: {ritmo}")

    g, waypoints, by_id, parallels = build_graph(session, velocidade_media_mph)
    if origem_waypoint_id not in g or destino_waypoint_id not in g:
        return []
    if origem_waypoint_id == destino_waypoint_id:
        return []

    candidates: list[RoutePlanItem] = []
    seen: set[tuple[int, ...]] = set()

    try:
        gen = nx.shortest_simple_paths(g, origem_waypoint_id, destino_waypoint_id, weight="tempo")
        node_paths = 0
        for path in gen:
            if node_paths >= k:
                break
            node_paths += 1
            for edge_attrs in edge_variants_for_path(parallels, path):
                sig = tuple(int(d["seg_id"]) for d in edge_attrs)
                if sig in seen:
                    continue
                seen.add(sig)
                candidates.append(item_from_edges(path, edge_attrs, waypoints, by_id, horas_por_dia))
    except nx.NetworkXNoPath:
        return []

    candidates.sort(key=lambda r: (r.tempo_horas, r.distancia_milhas))
    return candidates[:k]


def recompute_all_distances(session: Session) -> int:
    scale = get_or_create_scale(session)
    waypoints = {w.id: w for w in session.exec(select(Waypoint)).all() if w.id is not None}
    n = 0
    for seg in session.exec(select(RouteSegment)).all():
        a, b = waypoints.get(seg.waypoint_a_id), waypoints.get(seg.waypoint_b_id)
        if not a or not b:
            continue
        mid = parse_pontos(seg.pontos_intermediarios)
        seg.distancia_milhas = compute_distancia_milhas(a, b, mid, scale.miles_per_map_unit)
        session.add(seg)
        n += 1
    session.commit()
    return n
