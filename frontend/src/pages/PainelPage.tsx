import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { IconPlus } from '@tabler/icons-react'
import { adminApi } from '../api/admin'
import { campanhasApi, type PainelItem } from '../api/campanhas'
import { setCampaignSlug } from '../api/campaignSlug'
import { authApi } from '../api/client'
import { CampaignCard } from '../components/campaign/CampaignCard'
import { SiteChrome } from '../components/layout/SiteChrome'
import { clearInstanceConfigCache } from '../hooks/useInstanceConfig'
import { useApiErrorMessage } from '../hooks/useApiErrorMessage'
import { GENRE_IDS, type GenreId, resolveGenreId } from '../theme/genres'
import './PainelPage.css'
import { Button } from '../components/ui'
import { createLoginModalState, publicLoginBackground } from '../utils/loginNavigation'

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KiB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MiB`
  return `${(n / 1024 ** 3).toFixed(2)} GiB`
}

export function PainelPage() {
  const { t } = useTranslation('comum')
  const navigate = useNavigate()
  const errMsg = useApiErrorMessage()
  const [items, setItems] = useState<PainelItem[] | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [genreDrafts, setGenreDrafts] = useState<Record<string, GenreId>>({})
  const [savingGenreSlugs, setSavingGenreSlugs] = useState<Set<string>>(() => new Set())
  const [importSlug, setImportSlug] = useState('')

  const refresh = useCallback(async () => {
    const res = await campanhasApi.minhas()
    setItems(res.campanhas)
  }, [])

  useEffect(() => {
    let cancelled = false
    void authApi
      .me()
      .then(async () => {
        if (cancelled) return
        await refresh()
        if (!cancelled) setReady(true)
      })
      .catch(() => {
        if (!cancelled) navigate('/login?next=/painel', {
          replace: true,
          state: createLoginModalState(publicLoginBackground(), '/painel', '/'),
        })
      })
    return () => {
      cancelled = true
    }
  }, [navigate, refresh])

  async function toggleVis(item: PainelItem) {
    const next = item.visibilidade === 'listada' ? 'so_link' : 'listada'
    setError(null)
    try {
      await campanhasApi.patchVisibilidade(item.slug, next)
      await refresh()
    } catch (err) {
      setError(errMsg(err))
    }
  }

  async function toggleUnidade(item: PainelItem) {
    const next = item.unidade_distancia === 'km' ? 'mi' : 'km'
    setError(null)
    try {
      await campanhasApi.patchUnidadeDistancia(item.slug, next)
      clearInstanceConfigCache(item.slug)
      await refresh()
    } catch (err) {
      setError(errMsg(err))
    }
  }

  function cancelGenreChange(slug: string) {
    setGenreDrafts((current) => {
      const next = { ...current }
      delete next[slug]
      return next
    })
    setError(null)
  }

  async function saveGenreChange(item: PainelItem) {
    const genero = genreDrafts[item.slug]
    if (!genero || genero === resolveGenreId(item.genero)) return

    setSavingGenreSlugs((current) => new Set(current).add(item.slug))
    setError(null)
    try {
      const updated = await campanhasApi.patchGenero(item.slug, genero)
      clearInstanceConfigCache(item.slug)
      setItems((current) =>
        current?.map((campaign) =>
          campaign.slug === item.slug ? { ...campaign, genero: updated.genero } : campaign,
        ) ?? null,
      )
      cancelGenreChange(item.slug)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setSavingGenreSlugs((current) => {
        const next = new Set(current)
        next.delete(item.slug)
        return next
      })
    }
  }

  async function onCapaFile(item: PainelItem, file: File | undefined) {
    if (!file) return
    setError(null)
    setCampaignSlug(item.slug)
    try {
      const up = await adminApi.upload('covers', file)
      const name = up.url.split('/').pop() ?? ''
      await campanhasApi.patchCapa(item.slug, { capa_arquivo: name })
      clearInstanceConfigCache(item.slug)
      await refresh()
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setCampaignSlug(null)
    }
  }

  async function clearCapa(item: PainelItem) {
    setError(null)
    try {
      await campanhasApi.patchCapa(item.slug, { limpar_capa: true })
      clearInstanceConfigCache(item.slug)
      await refresh()
    } catch (err) {
      setError(errMsg(err))
    }
  }

  async function onExport(slugValue: string) {
    setError(null)
    try {
      const blob = await campanhasApi.exportZip(slugValue)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slugValue}-export.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(errMsg(err))
    }
  }

  async function onImport(file: File | null) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      await campanhasApi.importZip(file, importSlug.trim() || undefined)
      setImportSlug('')
      await refresh()
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return null

  return (
    <SiteChrome>
      <section className="painel-page">
        <div className="painel-page__header">
          <div>
            <h1 className="painel-page__title">{t('painel.title')}</h1>
            <p className="painel-page__lead">{t('painel.lead')}</p>
          </div>
          <Button variant="primary" type="button" onClick={() => navigate('/painel/novo')}>
            <IconPlus size={17} aria-hidden />
            {t('painel.createCta')}
          </Button>
        </div>
        {error && <p className="painel-page__error">{error}</p>}

        <div className="painel-page__grid">
          {items?.map((c) => {
            const pct = Math.min(100, Math.round((c.bytes_usados / Math.max(1, c.cota_bytes)) * 100))
            const savedGenre = resolveGenreId(c.genero)
            const selectedGenre = genreDrafts[c.slug] ?? savedGenre
            const hasGenreChange = selectedGenre !== savedGenre
            const savingThisGenre = savingGenreSlugs.has(c.slug)
            return (
              <CampaignCard
                key={c.slug}
                slug={c.slug}
                nome={c.nome}
                sistema={c.sistema}
                genero={c.genero}
                capa_url={c.capa_url}
                footer={
                  <div className="painel-page__card-footer">
                    <span className="painel-page__vis-badge">
                      {c.visibilidade === 'listada' ? t('painel.visListada') : t('painel.visSoLink')}
                    </span>
                    <div className="painel-page__quota">
                      <div className="painel-page__quota-row">
                        <span>{t('painel.quota', { used: formatBytes(c.bytes_usados), cap: formatBytes(c.cota_bytes) })}</span>
                        {c.aviso_cota ? <span aria-hidden>⚠</span> : null}
                      </div>
                      <div className="painel-page__quota-bar">
                        <div className="painel-page__quota-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="painel-page__actions">
                      <Link className="ui-btn ui-touch ui-btn--secondary ui-btn--sm" to={`/c/${c.slug}`}>
                        {t('painel.open')}
                      </Link>
                      <Button size="sm" variant="ghost" type="button" onClick={() => void onExport(c.slug)}>
                        {t('painel.export')}
                      </Button>
                      <Button size="sm" variant="ghost" type="button" onClick={() => void toggleVis(c)}>
                        {c.visibilidade === 'listada' ? t('painel.makeSoLink') : t('painel.makeListada')}
                      </Button>
                      <Button size="sm" variant="ghost" type="button" onClick={() => void toggleUnidade(c)}>
                        {t('painel.toggleUnit')} ({c.unidade_distancia === 'km' ? 'km' : 'mi'})
                      </Button>
                    </div>
                    <div className="painel-page__identidade">
                      <label className="painel-page__genre">
                        {t('painel.genreEdit')}
                        <select
                          value={selectedGenre}
                          aria-label={t('painel.genreEdit')}
                          disabled={savingThisGenre}
                          onChange={(event) =>
                            setGenreDrafts((current) => ({
                              ...current,
                              [c.slug]: event.target.value as GenreId,
                            }))
                          }
                        >
                          {GENRE_IDS.map((genre) => (
                            <option key={genre} value={genre}>
                              {t(`painel.genre_${genre}`)}
                            </option>
                          ))}
                        </select>
                      </label>
                      {hasGenreChange ? (
                        <div className="painel-page__genre-actions">
                          <Button
                            size="sm"
                            variant="primary"
                            type="button"
                            disabled={savingThisGenre}
                            onClick={() => void saveGenreChange(c)}
                          >
                            {savingThisGenre ? t('painel.genreSaving') : t('painel.genreSave')}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            type="button"
                            disabled={savingThisGenre}
                            onClick={() => cancelGenreChange(c.slug)}
                          >
                            {t('painel.genreCancel')}
                          </Button>
                        </div>
                      ) : null}
                      <label className="painel-page__capa">
                        {t('painel.cover')}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => void onCapaFile(c, e.target.files?.[0])}
                        />
                      </label>
                      {c.capa_url ? (
                        <Button size="sm" variant="ghost" type="button" onClick={() => void clearCapa(c)}>
                          {t('painel.clearCover')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                }
              />
            )
          })}

          <Link to="/painel/novo" className="painel-page__new-card">
            <IconPlus size={22} aria-hidden />
            <span>{t('painel.newCard')}</span>
          </Link>
        </div>

        {items && items.length === 0 ? (
          <p className="painel-page__empty">{t('painel.empty')}</p>
        ) : null}

        <div className="painel-page__import">
          <h2>{t('painel.importTitle')}</h2>
          <label>
            {t('painel.importSlugOptional')}
            <input
              value={importSlug}
              onChange={(e) => setImportSlug(e.target.value)}
              placeholder="slug-opcional"
            />
          </label>
          <label>
            {t('painel.importFile')}
            <input
              type="file"
              accept=".zip,application/zip"
              disabled={busy}
              onChange={(e) => void onImport(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

      </section>
    </SiteChrome>
  )
}
