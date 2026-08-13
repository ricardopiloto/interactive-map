import { useTranslation } from 'react-i18next'
import type { NPC, NPCStatus } from '../../types'
import { ImageSlot } from '../media/ImageSlot'

interface NpcFormDialogProps {
  title: string
  nome: string
  papel?: string
  descricao: string
  faccao: string
  status: NPCStatus
  retrato_url: string | null
  onChange: (
    patch: Partial<{
      nome: string
      papel: string
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
  papel = '',
  descricao,
  faccao,
  status,
  retrato_url,
  onChange,
  onSave,
  onCancel,
}: NpcFormDialogProps) {
  const { t } = useTranslation('admin')
  const { t: tc } = useTranslation('comum')

  return (
    <div className="dialog-backdrop" style={{ zIndex: 95 }}>
      <div className="dialog" role="dialog">
        <div className="dialog-title">{title}</div>
        <div className="dialog__body">
          <div className="dialog__group">
            <h6 className="dialog__group-title">{t('localForm.identidade')}</h6>
            <ImageSlot
              src={retrato_url}
              placeholder={t('npc.retrato')}
              shape="rounded"
              editable
              category="portraits"
              fit="contain"
              className={`npc-form__portrait${retrato_url ? '' : ' npc-form__portrait--empty'}`}
              onUploaded={(url) => onChange({ retrato_url: url })}
            />
            <div className="field">
              <label>{tc('form.nome')}</label>
              <input className="input" value={nome} onChange={(e) => onChange({ nome: e.target.value })} />
            </div>
            <div className="field">
              <label>{tc('form.papelOpcional')}</label>
              <input
                className="input"
                value={papel}
                onChange={(e) => onChange({ papel: e.target.value })}
              />
            </div>
          </div>
          <div className="dialog__group">
            <h6 className="dialog__group-title">{t('npc.detalhes')}</h6>
            <div className="field">
              <label>{tc('form.descricao')}</label>
              <textarea
                className="input"
                rows={3}
                value={descricao}
                onChange={(e) => onChange({ descricao: e.target.value })}
              />
            </div>
            <div className="field">
              <label>{tc('form.faccaoOpcional')}</label>
              <input
                className="input"
                value={faccao}
                onChange={(e) => onChange({ faccao: e.target.value })}
              />
            </div>
            <div className="field">
              <label>{tc('form.status')}</label>
              <select
                className="input"
                value={status}
                onChange={(e) => onChange({ status: e.target.value as NPCStatus })}
              >
                <option value="vivo">{tc('status.vivo')}</option>
                <option value="morto">{tc('status.morto')}</option>
                <option value="desaparecido">{tc('status.desaparecido')}</option>
                <option value="desconhecido">{tc('status.desconhecido')}</option>
              </select>
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {tc('buttons.cancel')}
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={!nome.trim()}>
            {tc('buttons.save')}
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
  const { t } = useTranslation('admin')
  const { t: tc } = useTranslation('comum')

  return (
    <div className="gm-section">
      <button type="button" className="btn btn-primary btn-block" onClick={onAdd}>
        {t('npc.newBtn')}
      </button>
      <div className="gm-stack">
        {npcs.length === 0 && <p className="text-muted">{tc('empty.nenhumItem')}</p>}
        {npcs.map((npc) => (
          <div key={npc.id} className="card elev-sm">
            <div className="card-title">{npc.nome}</div>
            <div className="card-meta">{tc(`status.${npc.status ?? 'desconhecido'}`)}</div>
            <div className="gm-row">
              <button type="button" className="btn btn-secondary" onClick={() => onEdit(npc)}>
                {tc('buttons.edit')}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  if (window.confirm(t('npc.confirmDelete'))) onDelete(npc.id)
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
