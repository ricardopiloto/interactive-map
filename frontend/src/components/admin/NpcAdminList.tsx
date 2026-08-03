import type { NPC, NPCStatus } from '../../types'
import { ImageSlot } from '../media/ImageSlot'

interface NpcFormDialogProps {
  title: string
  nome: string
  descricao: string
  faccao: string
  status: NPCStatus
  retrato_url: string | null
  onChange: (
    patch: Partial<{
      nome: string
      descricao: string
      faccao: string
      status: NPCStatus
      retrato_url: string | null
    }>,
  ) => void
  onSave: () => void
  onCancel: () => void
}

export function NpcFormDialog({
  title,
  nome,
  descricao,
  faccao,
  status,
  retrato_url,
  onChange,
  onSave,
  onCancel,
}: NpcFormDialogProps) {
  return (
    <div className="dialog-backdrop" style={{ zIndex: 95 }}>
      <div className="dialog" role="dialog">
        <div className="dialog-title">{title}</div>
        <div className="dialog__body">
          <ImageSlot
            src={retrato_url}
            placeholder="Retrato do NPC"
            shape="rounded"
            editable
            category="portraits"
            style={{ width: '100%', height: 110 }}
            onUploaded={(url) => onChange({ retrato_url: url })}
          />
          <div className="field">
            <label>Nome</label>
            <input className="input" value={nome} onChange={(e) => onChange({ nome: e.target.value })} />
          </div>
          <div className="field">
            <label>Descrição</label>
            <textarea
              className="input"
              rows={3}
              value={descricao}
              onChange={(e) => onChange({ descricao: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Facção (opcional)</label>
            <input
              className="input"
              value={faccao}
              onChange={(e) => onChange({ faccao: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => onChange({ status: e.target.value as NPCStatus })}
            >
              <option value="vivo">Vivo</option>
              <option value="morto">Morto</option>
              <option value="desaparecido">Desaparecido</option>
              <option value="desconhecido">Desconhecido</option>
            </select>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={!nome.trim()}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

interface NpcAdminListProps {
  npcs: NPC[]
  onAdd: () => void
  onEdit: (npc: NPC) => void
  onDelete: (id: number) => void
}

export function NpcAdminList({ npcs, onAdd, onEdit, onDelete }: NpcAdminListProps) {
  return (
    <div className="gm-section">
      <button type="button" className="btn btn-primary btn-block" onClick={onAdd}>
        + Novo NPC
      </button>
      <div className="gm-stack">
        {npcs.map((npc) => (
          <div key={npc.id} className="card elev-sm">
            <div className="card-title">{npc.nome}</div>
            <div className="card-meta">{npc.status}</div>
            <div className="gm-row">
              <button type="button" className="btn btn-secondary" onClick={() => onEdit(npc)}>
                Editar
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  if (window.confirm('Excluir este NPC?')) onDelete(npc.id)
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
