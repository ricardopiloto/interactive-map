import { api, campaignPath } from "./client";

export interface EstadoIndiceIa {
  estado: "ausente" | "ok" | "desatualizado" | "indisponivel";
  registros: number;
  trechos: number;
  atualizado_em: string | null;
}

const path = (slug: string, suffix = "") => campaignPath(slug, `admin/ia/indice${suffix}`);

export const indiceIaApi = {
  estado: (slug: string) => api.get<EstadoIndiceIa>(path(slug)),
  reindexar: (slug: string) => api.post<EstadoIndiceIa>(path(slug, "/reindexar")),
};
