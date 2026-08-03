import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { Arco, Local, NPC } from '../../types'
import { FOCUS_ANIM_MS } from '../map/CampaignMap'
import { ImageSlot } from '../media/ImageSlot'
import { MarkdownSafe } from './MarkdownSafe'
import './PinModal.css'

const PANEL_GAP_PX = 16
const VIEWPORT_PAD_PX = 16
const NARROW_VIEWPORT_PX = 640
const POSITION_RECALC_MS = FOCUS_ANIM_MS

interface PinModalProps {
  local: Local
  npcs: NPC[]
  arco: Arco | null
  onClose: () => void
  onOpenNpc: (id: number) => void
  onOpenArco: (id: number) => void
}

type PanelPlacement =
  | { mode: 'centered' }
  | { mode: 'beside'; top: number; left: number }

function computePlacement(pinEl: HTMLElement, panelEl: HTMLElement | null): PanelPlacement {
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (vw < NARROW_VIEWPORT_PX) return { mode: 'centered' }

  const pin = pinEl.getBoundingClientRect()
  if (!Number.isFinite(pin.width) || pin.width <= 0) return { mode: 'centered' }

  const panelW = panelEl?.offsetWidth || Math.min(440, vw - VIEWPORT_PAD_PX * 2)
  const panelH = panelEl?.offsetHeight || Math.min(vh * 0.9, 720)

  const pinCenterY = pin.top + pin.height / 2
  const top = Math.max(
    VIEWPORT_PAD_PX,
    Math.min(pinCenterY - panelH / 2, vh - panelH - VIEWPORT_PAD_PX),
  )

  const rightLeft = pin.right + PANEL_GAP_PX
  const leftLeft = pin.left - PANEL_GAP_PX - panelW
  const fitsRight = rightLeft + panelW <= vw - VIEWPORT_PAD_PX
  const fitsLeft = leftLeft >= VIEWPORT_PAD_PX

  // Prefer right of pin (opposite left side menu); flip left if needed.
  if (fitsRight) return { mode: 'beside', top, left: rightLeft }
  if (fitsLeft) return { mode: 'beside', top, left: leftLeft }
  return { mode: 'centered' }
}

export function PinModal({ local, npcs, arco, onClose, onOpenNpc, onOpenArco }: PinModalProps) {
  const linkedNpcs = npcs.filter((n) => local.npc_ids.includes(n.id))
  const descricao = local.descricao.trim()
  const panelRef = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<PanelPlacement>({ mode: 'centered' })

  useLayoutEffect(() => {
    let cancelled = false
    let raf = 0
    let timer = 0

    const update = () => {
      if (cancelled) return
      try {
        const pinEl = document.getElementById(`map-pin-${local.id}`)
        if (!pinEl) {
          setPlacement({ mode: 'centered' })
          return
        }
        setPlacement(computePlacement(pinEl, panelRef.current))
      } catch {
        setPlacement({ mode: 'centered' })
      }
    }

    update()
    raf = requestAnimationFrame(update)
    timer = window.setTimeout(update, POSITION_RECALC_MS)
    window.addEventListener('resize', update)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      window.removeEventListener('resize', update)
    }
  }, [local.id])

  const beside = placement.mode === 'beside'
  const panelStyle: CSSProperties | undefined = beside
    ? { top: placement.top, left: placement.left }
    : undefined

  return (
    <div
      className={`dialog-backdrop pin-modal-backdrop${beside ? '' : ' pin-modal-backdrop--centered'}`}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className={`dialog pin-modal${beside ? ' pin-modal--beside' : ''}`}
        style={panelStyle}
        role="dialog"
        aria-labelledby="pin-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ImageSlot
          src={local.imagem_url}
          placeholder="Imagem do local"
          shape="rounded"
          style={{ width: '100%', height: 150 }}
        />
        <div className="dialog-title" id="pin-modal-title">
          {local.nome}
        </div>
        {local.data_sessao && <div className="card-meta">{local.data_sessao}</div>}
        {descricao ? (
          <MarkdownSafe className="dialog-body pin-modal__markdown">{descricao}</MarkdownSafe>
        ) : (
          <div className="dialog-body">Sem descrição.</div>
        )}
        <div className="pin-modal__chips">
          {arco && (
            <button type="button" className="tag tag-accent" onClick={() => onOpenArco(arco.id)}>
              {arco.titulo}
            </button>
          )}
          {linkedNpcs.map((n) => (
            <button
              key={n.id}
              type="button"
              className="tag tag-outline"
              onClick={() => onOpenNpc(n.id)}
            >
              {n.nome}
            </button>
          ))}
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
