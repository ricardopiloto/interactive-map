import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { IconChevronDown, IconEdit, IconEye } from '@tabler/icons-react'
import { useEditMode } from '../../context/EditModeContext'
import { campaignNavItems } from './campaignNav'
import { CampaignBottomNav } from './CampaignBottomNav'
import { ThemeSelector } from './ThemeSelector'
import { UserMenu } from './UserMenu'
import './CodexHeader.css'

interface CodexHeaderProps {
  /** Campaign display name (plain text). */
  campaignName?: string | null
  /** When false, hide the Mapa nav link (no map image and not edit mode). Default true. */
  showMapNav?: boolean
  children?: ReactNode
  extraLeft?: ReactNode
}

export function CodexHeader({
  campaignName,
  showMapNav = true,
  children,
  extraLeft,
}: CodexHeaderProps) {
  const { t } = useTranslation('comum')
  const navigate = useNavigate()
  const { slug = '' } = useParams<{ slug: string }>()
  const { enabled, canEdit, toggle } = useEditMode()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)
  const switcherMenuId = useId()

  const tabs = slug
    ? campaignNavItems(slug).filter((tab) => tab.id !== 'mapa' || showMapNav)
    : []

  useEffect(() => {
    if (!switcherOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!switcherRef.current?.contains(e.target as Node)) setSwitcherOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [switcherOpen])

  return (
    <>
      <header className="codex-header">
        <div className="codex-header__left">
          <Link to="/" className="codex-header__brand">
            {t('brand')}
          </Link>
          {campaignName ? (
            <>
              <span className="codex-header__sep" aria-hidden>
                ›
              </span>
              <div className="codex-header__switcher" ref={switcherRef}>
                <button
                  type="button"
                  className="codex-header__campaign"
                  title={campaignName}
                  aria-label={t('campaignSwitcher.aria')}
                  aria-haspopup="menu"
                  aria-expanded={switcherOpen}
                  aria-controls={switcherMenuId}
                  onClick={() => setSwitcherOpen((o) => !o)}
                >
                  <span className="codex-header__campaign-name">{campaignName}</span>
                  <IconChevronDown size={15} aria-hidden />
                </button>
                {switcherOpen ? (
                  <div
                    id={switcherMenuId}
                    role="menu"
                    className="codex-header__switcher-menu"
                    onMouseLeave={() => setSwitcherOpen(false)}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="codex-header__switcher-item"
                      onClick={() => {
                        setSwitcherOpen(false)
                        navigate('/painel')
                      }}
                    >
                      {t('campaignSwitcher.myCampaigns')}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="codex-header__switcher-item"
                      onClick={() => {
                        setSwitcherOpen(false)
                        navigate('/')
                      }}
                    >
                      {t('campaignSwitcher.discover')}
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
          {extraLeft}
        </div>

        {slug ? (
          <nav className="codex-header__tabs" aria-label={t('nav.mainAria')}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <NavLink
                  key={tab.id}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) => `codex-header__tab${isActive ? ' is-active' : ''}`}
                >
                  <Icon size={16} aria-hidden />
                  {t(`nav.${tab.labelKey}`)}
                </NavLink>
              )
            })}
          </nav>
        ) : null}

        <div className="codex-header__right">
          {children}
          {canEdit ? (
            <button
              type="button"
              className={`codex-header__edit-toggle${enabled ? ' is-active' : ''}`}
              aria-pressed={enabled}
              title={enabled ? t('editMode.onTitle') : t('editMode.offTitle')}
              onClick={toggle}
            >
              {enabled ? <IconEdit size={15} aria-hidden /> : <IconEye size={15} aria-hidden />}
              <span className="codex-header__edit-label">
                {enabled ? t('editMode.on') : t('editMode.off')}
              </span>
            </button>
          ) : null}
          <ThemeSelector />
          <UserMenu includeTheme={false} />
        </div>
      </header>
      {slug ? <CampaignBottomNav slug={slug} showMapNav={showMapNav} /> : null}
    </>
  )
}
