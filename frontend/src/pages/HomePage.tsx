import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import {
  IconArrowRight,
  IconCheck,
  IconMap2,
  IconRoute2,
  IconUsers,
} from '@tabler/icons-react'
import { campanhasApi, type CatalogoItem } from '../api/campanhas'
import { CampaignCard } from '../components/campaign/CampaignCard'
import { SiteChrome } from '../components/layout/SiteChrome'
import { Chip } from '../components/ui'
import { applyCampaignGenre, clearCampaignGenre } from '../theme/campaignGenre'
import { GENRES, genreSwatchVar, type GenreId } from '../theme/genres'
import './HomePage.css'
import { createLoginModalState } from '../utils/loginNavigation'

export function HomePage() {
  const { t } = useTranslation('comum')
  const location = useLocation()
  const [featured, setFeatured] = useState<CatalogoItem[]>([])
  const [previewGenre, setPreviewGenre] = useState<GenreId>('fantasia')

  useEffect(() => {
    applyCampaignGenre(previewGenre)
    return () => clearCampaignGenre()
  }, [previewGenre])

  useEffect(() => {
    let cancelled = false
    void campanhasApi
      .catalogo()
      .then((res) => {
        if (!cancelled) setFeatured(res.campanhas.slice(0, 3))
      })
      .catch(() => {
        if (!cancelled) setFeatured([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <SiteChrome>
      <div className="landing">
        <section className="landing__hero">
          <div className="landing__hero-grid">
            <div className="landing__hero-copy">
              <Chip variant="accent">{t('landing.badge')}</Chip>
              <h1 className="landing__title">{t('landing.title')}</h1>
              <p className="landing__lede">{t('landing.lede')}</p>
              <div className="landing__ctas">
                <Link
                  className="ui-btn ui-touch ui-btn--primary"
                  to="/login?next=/painel"
                  state={createLoginModalState(location, '/painel')}
                >
                  {t('landing.ctaMaster')}
                  <IconArrowRight size={17} aria-hidden />
                </Link>
                <Link className="ui-btn ui-touch ui-btn--secondary" to="/explorar">
                  {t('landing.ctaExplore')}
                </Link>
              </div>
              <ul className="landing__checks">
                <li>
                  <IconCheck size={15} aria-hidden /> {t('landing.checkNoAccount')}
                </li>
                <li>
                  <IconCheck size={15} aria-hidden /> {t('landing.checkAnySystem')}
                </li>
                <li>
                  <IconCheck size={15} aria-hidden /> {t('landing.checkSelfHosted')}
                </li>
              </ul>
            </div>
            <div className="landing__mock" aria-hidden>
              <div className="landing__mock-bar">
                <span className="landing__mock-dot" />
                <span className="landing__mock-dot" />
                <span className="landing__mock-dot" />
              </div>
              <div className="landing__mock-body">
                <div className="landing__mock-panel">
                  <div className="landing__mock-search" />
                  <div className="landing__mock-row" />
                  <div className="landing__mock-row" />
                  <div className="landing__mock-row landing__mock-row--short" />
                </div>
                <div className="landing__mock-map">
                  <span className="landing__mock-pin" style={{ left: '30%', top: '35%' }} />
                  <span className="landing__mock-pin" style={{ left: '55%', top: '55%' }} />
                  <span
                    className="landing__mock-pin landing__mock-pin--group"
                    style={{ left: '68%', top: '30%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing__steps">
          <div className="landing__step">
            <span className="landing__step-icon" aria-hidden>
              <IconMap2 size={20} />
            </span>
            <h3>{t('landing.stepMapTitle')}</h3>
            <p>{t('landing.stepMapBody')}</p>
          </div>
          <div className="landing__step">
            <span className="landing__step-icon" aria-hidden>
              <IconUsers size={20} />
            </span>
            <h3>{t('landing.stepRelTitle')}</h3>
            <p>{t('landing.stepRelBody')}</p>
          </div>
          <div className="landing__step">
            <span className="landing__step-icon" aria-hidden>
              <IconRoute2 size={20} />
            </span>
            <h3>{t('landing.stepRouteTitle')}</h3>
            <p>{t('landing.stepRouteBody')}</p>
          </div>
        </section>

        <section className="landing__genres">
          <div className="landing__genres-inner">
            <h2>{t('landing.genresTitle')}</h2>
            <p className="landing__genres-lead">{t('landing.genresLead')}</p>
            <div className="landing__genre-grid" role="list">
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`landing__genre-card${previewGenre === g.id ? ' is-active' : ''}`}
                  onClick={() => setPreviewGenre(g.id)}
                >
                  <span
                    className="landing__genre-swatch"
                    style={{ background: genreSwatchVar(g.id) }}
                    aria-hidden
                  />
                  <span className="landing__genre-label">{t(`painel.genre_${g.id}`)}</span>
                  <span className="landing__genre-tag">{t(`painel.genreTag_${g.id}`)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {featured.length > 0 ? (
          <section className="landing__showcase">
            <h2>{t('landing.featuredTitle')}</h2>
            <div className="landing__showcase-grid">
              {featured.map((c) => (
                <CampaignCard
                  key={c.slug}
                  slug={c.slug}
                  nome={c.nome}
                  sistema={c.sistema}
                  genero={c.genero}
                  capa_url={c.capa_url}
                  linkTo={`/c/${c.slug}`}
                  compact
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="landing__cta">
          <h2>{t('landing.ctaFinalTitle')}</h2>
          <Link
            className="ui-btn ui-touch ui-btn--primary"
            to="/login?next=/painel%23criar"
            state={createLoginModalState(location, '/painel#criar')}
          >
            {t('landing.ctaFinal')}
          </Link>
        </section>
      </div>
    </SiteChrome>
  )
}
