import { useMemo, useRef, useState } from 'react'
import { ConfirmDialog, DropdownMenu, EmptyState, IconButton, Button, Input, Textarea} from '../ui'
import { useTranslation } from 'react-i18next'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import type { Arco } from '../../types'
import { formSnapshot, isFormDirty } from '../forms/dirty'
import { FormDrawer } from '../forms/FormDrawer'
import './adminList.css'

interface ArcoFormDialogProps {
  title: string
  titulo: string
  resumo: string
  ordem: number
  visivel_para_todos: boolean
  onChange: (
    patch: Partial<{ titulo: string; resumo: string; ordem: number; visivel_para_todos: boolean }>,
  ) => void
  onSave: () => void
  onCancel: () => void
}

export function ArcoFormDialog({
  title,
  titulo,
  resumo,
  ordem,
  visivel_para_todos,
  onChange,
  onSave,
  onCancel,
}: ArcoFormDialogProps) {
  const { t } = useTranslation('admin')
  const { t: tc } = useTranslation('comum')
  const snapshot = useMemo(
    () => ({ titulo, resumo, ordem, visivel_para_todos }),
    [titulo, resumo, ordem, visivel_para_todos],
  )
  const baseline = useRef(formSnapshot(snapshot))
  const [submitted, setSubmitted] = useState(false)
  const dirty = isFormDirty(baseline.current, snapshot)
  const tituloError = submitted && !titulo.trim() ? tc('form.required') : undefined

  function handleSave() {
    setSubmitted(true)
    if (!titulo.trim()) return
    onSave()
  }

  return (
    <FormDrawer open title={title} dirty={dirty} onClose={onCancel} onSave={handleSave}>
      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('arco.arcoGroup')}</h6>
        <div className="field">
          <label>{tc('form.titulo')}</label>
          <Input
            value={titulo}
            onChange={(e) => onChange({ titulo: e.target.value })}
            aria-invalid={Boolean(tituloError)}
          />
          {tituloError ? <p className="field-error">{tituloError}</p> : null}
        </div>
        <div className="field">
          <label>{tc('form.resumo')}</label>
          <Textarea
            rows={3}
            value={resumo}
            onChange={(e) => onChange({ resumo: e.target.value })}
          />
        </div>
        <div className="field">
          <label>{tc('form.ordem')}</label>
          <Input
            type="number"
            value={ordem}
            onChange={(e) => onChange({ ordem: Number(e.target.value) })}
          />
        </div>
        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={visivel_para_todos}
              onChange={(e) => onChange({ visivel_para_todos: e.target.checked })}
            />{' '}
            {t('arco.visivelParaTodos')}
          </label>
          {!visivel_para_todos ? (
            <p className="text-muted" role="status">
              {t('arco.ocultoAosJogadores')}
            </p>
          ) : null}
        </div>
      </section>
    </FormDrawer>
  )
}

interface ArcoAdminListProps {
  arcos: Arco[]
  onAdd: () => void
  onEdit: (arco: Arco) => void
  onDelete: (id: number) => void
}

export function ArcoAdminList({ arcos, onAdd, onEdit, onDelete }: ArcoAdminListProps) {
  const [pendingId, setPendingId] = useState<number | null>(null)
  const { t } = useTranslation('admin')
  const { t: tc } = useTranslation('comum')
  const { t: tm } = useTranslation('mapa')
  const sorted = [...arcos].sort((a, b) => a.ordem - b.ordem || a.id - b.id)

  return (
    <div className="list-section">
      <Button variant="primary" block className="list-section__add" type="button" onClick={onAdd}>
        {t('arco.newBtn')}
      </Button>
      <div className="list-section__stack">
        {sorted.length === 0 ? (
          <EmptyState title={tm('list.emptyArcos')} />
        ) : (
          sorted.map((arco) => (
            <div key={arco.id} className="list-row list-row--hoverable">
              <div className="list-row__main">
                <div className="list-row__title">
                  {arco.titulo}
                  {arco.visivel_para_todos === false ? (
                    <span className="list-row__oculto" title={t('arco.ocultoAria')} aria-label={t('arco.ocultoAria')} />
                  ) : null}
                </div>
                {arco.resumo ? <div className="list-row__meta">{arco.resumo}</div> : null}
              </div>
              <div className="list-row__actions list-row__actions--hover">
                <IconButton label={tc('buttons.edit')} onClick={() => onEdit(arco)}>
                  <IconPencil size={16} aria-hidden />
                </IconButton>
                <IconButton label={tc('buttons.delete')} onClick={() => setPendingId(arco.id)}>
                  <IconTrash size={16} aria-hidden />
                </IconButton>
              </div>
              <div className="list-row__menu">
                <DropdownMenu
                  label={tm('list.rowMenu')}
                  items={[
                    { id: 'edit', label: tc('buttons.edit'), onSelect: () => onEdit(arco) },
                    {
                      id: 'del',
                      label: tc('buttons.delete'),
                      onSelect: () => setPendingId(arco.id),
                      danger: true,
                    },
                  ]}
                />
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmDialog
        open={pendingId != null}
        title={t('arco.confirmDelete')}
        description={t('arco.deleteKeepsLocals')}
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
