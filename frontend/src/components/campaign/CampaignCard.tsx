import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { resolveGenreId } from '../../theme/genres'
import './CampaignCard.css'

export type CampaignCardProps = {
  slug: string
  nome: string
  sistema: string
  genero: string
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
  genero,
  capa_url,
  linkTo,
  compact = false,
  footer,
  className = '',
}: CampaignCardProps) {
  const { t } = useTranslation('comum')
  const genre = resolveGenreId(genero)
  const cls = `campaign-card${compact ? ' campaign-card--compact' : ''} ${className}`.trim()
  const coverStyle = {
    '--card-genre-swatch': `var(--genre-swatch-${genre})`,
  } as CSSProperties

  const inner = (
    <>
      <div className="campaign-card__cover" data-genre={genre} style={coverStyle}>
        {capa_url ? (
          <img className="campaign-card__cover-img" src={capa_url} alt="" />
        ) : (
          <span className="campaign-card__cover-placeholder" aria-hidden />
        )}
        <span className="campaign-card__genre-badge">{t(`painel.genre_${genre}`)}</span>
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
      <Link to={linkTo} className={cls} data-genre={genre}>
        {inner}
      </Link>
    )
  }

  return (
    <div className={cls} data-genre={genre}>
      {inner}
    </div>
  )
}
