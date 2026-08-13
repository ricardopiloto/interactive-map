import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('admin')
  const { t: tc } = useTranslation('comum')

  return (
    <div className="dialog-backdrop" style={{ zIndex: 95 }}>
      <div className="dialog" role="dialog">
        <div className="dialog-title">{title}</div>
        <div className="dialog__body">
          <div className="dialog__group">
            <h6 className="dialog__group-title">{t('arco.arcoGroup')}</h6>
            <div className="field">
              <label>{tc('form.titulo')}</label>
              <input
                className="input"
                value={titulo}
                onChange={(e) => onChange({ titulo: e.target.value })}
              />
            </div>
            <div className="field">
              <label>{tc('form.resumo')}</label>
              <textarea
                className="input"
                rows={3}
                value={resumo}
                onChange={(e) => onChange({ resumo: e.target.value })}
              />
            </div>
            <div className="field">
              <label>{tc('form.ordem')}</label>
              <input
                className="input"
                type="number"
                value={ordem}
                onChange={(e) => onChange({ ordem: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {tc('buttons.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSave}
            disabled={!titulo.trim()}
          >
            {tc('buttons.save')}
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
  const { t } = useTranslation('admin')
  const { t: tc } = useTranslation('comum')
  const sorted = [...arcos].sort((a, b) => a.ordem - b.ordem || a.id - b.id)

  return (
    <div className="gm-section">
      <button type="button" className="btn btn-primary btn-block" onClick={onAdd}>
        {t('arco.newBtn')}
      </button>
      <div className="gm-stack">
        {sorted.length === 0 && <p className="text-muted">{tc('empty.nenhumItem')}</p>}
        {sorted.map((arco) => (
          <div key={arco.id} className="card elev-sm">
            <div className="card-title">{arco.titulo}</div>
            <p className="card-body">{arco.resumo}</p>
            <div className="gm-row">
              <button type="button" className="btn btn-secondary" onClick={() => onEdit(arco)}>
                {tc('buttons.edit')}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  if (window.confirm(t('arco.confirmDelete'))) onDelete(arco.id)
                }}
              >
                {tc('buttons.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
