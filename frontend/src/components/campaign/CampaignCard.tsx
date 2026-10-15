import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './CampaignCard.css'

export type CampaignCardProps = {
  slug: string
  nome: string
  sistema: string
  capa_url?: string | null
  linkTo?: string
  compact?: boolean
  footer?: ReactNode
  className?: string
}

export function CampaignCard({
  slug,
  nome,
  sistema,
  capa_url,
  linkTo,
  compact = false,
  footer,
  className = '',
}: CampaignCardProps) {
  const cls = `campaign-card${compact ? ' campaign-card--compact' : ''} ${className}`.trim()
  const inner = (
    <>
      <div className="campaign-card__cover">
        {capa_url ? (
          <img className="campaign-card__cover-img" src={capa_url} alt="" />
        ) : (
          <span className="campaign-card__cover-placeholder" aria-hidden />
        )}
      </div>
      <div className="campaign-card__body">
        <span className="campaign-card__sistema">{sistema}</span>
        <h3 className="campaign-card__title">{nome}</h3>
        {!compact ? <p className="campaign-card__slug text-muted">{slug}</p> : null}
        {footer}
      </div>
    </>
  )

  if (linkTo) {
    return (
      <Link to={linkTo} className={cls}>
        {inner}
      </Link>
    )
  }

  return (
    <div className={cls}>
      {inner}
    </div>
  )
}
