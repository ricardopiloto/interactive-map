import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight, IconCheck, IconExternalLink, IconSparkles } from '@tabler/icons-react'
import { authApi } from '../api/client'
import { campanhasApi } from '../api/campanhas'
import { Button, Chip } from '../components/ui'
import { SiteChrome } from '../components/layout/SiteChrome'
import { useApiErrorMessage } from '../hooks/useApiErrorMessage'
import { applyCampaignGenre } from '../theme/campaignGenre'
import { GENRES, genreSwatchVar, type GenreId } from '../theme/genres'
import { slugify } from '../utils/slugify'
import './NovoCodexPage.css'
import { createLoginModalState, publicLoginBackground } from '../utils/loginNavigation'

const STEP_KEYS = ['identity', 'system', 'visibility', 'review'] as const
type Visibility = 'listada' | 'so_link'

export function NovoCodexPage() {
  const { t } = useTranslation('comum')
  const navigate = useNavigate()
  const apiError = useApiErrorMessage()
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [sistema, setSistema] = useState('')
  const [genero, setGenero] = useState<GenreId>('fantasia')
  const [visibilidade, setVisibilidade] = useState<Visibility>('listada')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ slug: string; nome: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    void authApi.me().then(() => {
      if (!cancelled) setReady(true)
    }).catch(() => {
      if (!cancelled) navigate('/login?next=/painel/novo', {
        replace: true,
        state: createLoginModalState(publicLoginBackground(), '/painel/novo', '/'),
      })
    })
    return () => { cancelled = true }
  }, [navigate])

  useEffect(() => {
    const root = document.documentElement
    const previousGenre = root.dataset.genre
    const previousTheme = root.dataset.theme
    const previousForcedDark = root.getAttribute('data-genre-forced-dark')
    applyCampaignGenre(genero)
    return () => {
      if (previousGenre) root.dataset.genre = previousGenre
      else delete root.dataset.genre
      if (previousTheme) root.dataset.theme = previousTheme
      else delete root.dataset.theme
      if (previousForcedDark === null) root.removeAttribute('data-genre-forced-dark')
      else root.setAttribute('data-genre-forced-dark', previousForcedDark)
    }
  }, [genero])

  const genreMeta = GENRES.find((item) => item.id === genero) ?? GENRES[0]
  const canAdvance = step === 0
    ? nome.trim().length > 1 && slug.trim().length > 1
    : step === 1 ? sistema.trim().length > 1 : true

  function updateName(value: string) {
    setNome(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  function updateSlug(value: string) {
    setSlug(slugify(value))
    setSlugTouched(true)
    setError(null)
  }

  async function createCampaign() {
    setBusy(true)
    setError(null)
    try {
      const result = await campanhasApi.criar({
        nome: nome.trim(), slug: slug.trim(), sistema: sistema.trim(), genero, visibilidade,
      })
      setCreated({ slug: result.slug, nome: result.nome })
    } catch (err) {
      setError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return null

  return (
    <SiteChrome>
      <section className="novo-codex" data-genre={genero}>
        {created ? (
          <div className="novo-codex__success">
            <span className="novo-codex__success-icon"><IconCheck size={26} aria-hidden /></span>
            <h1>{t('painel.wizard.successTitle', { nome: created.nome })}</h1>
            <p>{t('painel.wizard.successBody', { slug: created.slug })}</p>
            <div className="novo-codex__actions novo-codex__actions--center">
              <Link className="ui-btn ui-touch ui-btn--primary" to={`/c/${created.slug}`}>
                {t('painel.wizard.openCampaign')} <IconExternalLink size={16} aria-hidden />
              </Link>
              <Link className="ui-btn ui-touch ui-btn--secondary" to="/painel">{t('painel.wizard.goToPanel')}</Link>
            </div>
          </div>
        ) : (
          <div className="novo-codex__shell">
            <ol className="novo-codex__steps" aria-label={t('painel.wizard.progress')}>
              {STEP_KEYS.map((key, index) => (
                <li key={key} className={`novo-codex__step${index === step ? ' is-active' : ''}${index < step ? ' is-done' : ''}`} aria-current={index === step ? 'step' : undefined}>
                  <span className="novo-codex__step-dot">{index < step ? <IconCheck size={12} aria-hidden /> : index + 1}</span>
                  {t(`painel.wizard.steps.${key}`)}
                </li>
              ))}
            </ol>
            <div className="novo-codex__card">
              {step === 0 && <div className="novo-codex__content">
                <h1>{t('painel.wizard.identityTitle')}</h1>
                <p className="novo-codex__muted">{t('painel.wizard.identityLead')}</p>
                <label className="novo-codex__field">
                  {t('painel.wizard.name')}
                  <input className="ui-input ui-input--new-codex" autoFocus value={nome} onChange={(event) => updateName(event.target.value)} placeholder={t('painel.wizard.namePlaceholder')} />
                </label>
                <label className="novo-codex__field">
                  {t('painel.wizard.slugLabel')}
                  <span className="novo-codex__slug"><span>/c/</span><input className="ui-input ui-input--new-codex" value={slug} onChange={(event) => updateSlug(event.target.value)} /></span>
                  <span className="novo-codex__hint">{t('painel.wizard.slugImmutable')}</span>
                </label>
              </div>}
              {step === 1 && <div className="novo-codex__content">
                <h1>{t('painel.wizard.systemTitle')}</h1>
                <p className="novo-codex__muted">{t('painel.wizard.systemLead')}</p>
                <label className="novo-codex__field">
                  {t('painel.sistema')}
                  <input className="ui-input ui-input--new-codex" list="novo-codex-sistemas" value={sistema} onChange={(event) => setSistema(event.target.value)} placeholder={t('painel.wizard.systemPlaceholder')} />
                  <datalist id="novo-codex-sistemas">{genreMeta.suggestedSystems.map((item) => <option key={item} value={item} />)}</datalist>
                  <span className="novo-codex__hint">{t('painel.suggestedSystems')}</span>
                </label>
                <fieldset className="novo-codex__genre-field">
                  <legend>{t('painel.genre')}</legend>
                  <div className="novo-codex__genre-grid" role="radiogroup" aria-label={t('painel.genre')}>
                    {GENRES.map((item) => <button key={item.id} type="button" role="radio" aria-checked={genero === item.id} className={`novo-codex__genre${genero === item.id ? ' is-active' : ''}`} onClick={() => setGenero(item.id)}>
                      <span className="novo-codex__swatch" style={{ background: genreSwatchVar(item.id) }} />
                      <strong>{t(`painel.genre_${item.id}`)}</strong>
                      <Chip className="novo-codex__genre-tag">{t(`painel.genreTag_${item.id}`)}</Chip>
                    </button>)}
                  </div>
                  <span className="novo-codex__hint"><IconSparkles size={13} aria-hidden /> {t('painel.wizard.genrePreview')}</span>
                </fieldset>
              </div>}
              {step === 2 && <div className="novo-codex__content">
                <h1>{t('painel.wizard.visibilityTitle')}</h1>
                <p className="novo-codex__muted">{t('painel.wizard.visibilityLead')}</p>
                <div className="novo-codex__visibility">
                  {(['listada', 'so_link'] as const).map((value) => <label key={value} className={`novo-codex__radio-card${visibilidade === value ? ' is-active' : ''}`}>
                    <input type="radio" name="visibility" checked={visibilidade === value} onChange={() => setVisibilidade(value)} />
                    <span><strong>{t(value === 'listada' ? 'painel.visListada' : 'painel.visSoLink')}</strong><small>{t(value === 'listada' ? 'painel.wizard.listedHelp' : 'painel.wizard.linkOnlyHelp')}</small></span>
                  </label>)}
                </div>
              </div>}
              {step === 3 && <div className="novo-codex__content">
                <h1>{t('painel.wizard.reviewTitle')}</h1>
                <div className="novo-codex__review">
                  <div className="novo-codex__review-badges"><span>{sistema}</span><span>{t(visibilidade === 'listada' ? 'painel.visListada' : 'painel.visSoLink')}</span></div>
                  <h2>{nome}</h2><p>/c/{slug}</p>
                  <div className="novo-codex__review-genre"><span className="novo-codex__swatch" style={{ background: genreSwatchVar(genero) }} />{t(`painel.genre_${genero}`)}</div>
                </div>
              </div>}
              {error && <p className="novo-codex__error" role="alert">{error}</p>}
              <div className="novo-codex__actions">
                <Button variant="ghost" onClick={() => step === 0 ? navigate('/painel') : setStep((value) => value - 1)}>
                  <IconArrowLeft size={15} aria-hidden /> {t(step === 0 ? 'painel.wizard.cancel' : 'painel.wizard.back')}
                </Button>
                {step < STEP_KEYS.length - 1 ? <Button variant="primary" disabled={!canAdvance} onClick={() => { setError(null); setStep((value) => value + 1) }}>
                  {t('painel.wizard.continue')} <IconArrowRight size={15} aria-hidden />
                </Button> : <Button variant="primary" disabled={busy} onClick={() => void createCampaign()}>
                  {t(busy ? 'painel.wizard.creating' : 'painel.wizard.create')}
                </Button>}
              </div>
            </div>
          </div>
        )}
      </section>
    </SiteChrome>
  )
}
