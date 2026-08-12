import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import type { Personagem, Vinculo, VinculoTipo } from '../../types'
import { labelMatchesQuery } from '../../utils/textMatch'
import {
  computeFocusLayout,
  computeInitialLayout,
  discCenterFromNodePos,
  DISC,
  EDGE_OPACITY_DIM,
  EDGE_OPACITY_FOCUS,
  NODE_H,
  NODE_W,
  type Point,
} from './graphLayout'
import { vinculoStyle } from './vinculoStyles'
import './GraphStage.css'

const MIN_SCALE = 0.35
const MAX_SCALE = 2.5
const DRAG_THRESHOLD = 4
const CENTER: Point = { x: 0, y: 0 }

export type RotulosVinculo = 'foco' | 'sempre' | 'hover'

interface GraphStageProps {
  personagens: Personagem[]
  vinculos: Vinculo[]
  selectedId: number | null
  onSelect: (id: number) => void
  onDeselect: () => void
  showEdges: boolean
  isolate: boolean
  activeTipos: Set<VinculoTipo>
  onEdgeClick?: (vinculoId: number) => void
  rotulosVinculo?: RotulosVinculo
  espacamento?: number
  searchQuery?: string
}

interface DragSession {
  mode: 'pan' | 'node'
  nodeId?: number
  startClientX: number
  startClientY: number
  startPan: Point
  startOffset: Point
  moved: boolean
}

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function GraphStage({
  personagens,
  vinculos,
  selectedId,
  onSelect,
  onDeselect,
  showEdges,
  isolate,
  activeTipos,
  onEdgeClick,
  rotulosVinculo = 'foco',
  espacamento = 240,
  searchQuery = '',
}: GraphStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState<Point>(CENTER)
  const [dragOffsets, setDragOffsets] = useState<Map<number, Point>>(new Map())
  const [hoveredEdgeId, setHoveredEdgeId] = useState<number | null>(null)
  const dragRef = useRef<DragSession | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const filteredVinculos = useMemo(
    () => vinculos.filter((v) => activeTipos.has(v.tipo)),
    [vinculos, activeTipos],
  )

  const directIds = useMemo(() => {
    if (selectedId == null) return new Set<number>()
    const ids = filteredVinculos
      .filter((v) => v.personagem_a_id === selectedId || v.personagem_b_id === selectedId)
      .map((v) => (v.personagem_a_id === selectedId ? v.personagem_b_id : v.personagem_a_id))
    return new Set(ids)
  }, [filteredVinculos, selectedId])

  const basePositions = useMemo(() => {
    const allIds = personagens.map((p) => p.id)
    if (selectedId != null && allIds.includes(selectedId)) {
      const otherIds = allIds.filter((id) => id !== selectedId && !directIds.has(id))
      return computeFocusLayout(selectedId, [...directIds], otherIds, CENTER, espacamento)
    }
    const pjIds = personagens.filter((p) => p.tipo === 'pj').map((p) => p.id)
    const npcIds = personagens.filter((p) => p.tipo === 'npc').map((p) => p.id)
    return computeInitialLayout(pjIds, npcIds, CENTER, espacamento)
  }, [personagens, selectedId, directIds, espacamento])

  const positions = useMemo(() => {
    const out = new Map<number, Point>()
    for (const [id, p] of basePositions) {
      const off = dragOffsets.get(id)
      out.set(id, off ? { x: p.x + off.x, y: p.y + off.y } : p)
    }
    return out
  }, [basePositions, dragOffsets])

  const matchedIds = useMemo(() => {
    const q = searchQuery.trim()
    if (!q) return null
    return new Set(personagens.filter((p) => labelMatchesQuery(p.nome, q)).map((p) => p.id))
  }, [personagens, searchQuery])

  const isolated = isolate && selectedId != null

  function isVisible(id: number): boolean {
    if (!isolated) return true
    return id === selectedId || directIds.has(id)
  }

  const visibleEdges = useMemo(() => {
    if (!isolated) return filteredVinculos
    return filteredVinculos.filter(
      (v) => v.personagem_a_id === selectedId || v.personagem_b_id === selectedId,
    )
  }, [filteredVinculos, isolated, selectedId])

  function isFocusEdge(v: Vinculo): boolean {
    return selectedId != null && (v.personagem_a_id === selectedId || v.personagem_b_id === selectedId)
  }

  function clampScale(next: number): number {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
  }

  function handleWheel(e: ReactWheelEvent<HTMLDivElement>) {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    setScale((s) => clampScale(s * factor))
  }

  function findNodeId(target: EventTarget | null): number | null {
    if (!(target instanceof Element)) return null
    const el = target.closest('[data-node-id]')
    if (!el) return null
    const raw = el.getAttribute('data-node-id')
    return raw ? Number(raw) : null
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    const nodeId = findNodeId(e.target)
    e.currentTarget.setPointerCapture(e.pointerId)
    if (nodeId != null) {
      dragRef.current = {
        mode: 'node',
        nodeId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startPan: pan,
        startOffset: dragOffsets.get(nodeId) ?? { x: 0, y: 0 },
        moved: false,
      }
    } else {
      dragRef.current = {
        mode: 'pan',
        startClientX: e.clientX,
        startClientY: e.clientY,
        startPan: pan,
        startOffset: { x: 0, y: 0 },
        moved: false,
      }
    }
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    const dx = e.clientX - drag.startClientX
    const dy = e.clientY - drag.startClientY
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) drag.moved = true
    if (!drag.moved) return

    if (drag.mode === 'pan') {
      setPan({ x: drag.startPan.x + dx, y: drag.startPan.y + dy })
    } else if (drag.mode === 'node' && drag.nodeId != null) {
      const nodeId = drag.nodeId
      const next: Point = {
        x: drag.startOffset.x + dx / scale,
        y: drag.startOffset.y + dy / scale,
      }
      setDragOffsets((prev) => {
        const map = new Map(prev)
        map.set(nodeId, next)
        return map
      })
    }
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (!drag) return
    if (!drag.moved) {
      if (drag.mode === 'node' && drag.nodeId != null) onSelect(drag.nodeId)
      else onDeselect()
    }
  }

  function zoomBy(factor: number) {
    setScale((s) => clampScale(s * factor))
  }

  function resetView() {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  const showAlwaysLabels = rotulosVinculo === 'sempre'

  return (
    <div
      ref={containerRef}
      className="graph-stage"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="graph-stage__world"
        style={{
          transform: `translate(${size.width / 2 + pan.x}px, ${size.height / 2 + pan.y}px) scale(${scale})`,
        }}
      >
        <svg className="graph-stage__edges" aria-hidden="true">
          {visibleEdges.map((v) => {
              const aPos = positions.get(v.personagem_a_id)
              const bPos = positions.get(v.personagem_b_id)
              if (!aPos || !bPos) return null
              const a = discCenterFromNodePos(aPos)
              const b = discCenterFromNodePos(bPos)
              const style = vinculoStyle(v.tipo)
              const highlighted = showEdges && isFocusEdge(v)
              const midX = (a.x + b.x) / 2
              const midY = (a.y + b.y) / 2
              const labelVisible =
                highlighted &&
                (rotulosVinculo === 'foco' ||
                  showAlwaysLabels ||
                  (rotulosVinculo === 'hover' && hoveredEdgeId === v.id))
              return (
                <g key={v.id} className="graph-stage__edge-group">
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={style.color}
                    strokeWidth={highlighted ? 2.25 : 2}
                    strokeDasharray={style.dashed ? '6 5' : undefined}
                    opacity={highlighted ? EDGE_OPACITY_FOCUS : EDGE_OPACITY_DIM}
                    className="graph-stage__edge-line"
                  />
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="transparent"
                    strokeWidth={18}
                    className="graph-stage__edge-hit"
                    onPointerEnter={() => setHoveredEdgeId(v.id)}
                    onPointerLeave={() => setHoveredEdgeId((id) => (id === v.id ? null : id))}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdgeClick?.(v.id)
                    }}
                  />
                  {labelVisible && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x={-42}
                        y={-11}
                        width={84}
                        height={22}
                        rx={6}
                        className="graph-stage__edge-label-bg"
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        className="graph-stage__edge-label"
                        fill={style.color}
                      >
                        {style.label}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
        </svg>

        {personagens
          .filter((p) => isVisible(p.id))
          .map((p) => {
            const pos = positions.get(p.id)
            if (!pos) return null
            const related = selectedId != null && (p.id === selectedId || directIds.has(p.id))
            const dimByFocus = selectedId != null && !related
            const dimBySearch = matchedIds != null && !matchedIds.has(p.id)
            const opacity = dimByFocus ? 0.28 : dimBySearch ? 0.4 : 1
            const isMorto = p.status === 'morto'
            const classes = [
              'graph-node',
              p.tipo === 'pj' ? 'graph-node--pj' : 'graph-node--npc',
              p.id === selectedId ? 'graph-node--selected' : '',
              isMorto ? 'graph-node--morto' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <div
                key={p.id}
                data-node-id={p.id}
                className={classes}
                style={{
                  transform: `translate(${pos.x - NODE_W / 2}px, ${pos.y - NODE_H / 2}px)`,
                  width: NODE_W,
                  height: NODE_H,
                  opacity,
                }}
              >
                <div className="graph-node__disc" style={{ width: DISC, height: DISC }}>
                  <span>{initials(p.nome)}</span>
                </div>
                <div className="graph-node__name">{p.nome}</div>
                {p.papel && <div className="graph-node__papel">{p.papel}</div>}
              </div>
            )
          })}
      </div>

      <div className="graph-stage__zoom">
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={() => zoomBy(1.2)}
          aria-label="Aumentar zoom"
        >
          +
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={() => zoomBy(1 / 1.2)}
          aria-label="Diminuir zoom"
        >
          −
        </button>
        <button type="button" className="btn btn-secondary" onClick={resetView}>
          1:1
        </button>
      </div>
    </div>
  )
}
