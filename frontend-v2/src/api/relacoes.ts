import { useCallback, useEffect, useState } from "react";
import { api, campaignPath } from "./client";

export const VINCULO_TIPOS = [
  "aliado",
  "vinculo_sangue",
  "amizade",
  "inimizade",
  "adversario",
  "romance",
  "familia",
  "conhecido",
] as const;

export type VinculoTipo = (typeof VINCULO_TIPOS)[number];
export type VinculoDirecao = "a_para_b" | "b_para_a";
export type PersonagemTipo = "pj" | "npc";
export type PersonagemStatus = "vivo" | "morto" | "desaparecido" | "desconhecido";

export interface Personagem {
  id: number;
  nome: string;
  tipo: PersonagemTipo;
  papel: string | null;
  descricao: string;
  faccao: string | null;
  status: PersonagemStatus | null;
  retrato_url: string | null;
  visivel_para_todos?: boolean;
  extensoes_mecanica: Record<string, unknown>;
  local_ids: number[];
}

export interface PersonagemPayload {
  nome: string;
  tipo: PersonagemTipo;
  papel: string | null;
  descricao: string;
  faccao: string | null;
  status: PersonagemStatus | null;
  retrato_url: string | null;
  visivel_para_todos: boolean;
  extensoes_mecanica: Record<string, unknown>;
}

export interface Vinculo {
  id: number;
  personagem_a_id: number;
  personagem_b_id: number;
  tipo_ab?: VinculoTipo | null;
  tipo_ba?: VinculoTipo | null;
  nota_ab?: string;
  nota_ba?: string;
  publico: boolean;
  conhecido_ab?: boolean | null;
  conhecido_ba?: boolean | null;
  qualificador_ab?: string;
  qualificador_ba?: string;
  direcao?: VinculoDirecao | null;
}

export interface VinculoPayload {
  personagem_a_id: number;
  personagem_b_id: number;
  tipo_ab: VinculoTipo;
  tipo_ba: VinculoTipo | null;
  nota_ab: string;
  nota_ba: string;
  publico: boolean;
  conhecido_ab: boolean;
  conhecido_ba: boolean;
  qualificador_ab: string;
  qualificador_ba: string;
  direcao: VinculoDirecao | null;
}

export interface LugarResumo {
  id: number;
  nome: string;
}

export interface RelationsBundle {
  personagens: Personagem[];
  vinculos: Vinculo[];
  locais: LugarResumo[];
}

export function useRelations(slug: string, asGm: boolean | null) {
  const [data, setData] = useState<RelationsBundle | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(asGm !== null);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    setLoading(asGm !== null);
    if (asGm !== null) {
      void relacoesApi
        .load(slug, asGm)
        .then((value) => {
          if (active) setData(value);
        })
        .catch((reason: unknown) => {
          if (active) setError(reason instanceof Error ? reason : new Error(String(reason)));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [slug, asGm, revision]);

  return { data, error, loading, reload };
}

export const relacoesApi = {
  load(slug: string, asGm: boolean): Promise<RelationsBundle> {
    const people = asGm ? "admin/personagens" : "personagens";
    const bonds = asGm ? "admin/vinculos" : "vinculos";
    const places = asGm ? "admin/locais" : "locais";
    return Promise.all([
      api.get<Personagem[]>(campaignPath(slug, people)),
      api.get<Vinculo[]>(campaignPath(slug, bonds)),
      api.get<LugarResumo[]>(campaignPath(slug, places)).catch(() => [] as LugarResumo[]),
    ]).then(([personagens, vinculos, locais]) => ({
      personagens,
      vinculos,
      locais: locais.map((local) => ({ id: local.id, nome: local.nome })),
    }));
  },
  createPersonagem: (slug: string, body: PersonagemPayload) =>
    api.post<Personagem>(campaignPath(slug, "admin/personagens"), body),
  updatePersonagem: (slug: string, id: number, body: PersonagemPayload) =>
    api.put<Personagem>(campaignPath(slug, `admin/personagens/${id}`), body),
  deletePersonagem: (slug: string, id: number) =>
    api.delete(campaignPath(slug, `admin/personagens/${id}`)),
  createVinculo: (slug: string, body: VinculoPayload) =>
    api.post<Vinculo>(campaignPath(slug, "admin/vinculos"), body),
  updateVinculo: (slug: string, id: number, body: VinculoPayload) =>
    api.put<Vinculo>(campaignPath(slug, `admin/vinculos/${id}`), body),
  deleteVinculo: (slug: string, id: number) =>
    api.delete(campaignPath(slug, `admin/vinculos/${id}`)),
  uploadPortrait: (slug: string, file: File) => {
    const body = new FormData();
    body.set("file", file);
    body.set("category", "portraits");
    return api.upload<{ url: string }>(campaignPath(slug, "admin/uploads"), body);
  },
};
