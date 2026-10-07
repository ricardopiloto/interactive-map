import { useMemo, useRef, useState } from 'react'
import { ConfirmDialog, DropdownMenu, EmptyState, IconButton, Button, Input, Textarea} from '../ui'
import { useTranslation } from 'react-i18next'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import type { Arco, Sessao } from '../../types'
import { CapituloAdminList } from './CapituloFormDialog'
import { formSnapshot, isFormDirty } from '../forms/dirty'
import { FormDrawer } from '../forms/FormDrawer'
import './adminList.css'

export const DEFAULT_ARCO_COLOR = '#d8aa5a'

interface ArcoFormDialogProps {
  title: string
  titulo: string
  resumo: string
  ordem: number
  visivel_para_todos: boolean
  cor: string
  sessaoIds: number[]
  sessaoTransicaoId: number | null
  sessoes: Sessao[]
  arcos: Arco[]
  arcoId?: number
  localOpcoes?: { id: number; nome: string }[]
  localIds?: number[]
  onChange: (
    patch: Partial<{
      titulo: string
      resumo: string
      ordem: number
      visivel_para_todos: boolean
      cor: string
      sessaoIds: number[]
      sessaoTransicaoId: number | null
      localIds: number[]
    }>,
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
  cor,
  sessaoIds,
  sessaoTransicaoId,
  sessoes,
  arcos,
  arcoId,
  localOpcoes = [],
  localIds = [],
  onChange,
  onSave,
  onCancel,
}: ArcoFormDialogProps) {
  const { t } = useTranslation('admin')
  const { t: tc } = useTranslation('comum')
  const snapshot = useMemo(
    () => ({ titulo, resumo, ordem, visivel_para_todos, cor, sessaoIds, sessaoTransicaoId, localIds }),
    [titulo, resumo, ordem, visivel_para_todos, cor, sessaoIds, sessaoTransicaoId, localIds],
  )
  const baseline = useRef(formSnapshot(snapshot))
  const [submitted, setSubmitted] = useState(false)
  const dirty = isFormDirty(baseline.current, snapshot)
  const tituloError = submitted && !titulo.trim() ? tc('form.required') : undefined
  const sorted = useMemo(
    () => [...sessoes].sort((a, b) => a.numero - b.numero),
    [sessoes],
  )

  function handleSave() {
    setSubmitted(true)
    if (!titulo.trim()) return
    onSave()
  }

  function toggleLocal(id: number) {
    onChange({
      localIds: localIds.includes(id) ? localIds.filter((item) => item !== id) : [...localIds, id],
    })
  }

  function toggleSessao(id: number) {
    onChange({
      sessaoIds: sessaoIds.includes(id)
        ? sessaoIds.filter((x) => x !== id)
        : [...sessaoIds, id],
    })
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
          <label htmlFor="arco-cor">{t('arco.cor')}</label>
          <div className="gm-row" style={{ alignItems: 'center', marginTop: 0 }}>
            <input
              id="arco-cor"
              type="color"
              value={cor || DEFAULT_ARCO_COLOR}
              onChange={(e) => onChange({ cor: e.target.value.toLowerCase() })}
              aria-label={t('arco.corAria')}
            />
          </div>
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
      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('arco.sessoesGroup')}</h6>
        <fieldset className="field">
          <legend>{t('arco.sessoesLegend')}</legend>
          <div className="linha-tempo-page__checks">
            {sorted.map((s) => (
              <label key={s.id} className="linha-tempo-page__check">
                <input
                  type="checkbox"
                  checked={sessaoIds.includes(s.id)}
                  onChange={() => toggleSessao(s.id)}
                />
                {s.numero}. {s.titulo}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field">
          <label>{t('arco.sessaoTransicao')}</label>
          <select
            value={sessaoTransicaoId ?? ''}
            onChange={(e) =>
              onChange({
                sessaoTransicaoId: e.target.value === '' ? null : Number(e.target.value),
              })
            }
          >
            <option value="">{t('arco.sessaoTransicaoNone')}</option>
            {sorted.map((s) => (
              <option key={s.id} value={s.id}>
                {s.numero}. {s.titulo}
              </option>
            ))}
          </select>
          <p className="text-muted">{t('arco.sessaoTransicaoHelp')}</p>
        </div>
        {localOpcoes.length > 0 ? (
          <fieldset className="field">
            <legend>{t('arco.locaisSugeridos')}</legend>
            <div className="linha-tempo-page__checks">
              {localOpcoes.map((local) => (
                <label key={local.id} className="linha-tempo-page__check">
                  <input
                    type="checkbox"
                    checked={localIds.includes(local.id)}
                    onChange={() => toggleLocal(local.id)}
                  />
                  {local.nome}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </section>
      {arcoId != null ? <CapituloAdminList arcoId={arcoId} arcos={arcos} /> : null}
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
