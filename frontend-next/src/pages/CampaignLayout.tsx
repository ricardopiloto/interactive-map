import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import {
  IconMap2, IconUsers, IconRoute2, IconBook2, IconChevronDown,
  IconEdit, IconEye,
} from '@tabler/icons-react'
import { useCampaigns } from '../data/CampaignsStore'
import type { Campaign, GrupoPosicao } from '../data/types'
import { useCampaignGenre } from '../theme/ThemeContext'
import { ThemeSelector } from '../components/layout/ThemeSelector'
import { UserMenu } from '../components/layout/UserMenu'
import { IconSettings } from '@tabler/icons-react'
import { groupCopy } from '../components/map/groupCopy'
import { arcoCopy } from '../components/map/arcoCopy'
import './CampaignLayout.css'

export interface CampaignCtx {
  campaign: Campaign
  isGm: boolean
  groupMarker: GrupoPosicao
  setGroupMarker: (group: GrupoPosicao) => void
  moveGroupMode: boolean
  setMoveGroupMode: (active: boolean) => void
  arcoManagerOpen: boolean
  setArcoManagerOpen: (open: boolean) => void
}

export function CampaignLayout() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getBySlug } = useCampaigns()
  const campaign = slug ? getBySlug(slug) : undefined
  const [isGm, setIsGm] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [groupMarker, setGroupMarkerState] = useState<GrupoPosicao>({ x: 0.5, y: 0.5, formato: 'bandeira' })
  const [moveGroupMode, setMoveGroupMode] = useState(false)
  const [arcoManagerOpen, setArcoManagerOpen] = useState(false)

  useEffect(() => {
    if (campaign) setGroupMarkerState({ ...campaign.grupo, formato: campaign.grupo.formato ?? 'bandeira' })
  }, [campaign])

  useEffect(() => {
    if (!isGm) {
      setToolsOpen(false)
      setMoveGroupMode(false)
      setArcoManagerOpen(false)
    }
  }, [isGm])

  function setGroupMarker(group: GrupoPosicao) { setGroupMarkerState(group) }

  useCampaignGenre(campaign?.genero)

  const tabs = useMemo(
    () => [
      { to: '', label: 'Mapa', icon: IconMap2, end: true },
      { to: 'relacoes', label: 'Relações', icon: IconUsers },
      { to: 'rota', label: 'Rota', icon: IconRoute2 },
      { to: 'sessoes', label: 'Sessões', icon: IconBook2 },
    ],
    [],
  )

  if (!campaign) {
    return (
      <div className="campaign-missing">
        <h1>Codex não encontrado</h1>
        <p className="text-2">Esse link não corresponde a nenhuma campanha deste protótipo.</p>
        <Link to="/explorar" className="btn btn-primary">Ver campanhas disponíveis</Link>
      </div>
    )
  }

  return (
    <div className="campaign-shell">
      <header className="campaign-bar">
        <div className="campaign-bar__left">
          <Link to="/explorar" className="campaign-bar__brand">Campaign Codex</Link>
          <span className="campaign-bar__sep" aria-hidden>›</span>
          <div className="campaign-bar__switcher">
            <button type="button" className="campaign-bar__campaign" onClick={() => setMenuOpen((o) => !o)}>
              {campaign.nome}
              <IconChevronDown size={15} aria-hidden />
            </button>
            {menuOpen && (
              <div className="campaign-bar__menu" onMouseLeave={() => setMenuOpen(false)}>
                <div className="text-3" style={{ padding: '6px 10px 2px' }}>{campaign.sistema}</div>
                <button type="button" className="campaign-bar__menu-item" onClick={() => { setMenuOpen(false); navigate('/painel') }}>
                  Minhas campanhas
                </button>
                <button type="button" className="campaign-bar__menu-item" onClick={() => { setMenuOpen(false); navigate('/explorar') }}>
                  Descobrir outras
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="campaign-bar__tabs" aria-label="Navegação da campanha">
          {tabs.map((t) => (
            <NavLink
              key={t.label}
              to={t.to}
              end={t.end}
              className={({ isActive }) => `campaign-bar__tab${isActive ? ' is-active' : ''}`}
            >
              <t.icon size={16} aria-hidden />
              {t.label}
            </NavLink>
          ))}
        </nav>

        <div className="campaign-bar__right">
          {isGm && <div className="campaign-tools">
            <button type="button" className="chip" aria-haspopup="menu" aria-expanded={toolsOpen} aria-label={groupCopy('tools')} onClick={() => setToolsOpen((open) => !open)}>
              <IconSettings size={15} aria-hidden />{groupCopy('tools')}
            </button>
            {toolsOpen && <div className="campaign-bar__menu campaign-tools__menu" role="menu">
              <button type="button" role="menuitem" className="campaign-bar__menu-item" onClick={() => { setArcoManagerOpen(true); setMoveGroupMode(false); setToolsOpen(false); navigate(`/c/${campaign.slug}`) }}>{arcoCopy('manage')}</button>
              <button type="button" role="menuitem" className="campaign-bar__menu-item" onClick={() => { setMoveGroupMode(true); setArcoManagerOpen(false); setToolsOpen(false); navigate(`/c/${campaign.slug}`) }}>{groupCopy('move')}</button>
              <button type="button" role="menuitem" className="campaign-bar__menu-item" onClick={() => { setGroupMarker({ ...groupMarker, formato: groupMarker.formato === 'brasao' ? 'bandeira' : 'brasao' }); setToolsOpen(false) }}>{groupMarker.formato === 'brasao' ? groupCopy('formFlag') : groupCopy('form')}</button>
            </div>}
          </div>}
          <button
            type="button"
            className={`chip campaign-bar__mode-toggle${isGm ? ' is-active' : ''}`}
            onClick={() => setIsGm((v) => !v)}
            title="Alternar entre visão de jogador e Modo mestre"
          >
            {isGm ? <IconEdit size={15} aria-hidden /> : <IconEye size={15} aria-hidden />}
            {isGm ? 'Modo mestre' : 'Vendo como jogador'}
          </button>
          <ThemeSelector />
          <UserMenu includeTheme={false} />
        </div>
      </header>

      <main className="campaign-main">
        <Outlet context={{ campaign, isGm, groupMarker, setGroupMarker, moveGroupMode, setMoveGroupMode, arcoManagerOpen, setArcoManagerOpen } satisfies CampaignCtx} />
      </main>

      <nav className="campaign-tabbar" aria-label="Navegação da campanha (celular)">
        {tabs.map((t) => (
          <NavLink key={t.label} to={t.to} end={t.end} className={({ isActive }) => `campaign-tabbar__item${isActive ? ' is-active' : ''}`}>
            <t.icon size={20} aria-hidden />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
