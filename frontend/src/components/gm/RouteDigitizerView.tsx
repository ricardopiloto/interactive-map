import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch'
import { adminApi } from '../../api/admin'
import type { Local, MapPoint, RouteSegment, RouteTipo, Waypoint } from '../../types'
import './RouteDigitizer.css'

type Mode = 'idle' | 'place-wp' | 'draw-seg'

/** Normalized map coords (0–1): origin pick stays generous; finish is ~⅓ as tight. */
const ORIGIN_SNAP = 0.03
const FINISH_SNAP = 0.01

interface Props {
  mapUrl: string
  locais: Local[]
  onClose: () => void
  /** Called after link/unlink so map pins refresh when leaving Rede. */
  onCampaignChanged?: () => void
}

function DigControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls()
  return (
    <div className="route-digitizer__controls">
      <button type="button" className="btn btn-secondary btn-icon" onClick={() => zoomIn()}>
        +
      </button>
      <button type="button" className="btn btn-secondary btn-icon" onClick={() => zoomOut()}>
        −
      </button>
      <button type="button" className="btn btn-secondary btn-icon" onClick={() => resetTransform()}>
        ↺
      </button>
    </div>
  )
}

export function RouteDigitizerView({ mapUrl, locais, onClose, onCampaignChanged }: Props) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [segments, setSegments] = useState<RouteSegment[]>([])
  const [mode, setMode] = useState<Mode>('idle')
  const [linkLocalId, setLinkLocalId] = useState<number | ''>('')
  const [wpName, setWpName] = useState('')
  const [segTipo, setSegTipo] = useState<RouteTipo>('estrada')
  const [draftA, setDraftA] = useState<number | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const setMapZoomCss = useCallback((scale: number) => {
    stageRef.current?.style.setProperty('--map-zoom', String(scale))
  }, [])
  const [draftMids, setDraftMids] = useState<MapPoint[]>([])
  const [scaleMiles, setScaleMiles] = useState('80')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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
      setError(err instanceof Error ? err.message : 'Falha ao vincular Local')
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
    void reload().catch((e) => setError(e instanceof Error ? e.message : 'Falha ao carregar rede'))
  }, [reload])

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
        setError(err instanceof Error ? err.message : 'Falha ao criar nó')
      } finally {
        setBusy(false)
      }
      return
    }

    if (mode === 'draw-seg') {
      if (draftA == null) {
        const hit = nearestWaypoint(x, y, ORIGIN_SNAP)
        if (!hit) {
          setError('Clique em um nó existente para começar o segmento.')
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
          setError(err instanceof Error ? err.message : 'Falha ao salvar segmento')
        } finally {
          setBusy(false)
        }
        return
      }
      setDraftMids((m) => [...m, { x, y }])
    }
  }

  /** Right-click: pop last mid, or clear origin; stay in draw-seg. */
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
      setError('Escala inválida')
      return
    }
    setBusy(true)
    try {
      await adminApi.updateMapScale({ miles_per_map_unit: n })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar escala')
    } finally {
      setBusy(false)
    }
  }

  async function removeWaypoint(id: number) {
    if (!window.confirm('Remover nó e segmentos ligados?')) return
    await adminApi.deleteWaypoint(id)
    await reload()
  }

  async function removeSegment(id: number) {
    if (!window.confirm('Remover segmento?')) return
    await adminApi.deleteRouteSegment(id)
    await reload()
  }

  const byId = new Map(waypoints.map((w) => [w.id, w]))

  return (
    <div className="route-digitizer">
      <header className="route-digitizer__bar">
        <strong>Rede de rotas</strong>
        <span className="text-muted">Sem pins de lore — só navegação</span>
        <div className="route-digitizer__actions">
          <button
            type="button"
            className={`btn btn-secondary${mode === 'place-wp' ? ' is-active' : ''}`}
            disabled={busy}
            onClick={() => {
              setMode(mode === 'place-wp' ? 'idle' : 'place-wp')
              setDraftA(null)
              setDraftMids([])
            }}
          >
            Novo nó
          </button>
          <button
            type="button"
            className={`btn btn-secondary${mode === 'draw-seg' ? ' is-active' : ''}`}
            disabled={busy}
            onClick={() => {
              setMode(mode === 'draw-seg' ? 'idle' : 'draw-seg')
              setDraftA(null)
              setDraftMids([])
            }}
          >
            Traçar segmento
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Sair
          </button>
        </div>
      </header>

      <div className="route-digitizer__tools">
        {mode === 'place-wp' && (
          <>
            <input
              className="input"
              placeholder="Nome (opcional)"
              value={wpName}
              onChange={(e) => setWpName(e.target.value)}
            />
            <select
              className="input"
              value={linkLocalId === '' ? '' : String(linkLocalId)}
              onChange={(e) => setLinkLocalId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Sem Local</option>
              {locaisElegiveisPara(null).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </>
        )}
        {mode === 'draw-seg' && (
          <select className="input" value={segTipo} onChange={(e) => setSegTipo(e.target.value as RouteTipo)}>
            <option value="estrada">Estrada</option>
            <option value="rio">Rio</option>
            <option value="trilha">Trilha</option>
          </select>
        )}
        <label className="route-digitizer__scale">
          Escala (mi / unidade)
          <input className="input" value={scaleMiles} onChange={(e) => setScaleMiles(e.target.value)} />
          <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void saveScale()}>
            Salvar
          </button>
        </label>
      </div>
      {error && (
        <p className="route-digitizer__error" role="alert">
          {error}
        </p>
      )}
      {mode === 'draw-seg' && (
        <p className="text-muted route-digitizer__hint">
          {draftA == null
            ? 'Clique no nó de origem. Botão direito: desfazer último ponto.'
            : 'Clique intermediários na via; para salvar, clique no nó de destino (ou bem junto a ele). Botão direito: desfazer último ponto.'}
        </p>
      )}

      <div className="route-digitizer__map">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={12}
          centerOnInit
          wheel={{ step: 0.01 }}
          onInit={(ref) => setMapZoomCss(ref.state.scale)}
          onTransform={(_ref, state) => setMapZoomCss(state.scale)}
        >
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
                  return (
                    <polyline
                      key={s.id}
                      points={pts}
                      className={`route-digitizer__seg route-digitizer__seg--${s.tipo}`}
                      fill="none"
                      vectorEffect="non-scaling-stroke"
                    />
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
              {waypoints.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={`route-digitizer__wp${draftA === w.id ? ' is-active' : ''}`}
                  style={{ left: `${w.x * 100}%`, top: `${w.y * 100}%` }}
                  title={w.nome || `Nó ${w.id}`}
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
                        setError(err instanceof Error ? err.message : 'Falha ao salvar segmento')
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
      </div>

      <aside className="route-digitizer__lists">
        <div>
          <h3>Nós ({waypoints.length})</h3>
          <ul>
            {waypoints.map((w) => {
              const linked = w.local_id != null ? localById.get(w.local_id) : undefined
              const elegiveis = locaisElegiveisPara(w)
              return (
                <li key={w.id}>
                  <span>
                    {w.nome || `#${w.id}`}
                    {linked ? ` → ${linked.nome}` : ''}
                  </span>
                  <select
                    className="input"
                    aria-label={`Local do nó ${w.nome || w.id}`}
                    disabled={busy}
                    value={w.local_id ?? ''}
                    onChange={(e) =>
                      void setWaypointLocal(
                        w.id,
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  >
                    <option value="">Sem Local</option>
                    {elegiveis.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nome}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-ghost" onClick={() => void removeWaypoint(w.id)}>
                    Apagar
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <h3>Segmentos ({segments.length})</h3>
          <ul>
            {segments.map((s) => (
              <li key={s.id}>
                <span>
                  {s.waypoint_a_id}↔{s.waypoint_b_id} · {s.tipo} · {s.distancia_milhas} mi
                </span>
                <button type="button" className="btn btn-ghost" onClick={() => void removeSegment(s.id)}>
                  Apagar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
