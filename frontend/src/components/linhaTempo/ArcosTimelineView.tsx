import { useMemo, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState, Button } from '../ui'
import type { Arco, Evento, Sessao } from '../../types'
import {
  computeArcosLayout,
  DOT_RADIUS,
  LANE_WIDTH,
  ROW_HEIGHT,
  SEM_ARCO_KEY,
  type Connector,
} from './arcosLayout'
import './ArcosTimelineView.css'

const NEUTRAL_LANE_COLOR = '#958f83'

interface ArcosTimelineViewProps {
  arcos: Arco[]
  sessoes: Sessao[]
  eventos: Evento[]
  onBackToCronologico: () => void
}

export function ArcosTimelineView({
  arcos,
  sessoes,
  eventos,
  onBackToCronologico,
}: ArcosTimelineViewProps) {
  const { t } = useTranslation('linhaTempo')
  const [activeKeys, setActiveKeys] = useState<Set<string>>(() => new Set())

  const layout = useMemo(
    () => computeArcosLayout(arcos, sessoes, eventos, activeKeys.size === 0 ? null : activeKeys),
    [arcos, sessoes, eventos, activeKeys],
  )

  function toggleLane(key: string) {
    setActiveKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function resetFilter() {
    setActiveKeys(new Set())
  }

  if (arcos.length === 0) {
    return (
      <div className="arcos-timeline arcos-timeline--empty">
        <EmptyState title={t('arcos.emptyTitle')} description={t('arcos.emptyBody')} />
        <Button variant="secondary" type="button" onClick={onBackToCronologico}>
          {t('arcos.backToCronologico')}
        </Button>
      </div>
    )
  }

  const laneVisible = (key: string) => activeKeys.size === 0 || activeKeys.has(key)

  function elapsedLabel(years: number, months: number): string {
    const yearsText = years > 0 ? t('arcos.elapsedYears', { count: years }) : ''
    const monthsText = months > 0 ? t('arcos.elapsedMonths', { count: months }) : ''
    if (yearsText && monthsText) return t('arcos.elapsedBoth', { years: yearsText, months: monthsText })
    if (yearsText) return yearsText
    if (monthsText) return monthsText
    return t('arcos.elapsedSame')
  }

  const labelColumnX = layout.width + 20

  function colorForKey(key: string): string {
    const lane = layout.lanes.find((item) => item.key === key)
    return lane?.arco?.cor || NEUTRAL_LANE_COLOR
  }

  function connectorPath(c: Connector): string {
    if (c.orientation === 'vertical') return `M ${c.x1} ${c.y1} L ${c.x2} ${c.y2}`
    const dy = (c.y2 - c.y1) / 2
    return `M ${c.x1} ${c.y1} C ${c.x1} ${c.y1 + dy}, ${c.x2} ${c.y2 - dy}, ${c.x2} ${c.y2}`
  }

  return (
    <div className="arcos-timeline">
      <div className="arcos-timeline__chips" role="group" aria-label={t('arcos.filterAria')}>
        {layout.lanes.map((lane) => {
          const label = lane.arco ? lane.arco.titulo : t('arcos.semArco')
          const color = lane.arco?.cor || (lane.key === SEM_ARCO_KEY ? NEUTRAL_LANE_COLOR : undefined)
          const active = laneVisible(lane.key)
          return (
            <button
              key={lane.key}
              type="button"
              className={`arcos-timeline__chip${active ? ' is-active' : ''}`}
              style={color ? ({ '--chip-color': color } as CSSProperties) : undefined}
              onClick={() => toggleLane(lane.key)}
              aria-pressed={active}
            >
              <span className="arcos-timeline__chip-swatch" style={{ background: color }} aria-hidden />
              {label}
            </button>
          )
        })}
        {activeKeys.size > 0 ? (
          <button type="button" className="arcos-timeline__chip-reset" onClick={resetFilter}>
            {t('arcos.filterAll')}
          </button>
        ) : null}
      </div>

      <div className="arcos-timeline__scroll">
        <div
          className="arcos-timeline__canvas"
          style={{ width: labelColumnX + 320, height: layout.height + ROW_HEIGHT }}
        >
          {layout.columns.map((column) => (
            <div
              key={`head-${column.x}`}
              className="arcos-timeline__lane-head"
              style={{
                left: column.x - LANE_WIDTH / 2,
                width: LANE_WIDTH,
                background: colorForKey(column.colorKey),
              }}
              aria-hidden
            />
          ))}

          <svg className="arcos-timeline__links" aria-hidden>
            {layout.connectors.map((c, i) => (
              <path
                key={`conn-${i}`}
                className={`arcos-timeline__link${c.dashed ? ' is-dashed' : ''}`}
                d={connectorPath(c)}
                stroke={colorForKey(c.colorKey)}
              />
            ))}
          </svg>

          {layout.connectors.map((c, i) =>
            c.years != null && c.months != null ? (
              <span
                key={`gap-${i}`}
                className="arcos-timeline__gap-label"
                style={{
                  left: (c.orientation === 'vertical' ? c.x1 : (c.x1 + c.x2) / 2) + 10,
                  top: (c.y1 + c.y2) / 2,
                }}
              >
                {elapsedLabel(c.years, c.months)}
              </span>
            ) : null,
          )}

          {layout.lanes.flatMap((lane) => {
            const dots = layout.dotsByLane.get(lane.key) ?? []
            const color = lane.arco?.cor || NEUTRAL_LANE_COLOR
            return dots.map((dot) => (
              <span
                key={`dot-${lane.key}-${dot.sessaoId}`}
                className="arcos-timeline__dot"
                style={{
                  left: dot.x - DOT_RADIUS,
                  top: dot.y + ROW_HEIGHT / 2 - DOT_RADIUS,
                  width: DOT_RADIUS * 2,
                  height: DOT_RADIUS * 2,
                  background: color,
                }}
              />
            ))
          })}

          {layout.rows.map((row) => (
              <div
                key={`row-${row.sessao.id}`}
                className="arcos-timeline__row-label"
                style={{ left: labelColumnX, top: row.y + ROW_HEIGHT / 2 }}
              >
                <span className="arcos-timeline__row-numero">{row.sessao.numero}.</span>{' '}
                <span className="arcos-timeline__row-titulo">{row.sessao.titulo}</span>
                {row.sessao.arco_id == null ? (
                  <span className="arcos-timeline__row-sem-arco">{t('arcos.semArco')}</span>
                ) : null}
              </div>
          ))}
        </div>
      </div>
    </div>
  )
}
