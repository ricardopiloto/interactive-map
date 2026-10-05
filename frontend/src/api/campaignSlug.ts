/** Active campaign slug for API path composition (set by CampaignShell). */

let activeSlug: string | null = null
let activeOwner: number | null = null
let nextOwnerId = 1

export function setCampaignSlug(slug: string | null): void {
  activeSlug = slug
  if (slug === null) activeOwner = null
}

/** One id per CampaignShell instance. Repeating a claim keeps this id. */
export function nextCampaignSlugOwner(): number {
  return nextOwnerId++
}

/** Record the route slug and its owner. Same owner + same slug is a no-op. */
export function claimCampaignSlug(slug: string | null, owner: number): void {
  if (activeOwner === owner && activeSlug === slug) return
  activeSlug = slug
  activeOwner = owner
}

/** Drop the slug only when this owner still holds it. */
export function releaseCampaignSlug(owner: number): void {
  if (activeOwner !== owner) return
  activeSlug = null
  activeOwner = null
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
