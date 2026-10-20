import { api, campaignPath } from "./client";
import type { Sessao } from "./sessoes";

export const GERADOR_TIPOS = ["nome", "rumor", "clima", "item"] as const;
export type GeradorTipo = (typeof GERADOR_TIPOS)[number];

export interface GeradorResultado {
  tipo: GeradorTipo;
  resultado: string;
  sistema_usado: string;
  fallback: boolean;
}

/** Session still being prepared: hidden from players. */
export type SessaoEmPreparo = Pick<Sessao, "id" | "numero" | "titulo">;

/** Appends `- {label}: {result}` to the end of the notes, never touching what is already there. */
export function acrescentarNota(notas: string, rotulo: string, resultado: string): string {
  const item = `- ${rotulo}: ${resultado.trim()}`;
  const base = notas.trimEnd();
  return base ? `${base}\n${item}` : item;
}

/** The target session was revealed to players after the list was loaded. */
export class SessaoVisivelError extends Error {
  constructor() {
    super("SESSAO_VISIVEL");
  }
}

export const geradoresApi = {
  sortear: (slug: string, tipo: GeradorTipo, lang: string) =>
    api.post<GeradorResultado>(
      campaignPath(slug, `admin/geradores/${tipo}?lang=${encodeURIComponent(lang)}`),
    ),
  sessoesEmPreparo: async (slug: string): Promise<SessaoEmPreparo[]> => {
    const { sessoes } = await api.get<{ sessoes: Sessao[] }>(campaignPath(slug, "admin/sessoes"));
    return sessoes
      .filter((sessao) => sessao.visivel_para_todos === false)
      .sort((a, b) => b.numero - a.numero)
      .map(({ id, numero, titulo }) => ({ id, numero, titulo }));
  },
  /** Reads the session fresh and PATCHes only `notas_preparo`, so no other field is overwritten. */
  enviarParaPreparo: async (slug: string, sessaoId: number, rotulo: string, resultado: string) => {
    const path = campaignPath(slug, `admin/sessoes/${sessaoId}`);
    const atual = await api.get<Sessao>(path);
    if (atual.visivel_para_todos !== false) throw new SessaoVisivelError();
    return api.patch<Sessao>(path, {
      notas_preparo: acrescentarNota(atual.notas_preparo ?? "", rotulo, resultado),
    });
  },
};
