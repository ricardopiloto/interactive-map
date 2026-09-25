import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
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
import type { Local, Personagem, Sessao } from '../types'
import './SessoesPage.css'

interface SessaoDraft {
  isNew: boolean
  id?: number
  numero: number
  titulo: string
  data_rotulo: string
  resumo: string
  visivel_para_todos: boolean
  local_ids: number[]
  personagem_ids: number[]
}

export function SessoesPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { t } = useTranslation('sessoes')
  const { t: tc } = useTranslation('comum')
  const apiErrorMessage = useApiErrorMessage()
  const { config: instanceConfig } = useInstanceConfig(slug)
  const cfg = getCachedInstanceConfig(slug) ?? instanceConfig
  const { enabled: isGm } = useEditMode()

  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [locais, setLocais] = useState<Local[]>([])
  const [personagens, setPersonagens] = useState<Personagem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyError, setBusyError] = useState<string | null>(null)
  const [draft, setDraft] = useState<SessaoDraft | null>(null)
  const [draftBaseline, setDraftBaseline] = useState<string>('')
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      if (isGm) {
        const [s, locs, ps] = await Promise.all([
          adminApi.listSessoesAdmin(),
          adminApi.listLocaisAdmin(),
          adminApi.listPersonagensAdmin(),
        ])
        setSessoes(s.sessoes)
        setLocais(locs)
        setPersonagens(ps)
      } else {
        const s = await campaignApi.listSessoes()
        setSessoes(s.sessoes)
        setLocais([])
        setPersonagens([])
      }
    } catch (err) {
      setError(apiErrorMessage(err) || t('loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on edit-mode flip
  }, [isGm, slug])

  const dirty = useMemo(() => {
    if (!draft) return false
    return JSON.stringify(draft) !== draftBaseline
  }, [draft, draftBaseline])

  async function startCreate() {
    setBusyError(null)
    try {
      const { numero } = await adminApi.proximoNumeroSessao()
      const next: SessaoDraft = {
        isNew: true,
        numero,
        titulo: '',
        data_rotulo: '',
        resumo: '',
        visivel_para_todos: true,
        local_ids: [],
        personagem_ids: [],
      }
      setDraft(next)
      setDraftBaseline(JSON.stringify(next))
    } catch (err) {
      setBusyError(apiErrorMessage(err))
    }
  }

  function startEdit(s: Sessao) {
    const next: SessaoDraft = {
      isNew: false,
      id: s.id,
      numero: s.numero,
      titulo: s.titulo,
      data_rotulo: s.data_rotulo ?? '',
      resumo: s.resumo ?? '',
      visivel_para_todos: s.visivel_para_todos !== false,
      local_ids: s.locais.map((l) => l.id),
      personagem_ids: s.personagens.map((p) => p.id),
    }
    setDraft(next)
    setDraftBaseline(JSON.stringify(next))
    setBusyError(null)
  }

  async function saveDraft() {
    if (!draft || !draft.titulo.trim()) return
    setBusyError(null)
    const payload = {
      numero: draft.numero,
      titulo: draft.titulo.trim(),
      data_rotulo: draft.data_rotulo.trim() || null,
      resumo: draft.resumo,
      visivel_para_todos: draft.visivel_para_todos,
      local_ids: draft.local_ids,
      personagem_ids: draft.personagem_ids,
    }
    try {
      if (draft.isNew) await adminApi.createSessao(payload)
      else if (draft.id != null) await adminApi.updateSessao(draft.id, payload)
      setDraft(null)
      await refresh()
    } catch (err) {
      setBusyError(apiErrorMessage(err))
    }
  }

  async function confirmDelete() {
    if (pendingDeleteId == null) return
    try {
      await adminApi.deleteSessao(pendingDeleteId)
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
    <div className="sessoes-page">
      <CodexHeader campaignName={cfg?.nome}>
        {isGm ? (
          <Button variant="primary" type="button" onClick={() => void startCreate()}>
            <IconPlus size={16} aria-hidden /> {t('new')}
          </Button>
        ) : null}
      </CodexHeader>

      <main className="sessoes-page__main" tabIndex={0} role="region" aria-label={t('title')}>
        <h1 className="sessoes-page__title">{t('title')}</h1>
        {error ? <p className="sessoes-page__error">{error}</p> : null}
        {busyError ? <p className="sessoes-page__error">{busyError}</p> : null}

        {loading ? null : sessoes.length === 0 ? (
          <EmptyState title={isGm ? t('emptyGm') : t('empty')} />
        ) : (
          <ol className="sessoes-page__list">
            {sessoes.map((s) => (
              <li key={s.id} className="sessoes-page__item">
                <header className="sessoes-page__item-head">
                  <div>
                    <p className="sessoes-page__kicker">
                      {t('sessionLabel', { numero: s.numero })}
                      {isGm && s.visivel_para_todos === false ? (
                        <span className="sessoes-page__hidden"> · {t('hiddenBadge')}</span>
                      ) : null}
                    </p>
                    <h2 className="sessoes-page__item-title">{s.titulo}</h2>
                    {s.data_rotulo ? (
                      <p className="sessoes-page__date">{s.data_rotulo}</p>
                    ) : null}
                  </div>
                  {isGm ? (
                    <div className="sessoes-page__actions">
                      <IconButton
                        label={t('edit')}
                        onClick={() => startEdit(s)}
                      >
                        <IconPencil size={18} />
                      </IconButton>
                      <IconButton
                        label={t('delete')}
                        onClick={() => setPendingDeleteId(s.id)}
                      >
                        <IconTrash size={18} />
                      </IconButton>
                    </div>
                  ) : null}
                </header>
                {s.resumo ? (
                  <div className="sessoes-page__resumo">
                    <MarkdownSafe>{s.resumo}</MarkdownSafe>
                  </div>
                ) : null}
                {(s.locais.length > 0 || s.personagens.length > 0) && (
                  <div className="sessoes-page__chips">
                    {s.locais.map((loc) => (
                      <Link
                        key={`l-${loc.id}`}
                        className="sessoes-page__chip"
                        to={`/c/${slug}?local=${loc.id}`}
                      >
                        {t('chipLocal')}: {loc.nome}
                      </Link>
                    ))}
                    {s.personagens.map((p) => (
                      <Link
                        key={`p-${p.id}`}
                        className="sessoes-page__chip"
                        to={`/c/${slug}/relacoes?personagem=${p.id}`}
                      >
                        {t('chipPersonagem')}: {p.nome}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </main>

      {draft ? (
        <FormDrawer
          open
          title={draft.isNew ? t('new') : t('edit')}
          dirty={dirty}
          onClose={() => setDraft(null)}
          onSave={() => void saveDraft()}
          saveDisabled={!draft.titulo.trim()}
        >
          <label className="field">
            <span>{t('fieldNumero')}</span>
            <input
              type="number"
              min={1}
              value={draft.numero}
              onChange={(e) =>
                setDraft({ ...draft, numero: Number(e.target.value) || 1 })
              }
            />
          </label>
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
            <span>{t('fieldData')}</span>
            <Input
              className="ui-input--new-codex"
              type="text"
              value={draft.data_rotulo}
              onChange={(e) => setDraft({ ...draft, data_rotulo: e.target.value })}
            />
          </label>
          <MarkdownField
            label={t('fieldResumo')}
            value={draft.resumo}
            onChange={(resumo) => setDraft({ ...draft, resumo })}
            controlClassName="ui-input--new-codex"
          />
          <fieldset className="field">
            <legend>{t('fieldLocais')}</legend>
            <div className="sessoes-page__checks">
              {locais.map((loc) => (
                <label key={loc.id} className="sessoes-page__check">
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
            <div className="sessoes-page__checks">
              {personagens.map((p) => (
                <label key={p.id} className="sessoes-page__check">
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
          <label className="sessoes-page__check">
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
