import { useMemo } from 'react'
import { IconSkull, IconGhost2, IconQuestionMark } from '@tabler/icons-react'
import type { Personagem, Vinculo, VinculoFamilia } from '../../data/types'
import './RelationGraph.css'

const W = 900
const H = 680
const CX = W / 2
const CY = H / 2

const FAMILY_VAR: Record<VinculoFamilia, string> = {
  afinidade: 'var(--link-affinity)',
  laco: 'var(--link-bond)',
  hostil: 'var(--link-hostile)',
  neutro: 'var(--link-neutral)',
}

interface Pos { id: string; x: number; y: number }

function layout(personagens: Personagem[], vinculos: Vinculo[], focusId: string | null): Pos[] {
  if (personagens.length === 0) return []
  if (!focusId) {
    const r = Math.min(W, H) * 0.36
    return personagens.map((p, i) => {
      const angle = (i / personagens.length) * Math.PI * 2 - Math.PI / 2
      return { id: p.id, x: CX + Math.cos(angle) * r, y: CY + Math.sin(angle) * r }
    })
  }
  const neighbors = new Set<string>()
  vinculos.forEach((v) => {
    if (v.aId === focusId) neighbors.add(v.bId)
    if (v.bId === focusId) neighbors.add(v.aId)
  })
  const inner = personagens.filter((p) => neighbors.has(p.id))
  const outer = personagens.filter((p) => p.id !== focusId && !neighbors.has(p.id))
  const positions: Pos[] = [{ id: focusId, x: CX, y: CY }]
  const rInner = Math.min(W, H) * 0.26
  inner.forEach((p, i) => {
    const angle = (i / Math.max(inner.length, 1)) * Math.PI * 2 - Math.PI / 2
    positions.push({ id: p.id, x: CX + Math.cos(angle) * rInner, y: CY + Math.sin(angle) * rInner })
  })
  const rOuter = Math.min(W, H) * 0.46
  outer.forEach((p, i) => {
    const angle = (i / Math.max(outer.length, 1)) * Math.PI * 2 - Math.PI / 2 + 0.3
    positions.push({ id: p.id, x: CX + Math.cos(angle) * rOuter, y: CY + Math.sin(angle) * rOuter })
  })
  return positions
}

const STATUS_ICON = { morto: IconSkull, desaparecido: IconGhost2, desconhecido: IconQuestionMark } as const

export function RelationGraph({
  personagens, vinculos, focusId, hoveredId, onSelect, onHover, activeFamilies,
}: {
  personagens: Personagem[]
  vinculos: Vinculo[]
  focusId: string | null
  hoveredId: string | null
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
  activeFamilies: Set<VinculoFamilia>
}) {
  const positions = useMemo(() => layout(personagens, vinculos, focusId), [personagens, vinculos, focusId])
  const posById = useMemo(() => new Map(positions.map((p) => [p.id, p])), [positions])
  const neighborsOfFocus = useMemo(() => {
    if (!focusId) return null
    const s = new Set<string>([focusId])
    vinculos.forEach((v) => { if (v.aId === focusId) s.add(v.bId); if (v.bId === focusId) s.add(v.aId) })
    return s
  }, [focusId, vinculos])

  return (
    <svg className="rel-graph" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Grafo de relações entre personagens">
      <g className="rel-graph__edges">
        {vinculos
          .filter((v) => activeFamilies.has(v.familia))
          .map((v) => {
            const a = posById.get(v.aId)
            const b = posById.get(v.bId)
            if (!a || !b) return null
            const dim = focusId ? !(v.aId === focusId || v.bId === focusId) : false
            const stroke = FAMILY_VAR[v.familia]
            const isDouble = v.tipo === 'vinculo_sangue'
            const dash =
              v.tipo === 'familia' ? '2 6' :
              v.tipo === 'adversario' ? '7 5' :
              v.tipo === 'conhecido' ? '2 5' : undefined
            const width = v.tipo === 'aliado' ? 3 : v.tipo === 'conhecido' ? 1.4 : 2
            if (isDouble) {
              const dx = b.y - a.y, dy = a.x - b.x
              const len = Math.hypot(dx, dy) || 1
              const ox = (dx / len) * 2.2, oy = (dy / len) * 2.2
              return (
                <g key={v.id} className={`rel-graph__edge${dim ? ' is-dim' : ''}`}>
                  <line x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke={stroke} strokeWidth={1.6} />
                  <line x1={a.x - ox} y1={a.y - oy} x2={b.x - ox} y2={b.y - oy} stroke={stroke} strokeWidth={1.6} />
                </g>
              )
            }
            return (
              <line
                key={v.id}
                className={`rel-graph__edge${dim ? ' is-dim' : ''}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={stroke} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round"
              />
            )
          })}
      </g>
      <g className="rel-graph__nodes">
        {positions.map((pos) => {
          const p = personagens.find((x) => x.id === pos.id)
          if (!p) return null
          const isFocus = pos.id === focusId
          const isHovered = pos.id === hoveredId
          const dim = neighborsOfFocus ? !neighborsOfFocus.has(pos.id) : false
          const StatusIcon = p.status !== 'vivo' ? STATUS_ICON[p.status as keyof typeof STATUS_ICON] : null
          const r = isFocus ? 30 : 24
          return (
            <g
              key={pos.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className={`rel-graph__node${isFocus ? ' is-focus' : ''}${isHovered ? ' is-hovered' : ''}${dim ? ' is-dim' : ''}${p.tipo === 'pj' ? ' is-pj' : ''}`}
              onClick={() => onSelect(pos.id)}
              onMouseEnter={() => onHover(pos.id)}
              onMouseLeave={() => onHover(null)}
              role="button"
              tabIndex={0}
              aria-label={p.nome}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(pos.id) }}
            >
              <circle r={r} className="rel-graph__node-circle" />
              <text className="rel-graph__node-initials" dy="0.35em" textAnchor="middle">{p.nome.slice(0, 2).toUpperCase()}</text>
              {StatusIcon && (
                <g transform={`translate(${r * 0.62}, ${r * 0.62})`} className="rel-graph__status-badge">
                  <circle r="9" />
                  <StatusIcon size={11} x={-5.5} y={-5.5} aria-hidden />
                </g>
              )}
              <text className="rel-graph__node-label" y={r + 16} textAnchor="middle">{p.nome}</text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
