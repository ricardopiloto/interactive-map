import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconArrowDown, IconArrowUp, IconPencil, IconTrash } from '@tabler/icons-react'
import { adminApi, type Capitulo } from '../../api/admin'
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage'
import type { Arco } from '../../types'
import { formSnapshot, isFormDirty } from '../forms/dirty'
import { FormDrawer } from '../forms/FormDrawer'
import { MarkdownField } from '../forms/MarkdownField'
import { Button, ConfirmDialog, EmptyState, IconButton, Input } from '../ui'
import './adminList.css'

interface CapituloFormDialogProps {
  title: string
  titulo: string
  corpo_markdown: string
  ordem: number
  visivel_para_todos: boolean
  arco_id: number | null
  arcos: Arco[]
  onChange: (
    patch: Partial<{
      titulo: string
      corpo_markdown: string
      ordem: number
      visivel_para_todos: boolean
      arco_id: number | null
    }>,
  ) => void
  onSave: () => void
  onCancel: () => void
}

export function CapituloFormDialog({
  title,
  titulo,
  corpo_markdown,
  ordem,
  visivel_para_todos,
  arco_id,
  arcos,
  onChange,
  onSave,
  onCancel,
}: CapituloFormDialogProps) {
  const { t } = useTranslation('admin')
  const { t: tc } = useTranslation('comum')
  const snapshot = useMemo(
    () => ({ titulo, corpo_markdown, ordem, visivel_para_todos, arco_id }),
    [titulo, corpo_markdown, ordem, visivel_para_todos, arco_id],
  )
  const baseline = useRef(formSnapshot(snapshot))
  const [submitted, setSubmitted] = useState(false)
  const dirty = isFormDirty(baseline.current, snapshot)
  const tituloError = submitted && !titulo.trim() ? tc('form.required') : undefined
  const sortedArcos = useMemo(
    () => [...arcos].sort((a, b) => a.ordem - b.ordem || a.id - b.id),
    [arcos],
  )

  function handleSave() {
    setSubmitted(true)
    if (!titulo.trim()) return
    onSave()
  }

  return (
    <FormDrawer open title={title} dirty={dirty} onClose={onCancel} onSave={handleSave}>
      <section className="form-drawer__section">
        <h6 className="form-drawer__section-title">{t('capitulo.group')}</h6>
        <div className="field">
          <label>{tc('form.titulo')}</label>
          <Input
            value={titulo}
            onChange={(e) => onChange({ titulo: e.target.value })}
            aria-invalid={Boolean(tituloError)}
          />
          {tituloError ? <p className="field-error">{tituloError}</p> : null}
        </div>
        <MarkdownField
          label={t('capitulo.body')}
          value={corpo_markdown}
          onChange={(value) => onChange({ corpo_markdown: value })}
        />
        <div className="field">
          <label>{t('capitulo.order')}</label>
          <Input
            type="number"
            value={String(ordem)}
            onChange={(e) => onChange({ ordem: Number(e.target.value) })}
          />
        </div>
        <div className="field">
          <label>{t('capitulo.arco')}</label>
          <select
            value={arco_id ?? ''}
            onChange={(e) =>
              onChange({ arco_id: e.target.value === '' ? null : Number(e.target.value) })
            }
          >
            <option value="">{t('capitulo.arcoNone')}</option>
            {sortedArcos.map((arco) => (
              <option key={arco.id} value={arco.id}>
                {arco.titulo}
              </option>
            ))}
          </select>
          <p className="text-muted">{t('capitulo.arcoHelp')}</p>
        </div>
        <div className="field">
          <label className="linha-tempo-page__check">
            <input
              type="checkbox"
              checked={visivel_para_todos}
              onChange={(e) => onChange({ visivel_para_todos: e.target.checked })}
            />
            {t('capitulo.visible')}
          </label>
          {!visivel_para_todos ? (
            <p className="text-muted" role="status">
              {t('capitulo.hidden')}
            </p>
          ) : null}
        </div>
      </section>
    </FormDrawer>
  )
}

interface CapituloAdminListProps {
  arcoId: number
  arcos: Arco[]
}

export function CapituloAdminList({ arcoId, arcos }: CapituloAdminListProps) {
  const { t } = useTranslation('admin')
  const { t: tc } = useTranslation('comum')
  const apiErrorMessage = useApiErrorMessage()
  const [rows, setRows] = useState<Capitulo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<{
    id?: number
    titulo: string
    corpo_markdown: string
    ordem: number
    visivel_para_todos: boolean
    arco_id: number | null
    isNew: boolean
  } | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)

  async function reload() {
    const data = await adminApi.listCapitulos(arcoId)
    setRows([...data.capitulos].sort((a, b) => a.ordem - b.ordem || a.id - b.id))
  }

  useEffect(() => {
    let cancel = false
    adminApi
      .listCapitulos(arcoId)
      .then((data) => {
        if (cancel) return
        setRows([...data.capitulos].sort((a, b) => a.ordem - b.ordem || a.id - b.id))
      })
      .catch((err: unknown) => {
        if (!cancel) setError(apiErrorMessage(err))
      })
    return () => {
      cancel = true
    }
  }, [arcoId, apiErrorMessage])

  async function save() {
    if (!draft || !draft.titulo.trim()) return
    const payload = {
      titulo: draft.titulo.trim(),
      corpo_markdown: draft.corpo_markdown,
      ordem: draft.ordem,
      visivel_para_todos: draft.visivel_para_todos,
      arco_id: draft.arco_id,
    }
    try {
      if (draft.isNew) {
        await adminApi.createCapitulo(payload)
      } else if (draft.id != null) {
        await adminApi.updateCapitulo(draft.id, payload)
      }
      setDraft(null)
      await reload()
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const next = index + direction
    if (next < 0 || next >= rows.length) return
    const reordered = [...rows]
    const [item] = reordered.splice(index, 1)
    if (!item) return
    reordered.splice(next, 0, item)
    try {
      await Promise.all(
        reordered.map((row, position) => {
          const ordem = position + 1
          if (row.ordem === ordem) return Promise.resolve()
          return adminApi.updateCapitulo(row.id, { ordem })
        }),
      )
      await reload()
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  async function remove(id: number) {
    try {
      await adminApi.deleteCapitulo(id)
      setPendingId(null)
      await reload()
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  return (
    <section className="form-drawer__section">
      <h6 className="form-drawer__section-title">{t('capitulo.listTitle')}</h6>
      {error ? <p className="field-error">{error}</p> : null}
      <Button
        variant="secondary"
        type="button"
        onClick={() =>
          setDraft({
            titulo: '',
            corpo_markdown: '',
            ordem: rows.length ? Math.max(...rows.map((row) => row.ordem)) + 1 : 1,
            visivel_para_todos: false,
            arco_id: arcoId,
            isNew: true,
          })
        }
      >
        {t('capitulo.newBtn')}
      </Button>
      <div className="list-section__stack">
        {rows.length === 0 ? (
          <EmptyState title={t('capitulo.empty')} />
        ) : (
          rows.map((row, index) => (
            <div key={row.id} className="list-row">
              <div className="list-row__main">
                <div className="list-row__title">{row.titulo}</div>
                {!row.visivel_para_todos ? (
                  <span className="status-pill">{t('capitulo.hidden')}</span>
                ) : null}
              </div>
              <div className="list-row__actions list-row__actions--visible">
                <IconButton label={t('capitulo.moveUp')} onClick={() => void move(index, -1)}>
                  <IconArrowUp size={16} aria-hidden />
                </IconButton>
                <IconButton label={t('capitulo.moveDown')} onClick={() => void move(index, 1)}>
                  <IconArrowDown size={16} aria-hidden />
                </IconButton>
                <IconButton
                  label={tc('buttons.edit')}
                  onClick={() =>
                    setDraft({
                      id: row.id,
                      titulo: row.titulo,
                      corpo_markdown: row.corpo_markdown,
                      ordem: row.ordem,
                      visivel_para_todos: row.visivel_para_todos,
                      arco_id: row.arco_id,
                      isNew: false,
                    })
                  }
                >
                  <IconPencil size={16} aria-hidden />
                </IconButton>
                <IconButton label={tc('buttons.delete')} onClick={() => setPendingId(row.id)}>
                  <IconTrash size={16} aria-hidden />
                </IconButton>
              </div>
            </div>
          ))
        )}
      </div>
      {draft ? (
        <CapituloFormDialog
          title={draft.isNew ? t('capitulo.new') : t('capitulo.edit')}
          titulo={draft.titulo}
          corpo_markdown={draft.corpo_markdown}
          ordem={draft.ordem}
          visivel_para_todos={draft.visivel_para_todos}
          arco_id={draft.arco_id}
          arcos={arcos}
          onChange={(patch) => setDraft({ ...draft, ...patch })}
          onSave={() => void save()}
          onCancel={() => setDraft(null)}
        />
      ) : null}
      <ConfirmDialog
        open={pendingId != null}
        title={t('capitulo.confirmDelete')}
        description={t('capitulo.confirmDelete')}
        danger
        onConfirm={() => {
          if (pendingId != null) void remove(pendingId)
        }}
        onCancel={() => setPendingId(null)}
      />
    </section>
  )
}
