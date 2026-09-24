import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { IconMap2, IconX, IconCompass } from '@tabler/icons-react'
import { CAMPAIGNS } from '../../data/mock'
import './ProtoNav.css'

/**
 * Navegação de bastidores do PROTÓTIPO (não é UI do produto real) — deixa
 * Ricardo pular entre qualquer tela sem decorar URLs. Fica sempre por cima,
 * com identidade neutra própria, para nunca ser confundida com o produto.
 */
export function ProtoNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const links: { to: string; label: string }[] = [
    { to: '/', label: 'Apresentação (marketing)' },
    { to: '/explorar', label: 'Descobrir campanhas (jogador)' },
    { to: '/entrar', label: 'Entrar (mestre)' },
    { to: '/painel', label: 'Painel do mestre' },
    { to: '/painel/novo', label: 'Criar novo codex' },
    { to: '/admin', label: 'Console do administrador' },
    ...CAMPAIGNS.map((c) => ({ to: `/c/${c.slug}`, label: `Campanha · ${c.nome}` })),
  ]

  return (
    <div className="proto-nav" data-open={open}>
      {open && (
        <div className="proto-nav__panel">
          <div className="proto-nav__title">
            <IconCompass size={16} aria-hidden />
            Protótipo — saltar para
          </div>
          <div className="proto-nav__list">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`proto-nav__link${location.pathname === l.to ? ' is-active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <button type="button" className="proto-nav__fab" onClick={() => setOpen((o) => !o)} aria-label="Abrir navegação do protótipo">
        {open ? <IconX size={18} aria-hidden /> : <IconMap2 size={18} aria-hidden />}
      </button>
    </div>
  )
}
