import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import { adminApi } from '../../api/admin'
import { FormDrawer } from '../forms/FormDrawer'
import { MarkdownField } from '../forms/MarkdownField'
import { Button, ConfirmDialog, IconButton, Input } from '../ui'
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage'
import type { Evento, Item, Sessao } from '../../types'

interface ItemDraft {
  isNew: boolean
  id?: number
  nome: string
  descricao: string
  visivel_para_todos: boolean
  sessao_ids: number[]
  evento_ids: number[]
}

interface ItemManagerProps {
  sessoes: Sessao[]
  eventos: Evento[]
  onChanged: () => void
}

function toggleId(list: number[], id: number): number[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

export function ItemManager({ sessoes, eventos, onChanged }: ItemManagerProps) {
  const { t } = useTranslation('linhaTempo')
  const { t: tc } = useTranslation('comum')
  const apiErrorMessage = useApiErrorMessage()
  const [itens, setItens] = useState<Item[]>([])
  const [draft, setDraft] = useState<ItemDraft | null>(null)
  const [baseline, setBaseline] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    const res = await adminApi.listItensAdmin()
    setItens(res.itens)
  }

  useEffect(() => {
    void refresh().catch((err) => setError(apiErrorMessage(err)))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- load once when the manager mounts

  const dirty = useMemo(() => (draft ? JSON.stringify(draft) !== baseline : false), [draft, baseline])

  function openCreate() {
    const next: ItemDraft = {
      isNew: true,
      nome: '',
      descricao: '',
      visivel_para_todos: true,
      sessao_ids: [],
      evento_ids: [],
    }
    setDraft(next)
    setBaseline(JSON.stringify(next))
    setError(null)
  }

  function openEdit(item: Item) {
    const next: ItemDraft = {
      isNew: false,
      id: item.id,
      nome: item.nome,
      descricao: item.descricao ?? '',
      visivel_para_todos: item.visivel_para_todos !== false,
      sessao_ids: item.sessoes.map((s) => s.id),
      evento_ids: item.eventos.map((e) => e.id),
    }
    setDraft(next)
    setBaseline(JSON.stringify(next))
    setError(null)
  }

  async function save() {
    if (!draft || !draft.nome.trim()) return
    setError(null)
    const payload = {
      nome: draft.nome.trim(),
      descricao: draft.descricao,
      visivel_para_todos: draft.visivel_para_todos,
      sessao_ids: draft.sessao_ids,
      evento_ids: draft.evento_ids,
    }
    try {
      if (draft.isNew) await adminApi.createItem(payload)
      else if (draft.id != null) await adminApi.updateItem(draft.id, payload)
      setDraft(null)
      await refresh()
      onChanged()
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  async function confirmDelete() {
    if (pendingDeleteId == null) return
    try {
      await adminApi.deleteItem(pendingDeleteId)
      setPendingDeleteId(null)
      await refresh()
      onChanged()
    } catch (err) {
      setError(apiErrorMessage(err))
      setPendingDeleteId(null)
    }
  }

  return (
    <section className="linha-tempo-page__itens" aria-label={t('item.section')}>
      <div className="linha-tempo-page__itens-head">
        <h2 className="linha-tempo-page__itens-title">{t('item.section')}</h2>
        <Button variant="secondary" type="button" onClick={openCreate}>
          <IconPlus size={16} aria-hidden /> {t('item.new')}
        </Button>
      </div>
      {error ? <p className="linha-tempo-page__error">{error}</p> : null}
      {itens.length === 0 ? (
        <p className="linha-tempo-page__itens-empty">{t('item.empty')}</p>
      ) : (
        <ul className="linha-tempo-page__itens-list">
          {itens.map((item) => (
            <li key={item.id} className="linha-tempo-page__itens-row">
              <span>
                {item.nome}
                {item.visivel_para_todos === false ? (
                  <span className="linha-tempo-page__hidden"> · {t('hiddenBadge')}</span>
                ) : null}
              </span>
              <span className="linha-tempo-page__actions">
                <IconButton label={t('item.edit')} onClick={() => openEdit(item)}>
                  <IconPencil size={18} />
                </IconButton>
                <IconButton label={t('item.delete')} onClick={() => setPendingDeleteId(item.id)}>
                  <IconTrash size={18} />
                </IconButton>
              </span>
            </li>
          ))}
        </ul>
      )}

      {draft ? (
        <FormDrawer
          open
          title={draft.isNew ? t('item.new') : t('item.edit')}
          dirty={dirty}
          onClose={() => setDraft(null)}
          onSave={() => void save()}
          saveDisabled={!draft.nome.trim()}
        >
          <label className="field">
            <span>{t('item.fieldNome')}</span>
            <Input
              className="ui-input--new-codex"
              type="text"
              value={draft.nome}
              onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
              required
            />
          </label>
          <MarkdownField
            label={t('item.fieldDescricao')}
            value={draft.descricao}
            onChange={(descricao) => setDraft({ ...draft, descricao })}
            controlClassName="ui-input--new-codex"
          />
          <fieldset className="field">
            <legend>{t('item.fieldSessoes')}</legend>
            <div className="linha-tempo-page__checks">
              {sessoes.map((s) => (
                <label key={s.id} className="linha-tempo-page__check">
                  <input
                    type="checkbox"
                    checked={draft.sessao_ids.includes(s.id)}
                    onChange={() => setDraft({ ...draft, sessao_ids: toggleId(draft.sessao_ids, s.id) })}
                  />
                  {s.numero}. {s.titulo}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="field">
            <legend>{t('item.fieldEventos')}</legend>
            <div className="linha-tempo-page__checks">
              {eventos.map((ev) => (
                <label key={ev.id} className="linha-tempo-page__check">
                  <input
                    type="checkbox"
                    checked={draft.evento_ids.includes(ev.id)}
                    onChange={() => setDraft({ ...draft, evento_ids: toggleId(draft.evento_ids, ev.id) })}
                  />
                  {ev.titulo}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="linha-tempo-page__check">
            <input
              type="checkbox"
              checked={draft.visivel_para_todos}
              onChange={(e) => setDraft({ ...draft, visivel_para_todos: e.target.checked })}
            />
            {t('fieldVisivel')}
          </label>
        </FormDrawer>
      ) : null}

      <ConfirmDialog
        open={pendingDeleteId != null}
        title={t('item.deleteConfirmTitle')}
        description={t('item.deleteConfirmBody')}
        danger
        confirmLabel={tc('buttons.delete')}
        cancelLabel={tc('buttons.cancel')}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDeleteId(null)}
      />
    </section>
  )
}
