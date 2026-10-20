import { api, campaignPath } from "./client";

export const GERADOR_TIPOS = ["nome", "rumor", "clima", "item"] as const;
export type GeradorTipo = (typeof GERADOR_TIPOS)[number];

export interface GeradorResultado {
  tipo: GeradorTipo;
  resultado: string;
  sistema_usado: string;
  fallback: boolean;
}

export const geradoresApi = {
  sortear: (slug: string, tipo: GeradorTipo, lang: string) =>
    api.post<GeradorResultado>(
      campaignPath(slug, `admin/geradores/${tipo}?lang=${encodeURIComponent(lang)}`),
    ),
};
