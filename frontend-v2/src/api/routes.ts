import { useCallback, useEffect, useRef, useState } from "react";
import type { Local, Waypoint } from "./map";
import { api, campaignPath } from "./client";

export type Ritmo = "normal" | "intenso";
export type OrdenacaoRota = "mais_rapida" | "mais_barata";
export type ModoTransporte = "pago" | "proprio";
export type PreferenciaVia = "nenhuma" | "rio" | "estrada";
export type RouteTipo = "estrada" | "rio" | "trilha";

export interface MapPoint {
  x: number;
  y: number;
}

export interface RouteSegment {
  id: number;
  waypoint_a_id: number;
  waypoint_b_id: number;
  tipo: RouteTipo;
  pontos_intermediarios: MapPoint[];
  distancia_milhas: number;
  modificador_velocidade: number | null;
}

export interface MapScale {
  id: number;
  miles_per_map_unit: number;
  notas: string | null;
}

export interface Pernoite {
  dia: number;
  tipo: "local" | "relento";
  local_id: number | null;
  nome: string | null;
  x: number;
  y: number;
}

export interface RoutePlanItem {
  waypoint_ids: number[];
  distancia_milhas: number;
  tempo_horas: number;
  tempo_dias: number;
  tempo_horas_resto: number;
  tempo_texto: string;
  tipos: string[];
  geometria: MapPoint[];
  custo_dentro_bp: number;
  custo_fora_bp: number;
  pernoites: Pernoite[];
}

export interface RoutePlanResponse {
  rotas: RoutePlanItem[];
}

export interface PlanQuery {
  origemId: number;
  destinoId: number;
  ritmo: Ritmo;
  ordenacao: OrdenacaoRota;
  modo: ModoTransporte;
  preferencia: PreferenciaVia;
  velocidadeMph?: number;
}

export interface WaypointPayload {
  nome?: string | null;
  x: number;
  y: number;
  local_id?: number | null;
}

export interface RouteSegmentPayload {
  waypoint_a_id: number;
  waypoint_b_id: number;
  tipo: RouteTipo;
  pontos_intermediarios?: MapPoint[];
}

export interface RouteBundle {
  locais: Local[];
  waypoints: Waypoint[];
  segments: RouteSegment[];
  scale: MapScale | null;
}

function read<T>(slug: string, path: string) {
  return api.get<T>(campaignPath(slug, path));
}

export function planSearch(query: PlanQuery): string {
  const params = new URLSearchParams({
    origem_waypoint_id: String(query.origemId),
    destino_waypoint_id: String(query.destinoId),
    ritmo: query.ritmo,
    ordenacao: query.ordenacao,
    modo_transporte: query.modo,
    preferencia_via: query.preferencia,
  });
  if (query.modo === "proprio" && query.velocidadeMph != null) {
    params.set("velocidade_media_mph", String(query.velocidadeMph));
  }
  return params.toString();
}

export const routeApi = {
  load(slug: string, asGm: boolean): Promise<RouteBundle> {
    const locais = read<Local[]>(slug, asGm ? "admin/locais" : "locais");
    const waypoints = read<Waypoint[]>(slug, asGm ? "admin/waypoints" : "waypoints");
    if (!asGm) {
      return Promise.all([locais, waypoints]).then(([places, nodes]) => ({
        locais: places,
        waypoints: nodes,
        segments: [],
        scale: null,
      }));
    }
    return Promise.all([
      locais,
      waypoints,
      read<RouteSegment[]>(slug, "admin/route-segments"),
      read<MapScale>(slug, "admin/map-scale"),
    ]).then(([places, nodes, segments, scale]) => ({
      locais: places,
      waypoints: nodes,
      segments,
      scale,
    }));
  },
  plan(slug: string, query: PlanQuery) {
    return read<RoutePlanResponse>(slug, `routes/plan?${planSearch(query)}`);
  },
  createWaypoint(slug: string, body: WaypointPayload) {
    return api.post<Waypoint>(campaignPath(slug, "admin/waypoints"), body);
  },
  updateWaypoint(slug: string, id: number, body: Partial<WaypointPayload>) {
    return api.put<Waypoint>(campaignPath(slug, `admin/waypoints/${id}`), body);
  },
  deleteWaypoint(slug: string, id: number) {
    return api.delete(campaignPath(slug, `admin/waypoints/${id}`));
  },
  createSegment(slug: string, body: RouteSegmentPayload) {
    return api.post<RouteSegment>(campaignPath(slug, "admin/route-segments"), body);
  },
  deleteSegment(slug: string, id: number) {
    return api.delete(campaignPath(slug, `admin/route-segments/${id}`));
  },
  updateScale(slug: string, milesPerMapUnit: number) {
    return api.put<MapScale>(campaignPath(slug, "admin/map-scale"), {
      miles_per_map_unit: milesPerMapUnit,
    });
  },
};

export function useRouteBundle(slug: string, asGm: boolean) {
  const [data, setData] = useState<RouteBundle | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const loaded = useRef<string | null>(null);
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    const sameCampaign = loaded.current === slug;
    if (!sameCampaign) {
      setData(null);
      setLoading(true);
    }
    setError(null);
    void routeApi
      .load(slug, asGm)
      .then((bundle) => {
        if (!active) return;
        loaded.current = slug;
        setData(bundle);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason : new Error(String(reason)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [asGm, slug, revision]);

  return { data, error, loading, reload };
}
