import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconUsers } from '@tabler/icons-react'
import { genreById } from '../../theme/genres'
import type { Campaign } from '../../data/types'
import './CampaignCard.css'

interface CampaignCardProps {
  campaign: Campaign
  /** Se dado, o cartão inteiro é um link pra /c/:slug. Omita quando o rodapé já tem um link/botão próprio (evita <a> aninhado). */
  linkTo?: string
  /** Versão enxuta pra vitrines (sem resumo nem contagem de jogadores) — usada na Home/marketing. */
  compact?: boolean
  footer?: ReactNode
}

/**
 * Um único cartão de campanha, reusado em Home (pública), Explorar
 * (catálogo) e Painel (mestre) — antes cada tela tinha sua própria versão
 * quase idêntica; ficava difícil de perceber que eram a mesma coisa.
 */
export function CampaignCard({ campaign: c, linkTo, compact, footer }: CampaignCardProps) {
  const genre = genreById(c.genero)
  const inner = (
    <>
      <div className="campaign-card__cover" style={{ background: c.capaGradient }}>
        <span className="badge" style={{ background: genre.swatch, color: '#17140d' }}>{genre.label}</span>
      </div>
      <div className="campaign-card__body">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="badge badge-accent">{c.sistema}</span>
          {!compact && (
            <span className="text-3 row gap-1"><IconUsers size={13} aria-hidden /> {c.jogadores}</span>
          )}
        </div>
        <h3 className="campaign-card__title">{c.nome}</h3>
        {!compact && <p className="text-2 campaign-card__summary">{c.resumo}</p>}
        {footer}
      </div>
    </>
  )

  if (linkTo) {
    return (
      <Link to={linkTo} className="card campaign-card">
        {inner}
      </Link>
    )
  }
  return <div className="card campaign-card">{inner}</div>
}
