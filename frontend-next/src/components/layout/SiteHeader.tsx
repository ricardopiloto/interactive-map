import { Link } from 'react-router-dom'
import { UserMenu } from './UserMenu'
import './SiteHeader.css'

/** Cabeçalho fora de uma campanha — Home, Explorar, Painel, Admin. Equivalente ao SiteChrome do app real. */
export function SiteHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="site-header__brand">Campaign Codex</Link>
      <nav className="site-header__nav" aria-label="Navegação">
        <Link to="/explorar">Início</Link>
        <UserMenu />
      </nav>
    </header>
  )
}
