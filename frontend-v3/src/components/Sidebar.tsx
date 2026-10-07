import { NavLink } from 'react-router-dom'
import {
  IconLayoutDashboard,
  IconMap2,
  IconBook2,
  IconAffiliate,
  IconTimeline,
  IconNotebook,
  IconHistory,
  IconFlask2,
} from '@tabler/icons-react'
import { campanha } from '../data/mock'

const ITEMS = [
  { to: '/', label: 'Painel', icon: IconLayoutDashboard, end: true },
  { to: '/codex', label: 'Codex', icon: IconBook2 },
  { to: '/mapa', label: 'Mapa', icon: IconMap2 },
  { to: '/relacoes', label: 'Relações', icon: IconAffiliate },
  { to: '/linha-do-tempo', label: 'Linha do Tempo', icon: IconTimeline },
  { to: '/prep', label: 'Preparação', icon: IconNotebook },
  { to: '/sessoes', label: 'Sessões', icon: IconHistory },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark">
          <IconFlask2 size={20} aria-hidden />
        </div>
        <div>
          <p className="sidebar__brand-title">Campaign Codex</p>
          <p className="sidebar__brand-sub">v3 · protótipo</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
          >
            <item.icon size={18} aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__campaign">
        <p className="sidebar__campaign-label">Campanha ativa</p>
        <p className="sidebar__campaign-name">{campanha.nome}</p>
        <p className="sidebar__campaign-system">{campanha.sistema}</p>
      </div>
    </aside>
  )
}
