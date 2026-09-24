import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { IconArrowsExchange, IconRoute2, IconClockHour4, IconMapPin2 } from '@tabler/icons-react'
import type { CampaignCtx } from './CampaignLayout'
import { MapCanvas } from '../components/map/MapCanvas'
import { MapSidePanel } from '../components/map/MapSidePanel'
import { RouteDigitizer } from '../components/route/RouteDigitizer'
import { computeRoutes, sortRouteOptions, estimateCustoPo, nodeLabel, type RouteOption } from '../data/routeEngine'
import type { RouteEdge, WaypointNode } from '../data/types'
import './MapPage.css'
import './RotaPage.css'

type Transporte = 'pago' | 'proprio'
type Ritmo = 'normal' | 'intenso'
type Ordenacao = 'mais_rapida' | 'mais_barata'
type PreferenciaVia = 'nenhuma' | 'rio' | 'estrada'

const SPEED_MPH: Record<Transporte, number> = { pago: 4.4, proprio: 3 }
const HOURS_DAY: Record<Ritmo, number> = { normal: 6, intenso: 9 }
const RITMO_MULT: Record<Ritmo, number> = { normal: 1, intenso: 1.28 }

function formatTravel(distanciaMi: number, transporte: Transporte, ritmo: Ritmo) {
  const speed = SPEED_MPH[transporte] * RITMO_MULT[ritmo]
  const totalHours = distanciaMi / speed
  const hoursDay = HOURS_DAY[ritmo]
  const days = Math.floor(totalHours / hoursDay)
  const remHours = Math.round(totalHours - days * hoursDay)
  if (days === 0) return `${remHours} h`
  if (remHours === 0) return `${days} ${days === 1 ? 'dia' : 'dias'}`
  return `${days} ${days === 1 ? 'dia' : 'dias'} e ${remHours} h`
}

const ROUTE_KEY_LABEL: Record<string, string> = { direta: 'Mais direta', 'por-estrada': 'Por estrada', 'por-rio': 'Por rio' }

export function RotaPage() {
  const { campaign, isGm } = useOutletContext<CampaignCtx>()
  const [waypoints, setWaypoints] = useState<WaypointNode[]>(campaign.waypoints)
  const [edges, setEdges] = useState<RouteEdge[]>(campaign.edges)
  const [fromId, setFromId] = useState(waypoints[0]?.id ?? '')
  const [toId, setToId] = useState(waypoints[1]?.id ?? waypoints[0]?.id ?? '')
  const [transporte, setTransporte] = useState<Transporte>('proprio')
  const [ritmo, setRitmo] = useState<Ritmo>('normal')
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('mais_rapida')
  const [preferenciaVia, setPreferenciaVia] = useState<PreferenciaVia>('nenhuma')
  const [calculated, setCalculated] = useState(false)
  const [selectedRouteKey, setSelectedRouteKey] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [digitizerOpen, setDigitizerOpen] = useState(false)

  const rawOptions: RouteOption[] = useMemo(
    () => (calculated ? computeRoutes(edges, fromId, toId) : []),
    [calculated, edges, fromId, toId],
  )
  const options = useMemo(
    () => sortRouteOptions(rawOptions, ordenacao, preferenciaVia, transporte),
    [rawOptions, ordenacao, preferenciaVia, transporte],
  )
  const selectedOption = options.find((o) => o.key === selectedRouteKey) ?? options[0]

  function handleCalculate() {
    setCalculated(true)
    setSelectedRouteKey(null)
  }

  function swap() {
    setFromId(toId); setToId(fromId); setCalculated(false)
  }

  function addWaypoint(x: number, y: number, nome: string) {
    const id = `wp-${Date.now()}`
    setWaypoints((prev) => [...prev, { id, x, y, nome: nome || `Nó ${prev.length + 1}` }])
  }
  function removeWaypoint(id: string) {
    setWaypoints((prev) => prev.filter((w) => w.id !== id))
    setEdges((prev) => prev.filter((e) => e.a !== id && e.b !== id))
  }
  function addEdge(aId: string, bId: string, tipo: RouteEdge['tipo']) {
    const a = waypoints.find((w) => w.id === aId)
    const b = waypoints.find((w) => w.id === bId)
    const distanciaMi = a && b ? Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 400) : 10
    setEdges((prev) => [...prev, { a: aId, b: bId, tipo, distanciaMi }])
  }
  function removeEdge(index: number) {
    setEdges((prev) => prev.filter((_, i) => i !== index))
  }

  if (digitizerOpen) {
    return (
      <RouteDigitizer
        waypoints={waypoints}
        edges={edges}
        onAddWaypoint={addWaypoint}
        onRemoveWaypoint={removeWaypoint}
        onAddEdge={addEdge}
        onRemoveEdge={removeEdge}
        onClose={() => setDigitizerOpen(false)}
      />
    )
  }

  return (
    <div className="map-page">
      <MapCanvas
        campaign={{ ...campaign, waypoints, edges }}
        selectedId={null}
        hoveredId={null}
        onSelectLocal={() => {}}
        onHoverLocal={() => {}}
        highlightPath={selectedOption?.path}
      />

      {isGm && (
        <button type="button" className="btn btn-secondary rota-page__digitizer-btn" onClick={() => setDigitizerOpen(true)}>
          <IconMapPin2 size={16} aria-hidden /> Rede de rotas
        </button>
      )}

      <MapSidePanel
        expanded={expanded}
        onToggleExpand={() => setExpanded((v) => !v)}
        head={
          <div className="rota-page__form">
            <div className="rota-page__inputs">
              <div className="stack gap-2" style={{ flex: 1 }}>
                <select className="select" value={fromId} onChange={(e) => { setFromId(e.target.value); setCalculated(false) }}>
                  {waypoints.map((w) => <option key={w.id} value={w.id}>{w.nome}</option>)}
                </select>
                <select className="select" value={toId} onChange={(e) => { setToId(e.target.value); setCalculated(false) }}>
                  {waypoints.map((w) => <option key={w.id} value={w.id}>{w.nome}</option>)}
                </select>
              </div>
              <button type="button" className="icon-btn icon-btn-sm" onClick={swap} aria-label="Trocar origem e destino">
                <IconArrowsExchange size={16} aria-hidden />
              </button>
            </div>
            <div className="row gap-2" style={{ marginTop: 10, flexWrap: 'wrap' }}>
              <button type="button" className={`chip${transporte === 'proprio' ? ' is-active' : ''}`} onClick={() => setTransporte('proprio')}>Transporte próprio</button>
              <button type="button" className={`chip${transporte === 'pago' ? ' is-active' : ''}`} onClick={() => setTransporte('pago')}>Transporte pago</button>
              <button type="button" className={`chip${ritmo === 'normal' ? ' is-active' : ''}`} onClick={() => setRitmo('normal')}>Ritmo normal</button>
              <button type="button" className={`chip${ritmo === 'intenso' ? ' is-active' : ''}`} onClick={() => setRitmo('intenso')}>Ritmo intenso</button>
              <button type="button" className={`chip${ordenacao === 'mais_rapida' ? ' is-active' : ''}`} onClick={() => setOrdenacao('mais_rapida')}>Mais rápida</button>
              <button type="button" className={`chip${ordenacao === 'mais_barata' ? ' is-active' : ''}`} onClick={() => setOrdenacao('mais_barata')}>Mais barata</button>
              <button type="button" className={`chip${preferenciaVia === 'nenhuma' ? ' is-active' : ''}`} onClick={() => setPreferenciaVia('nenhuma')}>Sem preferência</button>
              <button type="button" className={`chip${preferenciaVia === 'estrada' ? ' is-active' : ''}`} onClick={() => setPreferenciaVia('estrada')}>Por estrada</button>
              <button type="button" className={`chip${preferenciaVia === 'rio' ? ' is-active' : ''}`} onClick={() => setPreferenciaVia('rio')}>Por rio</button>
            </div>
            <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 10 }} onClick={handleCalculate} disabled={fromId === toId}>
              <IconRoute2 size={16} aria-hidden /> Calcular rota
            </button>
            {fromId === toId && <p className="field-hint" style={{ marginTop: 6 }}>Escolha origem e destino diferentes.</p>}
          </div>
        }
      >
        {calculated && (
          options.length === 0 ? (
            <div className="empty-state"><p>Nenhuma rota conhecida entre esses dois pontos.</p></div>
          ) : (
            <div className="stack gap-2">
              {options.map((opt, i) => {
                const isSelected = selectedOption?.key === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    className={`rota-page__card${isSelected ? ' is-selected' : ''}`}
                    onClick={() => setSelectedRouteKey(opt.key)}
                  >
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span className="map-page__row-title">{ROUTE_KEY_LABEL[opt.key] ?? opt.key}</span>
                      {i === 0 && <span className="badge badge-accent">{ordenacao === 'mais_barata' ? 'mais barata' : 'mais rápida'}</span>}
                    </div>
                    <div className="row gap-3" style={{ marginTop: 6, flexWrap: 'wrap' }}>
                      <span className="text-2"><IconClockHour4 size={14} aria-hidden style={{ verticalAlign: -2 }} /> {formatTravel(opt.distanciaMi, transporte, ritmo)}</span>
                      <span className="text-3">{Math.round(opt.distanciaMi)} mi</span>
                      <span className="text-3">{estimateCustoPo(opt.distanciaMi, transporte)} PO</span>
                    </div>
                    <div className="text-3" style={{ marginTop: 4 }}>
                      {opt.path.map((id) => nodeLabel(waypoints, id)).join(' → ')}
                    </div>
                  </button>
                )
              })}
            </div>
          )
        )}
        {!calculated && (
          <div className="empty-state">
            <IconRoute2 size={28} aria-hidden style={{ opacity: 0.5 }} />
            <p>Escolha origem, destino e calcule para ver as alternativas de viagem.</p>
          </div>
        )}
      </MapSidePanel>
    </div>
  )
}
