"""Day-by-day overnight stops and intenso fatigue for route plan items."""

from __future__ import annotations

import math
from typing import Literal

from app.models.waypoint import Waypoint
from app.schemas.routes import DiaVisual, Pernoite, PernoiteTipo, Point

EPS = 1e-6
FATIGA_MORTE = 6


def _polyline_length_map_units(pts: list[tuple[float, float]]) -> float:
    if len(pts) < 2:
        return 0.0
    total = 0.0
    for i in range(1, len(pts)):
        total += math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    return total


def build_mile_polyline(
    path: list[int],
    edge_attrs: list[dict],
    waypoints: dict[int, Waypoint],
    mid_points_by_edge: list[list[Point]],
) -> list[tuple[float, float, float]]:
    """Ordered (x, y, cum_miles) samples along the path for interpolation."""
    if not path:
        return []
    samples: list[tuple[float, float, float]] = []
    w0 = waypoints[path[0]]
    samples.append((w0.x, w0.y, 0.0))
    cum = 0.0
    for i, data in enumerate(edge_attrs):
        a_id, b_id = path[i], path[i + 1]
        a, b = waypoints[a_id], waypoints[b_id]
        mid = mid_points_by_edge[i] if i < len(mid_points_by_edge) else []
        pts: list[tuple[float, float]] = [(a.x, a.y), *[(p.x, p.y) for p in mid], (b.x, b.y)]
        dist = float(data["distancia"])
        units = _polyline_length_map_units(pts)
        if units <= EPS or dist <= 0:
            cum += max(dist, 0.0)
            samples.append((b.x, b.y, cum))
            continue
        for j in range(1, len(pts)):
            seg_u = math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1])
            cum += dist * (seg_u / units)
            samples.append((pts[j][0], pts[j][1], cum))
    return samples


def interpolate_at_mile(
    samples: list[tuple[float, float, float]],
    target: float,
) -> tuple[float, float]:
    if not samples:
        return 0.0, 0.0
    if target <= samples[0][2] + EPS:
        return samples[0][0], samples[0][1]
    if target >= samples[-1][2] - EPS:
        return samples[-1][0], samples[-1][1]
    for i in range(1, len(samples)):
        x0, y0, m0 = samples[i - 1]
        x1, y1, m1 = samples[i]
        if m1 + EPS < target:
            continue
        if abs(m1 - m0) < EPS:
            return x1, y1
        t = (target - m0) / (m1 - m0)
        return x0 + t * (x1 - x0), y0 + t * (y1 - y0)
    return samples[-1][0], samples[-1][1]


def waypoint_cum_miles(edge_attrs: list[dict]) -> list[float]:
    cum = [0.0]
    for data in edge_attrs:
        cum.append(cum[-1] + float(data["distancia"]))
    return cum


def mid_points_oriented(
    path: list[int],
    edge_attrs: list[dict],
    by_id: dict,
) -> list[list[Point]]:
    import json

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

    out: list[list[Point]] = []
    for i, data in enumerate(edge_attrs):
        prev = path[i]
        seg = by_id.get(int(data["seg_id"]))
        mid = parse_pontos(seg.pontos_intermediarios) if seg else []
        if seg and seg.waypoint_a_id != prev:
            mid = list(reversed(mid))
        out.append(mid)
    return out


def _clamp01(v: float) -> float:
    return min(1.0, max(0.0, round(v, 6)))


def march_days_from_tempo(dias: int, resto_horas: float) -> int:
    """Published D + R → march days M (FR-001b)."""
    d = max(0, int(dias))
    r = float(resto_horas)
    if r < EPS:
        r = 0.0
    if d == 0 and r <= EPS:
        return 0
    if r > EPS:
        return d + 1
    return d


def milhas_por_dia_from_route(
    distancia_milhas: float,
    dias: int,
    resto_horas: float,
) -> tuple[int, float]:
    """Return (M, miles_per_day) with miles_per_day = dist/M when M ≥ 1."""
    m = march_days_from_tempo(dias, resto_horas)
    dist = float(distancia_milhas)
    if m < 1 or dist <= EPS:
        return m, 0.0
    return m, dist / m


def polyline_between_miles(
    samples: list[tuple[float, float, float]],
    mile_start: float,
    mile_end: float,
) -> list[Point]:
    """Ordered map points along samples from mile_start to mile_end (inclusive)."""
    if not samples or mile_end < mile_start - EPS:
        return []
    m0 = max(0.0, mile_start)
    m1 = max(m0, mile_end)
    pts: list[Point] = []

    def append_xy(x: float, y: float) -> None:
        p = Point(x=_clamp01(x), y=_clamp01(y))
        if pts and abs(pts[-1].x - p.x) < EPS and abs(pts[-1].y - p.y) < EPS:
            return
        pts.append(p)

    sx, sy = interpolate_at_mile(samples, m0)
    append_xy(sx, sy)
    for x, y, m in samples:
        if m <= m0 + EPS:
            continue
        if m >= m1 - EPS:
            break
        append_xy(x, y)
    ex, ey = interpolate_at_mile(samples, m1)
    append_xy(ex, ey)
    if len(pts) < 2:
        # Degenerate day: duplicate endpoint so clients can still stroke
        append_xy(ex, ey)
    return pts


def simulate_overnights_and_fatigue(
    path: list[int],
    edge_attrs: list[dict],
    waypoints: dict[int, Waypoint],
    by_id: dict,
    local_names: dict[int, str],
    milhas_por_dia: float,
    tolerancia_pct: float,
    ritmo: Literal["normal", "intenso"] | str,
    max_intermediate: int | None = None,
) -> tuple[list[Pernoite], int, int, bool, bool, list[DiaVisual]]:
    """Return pernoites, fatigue totals, and per-day visual slices.

    When max_intermediate is set (typically M−1), never emit more overnight stops.
    """
    empty = ([], 0, 0, False, False, [])
    if milhas_por_dia <= 0 or len(path) < 2 or len(edge_attrs) != len(path) - 1:
        return empty

    mids = mid_points_oriented(path, edge_attrs, by_id)
    samples = build_mile_polyline(path, edge_attrs, waypoints, mids)
    wp_cum = waypoint_cum_miles(edge_attrs)
    total = wp_cum[-1]
    if total <= EPS:
        return empty

    stop_cap = max_intermediate if max_intermediate is not None else 500
    if stop_cap < 0:
        stop_cap = 0

    tol = tolerancia_pct * milhas_por_dia
    day_start = 0.0
    dia = 1
    pernoites: list[Pernoite] = []
    overnight_miles: list[float] = []

    while len(pernoites) < stop_cap:
        ideal = day_start + milhas_por_dia
        if ideal >= total - EPS:
            break

        best_idx: int | None = None
        best_dev = float("inf")
        for wi in range(1, len(path) - 1):
            wp = waypoints[path[wi]]
            if wp.local_id is None:
                continue
            c = wp_cum[wi]
            if c <= day_start + EPS or c >= total - EPS:
                continue
            if abs(c - ideal) > tol + EPS:
                continue
            dev = abs(c - ideal)
            if dev < best_dev - EPS or (
                abs(dev - best_dev) <= EPS and (best_idx is None or wi < best_idx)
            ):
                best_dev = dev
                best_idx = wi

        if best_idx is not None:
            wp = waypoints[path[best_idx]]
            lid = wp.local_id
            assert lid is not None
            nome = local_names.get(lid) or wp.nome or f"Local {lid}"
            pernoites.append(
                Pernoite(
                    dia=dia,
                    tipo=PernoiteTipo.local,
                    local_id=lid,
                    nome=nome,
                    x=wp.x,
                    y=wp.y,
                )
            )
            day_start = wp_cum[best_idx]
        else:
            x, y = interpolate_at_mile(samples, ideal)
            pernoites.append(
                Pernoite(
                    dia=dia,
                    tipo=PernoiteTipo.relento,
                    local_id=None,
                    nome=None,
                    x=_clamp01(x),
                    y=_clamp01(y),
                )
            )
            day_start = ideal

        overnight_miles.append(day_start)
        dia += 1

    # Day mile bounds: 0 → overnight1 → … → total
    bounds = [0.0, *overnight_miles, total]
    dias_marcha = len(bounds) - 1
    intenso = ritmo == "intenso"

    saldo = 0
    pico = 0
    dias_visuais: list[DiaVisual] = []
    for d in range(1, dias_marcha + 1):
        geom = polyline_between_miles(samples, bounds[d - 1], bounds[d])
        if intenso:
            saldo += 1
            pico = max(pico, saldo)
            if d <= len(pernoites) and pernoites[d - 1].tipo == PernoiteTipo.local:
                saldo = max(0, saldo - 1)
                residual = False
            else:
                residual = True
            fadiga_apos = saldo
        else:
            residual = False
            fadiga_apos = 0
        dias_visuais.append(
            DiaVisual(
                dia=d,
                residual=residual,
                fadiga_apos=fadiga_apos,
                geometria=geom,
            )
        )

    if not intenso:
        return pernoites, 0, 0, False, False, dias_visuais

    return pernoites, saldo, pico, saldo > 1, pico >= FATIGA_MORTE, dias_visuais
