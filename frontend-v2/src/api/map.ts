import { useCallback, useEffect, useRef, useState } from "react";
import { api, campaignPath } from "./client";

export type EstadoExploracao = "conhecido" | "visitado";
export type NpcStatus = "vivo" | "morto" | "desaparecido" | "desconhecido";
export type GrupoFormato = "bandeira" | "brasao";

/** Same default as `Local.cor_pin` on the backend. */
export const DEFAULT_PIN_COLOR = "#c4b5fd";

export interface Local {
  id: number;
  nome: string;
  descricao: string;
  x: number;
  y: number;
  imagem_url: string | null;
  data_sessao: string | null;
  estado_exploracao: EstadoExploracao;
  arco_id: number | null;
  npc_ids: number[];
  saida_ids: number[];
  cor_pin: string;
  waypoint_id?: number | null;
  visivel_para_todos?: boolean;
}

export interface LocalPayload {
  nome: string;
  descricao?: string;
  x: number;
  y: number;
  imagem_url?: string | null;
  data_sessao?: string | null;
  estado_exploracao?: EstadoExploracao;
  arco_id?: number | null;
  npc_ids?: number[];
  saida_ids?: number[];
  cor_pin: string;
  waypoint_id?: number | null;
  visivel_para_todos?: boolean;
}

export interface Npc {
  id: number;
  nome: string;
  tipo?: "pj" | "npc";
  papel?: string | null;
  descricao: string;
  faccao: string | null;
  status: NpcStatus | null;
  retrato_url: string | null;
  local_ids: number[];
  visivel_para_todos?: boolean;
}

export interface NpcPayload {
  nome: string;
  tipo?: "npc";
  papel?: string | null;
  descricao?: string;
  faccao?: string | null;
  status?: NpcStatus | null;
  retrato_url?: string | null;
  visivel_para_todos?: boolean;
}

export interface Arco {
  id: number;
  titulo: string;
  ordem: number;
}

export interface Waypoint {
  id: number;
  nome: string | null;
  x: number;
  y: number;
  local_id: number | null;
}

export interface GrupoPosicao {
  x: number;
  y: number;
  formato: GrupoFormato;
  atualizado_em: string;
}

export interface UploadResult {
  url: string;
}

export interface MapBundle {
  locais: Local[];
  npcs: Npc[];
  arcos: Arco[];
  waypoints: Waypoint[];
  grupo: GrupoPosicao;
}

export function localPayload(local: Local, patch: Partial<LocalPayload> = {}): LocalPayload {
  return {
    nome: local.nome,
    descricao: local.descricao,
    x: local.x,
    y: local.y,
    imagem_url: local.imagem_url,
    data_sessao: local.data_sessao,
    estado_exploracao: local.estado_exploracao,
    arco_id: local.arco_id,
    npc_ids: local.npc_ids,
    saida_ids: local.saida_ids,
    cor_pin: local.cor_pin,
    waypoint_id: local.waypoint_id ?? null,
    visivel_para_todos: local.visivel_para_todos ?? true,
    ...patch,
  };
}

async function optional<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

export const mapApi = {
  load(slug: string, asGm: boolean): Promise<MapBundle> {
    const read = <T>(path: string) => api.get<T>(campaignPath(slug, path));
    return Promise.all([
      read<Local[]>(asGm ? "admin/locais" : "locais"),
      read<Npc[]>(asGm ? "admin/npcs" : "npcs"),
      optional(() => read<Arco[]>(asGm ? "admin/arcos" : "arcos"), []),
      optional(() => read<Waypoint[]>(asGm ? "admin/waypoints" : "waypoints"), []),
      read<GrupoPosicao>("grupo"),
    ]).then(([locais, npcs, arcos, waypoints, grupo]) => ({
      locais,
      npcs,
      arcos,
      waypoints,
      grupo,
    }));
  },
  createLocal: (slug: string, body: LocalPayload) =>
    api.post<Local>(campaignPath(slug, "admin/locais"), body),
  updateLocal: (slug: string, id: number, body: LocalPayload) =>
    api.put<Local>(campaignPath(slug, `admin/locais/${id}`), body),
  deleteLocal: (slug: string, id: number) => api.delete(campaignPath(slug, `admin/locais/${id}`)),
  createNpc: (slug: string, body: NpcPayload) =>
    api.post<Npc>(campaignPath(slug, "admin/npcs"), body),
  updateNpc: (slug: string, id: number, body: NpcPayload) =>
    api.put<Npc>(campaignPath(slug, `admin/npcs/${id}`), body),
  deleteNpc: (slug: string, id: number) => api.delete(campaignPath(slug, `admin/npcs/${id}`)),
  updateGrupo: (slug: string, body: { x: number; y: number; formato?: GrupoFormato }) =>
    api.put<GrupoPosicao>(campaignPath(slug, "admin/grupo"), body),
  upload: (slug: string, category: "map" | "locals" | "portraits", file: File) => {
    const body = new FormData();
    body.append("category", category);
    body.append("file", file);
    return api.upload<UploadResult>(campaignPath(slug, "admin/uploads"), body);
  },
};

export function useMapData(slug: string, asGm: boolean) {
  const [data, setData] = useState<MapBundle | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const loadedSlug = useRef<string | null>(null);
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    const sameCampaign = loadedSlug.current === slug;
    if (!sameCampaign) {
      setData(null);
      setLoading(true);
    }
    setError(null);
    void mapApi
      .load(slug, asGm)
      .then((bundle) => {
        if (!active) return;
        loadedSlug.current = slug;
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
