import { useParams } from "react-router-dom";
import { api, campaignPath } from "./client";
import { useApi } from "./useApi";

export interface CampaignConfig {
  id: number;
  slug: string;
  nome: string;
  sistema: string;
  has_map_image: boolean;
  indexavel?: boolean;
  map_url: string | null;
  modulos_ativos: string[];
  /** Campaign display unit. The route engine always returns miles. */
  unidade_distancia?: "mi" | "km";
}

/** API key for the campaign in the URL: numeric `id` when the path is canonical, otherwise the slug. */
export function useCampaignKey(): string {
  const { id, slug } = useParams();
  if (id && /^\d+$/.test(id)) return id;
  return slug ?? "";
}

export function useCampaignConfig(slug: string) {
  return useApi(`config:${slug}`, () => api.get<CampaignConfig>(campaignPath(slug, "config")));
}
