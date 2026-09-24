import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch'
import { IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react'
import { adminApi } from '../../api/admin'
import { ConfirmDialog, Button, Chip, IconButton, Input, Select } from '../ui'
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage'
import type { Local, MapPoint, RouteSegment, RouteTipo, Waypoint } from '../../types'
import { labelMatchesQuery } from '../../utils/textMatch'
import { DigitizerListPanel } from './DigitizerListPanel'
import './RouteDigitizer.css'

type Mode = 'idle' | 'place-wp' | 'draw-seg'

const ORIGIN_SNAP = 0.01
const FINISH_SNAP = 0.005
const FOCUS_SCALE = 2.5
const FOCUS_ANIM_MS = 280
const NARROW_MQ = '(max-width: 800px)'

interface Props {
  mapUrl: string
  locais: Local[]
  onClose: () => void
  onCampaignChanged?: () => void
}

type FocusRequest =
  | { kind: 'waypoint'; id: number; nonce: number }
  | { kind: 'segment'; id: number; x: number; y: number; nonce: number }

function DigControls() {
  const { t } = useTranslation('mapa')
  const { zoomIn, zoomOut, resetTransform } = useControls()
  return (
    <div className="route-digitizer__controls" role="toolbar" aria-label={t('controls.aria')}>
      <IconButton label={t('controls.zoomIn')} onClick={() => zoomIn()}>
        <IconZoomIn size={20} aria-hidden />
      </IconButton>
      <IconButton label={t('controls.zoomOut')} onClick={() => zoomOut()}>
        <IconZoomOut size={20} aria-hidden />
      </IconButton>
      <IconButton label={t('controls.reset')} onClick={() => resetTransform()}>
        <IconZoomReset size={20} aria-hidden />
      </IconButton>
    </div>
  )
}

function DigitizerFocusController({
  focusRequest,
  onFocusApplied,
}: {
  focusRequest: FocusRequest | null
  onFocusApplied: () => void
}) {
  const { zoomToElement } = useControls()
  const zoomToElementRef = useRef(zoomToElement)
  zoomToElementRef.current = zoomToElement

  useEffect(() => {
    if (focusRequest == null) return
    const id =
      focusRequest.kind === 'waypoint'
        ? `digitizer-wp-${focusRequest.id}`
        : `digitizer-seg-focus-${focusRequest.id}`
    const el = document.getElementById(id)
    if (!el) return
    try {
      zoomToElementRef.current(el, FOCUS_SCALE, FOCUS_ANIM_MS, 'easeOut')
      onFocusApplied()
    } catch {
      // DOM/transform not ready
    }
  }, [focusRequest, onFocusApplied])

  return null
}

function segmentMidpoint(s: RouteSegment, byId: Map<number, Waypoint>): { x: number; y: number } | null {
  const a = byId.get(s.waypoint_a_id)
  const b = byId.get(s.waypoint_b_id)
  if (!a || !b) return null
  const pts = [a, ...s.pontos_intermediarios, b]
  const x = pts.reduce((sum, p) => sum + p.x, 0) / pts.length
  const y = pts.reduce((sum, p) => sum + p.y, 0) / pts.length
  return { x, y }
}

export function RouteDigitizerView({ mapUrl, locais, onClose, onCampaignChanged }: Props) {
  const { t } = useTranslation('admin')
  const { t: tm } = useTranslation('mapa')
  const { t: tc } = useTranslation('comum')
  const apiErrorMessage = useApiErrorMessage()
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [segments, setSegments] = useState<RouteSegment[]>([])
  const [mode, setMode] = useState<Mode>('idle')
  const [linkLocalId, setLinkLocalId] = useState<number | ''>('')
  const [wpName, setWpName] = useState('')
  const [segTipo, setSegTipo] = useState<RouteTipo>('estrada')
  const [draftA, setDraftA] = useState<number | null>(null)
  const [hoveredSegmentId, setHoveredSegmentId] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const [query, setQuery] = useState('')
  const [waypointsOpen, setWaypointsOpen] = useState(true)
  const [segmentsOpen, setSegmentsOpen] = useState(true)
  const [focusedWaypointId, setFocusedWaypointId] = useState<number | null>(null)
  const [focusedSegmentId, setFocusedSegmentId] = useState<number | null>(null)
  const [listSheetOpen, setListSheetOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(NARROW_MQ).matches : false,
  )
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null)
  const focusNonce = useRef(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const segRowRefs = useRef<Map<number, HTMLLIElement>>(new Map())

  const setMapZoomCss = useCallback((scale: number) => {
    stageRef.current?.style.setProperty('--map-zoom', String(scale))
  }, [])
  const [draftMids, setDraftMids] = useState<MapPoint[]>([])
  const [scaleMiles, setScaleMiles] = useState('80')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<
    null | { kind: 'waypoint' | 'segment'; id: number }
  >(null)

  const segmentHoverEnabled = mode === 'idle'

  useEffect(() => {
    const mq = window.matchMedia(NARROW_MQ)
    const onChange = () => setIsNarrow(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const localById = new Map(locais.map((l) => [l.id, l]))

  function locaisElegiveisPara(wp: Waypoint | null): Local[] {
    const taken = new Set(
      waypoints
        .filter((w) => w.local_id != null && (wp == null || w.id !== wp.id))
        .map((w) => w.local_id as number),
    )
    return locais.filter((l) => !taken.has(l.id) || (wp != null && wp.local_id === l.id))
  }

  async function setWaypointLocal(wpId: number, localId: number | null) {
    setBusy(true)
    setError(null)
    try {
      await adminApi.updateWaypoint(wpId, { local_id: localId })
      await reload()
      onCampaignChanged?.()
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const reload = useCallback(async () => {
    const [w, s, scale] = await Promise.all([
      adminApi.listWaypoints(),
      adminApi.listRouteSegments(),
      adminApi.getMapScale(),
    ])
    setWaypoints(w)
    setSegments(s)
    setScaleMiles(String(scale.miles_per_map_unit))
  }, [])

  useEffect(() => {
    void reload().catch((e) => setError(apiErrorMessage(e)))
  }, [reload, apiErrorMessage])

  const byId = useMemo(() => new Map(waypoints.map((w) => [w.id, w])), [waypoints])

  function waypointLabel(id: number): string {
    const w = byId.get(id)
    const nome = w?.nome?.trim()
    return nome || String(id)
  }

  function segmentIdentity(s: RouteSegment): string {
    return `${waypointLabel(s.waypoint_a_id)}↔${waypointLabel(s.waypoint_b_id)} · ${s.tipo} · ${s.distancia_milhas} mi`
  }

  const filteredWaypoints = useMemo(() => {
    const q = query.trim()
    if (!q) return waypoints
    return waypoints.filter((w) => {
      const label = w.nome?.trim() || `#${w.id}`
      return labelMatchesQuery(label, q)
    })
  }, [waypoints, query])

  const filteredSegments = useMemo(() => {
    const q = query.trim()
    if (!q) return segments
    return segments.filter((s) => {
      const identity = `${waypointLabel(s.waypoint_a_id)}↔${waypointLabel(s.waypoint_b_id)} · ${s.tipo} · ${s.distancia_milhas} mi`
      return labelMatchesQuery(identity, q)
    })
  }, [segments, query, byId])

  function focusWaypoint(id: number) {
    setFocusedWaypointId(id)
    setFocusedSegmentId(null)
    focusNonce.current += 1
    setFocusRequest({ kind: 'waypoint', id, nonce: focusNonce.current })
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-waypoint-id="${id}"]`)
        ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    })
    if (isNarrow) setListSheetOpen(false)
  }

  function focusSegment(id: number) {
    const s = segments.find((seg) => seg.id === id)
    if (!s) return
    const mid = segmentMidpoint(s, byId)
    if (!mid) return
    setFocusedSegmentId(id)
    setFocusedWaypointId(null)
    setHoveredSegmentId(id)
    focusNonce.current += 1
    setFocusRequest({ kind: 'segment', id, x: mid.x, y: mid.y, nonce: focusNonce.current })
    requestAnimationFrame(() => {
      segRowRefs.current.get(id)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    })
    if (isNarrow) setListSheetOpen(false)
  }

  function nearestWaypoint(x: number, y: number, maxDist: number): Waypoint | null {
    let best: Waypoint | null = null
    let bestD = maxDist
    for (const w of waypoints) {
      const d = Math.hypot(w.x - x, w.y - y)
      if (d < bestD) {
        bestD = d
        best = w
      }
    }
    return best
  }

  async function onStageClick(e: MouseEvent<HTMLDivElement>) {
    const stage = e.currentTarget
    const rect = stage.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    setError(null)

    if (mode === 'place-wp') {
      setBusy(true)
      try {
        await adminApi.createWaypoint({
          x,
          y,
          nome: wpName.trim() || null,
          local_id: linkLocalId === '' ? null : linkLocalId,
        })
        setWpName('')
        setLinkLocalId('')
        setMode('idle')
        await reload()
        onCampaignChanged?.()
      } catch (err) {
        setError(apiErrorMessage(err))
      } finally {
        setBusy(false)
      }
      return
    }

    if (mode === 'draw-seg') {
      if (draftA == null) {
        const hit = nearestWaypoint(x, y, ORIGIN_SNAP)
        if (!hit) {
          setError(t('digitizer.errClicarOrigem'))
          return
        }
        setDraftA(hit.id)
        setDraftMids([])
        return
      }
      const hit = nearestWaypoint(x, y, FINISH_SNAP)
      if (hit && hit.id !== draftA) {
        setBusy(true)
        try {
          await adminApi.createRouteSegment({
            waypoint_a_id: draftA,
            waypoint_b_id: hit.id,
            tipo: segTipo,
            pontos_intermediarios: draftMids,
          })
          setDraftA(null)
          setDraftMids([])
          setMode('idle')
          await reload()
        } catch (err) {
          setError(apiErrorMessage(err))
        } finally {
          setBusy(false)
        }
        return
      }
      setDraftMids((m) => [...m, { x, y }])
    }
  }

  function undoDraftPoint() {
    if (mode !== 'draw-seg' || busy) return
    if (draftMids.length > 0) {
      setDraftMids((m) => m.slice(0, -1))
      return
    }
    if (draftA != null) {
      setDraftA(null)
      setDraftMids([])
    }
  }

  function onDrawSegContextMenu(e: MouseEvent) {
    if (mode !== 'draw-seg') return
    e.preventDefault()
    e.stopPropagation()
    undoDraftPoint()
  }

  async function saveScale() {
    const n = Number(scaleMiles)
    if (!Number.isFinite(n) || n <= 0) {
      setError(t('digitizer.escalaInvalida'))
      return
    }
    setBusy(true)
    try {
      await adminApi.updateMapScale({ miles_per_map_unit: n })
      await reload()
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  function requestRemoveWaypoint(id: number) {
    setPendingDelete({ kind: 'waypoint', id })
  }

  async function removeWaypoint(id: number) {
    await adminApi.deleteWaypoint(id)
    if (focusedWaypointId === id) setFocusedWaypointId(null)
    await reload()
  }

  function requestRemoveSegment(id: number) {
    setPendingDelete({ kind: 'segment', id })
  }

  async function removeSegment(id: number) {
    await adminApi.deleteRouteSegment(id)
    if (hoveredSegmentId === id) {
      setHoveredSegmentId(null)
      setTooltipPos(null)
    }
    if (focusedSegmentId === id) setFocusedSegmentId(null)
    await reload()
  }

  function updateSegTooltipPos(e: ReactPointerEvent) {
    if (!segmentHoverEnabled) return
    const map = mapRef.current
    if (!map) return
    const rect = map.getBoundingClientRect()
    setTooltipPos({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12 })
  }

  function onSavedSegPointerEnter(s: RouteSegment, e: ReactPointerEvent<SVGPolylineElement>) {
    if (!segmentHoverEnabled) return
    setHoveredSegmentId(s.id)
    updateSegTooltipPos(e)
    requestAnimationFrame(() => {
      segRowRefs.current.get(s.id)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    })
  }

  function onSavedSegPointerLeave() {
    setHoveredSegmentId(null)
    setTooltipPos(null)
  }

  useEffect(() => {
    if (!segmentHoverEnabled) {
      setHoveredSegmentId(null)
      setTooltipPos(null)
    }
  }, [segmentHoverEnabled])

  useEffect(() => {
    if (hoveredSegmentId != null && !segments.some((s) => s.id === hoveredSegmentId)) {
      setHoveredSegmentId(null)
      setTooltipPos(null)
    }
  }, [segments, hoveredSegmentId])

  const hoveredSegment =
    segmentHoverEnabled && hoveredSegmentId != null
      ? segments.find((s) => s.id === hoveredSegmentId)
      : undefined

  const segmentFocusMarkers = useMemo(() => {
    if (focusedSegmentId == null) return []
    const s = segments.find((seg) => seg.id === focusedSegmentId)
    if (!s) return []
    const mid = segmentMidpoint(s, byId)
    if (!mid) return []
    return [{ id: s.id, x: mid.x, y: mid.y }]
  }, [focusedSegmentId, segments, byId])

  const listPanel = (
    <DigitizerListPanel
      query={query}
      onQueryChange={setQuery}
      waypointsOpen={waypointsOpen}
      onWaypointsOpenChange={setWaypointsOpen}
      segmentsOpen={segmentsOpen}
      onSegmentsOpenChange={setSegmentsOpen}
      waypoints={filteredWaypoints}
      segments={filteredSegments}
      focusedWaypointId={focusedWaypointId}
      focusedSegmentId={focusedSegmentId}
      hoveredSegmentId={hoveredSegmentId}
      segmentHoverEnabled={segmentHoverEnabled}
      busy={busy}
      localById={localById}
      locaisElegiveisPara={locaisElegiveisPara}
      segmentIdentity={segmentIdentity}
      onWaypointClick={focusWaypoint}
      onSegmentClick={focusSegment}
      onWaypointLocalChange={(wpId, localId) => void setWaypointLocal(wpId, localId)}
      onRemoveWaypoint={(id) => requestRemoveWaypoint(id)}
      onRemoveSegment={(id) => requestRemoveSegment(id)}
      segRowRefs={segRowRefs}
      className={
        isNarrow
          ? `digitizer-list digitizer-list--sheet${listSheetOpen ? ' is-open' : ''}`
          : 'digitizer-list digitizer-list--column'
      }
    />
  )

  return (
    <div className={`route-digitizer${isNarrow ? ' route-digitizer--narrow' : ''}`}>
      <header className="route-digitizer__bar">
        <strong>{t('digitizer.title')}</strong>
        <span className="text-muted">{t('digitizer.subtitle')}</span>
        <div className="route-digitizer__actions">
          {isNarrow && (
            <Button
              type="button"
              className={`${listSheetOpen ? ' is-active' : ''}`}
              onClick={() => setListSheetOpen((o) => !o)}
            >
              {t('digitizer.lista')}
            </Button>
          )}
          <Chip
            variant={mode === 'place-wp' ? 'accent' : 'outline'}
            aria-pressed={mode === 'place-wp'}
            disabled={busy}
            onClick={() => {
              setMode(mode === 'place-wp' ? 'idle' : 'place-wp')
              setDraftA(null)
              setDraftMids([])
            }}
          >
            {t('digitizer.novoNo')}
          </Chip>
          <Chip
            variant={mode === 'draw-seg' ? 'accent' : 'outline'}
            aria-pressed={mode === 'draw-seg'}
            disabled={busy}
            onClick={() => {
              setMode(mode === 'draw-seg' ? 'idle' : 'draw-seg')
              setDraftA(null)
              setDraftMids([])
            }}
          >
            {t('digitizer.tracarSegmento')}
          </Chip>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t('digitizer.sair')}
          </Button>
        </div>
      </header>

      <div className="route-digitizer__tools">
        {mode === 'place-wp' && (
          <>
            <Input
              placeholder={t('digitizer.nomeOpcional')}
              value={wpName}
              onChange={(e) => setWpName(e.target.value)}
            />
            <Select
              value={linkLocalId === '' ? '' : String(linkLocalId)}
              onChange={(e) => setLinkLocalId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">{t('digitizer.semLocal')}</option>
              {locaisElegiveisPara(null).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </Select>
          </>
        )}
        {mode === 'draw-seg' && (
          <Select value={segTipo} onChange={(e) => setSegTipo(e.target.value as RouteTipo)}>
            <option value="estrada">{tm('routeEnums.tipoVia.estrada')}</option>
            <option value="rio">{tm('routeEnums.tipoVia.rio')}</option>
            <option value="trilha">{tm('routeEnums.tipoVia.trilha')}</option>
          </Select>
        )}
        <label className="route-digitizer__scale">
          {t('digitizer.escala')}
          <Input value={scaleMiles} onChange={(e) => setScaleMiles(e.target.value)} />
          <Button type="button" disabled={busy} onClick={() => void saveScale()}>
            {tc('buttons.save')}
          </Button>
        </label>
      </div>
      {error && (
        <p className="route-digitizer__error" role="alert">
          {error}
        </p>
      )}
      {mode === 'draw-seg' && (
        <p className="text-muted route-digitizer__hint">
          {draftA == null ? t('digitizer.hintOrigem') : t('digitizer.hintDestino')}
        </p>
      )}

      <div className="route-digitizer__body">
        {!isNarrow && listPanel}

        <div className="route-digitizer__map" ref={mapRef}>
          {isNarrow && listSheetOpen && (
            <button
              type="button"
              className="route-digitizer__sheet-backdrop"
              aria-label={t('digitizer.fecharLista')}
              onClick={() => setListSheetOpen(false)}
            />
          )}
          {isNarrow && listSheetOpen && listPanel}

          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={12}
            centerOnInit
            wheel={{ step: 0.01 }}
            pinch={{ step: 5 }}
            onInit={(ref) => setMapZoomCss(ref.state.scale)}
            onTransform={(_ref, state) => setMapZoomCss(state.scale)}
          >
            <DigitizerFocusController
              focusRequest={focusRequest}
              onFocusApplied={() => setFocusRequest(null)}
            />
            <DigControls />
            <TransformComponent
              wrapperClass="route-digitizer__viewport"
              contentClass="route-digitizer__content"
              wrapperStyle={{ width: '100%', height: '100%' }}
            >
              <div
                ref={stageRef}
                className="route-digitizer__stage"
                style={{ ['--map-zoom' as string]: 1 }}
                onClick={(e) => void onStageClick(e)}
                onContextMenu={onDrawSegContextMenu}
              >
                <img src={mapUrl} alt="" className="route-digitizer__image" draggable={false} />
                <svg className="route-digitizer__segs" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {segments.map((s) => {
                    const a = byId.get(s.waypoint_a_id)
                    const b = byId.get(s.waypoint_b_id)
                    if (!a || !b) return null
                    const pts = [
                      `${a.x * 100},${a.y * 100}`,
                      ...s.pontos_intermediarios.map((p) => `${p.x * 100},${p.y * 100}`),
                      `${b.x * 100},${b.y * 100}`,
                    ].join(' ')
                    const hovered =
                      segmentHoverEnabled &&
                      (hoveredSegmentId === s.id || focusedSegmentId === s.id)
                    return (
                      <g key={s.id}>
                        <polyline
                          points={pts}
                          className={`route-digitizer__seg route-digitizer__seg--${s.tipo}${hovered ? ' is-hovered' : ''}`}
                          fill="none"
                          vectorEffect="non-scaling-stroke"
                        />
                        {segmentHoverEnabled && (
                          <polyline
                            points={pts}
                            className="route-digitizer__seg-hit"
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                            onPointerEnter={(e) => onSavedSegPointerEnter(s, e)}
                            onPointerMove={updateSegTooltipPos}
                            onPointerLeave={onSavedSegPointerLeave}
                          />
                        )}
                      </g>
                    )
                  })}
                  {draftA != null &&
                    (() => {
                      const a = byId.get(draftA)
                      if (!a) return null
                      const pts = [
                        `${a.x * 100},${a.y * 100}`,
                        ...draftMids.map((p) => `${p.x * 100},${p.y * 100}`),
                      ].join(' ')
                      return (
                        <polyline
                          points={pts}
                          className="route-digitizer__seg route-digitizer__seg--draft"
                          fill="none"
                          vectorEffect="non-scaling-stroke"
                        />
                      )
                    })()}
                </svg>
                {segmentFocusMarkers.map((m) => (
                  <div
                    key={m.id}
                    id={`digitizer-seg-focus-${m.id}`}
                    className="route-digitizer__focus-marker"
                    style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
                    aria-hidden
                  />
                ))}
                {waypoints.map((w) => (
                  <button
                    key={w.id}
                    id={`digitizer-wp-${w.id}`}
                    type="button"
                    className={`route-digitizer__wp${draftA != null ? ' route-digitizer__wp--closing' : ''}${draftA === w.id ? ' is-active' : ''}${focusedWaypointId === w.id ? ' is-focused' : ''}`}
                    style={{ left: `${w.x * 100}%`, top: `${w.y * 100}%` }}
                    title={w.nome || t('digitizer.noTooltip', { id: w.id })}
                    onContextMenu={onDrawSegContextMenu}
                    onClick={(ev) => {
                      ev.stopPropagation()
                      if (mode !== 'draw-seg') return
                      void (async () => {
                        setError(null)
                        if (draftA == null) {
                          setDraftA(w.id)
                          setDraftMids([])
                          return
                        }
                        if (w.id === draftA) return
                        setBusy(true)
                        try {
                          await adminApi.createRouteSegment({
                            waypoint_a_id: draftA,
                            waypoint_b_id: w.id,
                            tipo: segTipo,
                            pontos_intermediarios: draftMids,
                          })
                          setDraftA(null)
                          setDraftMids([])
                          setMode('idle')
                          await reload()
                        } catch (err) {
                          setError(apiErrorMessage(err))
                        } finally {
                          setBusy(false)
                        }
                      })()
                    }}
                  />
                ))}
              </div>
            </TransformComponent>
          </TransformWrapper>
          {hoveredSegment && tooltipPos && (
            <div
              className="route-digitizer__seg-tooltip"
              style={{ left: tooltipPos.x, top: tooltipPos.y }}
              role="status"
            >
              {segmentIdentity(hoveredSegment)}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={pendingDelete != null}
        title={
          pendingDelete?.kind === 'segment'
            ? t('digitizer.confirmRemoverSegmento')
            : t('digitizer.confirmRemoverNo')
        }
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          const pending = pendingDelete
          setPendingDelete(null)
          if (!pending) return
          if (pending.kind === 'waypoint') void removeWaypoint(pending.id)
          else void removeSegment(pending.id)
        }}
      />
    </div>
  )
}
