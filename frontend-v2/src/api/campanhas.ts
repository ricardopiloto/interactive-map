import { api, campaignPath, requestBlob } from "./client";

export interface CatalogoItem {
  id: number;
  slug: string;
  nome: string;
  sistema: string;
  capa_url?: string | null;
}

export interface PainelItem {
  id: number;
  slug: string;
  nome: string;
  sistema: string;
  visibilidade: "listada" | "so_link" | string;
  unidade_distancia?: "mi" | "km" | string;
  capa_url?: string | null;
  bytes_usados: number;
  cota_bytes: number;
  aviso_cota: boolean;
  modulos_ativos: string[];
}

export interface CampanhaCriada {
  slug: string;
  id: number;
  nome: string;
  sistema: string;
  visibilidade?: string;
}

export type TipoAssistencia =
  | "rascunho_sessao"
  | "fios_narrativos"
  | "resumo_sessao"
  | "descricao_personagem"
  | "descricao_local";

export interface AssistirRequest {
  tipo: TipoAssistencia;
  texto_atual: string;
  instrucao: string;
  alvo_id: number | null;
  campo_publico: boolean;
}

export interface AssistirResponse {
  estado: "sugestao" | "vazio" | "falha";
  texto: string | null;
  mensagem: string;
  usou_conteudo_oculto: boolean;
  truncado: boolean;
  limite_caracteres: number;
  campo_destino: string;
}

export const campanhasApi = {
  assistir: (slug: string, body: AssistirRequest) =>
    api.post<AssistirResponse>(campaignPath(slug, "admin/ia/assistir"), body),
  catalogo: () => api.get<{ campanhas: CatalogoItem[] }>("/api/campanhas/catalogo"),
  minhas: () => api.get<{ campanhas: PainelItem[] }>("/api/campanhas/minhas"),
  criar: (body: {
    nome: string;
    slug: string;
    sistema: string;
    visibilidade?: "listada" | "so_link";
  }) => api.post<CampanhaCriada>("/api/campanhas", body),
  patchVisibilidade: (slug: string, visibilidade: "listada" | "so_link") =>
    api.patch<{ slug: string; visibilidade: string }>(
      `/api/campanhas/${encodeURIComponent(slug)}/visibilidade`,
      { visibilidade },
    ),
  patchUnidadeDistancia: (slug: string, unidade_distancia: "mi" | "km") =>
    api.patch<{ slug: string; unidade_distancia: string }>(
      `/api/campanhas/${encodeURIComponent(slug)}/unidade-distancia`,
      { unidade_distancia },
    ),
  patchModulo: (slug: string, modulo: "ia_arcos", ativo: boolean) =>
    api.patch<{ slug: string; modulos_ativos: string[] }>(
      `/api/campanhas/${encodeURIComponent(slug)}/modulos`,
      { modulo, ativo },
    ),
  patchCapa: (slug: string, body: { capa_arquivo?: string | null; limpar_capa?: boolean }) =>
    api.patch<{ slug: string; capa_arquivo: string; capa_url: string | null }>(
      `/api/campanhas/${encodeURIComponent(slug)}/capa`,
      body,
    ),
  uploadCapa: (slug: string, file: File) => {
    const body = new FormData();
    body.append("category", "covers");
    body.append("file", file);
    return api.upload<{ url: string }>(campaignPath(slug, "admin/uploads"), body);
  },
  exportZip: (slug: string) => requestBlob(campaignPath(slug, "admin/export")),
  importZip: (file: File, slug?: string) => {
    const body = new FormData();
    body.append("file", file);
    if (slug) body.append("slug", slug);
    return api.upload<CampanhaCriada>("/api/campanhas/import", body);
  },
};
