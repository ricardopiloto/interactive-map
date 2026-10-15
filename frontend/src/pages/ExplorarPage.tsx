import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconSearch } from '@tabler/icons-react'
import { campanhasApi, type CatalogoItem } from '../api/campanhas'
import { CampaignCard } from '../components/campaign/CampaignCard'
import { SiteChrome } from '../components/layout/SiteChrome'
import { EmptyState, Input } from '../components/ui'
import './ExplorarPage.css'


export function ExplorarPage() {
  const { t } = useTranslation('comum')
  const [items, setItems] = useState<CatalogoItem[] | null>(null)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    void campanhasApi
      .catalogo()
      .then((res) => {
        if (!cancelled) setItems(res.campanhas)
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
          setItems([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (!items) return []
    const q = query.trim().toLowerCase()
    return items.filter((c) => {
      const matchesQuery =
        !q ||
        c.nome.toLowerCase().includes(q) ||
        c.sistema.toLowerCase().includes(q)
      return matchesQuery
    })
  }, [items, query])

  return (
    <SiteChrome>
      <section className="explore-page">
        <h1 className="explore-page__title">{t('explorar.title')}</h1>
        <p className="explore-page__lead">{t('explorar.lead')}</p>

        <div className="explore-page__toolbar">
          <label className="explore-page__search">
            <IconSearch size={17} aria-hidden />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('explorar.searchPlaceholder')}
              aria-label={t('explorar.searchAria')}
            />
          </label>
        </div>

        {error ? <p className="explore-page__error">{t('explorar.loadError')}</p> : null}

        {items && filtered.length === 0 && !error ? (
          <EmptyState title={t('explorar.empty')} />
        ) : null}

        {filtered.length > 0 ? (
          <div className="explore-page__grid">
            {filtered.map((c) => (
              <CampaignCard
                key={c.slug}
                slug={c.slug}
                nome={c.nome}
                sistema={c.sistema}
                capa_url={c.capa_url}
                linkTo={`/c/${c.slug}`}
              />
            ))}
          </div>
        ) : null}
      </section>
    </SiteChrome>
  )
}
