import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './CodexHeader.css'

interface CodexHeaderProps {
  isGm: boolean
  onToggleGm: () => void
  /** Right-side GM actions (buttons/dialog triggers) rendered before the GM toggle. */
  children?: ReactNode
  /** Extra content in the left cluster, after the nav (e.g. page-specific GM tools). */
  extraLeft?: ReactNode
}

export function CodexHeader({ isGm, onToggleGm, children, extraLeft }: CodexHeaderProps) {
  const location = useLocation()
  const isRelacoes = location.pathname.startsWith('/relacoes')
  const isMapa = !isRelacoes

  return (
    <header className="codex-header">
      <div className="codex-header__left">
        <span className="codex-header__brand">Codex da Campanha</span>
        <nav className="codex-header__nav" aria-label="Navegação principal">
          <Link
            to="/"
            className={`codex-header__link${isMapa ? ' codex-header__link--active' : ''}`}
          >
            Mapa
          </Link>
          <Link
            to="/relacoes"
            className={`codex-header__link${isRelacoes ? ' codex-header__link--active' : ''}`}
          >
            Relações
          </Link>
        </nav>
        {isGm && <span className="tag tag-accent">Modo GM</span>}
        {extraLeft}
      </div>
      <div className="codex-header__right">
        {children}
        <button
          type="button"
          className="btn btn-ghost codex-header__gm-toggle"
          onClick={onToggleGm}
        >
          {isGm ? 'Modo GM · Sair' : 'Acesso restrito (GM)'}
        </button>
      </div>
    </header>
  )
}
