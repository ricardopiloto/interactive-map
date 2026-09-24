import type { ComponentType } from 'react'
import { IconBook2, IconHistory, IconMap2, IconRoute2, IconUsers } from '@tabler/icons-react'

export type CampaignNavId = 'mapa' | 'relacoes' | 'rota' | 'sessoes' | 'linha-tempo'

export type CampaignNavItem = {
  id: CampaignNavId
  /** i18n key under `comum.nav.*` */
  labelKey: 'mapa' | 'relacoes' | 'rota' | 'sessoes' | 'linhaTempo'
  to: string
  end?: boolean
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
}

/** Build campaign section tabs for the given slug. */
export function campaignNavItems(slug: string): CampaignNavItem[] {
  const base = `/c/${slug}`
  return [
    { id: 'mapa', labelKey: 'mapa', to: base, end: true, icon: IconMap2 },
    { id: 'relacoes', labelKey: 'relacoes', to: `${base}/relacoes`, icon: IconUsers },
    { id: 'rota', labelKey: 'rota', to: `${base}/rota`, icon: IconRoute2 },
    { id: 'sessoes', labelKey: 'sessoes', to: `${base}/sessoes`, icon: IconBook2 },
    {
      id: 'linha-tempo',
      labelKey: 'linhaTempo',
      to: `${base}/linha-do-tempo`,
      icon: IconHistory,
    },
  ]
}

/** Which tab is active for the current pathname. */
export function activeCampaignNavId(pathname: string, slug: string): CampaignNavId {
  const base = `/c/${slug}`
  if (pathname.includes(`${base}/relacoes`) || pathname.endsWith('/relacoes')) return 'relacoes'
  if (pathname.includes(`${base}/rota`) || pathname.endsWith('/rota')) return 'rota'
  if (pathname.includes(`${base}/sessoes`) || pathname.endsWith('/sessoes')) return 'sessoes'
  if (
    pathname.includes(`${base}/linha-do-tempo`) ||
    pathname.endsWith('/linha-do-tempo')
  ) {
    return 'linha-tempo'
  }
  return 'mapa'
}
