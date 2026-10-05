import { useMemo, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState, Button } from '../ui'
import type { Arco, Sessao } from '../../types'
import {
  computeArcosLayout,
  DOT_RADIUS,
  LANE_WIDTH,
  ROW_HEIGHT,
  SEM_ARCO_KEY,
} from './arcosLayout'
import './ArcosTimelineView.css'

const NEUTRAL_LANE_COLOR = '#958f83'

interface ArcosTimelineViewProps {
  arcos: Arco[]
  sessoes: Sessao[]
  onBackToCronologico: () => void
}

export function ArcosTimelineView({ arcos, sessoes, onBackToCronologico }: ArcosTimelineViewProps) {
  const { t } = useTranslation('linhaTempo')
  const [activeKeys, setActiveKeys] = useState<Set<string>>(() => new Set())

  const layout = useMemo(() => computeArcosLayout(arcos, sessoes), [arcos, sessoes])

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
  const rowVisible = (s: Sessao) => {
    const keys = [s.arco_id == null ? SEM_ARCO_KEY : String(s.arco_id)]
    if (s.arco_transicao_id != null) keys.push(String(s.arco_transicao_id))
    return keys.some(laneVisible)
  }

  const labelColumnX = layout.width + 20

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
          {layout.lanes.map((lane) =>
            laneVisible(lane.key) ? (
              <div
                key={`head-${lane.key}`}
                className="arcos-timeline__lane-head"
                style={{
                  left: lane.x - LANE_WIDTH / 2,
                  width: LANE_WIDTH,
                  background: lane.arco?.cor || (lane.key === SEM_ARCO_KEY ? NEUTRAL_LANE_COLOR : undefined),
                }}
                aria-hidden
              />
            ) : null,
          )}

          {layout.connectors.map((c, i) => {
            const lane = layout.lanes.find((l) => l.key === c.laneKey)
            if (!lane || !laneVisible(lane.key)) return null
            const color = lane.arco?.cor || NEUTRAL_LANE_COLOR
            return (
              <div
                key={`conn-${i}`}
                className={`arcos-timeline__connector${c.gap > 0 ? ' is-dashed' : ''}`}
                style={{
                  left: lane.x,
                  top: c.y1 + ROW_HEIGHT / 2 + DOT_RADIUS,
                  height: c.y2 - c.y1 - 2 * DOT_RADIUS,
                  borderColor: color,
                }}
              >
                {c.gap > 0 ? (
                  <span className="arcos-timeline__gap-label">
                    {t('arcos.gapLabel', { count: c.gap })}
                  </span>
                ) : null}
              </div>
            )
          })}

          {layout.lanes.flatMap((lane) => {
            if (!laneVisible(lane.key)) return []
            const dots = layout.dotsByLane.get(lane.key) ?? []
            const color = lane.arco?.cor || NEUTRAL_LANE_COLOR
            return dots.map((dot) => (
              <span
                key={`dot-${lane.key}-${dot.sessaoId}`}
                className="arcos-timeline__dot"
                style={{
                  left: lane.x - DOT_RADIUS,
                  top: dot.y + ROW_HEIGHT / 2 - DOT_RADIUS,
                  width: DOT_RADIUS * 2,
                  height: DOT_RADIUS * 2,
                  background: color,
                }}
              />
            ))
          })}

          {layout.rows.map((row) =>
            rowVisible(row.sessao) ? (
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
            ) : null,
          )}
        </div>
      </div>
    </div>
  )
}
