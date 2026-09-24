import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { activeCampaignNavId, campaignNavItems } from './campaignNav'
import './CampaignBottomNav.css'

export function CampaignBottomNav({
  slug,
  showMapNav = true,
}: {
  slug: string
  showMapNav?: boolean
}) {
  const { t } = useTranslation('comum')
  const location = useLocation()
  const tabs = campaignNavItems(slug).filter((tab) => tab.id !== 'mapa' || showMapNav)
  const activeId = activeCampaignNavId(location.pathname, slug)

  return (
    <nav className="campaign-bottom-nav" aria-label={t('nav.bottomAria')}>
      {tabs.map((tab) => {
        const active = activeId === tab.id
        const Icon = tab.icon
        return (
          <Link
            key={tab.id}
            to={tab.to}
            className={`campaign-bottom-nav__item${active ? ' campaign-bottom-nav__item--active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={20} aria-hidden />
            <span>{t(`nav.${tab.labelKey}`)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
