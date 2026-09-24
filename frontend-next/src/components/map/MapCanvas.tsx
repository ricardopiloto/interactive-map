import { useState } from 'react'
import {
  TransformWrapper, TransformComponent, KeepScale, useControls,
  type ReactZoomPanPinchContentRef,
} from 'react-zoom-pan-pinch'
import { IconPlus, IconMinus, IconFocus2, IconFlagFilled, IconShield } from '@tabler/icons-react'
import type { Campaign, Local } from '../../data/types'
import './MapCanvas.css'

export const MAP_W = 1400
export const MAP_H = 900

interface MapCanvasProps {
  campaign: Campaign
  selectedId: string | null
  hoveredId: string | null
  onSelectLocal: (id: string) => void
  onHoverLocal: (id: string | null) => void
  addMode?: boolean
  onAddAt?: (x: number, y: number) => void
  moveGroupMode?: boolean
  onMoveGroupAt?: (x: number, y: number) => void
  /** Waypoint ids, em ordem, para destacar como rota calculada. */
  highlightPath?: string[]
}

function MapControls({ onRecenter }: { onRecenter: () => void }) {
  const { zoomIn, zoomOut, resetTransform } = useControls()
  return (
    <div className="map-canvas__controls">
      <button type="button" className="icon-btn map-canvas__ctrl" onClick={() => onRecenter()} aria-label="Ir para o grupo">
        <IconFocus2 size={18} aria-hidden />
      </button>
      <div className="map-canvas__zoom">
        <button type="button" className="icon-btn map-canvas__ctrl" onClick={() => zoomIn()} aria-label="Aumentar zoom">
          <IconPlus size={18} aria-hidden />
        </button>
        <button type="button" className="icon-btn map-canvas__ctrl" onClick={() => zoomOut()} aria-label="Diminuir zoom">
          <IconMinus size={18} aria-hidden />
        </button>
        <button
          type="button"
          className="icon-btn map-canvas__ctrl map-canvas__ctrl--text"
          onClick={() => resetTransform()}
          aria-label="Voltar ao zoom padrão"
        >
          1:1
        </button>
      </div>
    </div>
  )
}

function Pin({ local, state, onSelect, onHover, moveGroupMode }: {
  local: Local
  state: 'default' | 'selected' | 'hovered'
  onSelect: () => void
  onHover: (v: boolean) => void
  moveGroupMode?: boolean
}) {
  return (
    <KeepScale
      style={{ position: 'absolute', left: local.x * MAP_W, top: local.y * MAP_H, transform: 'translate(-50%, -100%)' }}
    >
      <button
        type="button"
        className={`map-pin${local.visitado ? ' map-pin--filled' : ' map-pin--outline'}${state !== 'default' ? ` map-pin--${state}` : ''}`}
        style={{ '--pin-color': local.corPin } as React.CSSProperties}
        onClick={() => { if (!moveGroupMode) onSelect() }}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <span className="map-pin__dot" />
        <span className="map-pin__label">{local.nome}</span>
      </button>
    </KeepScale>
  )
}

export function MapCanvas({ campaign, selectedId, hoveredId, onSelectLocal, onHoverLocal, addMode, onAddAt, moveGroupMode, onMoveGroupAt, highlightPath }: MapCanvasProps) {
  const [instanceKey] = useState(0)

  function handleSurfaceClick(e: React.MouseEvent<HTMLDivElement>, ctx: ReactZoomPanPinchContentRef) {
    if (moveGroupMode && onMoveGroupAt) {
      const content = ctx.clientToContent(e.clientX, e.clientY)
      onMoveGroupAt(Math.min(1, Math.max(0, content.x / MAP_W)), Math.min(1, Math.max(0, content.y / MAP_H)))
      return
    }
    if (!addMode || !onAddAt) return
    const content = ctx.clientToContent(e.clientX, e.clientY)
    onAddAt(Math.min(1, Math.max(0, content.x / MAP_W)), Math.min(1, Math.max(0, content.y / MAP_H)))
  }

  const routeLines = campaign.waypoints.length
    ? campaign.edges
        .map((edge) => {
          const a = campaign.waypoints.find((w) => w.id === edge.a)
          const b = campaign.waypoints.find((w) => w.id === edge.b)
          if (!a || !b) return null
          return { key: `${edge.a}-${edge.b}`, x1: a.x * MAP_W, y1: a.y * MAP_H, x2: b.x * MAP_W, y2: b.y * MAP_H }
        })
        .filter((v): v is NonNullable<typeof v> => v !== null)
    : []

  const highlightSegments = (highlightPath ?? []).slice(1).map((id, i) => {
    const prevId = (highlightPath as string[])[i]
    const a = campaign.waypoints.find((w) => w.id === prevId)
    const b = campaign.waypoints.find((w) => w.id === id)
    if (!a || !b) return null
    return { key: `${prevId}-${id}`, x1: a.x * MAP_W, y1: a.y * MAP_H, x2: b.x * MAP_W, y2: b.y * MAP_H }
  }).filter((v): v is NonNullable<typeof v> => v !== null)

  return (
    <div className={`map-canvas${addMode ? ' map-canvas--adding' : ''}${moveGroupMode ? ' map-canvas--moving-group' : ''}`} key={instanceKey}>
      <TransformWrapper
        initialScale={1}
        minScale={0.55}
        maxScale={3.2}
        centerOnInit
        limitToBounds={false}
        wheel={{ step: 0.12 }}
        doubleClick={{ mode: 'zoomIn' }}
        panning={{ disabled: Boolean(addMode || moveGroupMode) }}
      >
        {(ctx) => (
          <>
            <TransformComponent
              wrapperClass="map-canvas__wrapper"
              contentClass="map-canvas__content"
              contentStyle={{ width: MAP_W, height: MAP_H }}
            >
              <div className="map-canvas__surface" onClick={(e) => handleSurfaceClick(e, ctx)}>
                <div className="map-canvas__bg" aria-hidden />
                <svg className="map-canvas__veins" viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden preserveAspectRatio="none">
                  <path d={`M ${MAP_W * 0.05} ${MAP_H * 0.15} C ${MAP_W * 0.3} ${MAP_H * 0.05}, ${MAP_W * 0.6} ${MAP_H * 0.3}, ${MAP_W * 0.95} ${MAP_H * 0.2}`} className="map-canvas__vein" />
                  <path d={`M ${MAP_W * 0.1} ${MAP_H * 0.85} C ${MAP_W * 0.35} ${MAP_H * 0.6}, ${MAP_W * 0.5} ${MAP_H * 0.75}, ${MAP_W * 0.9} ${MAP_H * 0.55}` } className="map-canvas__vein" />
                  <path d={`M ${MAP_W * 0.75} ${MAP_H * 0.05} C ${MAP_W * 0.6} ${MAP_H * 0.35}, ${MAP_W * 0.7} ${MAP_H * 0.6}, ${MAP_W * 0.55} ${MAP_H * 0.95}`} className="map-canvas__vein map-canvas__vein--soft" />
                  {routeLines.map((l) => (
                    <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} className="map-canvas__route" />
                  ))}
                  {highlightSegments.map((l) => (
                    <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} className="map-canvas__route map-canvas__route--highlight" />
                  ))}
                </svg>

                {campaign.locais.map((local) => (
                  <Pin
                    key={local.id}
                    local={local}
                    state={selectedId === local.id ? 'selected' : hoveredId === local.id ? 'hovered' : 'default'}
                    onSelect={() => onSelectLocal(local.id)}
                    onHover={(v) => onHoverLocal(v ? local.id : null)}
                    moveGroupMode={moveGroupMode}
                  />
                ))}

                <KeepScale
                  id="group-marker"
                  style={{ position: 'absolute', left: campaign.grupo.x * MAP_W, top: campaign.grupo.y * MAP_H, transform: 'translate(-50%, -50%)' }}
                >
                  <span className={`map-group-marker map-group-marker--${campaign.grupo.formato ?? 'bandeira'}`} title={campaign.grupo.formato === 'brasao' ? 'Grupo — brasão' : 'Grupo — bandeira'}>
                    <span className="map-group-marker__pulse" aria-hidden />
                    {campaign.grupo.formato === 'brasao' ? <IconShield size={16} aria-hidden /> : <IconFlagFilled size={14} aria-hidden />}
                  </span>
                </KeepScale>
              </div>
            </TransformComponent>
            <MapControls onRecenter={() => ctx.zoomToElement('group-marker', 1.15)} />
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
