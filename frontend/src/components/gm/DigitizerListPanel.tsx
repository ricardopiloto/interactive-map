import type { MutableRefObject } from 'react'
import { useTranslation } from 'react-i18next'
import type { Local, RouteSegment, Waypoint } from '../../types'
import { Button, Input, Select } from '../ui'

interface DigitizerListPanelProps {
  query: string
  onQueryChange: (value: string) => void
  waypointsOpen: boolean
  onWaypointsOpenChange: (open: boolean) => void
  segmentsOpen: boolean
  onSegmentsOpenChange: (open: boolean) => void
  waypoints: Waypoint[]
  segments: RouteSegment[]
  focusedWaypointId: number | null
  focusedSegmentId: number | null
  hoveredSegmentId: number | null
  segmentHoverEnabled: boolean
  busy: boolean
  localById: Map<number, Local>
  locaisElegiveisPara: (wp: Waypoint | null) => Local[]
  segmentIdentity: (s: RouteSegment) => string
  onWaypointClick: (id: number) => void
  onSegmentClick: (id: number) => void
  onWaypointLocalChange: (wpId: number, localId: number | null) => void
  onRemoveWaypoint: (id: number) => void
  onRemoveSegment: (id: number) => void
  segRowRefs: MutableRefObject<Map<number, HTMLLIElement>>
  className?: string
}

export function DigitizerListPanel({
  query,
  onQueryChange,
  waypointsOpen,
  onWaypointsOpenChange,
  segmentsOpen,
  onSegmentsOpenChange,
  waypoints,
  segments,
  focusedWaypointId,
  focusedSegmentId,
  hoveredSegmentId,
  segmentHoverEnabled,
  busy,
  localById,
  locaisElegiveisPara,
  segmentIdentity,
  onWaypointClick,
  onSegmentClick,
  onWaypointLocalChange,
  onRemoveWaypoint,
  onRemoveSegment,
  segRowRefs,
  className,
}: DigitizerListPanelProps) {
  const { t } = useTranslation('admin')

  return (
    <aside className={className ?? 'digitizer-list'}>
      <Input className="digitizer-list__search"
        type="search"
        placeholder={t('digitizer.searchPlaceholder')}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        aria-label={t('digitizer.searchAria')}
      />

      <section className="digitizer-list__section">
        <button
          type="button"
          className="digitizer-list__section-toggle"
          onClick={() => onWaypointsOpenChange(!waypointsOpen)}
          aria-expanded={waypointsOpen}
        >
          {t('digitizer.waypoints', { count: waypoints.length })}
        </button>
        {waypointsOpen && (
          <ul className="digitizer-list__items">
            {waypoints.map((w) => {
              const linked = w.local_id != null ? localById.get(w.local_id) : undefined
              const elegiveis = locaisElegiveisPara(w)
              const focused = focusedWaypointId === w.id
              return (
                <li
                  key={w.id}
                  className={focused ? 'is-focused' : undefined}
                  data-waypoint-id={w.id}
                >
                  <button
                    type="button"
                    className="digitizer-list__item-label"
                    onClick={() => onWaypointClick(w.id)}
                  >
                    {w.nome || `#${w.id}`}
                    {linked ? ` → ${linked.nome}` : ''}
                  </button>
                  <Select
                    aria-label={t('digitizer.localDoNo', { nome: w.nome || w.id })}
                    disabled={busy}
                    value={w.local_id ?? ''}
                    onChange={(e) =>
                      onWaypointLocalChange(w.id, e.target.value ? Number(e.target.value) : null)
                    }
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">{t('digitizer.semLocal')}</option>
                    {elegiveis.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nome}
                      </option>
                    ))}
                  </Select>
                  <Button variant="ghost"
                    type="button"
                    onClick={() => onRemoveWaypoint(w.id)}
                  >
                    {t('digitizer.apagar')}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="digitizer-list__section">
        <button
          type="button"
          className="digitizer-list__section-toggle"
          onClick={() => onSegmentsOpenChange(!segmentsOpen)}
          aria-expanded={segmentsOpen}
        >
          {t('digitizer.arestas', { count: segments.length })}
        </button>
        {segmentsOpen && (
          <ul className="digitizer-list__items">
            {segments.map((s) => {
              const highlighted =
                focusedSegmentId === s.id ||
                (segmentHoverEnabled && hoveredSegmentId === s.id)
              return (
                <li
                  key={s.id}
                  className={highlighted ? 'is-focused' : undefined}
                  ref={(el) => {
                    if (el) segRowRefs.current.set(s.id, el)
                    else segRowRefs.current.delete(s.id)
                  }}
                >
                  <button
                    type="button"
                    className="digitizer-list__item-label"
                    onClick={() => onSegmentClick(s.id)}
                  >
                    {segmentIdentity(s)}
                  </button>
                  <Button variant="ghost" type="button" onClick={() => onRemoveSegment(s.id)}>
                    {t('digitizer.apagar')}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </aside>
  )
}
