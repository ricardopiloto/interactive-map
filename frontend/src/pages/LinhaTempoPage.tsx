import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IconChevronDown, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import { adminApi } from '../api/admin'
import { campaignApi } from '../api/campaign'
import { MarkdownSafe } from '../components/common/MarkdownSafe'
import { FormDrawer } from '../components/forms/FormDrawer'
import { MarkdownField } from '../components/forms/MarkdownField'
import { CodexHeader } from '../components/layout/CodexHeader'
import { ConfirmDialog, EmptyState, IconButton, Button, Input } from '../components/ui'
import { useEditMode } from '../context/EditModeContext'
import { useApiErrorMessage } from '../hooks/useApiErrorMessage'
import { getCachedInstanceConfig, useInstanceConfig } from '../hooks/useInstanceConfig'
import type { Evento, Local, Personagem, Sessao } from '../types'
import './LinhaTempoPage.css'

interface EventoDraft {
  isNew: boolean
  id?: number
  titulo: string
  ano: number
  /** Preserved from the API; not shown or edited in the form (spec 144). */
  mes: number | null
  rotulo_era: string
  descricao: string
  visivel_para_todos: boolean
  sessao_id: number | null
  local_ids: number[]
  personagem_ids: number[]
}

function EventoDetailBody({
  ev,
  slug,
}: {
  ev: Evento
  slug: string
}) {
  const { t } = useTranslation('linhaTempo')
  const hasDesc = Boolean(ev.descricao)
  const hasChips = ev.locais.length > 0 || ev.personagens.length > 0
  if (!hasDesc && !hasChips) return null
  return (
    <div className="linha-tempo-page__body">
      {hasDesc ? (
        <div className="linha-tempo-page__descricao">
          <MarkdownSafe>{ev.descricao}</MarkdownSafe>
        </div>
      ) : null}
      {hasChips ? (
        <div className="linha-tempo-page__chips">
          {ev.locais.map((loc) => (
            <Link
              key={`l-${loc.id}`}
              className="linha-tempo-page__chip"
              to={`/c/${slug}?local=${loc.id}`}
            >
              {t('chipLocal')}: {loc.nome}
            </Link>
          ))}
          {ev.personagens.map((p) => (
            <Link
              key={`p-${p.id}`}
              className="linha-tempo-page__chip"
              to={`/c/${slug}/relacoes?personagem=${p.id}`}
            >
              {t('chipPersonagem')}: {p.nome}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function yearKicker(ev: Evento, t: (key: string, opts?: Record<string, unknown>) => string) {
  if (ev.mes != null) return t('yearMonthLabel', { ano: ev.ano, mes: ev.mes })
  return t('yearLabel', { ano: ev.ano })
}

export function LinhaTempoPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { t } = useTranslation('linhaTempo')
  const { t: tc } = useTranslation('comum')
  const apiErrorMessage = useApiErrorMessage()
  const { config: instanceConfig } = useInstanceConfig(slug)
  const cfg = getCachedInstanceConfig(slug) ?? instanceConfig
  const { enabled: isGm } = useEditMode()

  const [eventos, setEventos] = useState<Evento[]>([])
  const [locais, setLocais] = useState<Local[]>([])
  const [personagens, setPersonagens] = useState<Personagem[]>([])
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyError, setBusyError] = useState<string | null>(null)
  const [draft, setDraft] = useState<EventoDraft | null>(null)
  const [draftBaseline, setDraftBaseline] = useState<string>('')
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set())

  const sessaoById = useMemo(() => new Map(sessoes.map((s) => [s.id, s])), [sessoes])

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      if (isGm) {
        const [ev, locs, ps, ss] = await Promise.all([
          adminApi.listEventosAdmin(),
          adminApi.listLocaisAdmin(),
          adminApi.listPersonagensAdmin(),
          adminApi.listSessoesAdmin(),
        ])
        setEventos(ev.eventos)
        setLocais(locs)
        setPersonagens(ps)
        setSessoes(ss.sessoes)
      } else {
        const [ev, ss] = await Promise.all([
          campaignApi.listEventos(),
          campaignApi.listSessoes(),
        ])
        setEventos(ev.eventos)
        setLocais([])
        setPersonagens([])
        setSessoes(ss.sessoes)
      }
    } catch (err) {
      setError(apiErrorMessage(err) || t('loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setExpandedIds(new Set())
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on edit-mode flip
  }, [isGm, slug])

  const dirty = useMemo(() => {
    if (!draft) return false
    return JSON.stringify(draft) !== draftBaseline
  }, [draft, draftBaseline])
  const mesInvalido =
    draft?.mes != null &&
    (!Number.isInteger(draft.mes) || draft.mes < 1 || draft.mes > 12)

  function toggleExpanded(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function startCreate() {
    const next: EventoDraft = {
      isNew: true,
      titulo: '',
      ano: new Date().getFullYear(),
      mes: null,
      rotulo_era: '',
      descricao: '',
      visivel_para_todos: true,
      sessao_id: null,
      local_ids: [],
      personagem_ids: [],
    }
    setDraft(next)
    setDraftBaseline(JSON.stringify(next))
    setBusyError(null)
  }

  function startEdit(e: Evento) {
    const next: EventoDraft = {
      isNew: false,
      id: e.id,
      titulo: e.titulo,
      ano: e.ano,
      mes: e.mes ?? null,
      rotulo_era: e.rotulo_era ?? '',
      descricao: e.descricao ?? '',
      visivel_para_todos: e.visivel_para_todos !== false,
      sessao_id: e.sessao_id ?? null,
      local_ids: e.locais.map((l) => l.id),
      personagem_ids: e.personagens.map((p) => p.id),
    }
    setDraft(next)
    setDraftBaseline(JSON.stringify(next))
    setBusyError(null)
  }

  async function saveDraft() {
    if (
      !draft ||
      !draft.titulo.trim() ||
      Number.isNaN(draft.ano) ||
      mesInvalido
    ) return
    setBusyError(null)
    const payload = {
      titulo: draft.titulo.trim(),
      ano: draft.ano,
      mes: draft.mes,
      rotulo_era: draft.rotulo_era.trim() || null,
      descricao: draft.descricao,
      visivel_para_todos: draft.visivel_para_todos,
      sessao_id: draft.sessao_id,
      local_ids: draft.local_ids,
      personagem_ids: draft.personagem_ids,
    }
    try {
      if (draft.isNew) await adminApi.createEvento(payload)
      else if (draft.id != null) await adminApi.updateEvento(draft.id, payload)
      setDraft(null)
      await refresh()
    } catch (err) {
      setBusyError(apiErrorMessage(err))
    }
  }

  async function confirmDelete() {
    if (pendingDeleteId == null) return
    try {
      await adminApi.deleteEvento(pendingDeleteId)
      setPendingDeleteId(null)
      await refresh()
    } catch (err) {
      setBusyError(apiErrorMessage(err))
      setPendingDeleteId(null)
    }
  }

  function toggleId(list: number[], id: number): number[] {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
  }

  return (
    <div className="linha-tempo-page">
      <CodexHeader campaignName={cfg?.nome}>
        {isGm ? (
          <Button variant="primary" type="button" onClick={startCreate}>
            <IconPlus size={16} aria-hidden /> {t('new')}
          </Button>
        ) : null}
      </CodexHeader>

      <main className="linha-tempo-page__main">
        <header className="linha-tempo-page__intro">
          <h1 className="linha-tempo-page__title">{t('title')}</h1>
          <p className="linha-tempo-page__subtitle">
            {isGm ? t('subtitleGm') : t('subtitlePlayer')}
          </p>
        </header>
        {error ? <p className="linha-tempo-page__error">{error}</p> : null}
        {busyError ? <p className="linha-tempo-page__error">{busyError}</p> : null}

        {loading ? null : eventos.length === 0 ? (
          <EmptyState title={isGm ? t('emptyGm') : t('empty')} />
        ) : (
          <>
            <ol className="linha-tempo-page__list">
              {eventos.map((ev) => {
                const open = expandedIds.has(ev.id)
                const sessao =
                  ev.sessao_id != null ? (sessaoById.get(ev.sessao_id) ?? null) : null
                return (
                  <li key={ev.id} className="linha-tempo-page__item">
                    <div className="linha-tempo-page__rail" aria-hidden>
                      <span className="linha-tempo-page__dot" />
                    </div>
                    <article
                      className={`linha-tempo-page__card${open ? ' is-open' : ''}`}
                    >
                      <header className="linha-tempo-page__card-head">
                        <button
                          type="button"
                          className="linha-tempo-page__card-toggle"
                          aria-expanded={open}
                          aria-label={
                            open
                              ? `${t('collapse')}: ${ev.titulo}`
                              : `${t('expand')}: ${ev.titulo}`
                          }
                          onClick={() => toggleExpanded(ev.id)}
                        >
                          <p className="linha-tempo-page__kicker">
                            <span className="linha-tempo-page__kicker-year">
                              {yearKicker(ev, t)}
                            </span>
                            {ev.rotulo_era ? (
                              <span className="linha-tempo-page__kicker-era">
                                {' '}
                                · {ev.rotulo_era}
                              </span>
                            ) : null}
                            {isGm && ev.visivel_para_todos === false ? (
                              <span className="linha-tempo-page__hidden">
                                {' '}
                                · {t('hiddenBadge')}
                              </span>
                            ) : null}
                          </p>
                          <span className="linha-tempo-page__card-title-row">
                            <span className="linha-tempo-page__card-title">{ev.titulo}</span>
                            <IconChevronDown
                              size={18}
                              aria-hidden
                              className={`linha-tempo-page__chevron${open ? ' is-open' : ''}`}
                            />
                          </span>
                          {sessao ? (
                            <p className="linha-tempo-page__sessao">
                              {t('sessionMeta', {
                                numero: sessao.numero,
                                titulo: sessao.titulo,
                              })}
                            </p>
                          ) : null}
                        </button>
                        {isGm ? (
                          <div className="linha-tempo-page__actions">
                            <IconButton
                              label={t('edit')}
                              onClick={() => startEdit(ev)}
                            >
                              <IconPencil size={18} />
                            </IconButton>
                            <IconButton
                              label={t('delete')}
                              onClick={() => setPendingDeleteId(ev.id)}
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          </div>
                        ) : null}
                      </header>
                      {open ? <EventoDetailBody ev={ev} slug={slug} /> : null}
                    </article>
                  </li>
                )
              })}
            </ol>
            {!isGm ? (
              <p className="linha-tempo-page__unrevealed">{t('unrevealedNote')}</p>
            ) : null}
          </>
        )}
      </main>

      {draft ? (
        <FormDrawer
          open
          title={draft.isNew ? t('new') : t('edit')}
          dirty={dirty}
          onClose={() => setDraft(null)}
          onSave={() => void saveDraft()}
          saveDisabled={
            !draft.titulo.trim() || Number.isNaN(draft.ano) || mesInvalido
          }
        >
          <label className="field">
            <span>{t('fieldTitulo')}</span>
            <Input
              className="ui-input--new-codex"
              type="text"
              value={draft.titulo}
              onChange={(e) => setDraft({ ...draft, titulo: e.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>{t('fieldAno')}</span>
            <Input
              className="ui-input--new-codex"
              type="number"
              value={draft.ano}
              onChange={(e) =>
                setDraft({ ...draft, ano: Number(e.target.value) })
              }
              required
            />
          </label>
          <label className="field">
            <span>{t('fieldMes')}</span>
            <Input
              className="ui-input--new-codex"
              type="number"
              min={1}
              max={12}
              step={1}
              value={draft.mes ?? ''}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  mes: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
          </label>
          <label className="field">
            <span>{t('fieldEra')}</span>
            <Input
              className="ui-input--new-codex"
              type="text"
              value={draft.rotulo_era}
              onChange={(e) => setDraft({ ...draft, rotulo_era: e.target.value })}
            />
          </label>
          <MarkdownField
            label={t('fieldDescricao')}
            value={draft.descricao}
            onChange={(descricao) => setDraft({ ...draft, descricao })}
            controlClassName="ui-input--new-codex"
          />
          <label className="field">
            <span>{t('fieldSessao')}</span>
            <select
              value={draft.sessao_id ?? ''}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  sessao_id: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            >
              <option value="">{t('fieldSessaoNone')}</option>
              {sessoes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.numero}. {s.titulo}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="field">
            <legend>{t('fieldLocais')}</legend>
            <div className="linha-tempo-page__checks">
              {locais.map((loc) => (
                <label key={loc.id} className="linha-tempo-page__check">
                  <input
                    type="checkbox"
                    checked={draft.local_ids.includes(loc.id)}
                    onChange={() =>
                      setDraft({
                        ...draft,
                        local_ids: toggleId(draft.local_ids, loc.id),
                      })
                    }
                  />
                  {loc.nome}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="field">
            <legend>{t('fieldPersonagens')}</legend>
            <div className="linha-tempo-page__checks">
              {personagens.map((p) => (
                <label key={p.id} className="linha-tempo-page__check">
                  <input
                    type="checkbox"
                    checked={draft.personagem_ids.includes(p.id)}
                    onChange={() =>
                      setDraft({
                        ...draft,
                        personagem_ids: toggleId(draft.personagem_ids, p.id),
                      })
                    }
                  />
                  {p.nome}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="linha-tempo-page__check">
            <input
              type="checkbox"
              checked={draft.visivel_para_todos}
              onChange={(e) =>
                setDraft({ ...draft, visivel_para_todos: e.target.checked })
              }
            />
            {t('fieldVisivel')}
          </label>
        </FormDrawer>
      ) : null}

      <ConfirmDialog
        open={pendingDeleteId != null}
        title={t('deleteConfirmTitle')}
        description={t('deleteConfirmBody')}
        danger
        confirmLabel={tc('buttons.delete')}
        cancelLabel={tc('buttons.cancel')}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}
