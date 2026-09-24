/** Active campaign slug for API path composition (set by CampaignShell). */

let activeSlug: string | null = null

export function setCampaignSlug(slug: string | null): void {
  activeSlug = slug
}

export function getCampaignSlug(): string | null {
  return activeSlug
}

export function requireCampaignSlug(): string {
  if (!activeSlug) {
    throw new Error('CAMPAIGN_SLUG_REQUIRED')
  }
  return activeSlug
}

export function campaignApiPrefix(slug?: string): string {
  const s = slug ?? requireCampaignSlug()
  return `/api/c/${s}`
}

export function campaignAdminPrefix(slug?: string): string {
  return `${campaignApiPrefix(slug)}/admin`
}

export function campaignMediaUrl(
  category: 'map' | 'portraits' | 'locals' | 'covers',
  filename: string,
  slug?: string,
): string {
  const s = slug ?? requireCampaignSlug()
  return `/api/c/${s}/media/${category}/${filename}`
}

/** Prefer map_url from config; fallback empty (no hardcoded campaign-map.*). */
export function defaultMapUrl(slug?: string, mapUrl?: string | null, mapaArquivo?: string | null): string {
  if (mapUrl) return mapUrl
  if (mapaArquivo) return campaignMediaUrl('map', mapaArquivo, slug)
  return ''
}
