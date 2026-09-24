import { useState } from 'react'
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch'
import { IconPlus, IconMinus, IconRefresh, IconX, IconMapPinPlus, IconRoute } from '@tabler/icons-react'
import { MapSidePanel } from '../map/MapSidePanel'
import { MAP_W, MAP_H } from '../map/MapCanvas'
import type { RouteEdge, WaypointNode } from '../../data/types'
import '../map/MapCanvas.css'
import '../../pages/MapPage.css'
import './RouteDigitizer.css'

type Mode = 'idle' | 'place-wp' | 'draw-seg'

const TIPO_LABEL: Record<RouteEdge['tipo'], string> = { estrada: 'Estrada', rio: 'Rio', trilha: 'Trilha' }

/**
 * Rede de rotas (GM): digitalizar os nós (waypoints) e segmentos (estrada/rio/
 * trilha) que o planejador de Rota usa para calcular viagens. Versão do
 * protótipo simplifica o traço para retas entre dois nós — sem pontos
 * intermediários — mas o fluxo (novo nó → traçar segmento → escolher tipo →
 * lista com busca e exclusão → escala do mapa) é o mesmo do app real.
 */
export function RouteDigitizer({
  waypoints, edges, onAddWaypoint, onRemoveWaypoint, onAddEdge, onRemoveEdge, onClose,
}: {
  waypoints: WaypointNode[]
  edges: RouteEdge[]
  onAddWaypoint: (x: number, y: number, nome: string) => void
  onRemoveWaypoint: (id: string) => void
  onAddEdge: (aId: string, bId: string, tipo: RouteEdge['tipo']) => void
  onRemoveEdge: (index: number) => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<Mode>('idle')
  const [wpName, setWpName] = useState('')
  const [segTipo, setSegTipo] = useState<RouteEdge['tipo']>('estrada')
  const [draftA, setDraftA] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(true)
  const [scaleMi, setScaleMi] = useState('100')

  function handleWaypointClick(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (mode !== 'draw-seg') return
    if (draftA == null) { setDraftA(id); return }
    if (id === draftA) return
    onAddEdge(draftA, id, segTipo)
    setDraftA(null)
  }

  function handleStageClick(e: React.MouseEvent<HTMLDivElement>, ctx: { clientToContent: (x: number, y: number) => { x: number; y: number } }) {
    if (mode !== 'place-wp') return
    const p = ctx.clientToContent(e.clientX, e.clientY)
    onAddWaypoint(Math.min(1, Math.max(0, p.x / MAP_W)), Math.min(1, Math.max(0, p.y / MAP_H)), wpName.trim())
    setWpName('')
    setMode('idle')
  }

  const filteredWp = waypoints.filter((w) => w.nome.toLowerCase().includes(query.toLowerCase()))
  const filteredEdges = edges
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => {
      const label = `${waypoints.find((w) => w.id === e.a)?.nome ?? ''} ${waypoints.find((w) => w.id === e.b)?.nome ?? ''}`
      return label.toLowerCase().includes(query.toLowerCase())
    })

  return (
    <div className="route-digitizer">
      <header className="route-digitizer__bar">
        <div>
          <strong>Rede de rotas</strong>
          <span className="text-3" style={{ marginLeft: 8 }}>Nós e segmentos que alimentam o planejador de Rota</span>
        </div>
        <div className="row gap-2">
          <button type="button" className={`chip${mode === 'place-wp' ? ' is-active' : ''}`} onClick={() => { setMode((m) => (m === 'place-wp' ? 'idle' : 'place-wp')); setDraftA(null) }}>
            <IconMapPinPlus size={14} aria-hidden /> Novo nó
          </button>
          <button type="button" className={`chip${mode === 'draw-seg' ? ' is-active' : ''}`} onClick={() => { setMode((m) => (m === 'draw-seg' ? 'idle' : 'draw-seg')); setDraftA(null) }}>
            <IconRoute size={14} aria-hidden /> Traçar segmento
          </button>
          <button type="button" className="icon-btn icon-btn-sm icon-btn-plain" onClick={onClose} aria-label="Sair da rede de rotas">
            <IconX size={16} aria-hidden />
          </button>
        </div>
      </header>

      {mode === 'place-wp' && (
        <div className="route-digitizer__tools">
          <input className="input" placeholder="Nome do nó (opcional)" value={wpName} onChange={(e) => setWpName(e.target.value)} />
          <span className="text-3">Toque no mapa para posicionar</span>
        </div>
      )}
      {mode === 'draw-seg' && (
        <div className="route-digitizer__tools">
          <select className="select" value={segTipo} onChange={(e) => setSegTipo(e.target.value as RouteEdge['tipo'])}>
            <option value="estrada">Estrada</option>
            <option value="rio">Rio</option>
            <option value="trilha">Trilha</option>
          </select>
          <span className="text-3">{draftA == null ? 'Clique no nó de origem' : 'Clique no nó de destino'}</span>
        </div>
      )}

      <div className="route-digitizer__body">
        <TransformWrapper initialScale={1} minScale={0.55} maxScale={3.2} centerOnInit limitToBounds={false} wheel={{ step: 0.12 }}>
          {(ctx) => (
            <>
              <TransformComponent wrapperClass="map-canvas__wrapper" contentClass="map-canvas__content" contentStyle={{ width: MAP_W, height: MAP_H }}>
                <div className="map-canvas__surface" onClick={(e) => handleStageClick(e, ctx)} style={{ cursor: mode === 'place-wp' ? 'crosshair' : 'default' }}>
                  <div className="map-canvas__bg" aria-hidden />
                  <svg className="map-canvas__veins" viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden preserveAspectRatio="none">
                    {edges.map((edge, i) => {
                      const a = waypoints.find((w) => w.id === edge.a)
                      const b = waypoints.find((w) => w.id === edge.b)
                      if (!a || !b) return null
                      return (
                        <line
                          key={i}
                          x1={a.x * MAP_W} y1={a.y * MAP_H} x2={b.x * MAP_W} y2={b.y * MAP_H}
                          className={`route-digitizer__seg route-digitizer__seg--${edge.tipo}`}
                        />
                      )
                    })}
                    {draftA != null && (() => {
                      const a = waypoints.find((w) => w.id === draftA)
                      return a ? <circle cx={a.x * MAP_W} cy={a.y * MAP_H} r={16} className="route-digitizer__draft-ring" /> : null
                    })()}
                  </svg>
                  {waypoints.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      className={`route-digitizer__wp${draftA === w.id ? ' is-active' : ''}`}
                      style={{ left: `${w.x * 100}%`, top: `${w.y * 100}%` }}
                      onClick={(e) => handleWaypointClick(w.id, e)}
                      title={w.nome}
                    />
                  ))}
                </div>
              </TransformComponent>
              <DigitizerZoomControls />
            </>
          )}
        </TransformWrapper>

        <MapSidePanel
          expanded={expanded}
          onToggleExpand={() => setExpanded((v) => !v)}
          head={
            <>
              <div className="search-field">
                <input className="search-field__input" placeholder="Buscar nó ou segmento…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="field" style={{ marginTop: 10, marginBottom: 0 }}>
                <label>Escala do mapa (milhas por unidade)</label>
                <div className="row gap-2">
                  <input className="input" value={scaleMi} onChange={(e) => setScaleMi(e.target.value)} />
                  <button type="button" className="btn btn-secondary btn-sm">Salvar</button>
                </div>
              </div>
            </>
          }
        >
          <div className="stack gap-4">
            <section>
              <h3 className="map-page__section-title">Nós · {filteredWp.length}</h3>
              <div className="stack gap-1">
                {filteredWp.map((w) => (
                  <div key={w.id} className="map-page__row" style={{ cursor: 'default' }}>
                    <span className="grow map-page__row-title">{w.nome || `#${w.id}`}</span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onRemoveWaypoint(w.id)}>Apagar</button>
                  </div>
                ))}
                {filteredWp.length === 0 && <p className="text-3">Nenhum nó ainda.</p>}
              </div>
            </section>
            <section>
              <h3 className="map-page__section-title">Segmentos · {filteredEdges.length}</h3>
              <div className="stack gap-1">
                {filteredEdges.map(({ e, i }) => (
                  <div key={i} className="map-page__row" style={{ cursor: 'default' }}>
                    <span className="grow">
                      <span className="map-page__row-title">
                        {waypoints.find((w) => w.id === e.a)?.nome} ↔ {waypoints.find((w) => w.id === e.b)?.nome}
                      </span>
                      <span className="text-3">{TIPO_LABEL[e.tipo]} · {e.distanciaMi} mi</span>
                    </span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onRemoveEdge(i)}>Apagar</button>
                  </div>
                ))}
                {filteredEdges.length === 0 && <p className="text-3">Nenhum segmento ainda.</p>}
              </div>
            </section>
          </div>
        </MapSidePanel>
      </div>
    </div>
  )
}

function DigitizerZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls()
  return (
    <div className="map-canvas__controls">
      <div className="map-canvas__zoom">
        <button type="button" className="icon-btn map-canvas__ctrl" onClick={() => zoomIn()} aria-label="Aumentar zoom"><IconPlus size={18} aria-hidden /></button>
        <button type="button" className="icon-btn map-canvas__ctrl" onClick={() => zoomOut()} aria-label="Diminuir zoom"><IconMinus size={18} aria-hidden /></button>
        <button type="button" className="icon-btn map-canvas__ctrl" onClick={() => resetTransform()} aria-label="Redefinir zoom"><IconRefresh size={16} aria-hidden /></button>
      </div>
    </div>
  )
}
