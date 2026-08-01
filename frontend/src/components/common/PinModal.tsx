import type { Arco, Local, NPC } from '../../types'
import { ImageSlot } from '../media/ImageSlot'
import './PinModal.css'

interface PinModalProps {
  local: Local
  npcs: NPC[]
  arco: Arco | null
  onClose: () => void
  onOpenNpc: (id: number) => void
  onOpenArco: (id: number) => void
}

export function PinModal({ local, npcs, arco, onClose, onOpenNpc, onOpenArco }: PinModalProps) {
  const linkedNpcs = npcs.filter((n) => local.npc_ids.includes(n.id))

  return (
    <div className="dialog-backdrop pin-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="dialog pin-modal"
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
        <div className="dialog-body">{local.descricao || 'Sem descrição.'}</div>
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
