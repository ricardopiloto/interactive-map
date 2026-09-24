import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './ui.css'

export type ChipVariant = 'default' | 'accent' | 'neutral' | 'outline'

export interface ChipProps {
  children: ReactNode
  variant?: ChipVariant
  className?: string
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
  disabled?: boolean
  'aria-label'?: string
  'aria-pressed'?: boolean | 'true' | 'false' | 'mixed'
}

export function Chip({
  children,
  variant = 'default',
  className = '',
  onClick,
  type = 'button',
  disabled,
  ...aria
}: ChipProps) {
  const cls = `ui-chip ui-chip--${variant} ${className}`.trim()
  if (onClick) {
    return (
      <button type={type} className={cls} onClick={onClick} disabled={disabled} {...aria}>
        {children}
      </button>
    )
  }
  return (
    <span className={cls} {...aria}>
      {children}
    </span>
  )
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`ui-card ${className}`.trim()}>{children}</div>
}

export function CardMeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`ui-card__meta ${className}`.trim()}>{children}</div>
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="ui-empty">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  )
}

export function Skeleton({
  width = '100%',
  height = '1em',
}: {
  width?: string | number
  height?: string | number
}) {
  return <span className="ui-skeleton" style={{ width, height }} aria-hidden />
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="ui-tabs" role="tablist">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          className="ui-tabs__tab ui-touch"
          aria-selected={value === it.id}
          onClick={() => onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}
