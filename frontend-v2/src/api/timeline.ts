import { api, campaignPath } from "./client";
import type { Sessao } from "./sessoes";
import type { Local } from "./map";

export interface Evento {
  id: number;
  titulo: string;
  ano: number;
  mes: number | null;
  rotulo_era: string | null;
  descricao: string;
  sessao_id: number | null;
  locais: { id: number; nome: string }[];
  personagens: { id: number; nome: string }[];
  visivel_para_todos?: boolean;
}
export type EventoDraft = Pick<
  Evento,
  "titulo" | "ano" | "mes" | "rotulo_era" | "descricao" | "sessao_id"
> & { visivel_para_todos: boolean; local_ids: number[]; personagem_ids: number[] };
export interface Arco {
  id: number;
  titulo: string;
  resumo: string;
  ordem: number;
  cor: string | null;
  visivel_para_todos: boolean;
  sessao_ids: number[];
  sessao_transicao_id: number | null;
}
export type ArcoDraft = Omit<Arco, "id">;
export interface Aparicao {
  origem: "sessao" | "evento";
  id: number;
  titulo: string;
  numero: number | null;
  ano: number | null;
  mes: number | null;
  reaparicao: boolean;
  intervalo?: { anos: number; meses: number; sessoes: number | null };
  visivel_para_todos?: boolean;
}
export interface Entidade {
  tipo: "personagem" | "local" | "faccao" | "item";
  id: number | null;
  nome: string;
  descricao?: string | null;
  aparicoes: Aparicao[];
}
export interface Alerta {
  personagem_id: number;
  personagem_nome: string;
  sessao_visivel_numero: number;
  sessao_oculta_numero: number;
  sessao_oculta_titulo: string;
}
export interface Descoberta {
  entidades: Entidade[];
  alertas?: Alerta[];
}
export interface Item {
  id: number;
  nome: string;
  descricao: string;
  visivel_para_todos: boolean;
  sessoes: { id: number; numero: number; titulo: string }[];
  eventos: { id: number; titulo: string; ano?: number; mes?: number | null }[];
}
/** Public list shape — same fields as admin `Item` without `visivel_para_todos`. */
export type ItemPublico = Omit<Item, "visivel_para_todos">;
export type ItemDraft = Pick<Item, "nome" | "descricao" | "visivel_para_todos"> & {
  sessao_ids: number[];
  evento_ids: number[];
};

export function listItensPublicos(slug: string) {
  return api.get<{ itens: ItemPublico[] }>(campaignPath(slug, "itens"));
}
export interface Proposta {
  titulo: string;
  resumo: string;
  sessao_ids: number[];
  sessao_transicao_id: number | null;
  local_ids: number[];
}
export interface Propostas {
  estado: "propostas" | "sessoes_insuficientes" | "falha";
  mensagem: string;
  propostas: Proposta[];
}
export interface Sugestao {
  estado: "sugestoes" | "vazio" | "falha";
  mensagem: string;
  local_ids: number[];
  personagem_ids: number[];
}
export const timelineApi = {
  load: async (slug: string, gm: boolean, owner: boolean) => {
    const read = <T>(path: string) =>
      api.get<T>(campaignPath(slug, `${gm ? "admin/" : ""}${path}`));
    const [eventos, arcos, sessoes, descoberta] = await Promise.all([
      read<{ eventos: Evento[] }>("eventos"),
      read<Arco[]>("arcos"),
      read<{ sessoes: Sessao[] }>("sessoes"),
      api.get<Descoberta>(campaignPath(slug, `${owner ? "admin/" : ""}descoberta`)),
    ]);
    return { eventos: eventos.eventos, arcos, sessoes: sessoes.sessoes, descoberta };
  },
  items: (slug: string) => api.get<{ itens: Item[] }>(campaignPath(slug, "admin/itens")),
  catalogs: async (slug: string) => {
    const [locais, personagens] = await Promise.all([
      api.get<Local[]>(campaignPath(slug, "admin/locais")),
      api.get<{ id: number; nome: string }[]>(campaignPath(slug, "admin/personagens")),
    ]);
    return { locais, personagens };
  },
  createEvent: (slug: string, body: EventoDraft) =>
    api.post<Evento>(campaignPath(slug, "admin/eventos"), body),
  updateEvent: (slug: string, id: number, body: EventoDraft) =>
    api.patch<Evento>(campaignPath(slug, `admin/eventos/${id}`), body),
  deleteEvent: (slug: string, id: number) => api.delete(campaignPath(slug, `admin/eventos/${id}`)),
  suggestEvent: (slug: string, descricao: string) =>
    api.post<Sugestao>(campaignPath(slug, "admin/eventos/sugerir-associacoes"), { descricao }),
  createArc: (slug: string, body: ArcoDraft) =>
    api.post<Arco>(campaignPath(slug, "admin/arcos"), body),
  updateArc: (slug: string, id: number, body: ArcoDraft) =>
    api.put<Arco>(campaignPath(slug, `admin/arcos/${id}`), body),
  deleteArc: (slug: string, id: number) => api.delete(campaignPath(slug, `admin/arcos/${id}`)),
  proposeArcs: (slug: string) => api.post<Propostas>(campaignPath(slug, "admin/arcos/propor")),
  createItem: (slug: string, body: ItemDraft) =>
    api.post<Item>(campaignPath(slug, "admin/itens"), body),
  updateItem: (slug: string, id: number, body: ItemDraft) =>
    api.patch<Item>(campaignPath(slug, `admin/itens/${id}`), body),
  deleteItem: (slug: string, id: number) => api.delete(campaignPath(slug, `admin/itens/${id}`)),
};
