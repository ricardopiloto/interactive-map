import type { ReactNode } from 'react'

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'danger' | 'success' | 'warning'
}) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function Card({
  children,
  className,
  as: As = 'div',
  onClick,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'button'
  onClick?: () => void
}) {
  if (As === 'button') {
    return (
      <button type="button" className={`card card--clickable ${className ?? ''}`.trim()} onClick={onClick}>
        {children}
      </button>
    )
  }
  return <div className={`card ${className ?? ''}`.trim()}>{children}</div>
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {action}
    </div>
  )
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {body ? <p className="empty-state__body">{body}</p> : null}
    </div>
  )
}

export function Avatar({ iniciais, cor, size = 40 }: { iniciais: string; cor: string; size?: number }) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `color-mix(in srgb, ${cor} 28%, var(--bg-elevated))`,
        color: cor,
        border: `1px solid color-mix(in srgb, ${cor} 55%, transparent)`,
      }}
    >
      {iniciais}
    </div>
  )
}

export function StatTable({
  fields,
}: {
  fields: { rotulo: string; valor?: number }[]
}) {
  return (
    <table className="stat-table">
      <thead>
        <tr>
          {fields.map((f) => (
            <th key={f.rotulo}>{f.rotulo}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {fields.map((f) => (
            <td key={f.rotulo}>{f.valor ?? '—'}</td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

export function Pill({ cor, children }: { cor: string; children: ReactNode }) {
  return (
    <span className="pill" style={{ borderColor: cor, color: cor }}>
      {children}
    </span>
  )
}
