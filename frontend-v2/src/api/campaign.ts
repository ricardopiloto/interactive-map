import { api, campaignPath } from "./client";
import { useApi } from "./useApi";

export interface CampaignConfig {
  slug: string;
  nome: string;
  sistema: string;
  genero: string;
  has_map_image: boolean;
  map_url: string | null;
  modulos_ativos: string[];
  /** Campaign display unit. The route engine always returns miles. */
  unidade_distancia?: "mi" | "km";
}

export function useCampaignConfig(slug: string) {
  return useApi(`config:${slug}`, () => api.get<CampaignConfig>(campaignPath(slug, "config")));
}
