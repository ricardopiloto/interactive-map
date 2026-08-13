import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { LanguageSelector } from './LanguageSelector'
import './CodexHeader.css'

interface CodexHeaderProps {
  isGm: boolean
  onToggleGm: () => void
  children?: ReactNode
  extraLeft?: ReactNode
}

export function CodexHeader({ isGm, onToggleGm, children, extraLeft }: CodexHeaderProps) {
  const { t } = useTranslation('comum')
  const location = useLocation()
  const isRelacoes = location.pathname.startsWith('/relacoes')
  const isMapa = !isRelacoes

  return (
    <header className="codex-header">
      <div className="codex-header__left">
        <span className="codex-header__brand">{t('brand')}</span>
        <nav className="codex-header__nav" aria-label={t('nav.mainAria')}>
          <Link
            to="/"
            className={`codex-header__link${isMapa ? ' codex-header__link--active' : ''}`}
          >
            {t('nav.mapa')}
          </Link>
          <Link
            to="/relacoes"
            className={`codex-header__link${isRelacoes ? ' codex-header__link--active' : ''}`}
          >
            {t('nav.relacoes')}
          </Link>
        </nav>
        {isGm && <span className="tag tag-accent">{t('gm.modeTag')}</span>}
        {extraLeft}
      </div>
      <div className="codex-header__right">
        {children}
        <LanguageSelector />
        <button
          type="button"
          className="btn btn-ghost codex-header__gm-toggle"
          onClick={onToggleGm}
        >
          {isGm ? t('gm.exit') : t('gm.restricted')}
        </button>
      </div>
    </header>
  )
}
