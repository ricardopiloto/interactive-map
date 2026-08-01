import type { Arco } from '../../types'

interface ArcoFormDialogProps {
  title: string
  titulo: string
  resumo: string
  ordem: number
  onChange: (patch: Partial<{ titulo: string; resumo: string; ordem: number }>) => void
  onSave: () => void
  onCancel: () => void
}

export function ArcoFormDialog({
  title,
  titulo,
  resumo,
  ordem,
  onChange,
  onSave,
  onCancel,
}: ArcoFormDialogProps) {
  return (
    <div className="dialog-backdrop" style={{ zIndex: 95 }}>
      <div className="dialog" role="dialog">
        <div className="dialog-title">{title}</div>
        <div className="field">
          <label>Título</label>
          <input
            className="input"
            value={titulo}
            onChange={(e) => onChange({ titulo: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Resumo</label>
          <textarea
            className="input"
            rows={3}
            value={resumo}
            onChange={(e) => onChange({ resumo: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Ordem</label>
          <input
            className="input"
            type="number"
            value={ordem}
            onChange={(e) => onChange({ ordem: Number(e.target.value) })}
          />
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSave}
            disabled={!titulo.trim()}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

interface ArcoAdminListProps {
  arcos: Arco[]
  onAdd: () => void
  onEdit: (arco: Arco) => void
  onDelete: (id: number) => void
}

export function ArcoAdminList({ arcos, onAdd, onEdit, onDelete }: ArcoAdminListProps) {
  const sorted = [...arcos].sort((a, b) => a.ordem - b.ordem || a.id - b.id)
  return (
    <div className="gm-section">
      <button type="button" className="btn btn-primary btn-block" onClick={onAdd}>
        + Novo arco
      </button>
      <div className="gm-stack">
        {sorted.map((arco) => (
          <div key={arco.id} className="card elev-sm">
            <div className="card-title">{arco.titulo}</div>
            <p className="card-body">{arco.resumo}</p>
            <div className="gm-row">
              <button type="button" className="btn btn-secondary" onClick={() => onEdit(arco)}>
                Editar
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  if (window.confirm('Excluir este arco?')) onDelete(arco.id)
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
