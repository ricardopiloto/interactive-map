import { api, campaignPath } from "./client";

export type EstadoFio = "aberto" | "resolvido";
export type OrigemFio = "manual" | "ia";
export interface Fio {
  id: number;
  titulo: string;
  descricao: string;
  estado: EstadoFio;
  origem: OrigemFio;
  sessao_origem_id: number | null;
  ordem: number;
  criado_em: string;
}
export interface FioCreate {
  titulo: string;
  descricao: string;
  origem: OrigemFio;
  sessao_origem_id: number | null;
}
export interface PropostaFio {
  titulo: string;
  descricao: string;
  sessao_numero?: number | null;
}
export interface PropostaFios {
  estado: "propostas" | "vazio" | "falha";
  fios: PropostaFio[];
  sessoes_omitidas: number;
  usou_conteudo_oculto: boolean;
  mensagem?: string;
}
const path = (slug: string, suffix = "") => campaignPath(slug, `admin/fios${suffix}`);
export const fiosApi = {
  list: (slug: string, estado?: EstadoFio, sessao_origem_id?: number) => {
    const params = new URLSearchParams();
    if (estado) params.set("estado", estado);
    if (sessao_origem_id !== undefined) params.set("sessao_origem_id", String(sessao_origem_id));
    return api.get<Fio[]>(path(slug, params.size ? `?${params}` : ""));
  },
  create: (slug: string, body: FioCreate) => api.post<Fio>(path(slug), body),
  createBatch: (slug: string, fios: FioCreate[]) => api.post<Fio[]>(path(slug, "/lote"), { fios }),
  update: (
    slug: string,
    id: number,
    body: Partial<Pick<Fio, "titulo" | "descricao" | "estado" | "sessao_origem_id">>,
  ) => api.patch<Fio>(path(slug, `/${id}`), body),
  remove: (slug: string, id: number) => api.delete(path(slug, `/${id}`)),
  reorder: (slug: string, ids: number[]) => api.put<Fio[]>(path(slug, "/ordem"), { ids }),
  propose: (slug: string, sessao_id: number | null) =>
    api.post<PropostaFios>(path(slug, "/propor"), { sessao_id }),
};
