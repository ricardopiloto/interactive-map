import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch'
import { adminApi } from '../../api/admin'
import type { GrupoPosicao, Local } from '../../types'
import { ImageSlot } from '../media/ImageSlot'
import './CampaignMap.css'

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
  interactivePins?: boolean
  mapEditable?: boolean
  onMapUploaded?: (url: string) => void
  overlay?: ReactNode
}

function MapControls({ onReplaceMap }: { onReplaceMap?: () => void }) {
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
  interactivePins = true,
  mapEditable = false,
  onMapUploaded,
  overlay,
}: CampaignMapProps) {
  const placing = placementMode !== 'none'
  const [mapFailed, setMapFailed] = useState(false)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const formato = grupo?.formato === 'brasao' ? 'brasao' : 'bandeira'

  useEffect(() => {
    setMapFailed(false)
  }, [mapUrl])

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
          {placementMode === 'reposition' && 'Clique no mapa para reposicionar o local'}
          {placementMode === 'move-group' && 'Clique no mapa para reposicionar o grupo'}
        </div>
      )}
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.1 }}
        panning={{ disabled: placing }}
      >
        <MapControls
          onReplaceMap={
            mapEditable && showImage ? () => replaceInputRef.current?.click() : undefined
          }
        />
        <TransformComponent
          wrapperClass="campaign-map__viewport"
          contentClass="campaign-map__content"
          wrapperStyle={{ width: '100%', height: '100%' }}
        >
          <div
            className="campaign-map__stage"
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
            {locais.map((local) => {
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
            {grupo && (
              <div
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
      <div className="campaign-map__legend">
        <span>
          <i className="campaign-map__legend-pin campaign-map__legend-pin--visited" /> Visitado
          <span className="text-muted"> (sugestão)</span>
        </span>
        <span>
          <i className="campaign-map__legend-pin campaign-map__legend-pin--known" /> Conhecido
          <span className="text-muted"> (sugestão)</span>
        </span>
        <span>
          <i className={`campaign-map__legend-party campaign-map__legend-party--${formato}`} /> Grupo
        </span>
        <span className="campaign-map__legend-note text-muted">GM pode usar outras cores</span>
      </div>
      {overlay}
    </div>
  )
}
