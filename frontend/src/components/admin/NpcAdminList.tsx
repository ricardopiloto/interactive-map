import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { ConfirmDialog, DropdownMenu, EmptyState, IconButton, Button, Input, Select} from '../ui'
import type { NPC, NPCStatus } from '../../types'
import { formSnapshot, isFormDirty } from '../forms/dirty'
import { FormDrawer } from '../forms/FormDrawer'
import { MarkdownField } from '../forms/MarkdownField'
import { ImageSlot } from '../media/ImageSlot'
import './adminList.css'

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
  const snapshot = useMemo(
    () => ({ nome, papel, descricao, faccao, status, retrato_url }),
    [nome, papel, descricao, faccao, status, retrato_url],
  )
  const baseline = useRef(formSnapshot(snapshot))
  const [submitted, setSubmitted] = useState(false)
  const dirty = isFormDirty(baseline.current, snapshot)
  const nomeError = submitted && !nome.trim() ? tc('form.required') : undefined

  function handleSave() {
    setSubmitted(true)
    if (!nome.trim()) return
    onSave()
  }

  return (
    <FormDrawer open title={title} dirty={dirty} onClose={onCancel} onSave={handleSave}>
      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('localForm.identidade')}</h6>
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
          <Input
            value={nome}
            onChange={(e) => onChange({ nome: e.target.value })}
            aria-invalid={Boolean(nomeError)}
          />
          {nomeError ? <p className="field-error">{nomeError}</p> : null}
        </div>
        <div className="field">
          <label>{tc('form.papelOpcional')}</label>
          <Input
            value={papel}
            onChange={(e) => onChange({ papel: e.target.value })}
          />
        </div>
      </section>
      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('npc.detalhes')}</h6>
        <MarkdownField
          label={tc('form.descricao')}
          value={descricao}
          onChange={(v) => onChange({ descricao: v })}
        />
        <div className="field">
          <label>{tc('form.faccaoOpcional')}</label>
          <Input
            value={faccao}
            onChange={(e) => onChange({ faccao: e.target.value })}
          />
        </div>
        <div className="field">
          <label>{tc('form.status')}</label>
          <Select
            value={status}
            onChange={(e) => onChange({ status: e.target.value as NPCStatus })}
          >
            <option value="vivo">{tc('status.vivo')}</option>
            <option value="morto">{tc('status.morto')}</option>
            <option value="desaparecido">{tc('status.desaparecido')}</option>
            <option value="desconhecido">{tc('status.desconhecido')}</option>
          </Select>
        </div>
      </section>
    </FormDrawer>
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
  const { t: tm } = useTranslation('mapa')
  const [pendingId, setPendingId] = useState<number | null>(null)

  return (
    <div className="list-section">
      <Button variant="primary" block className="list-section__add" type="button" onClick={onAdd}>
        {t('npc.newBtn')}
      </Button>
      <div className="list-section__stack">
        {npcs.length === 0 ? (
          <EmptyState title={tm('list.emptyNpcs')} />
        ) : (
          npcs.map((npc) => {
            const st = npc.status ?? 'desconhecido'
            return (
              <div key={npc.id} className="list-row list-row--hoverable">
                <ImageSlot
                  src={npc.retrato_url}
                  placeholder={tc('image.portrait')}
                  shape="circle"
                  style={{ width: 32, height: 32, flexShrink: 0, padding: 0 }}
                />
                <div className="list-row__main">
                  <div className="list-row__title">{npc.nome}</div>
                  <span className="status-pill">
                    <i className={`status-dot status-dot--${st}`} aria-hidden />
                    {tc(`status.${st}`)}
                  </span>
                </div>
                <div className="list-row__actions list-row__actions--hover">
                  <IconButton label={tc('buttons.edit')} onClick={() => onEdit(npc)}>
                    <IconPencil size={16} aria-hidden />
                  </IconButton>
                  <IconButton label={tc('buttons.delete')} onClick={() => setPendingId(npc.id)}>
                    <IconTrash size={16} aria-hidden />
                  </IconButton>
                </div>
                <div className="list-row__menu">
                  <DropdownMenu
                    label={tm('list.rowMenu')}
                    items={[
                      { id: 'edit', label: tc('buttons.edit'), onSelect: () => onEdit(npc) },
                      {
                        id: 'del',
                        label: tc('buttons.delete'),
                        onSelect: () => setPendingId(npc.id),
                        danger: true,
                      },
                    ]}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
      <ConfirmDialog
        open={pendingId != null}
        title={t('npc.confirmDelete')}
        danger
        onCancel={() => setPendingId(null)}
        onConfirm={() => {
          const id = pendingId
          setPendingId(null)
          if (id != null) onDelete(id)
        }}
      />
    </div>
  )
}
