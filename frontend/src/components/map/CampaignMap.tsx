import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch'
import { adminApi } from '../../api/admin'
import type { GrupoPosicao, Local, RoutePlanItem } from '../../types'
import { ImageSlot } from '../media/ImageSlot'
import { RouteOverlay } from '../routes/RouteOverlay'
import './CampaignMap.css'

/** Fixed moderate zoom when focusing a pin from the side menu. */
export const FOCUS_SCALE = 2
export const FOCUS_ANIM_MS = 400

export type PinFocusRequest =
  | { target: 'local'; localId: number; nonce: number }
  | { target: 'group'; nonce: number }

interface CampaignMapProps {
  mapUrl: string
  locais: Local[]
  grupo: GrupoPosicao | null
  selectedLocalId: number | null
  hoveredLocalId?: number | null
  onSelectLocal: (id: number) => void
  placementMode?: 'none' | 'add-pin' | 'reposition' | 'move-group'
  onMapClickRelative?: (x: number, y: number) => void
  /** Empty-stage click when not placing — clear pin selection (GM). */
  onClearSelection?: () => void
  /** Banner Cancel during reposition — exit placement without changing draft coords. */
  onCancelPlacement?: () => void
  /** Menu-driven focus: animate pan+zoom to pin (nonce re-triggers same id). */
  focusRequest?: PinFocusRequest | null
  /** Clear focusRequest after zoom so hover re-renders cannot re-fire (016). */
  onFocusApplied?: () => void
  interactivePins?: boolean
  mapEditable?: boolean
  onMapUploaded?: (url: string) => void
  overlay?: ReactNode
  /** Travel plan overlay (021) — separate from narrative saida_ids lines. */
  travelPlan?: RoutePlanItem[]
  travelSelectedIndex?: number
  /** Hide lore pins/grupo (GM route digitizer). */
  hideLorePins?: boolean
}

function MapControls({
  onReplaceMap,
  showFocusGroup,
  onFocusGroup,
}: {
  onReplaceMap?: () => void
  showFocusGroup?: boolean
  onFocusGroup?: () => void
}) {
  const { zoomIn, zoomOut, resetTransform } = useControls()
  return (
    <div className="campaign-map__controls">
      <button type="button" className="btn btn-secondary btn-icon" onClick={() => zoomIn()} aria-label="Aproximar">
        +
      </button>
      <button type="button" className="btn btn-secondary btn-icon" onClick={() => zoomOut()} aria-label="Afastar">
        −
      </button>
      <button
        type="button"
        className="btn btn-secondary btn-icon"
        onClick={() => resetTransform()}
        aria-label="Resetar zoom"
      >
        1:1
      </button>
      {showFocusGroup && onFocusGroup && (
        <button
          type="button"
          className="btn btn-secondary btn-icon campaign-map__focus-group"
          onClick={onFocusGroup}
          aria-label="Ir ao grupo"
          title="Ir ao grupo"
        >
          ⚑
        </button>
      )}
      {onReplaceMap && (
        <button
          type="button"
          className="btn btn-secondary campaign-map__replace"
          onClick={onReplaceMap}
          aria-label="Substituir mapa"
          title="Substituir mapa"
        >
          Mapa
        </button>
      )}
    </div>
  )
}

function PinFocusController({
  focusRequest,
  onFocusApplied,
}: {
  focusRequest: PinFocusRequest | null | undefined
  /** Clear request after apply so hover re-renders cannot re-fire zoom (016). */
  onFocusApplied?: () => void
}) {
  const { zoomToElement } = useControls()
  const zoomToElementRef = useRef(zoomToElement)
  zoomToElementRef.current = zoomToElement
  const onFocusAppliedRef = useRef(onFocusApplied)
  onFocusAppliedRef.current = onFocusApplied

  const target = focusRequest?.target
  const localId = focusRequest?.target === 'local' ? focusRequest.localId : undefined
  const nonce = focusRequest?.nonce

  useEffect(() => {
    if (target == null || nonce == null) return
    const id = target === 'group' ? 'map-party' : localId != null ? `map-pin-${localId}` : null
    if (!id) return
    try {
      const el = document.getElementById(id)
      if (!el) return
      zoomToElementRef.current(el, FOCUS_SCALE, FOCUS_ANIM_MS, 'easeOut')
      onFocusAppliedRef.current?.()
    } catch {
      // Silent no-op if transform/DOM not ready (missing #map-party / pin)
    }
  }, [target, localId, nonce])

  return null
}

export function CampaignMap({
  mapUrl,
  locais,
  grupo,
  selectedLocalId,
  hoveredLocalId = null,
  onSelectLocal,
  placementMode = 'none',
  onMapClickRelative,
  onClearSelection,
  onCancelPlacement,
  focusRequest = null,
  onFocusApplied,
  interactivePins = true,
  mapEditable = false,
  onMapUploaded,
  overlay,
  travelPlan = [],
  travelSelectedIndex = 0,
  hideLorePins = false,
}: CampaignMapProps) {
  const placing = placementMode !== 'none'
  const [mapFailed, setMapFailed] = useState(false)
  const [internalFocus, setInternalFocus] = useState<PinFocusRequest | null>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const formato = grupo?.formato === 'brasao' ? 'brasao' : 'bandeira'
  const partyVisible = Boolean(grupo) && !hideLorePins
  const effectiveFocus = focusRequest ?? internalFocus

  const setMapZoomCss = useCallback((scale: number) => {
    stageRef.current?.style.setProperty('--map-zoom', String(scale))
  }, [])

  const handleFocusApplied = useCallback(() => {
    if (focusRequest) {
      onFocusApplied?.()
    } else {
      setInternalFocus(null)
    }
  }, [focusRequest, onFocusApplied])

  useEffect(() => {
    setMapFailed(false)
  }, [mapUrl])

  useEffect(() => {
    if (focusRequest) setInternalFocus(null)
  }, [focusRequest])

  function handleStageClick(e: MouseEvent<HTMLDivElement>) {
    if (placing) {
      if (!onMapClickRelative) return
      const stage = e.currentTarget
      const rect = stage.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      onMapClickRelative(Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y)))
      return
    }
    onClearSelection?.()
  }

  async function handleReplaceFile(file: File | undefined) {
    if (!file || !onMapUploaded) return
    try {
      const { url } = await adminApi.upload('map', file)
      setMapFailed(false)
      onMapUploaded(url)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Falha no upload')
    }
  }

  const showImage = !mapFailed && Boolean(mapUrl)

  return (
    <div className={`campaign-map${placing ? ' campaign-map--placing' : ''}`}>
      {placing && (
        <div className="tag tag-accent campaign-map__banner" role="status">
          {placementMode === 'add-pin' && 'Clique no mapa para posicionar o novo local'}
          {placementMode === 'reposition' && (
            <>
              <span>Clique no mapa para reposicionar o local</span>
              {onCancelPlacement && (
                <button
                  type="button"
                  className="btn btn-ghost campaign-map__banner-cancel"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCancelPlacement()
                  }}
                >
                  Cancelar
                </button>
              )}
            </>
          )}
          {placementMode === 'move-group' && 'Clique no mapa para reposicionar o grupo'}
        </div>
      )}
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.01 }}
        panning={{ disabled: placing }}
        onInit={(ref) => setMapZoomCss(ref.state.scale)}
        onTransform={(_ref, state) => setMapZoomCss(state.scale)}
      >
        <PinFocusController focusRequest={effectiveFocus} onFocusApplied={handleFocusApplied} />
        <MapControls
          onReplaceMap={
            mapEditable && showImage ? () => replaceInputRef.current?.click() : undefined
          }
          showFocusGroup={partyVisible}
          onFocusGroup={
            partyVisible
              ? () => setInternalFocus({ target: 'group', nonce: Date.now() })
              : undefined
          }
        />
        <TransformComponent
          wrapperClass="campaign-map__viewport"
          contentClass="campaign-map__content"
          wrapperStyle={{ width: '100%', height: '100%' }}
        >
          <div
            ref={stageRef}
            className="campaign-map__stage"
            style={{ ['--map-zoom' as string]: 1 }}
            onClick={handleStageClick}
            role={placing ? 'button' : undefined}
          >
            {showImage && (
              <img
                key={mapUrl}
                src={mapUrl}
                alt="Mapa da campanha"
                className="campaign-map__image"
                draggable={false}
                loading="lazy"
                decoding="async"
                onLoad={() => setMapFailed(false)}
                onError={() => setMapFailed(true)}
              />
            )}
            {!showImage && mapEditable && (
              <ImageSlot
                className="campaign-map__slot"
                src={null}
                placeholder="Mapa da campanha — arraste a imagem aqui"
                shape="rect"
                fit="cover"
                editable
                category="map"
                onUploaded={(url) => {
                  setMapFailed(false)
                  onMapUploaded?.(url)
                }}
              />
            )}
            {!showImage && !mapEditable && (
              <div className="campaign-map__placeholder" role="status">
                Mapa da campanha — imagem indisponível
              </div>
            )}
            {(() => {
              if (hideLorePins) return null
              // Selection wins for lines; hover previews only when nothing is selected (020).
              const connectionOriginId =
                selectedLocalId != null ? selectedLocalId : hoveredLocalId
              if (connectionOriginId == null) return null
              const origin = locais.find((l) => l.id === connectionOriginId)
              if (!origin) return null
              const saidas = origin.saida_ids ?? []
              if (saidas.length === 0) return null
              const byId = new Map(locais.map((l) => [l.id, l]))
              const segments = saidas
                .map((id) => byId.get(id))
                .filter((d): d is (typeof locais)[number] => d != null)
              if (segments.length === 0) return null
              return (
                <svg className="campaign-map__connections" aria-hidden="true">
                  {segments.map((dest) => (
                    <line
                      key={`${origin.id}-${dest.id}`}
                      className="campaign-map__connection-line"
                      x1={`${origin.x * 100}%`}
                      y1={`${origin.y * 100}%`}
                      x2={`${dest.x * 100}%`}
                      y2={`${dest.y * 100}%`}
                    />
                  ))}
                </svg>
              )
            })()}
            <RouteOverlay rotas={travelPlan} selectedIndex={travelSelectedIndex} />
            {!hideLorePins &&
              locais.map((local) => {
              const selected = selectedLocalId === local.id
              const hovered = hoveredLocalId === local.id
              const pinColor = local.cor_pin || '#c4b5fd'
              const pinClass = [
                'campaign-map__pin',
                selected ? 'campaign-map__pin--selected' : '',
                hovered ? 'campaign-map__pin--hovered' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={local.id}
                  id={`map-pin-${local.id}`}
                  type="button"
                  className={pinClass}
                  style={{
                    left: `${local.x * 100}%`,
                    top: `${local.y * 100}%`,
                    background: pinColor,
                    ['--pin-color' as string]: pinColor,
                  }}
                  title={local.nome}
                  disabled={!interactivePins || placing}
                  onClick={(ev) => {
                    ev.stopPropagation()
                    if (!placing) onSelectLocal(local.id)
                  }}
                >
                  <span className="visually-hidden">{local.nome}</span>
                </button>
              )
            })}
            {!hideLorePins && grupo && (
              <div
                id="map-party"
                className={`campaign-map__party campaign-map__party--${formato}`}
                style={{ left: `${grupo.x * 100}%`, top: `${grupo.y * 100}%` }}
                title="Posição do grupo"
                onClick={(ev) => ev.stopPropagation()}
              />
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
      {mapEditable && (
        <input
          ref={replaceInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            void handleReplaceFile(file)
          }}
        />
      )}
      {!hideLorePins && (
        <div className="campaign-map__legend">
          <span>
            <i className="campaign-map__legend-pin campaign-map__legend-pin--visited" /> Visitado
          </span>
          <span>
            <i className="campaign-map__legend-pin campaign-map__legend-pin--known" /> Conhecido
          </span>
          <span>
            <i className={`campaign-map__legend-party campaign-map__legend-party--${formato}`} /> Grupo
          </span>
          <span className="campaign-map__legend-note text-muted">GM pode usar outras cores</span>
        </div>
      )}
      {overlay}
    </div>
  )
}
