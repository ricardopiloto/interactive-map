import { useCallback, useEffect, useRef, useState } from "react";
import { api, campaignPath } from "./client";

export interface SessaoRefLocal {
  id: number;
  nome: string;
}

export interface SessaoRefPersonagem {
  id: number;
  nome: string;
  tipo: string;
}

export interface AlertaInconsistencia {
  personagem_id: number;
  personagem_nome: string;
  sessao_visivel_id: number;
  sessao_visivel_numero: number;
  sessao_oculta_id: number;
  sessao_oculta_numero: number;
  sessao_oculta_titulo: string;
}

export interface Sessao {
  id: number;
  numero: number;
  titulo: string;
  data_rotulo: string | null;
  resumo: string;
  /** GM-only; never present on public `GET /sessoes` payloads. */
  notas_preparo?: string;
  locais: SessaoRefLocal[];
  personagens: SessaoRefPersonagem[];
  arco_id: number | null;
  arco_transicao_id: number | null;
  visivel_para_todos?: boolean;
  alertas_inconsistencia?: AlertaInconsistencia[];
}

export interface SessaoPayload {
  numero: number;
  titulo: string;
  data_rotulo: string | null;
  resumo: string;
  notas_preparo: string;
  visivel_para_todos: boolean;
  local_ids: number[];
  personagem_ids: number[];
}

export interface SugestaoAssociacoes {
  estado: "sugestoes" | "vazio" | "falha";
  mensagem: string;
  local_ids: number[];
  personagem_ids: number[];
}

export interface CatalogoItem {
  id: number;
  nome: string;
}

export interface ArcoResumo {
  id: number;
  titulo: string;
}

export interface SessoesBundle {
  sessoes: Sessao[];
  locais: CatalogoItem[];
  personagens: CatalogoItem[];
  arcos: ArcoResumo[];
}

async function optional<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

export const sessoesApi = {
  load(slug: string, asGm: boolean): Promise<SessoesBundle> {
    const read = <T>(path: string) => api.get<T>(campaignPath(slug, path));
    return Promise.all([
      read<{ sessoes: Sessao[] }>(asGm ? "admin/sessoes" : "sessoes"),
      optional(() => read<ArcoResumo[]>(asGm ? "admin/arcos" : "arcos"), []),
      asGm ? read<CatalogoItem[]>("admin/locais") : Promise.resolve([]),
      asGm ? read<CatalogoItem[]>("admin/personagens") : Promise.resolve([]),
    ]).then(([list, arcos, locais, personagens]) => ({
      sessoes: list.sessoes,
      arcos: arcos.map((arco) => ({ id: arco.id, titulo: arco.titulo })),
      locais: locais.map((local) => ({ id: local.id, nome: local.nome })),
      personagens: personagens.map((personagem) => ({
        id: personagem.id,
        nome: personagem.nome,
      })),
    }));
  },
  proximoNumero: (slug: string) =>
    api.get<{ numero: number }>(campaignPath(slug, "admin/sessoes/proximo-numero")),
  sugerir: (slug: string, resumo: string) =>
    api.post<SugestaoAssociacoes>(campaignPath(slug, "admin/sessoes/sugerir-associacoes"), {
      resumo,
    }),
  create: (slug: string, body: SessaoPayload) =>
    api.post<Sessao>(campaignPath(slug, "admin/sessoes"), body),
  update: (slug: string, id: number, body: SessaoPayload) =>
    api.patch<Sessao>(campaignPath(slug, `admin/sessoes/${id}`), body),
  remove: (slug: string, id: number) => api.delete(campaignPath(slug, `admin/sessoes/${id}`)),
};

export function useSessoes(slug: string, asGm: boolean | null) {
  const [data, setData] = useState<SessoesBundle | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const scope = useRef<string | null>(null);
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    const nextScope = asGm === null ? null : `${slug}:${String(asGm)}`;
    if (scope.current !== nextScope) {
      scope.current = nextScope;
      setData(null);
      setLoading(true);
    }
    setError(null);
    if (asGm === null) {
      return () => {
        active = false;
      };
    }
    void sessoesApi
      .load(slug, asGm)
      .then((bundle) => {
        if (active) setData(bundle);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setData(null);
        setError(reason instanceof Error ? reason : new Error(String(reason)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, asGm, revision]);

  return { data, error, loading, reload };
}
