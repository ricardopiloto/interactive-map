import { useState } from 'react'
import { IconSearch } from '@tabler/icons-react'
import { useCampaigns } from '../data/CampaignsStore'
import { GENRES, type GenreId } from '../theme/genres'
import { useCampaignGenre } from '../theme/ThemeContext'
import { SiteHeader } from '../components/layout/SiteHeader'
import { CampaignCard } from '../components/common/CampaignCard'
import './ExplorePage.css'

export function ExplorePage() {
  useCampaignGenre('fantasia')
  const { campaigns } = useCampaigns()
  const [query, setQuery] = useState('')
  const [genreFilter, setGenreFilter] = useState<GenreId | 'todos'>('todos')

  const listed = campaigns.filter((c) => c.visibilidade === 'listada')
  const filtered = listed.filter((c) => {
    const matchesQuery = c.nome.toLowerCase().includes(query.toLowerCase()) || c.sistema.toLowerCase().includes(query.toLowerCase())
    const matchesGenre = genreFilter === 'todos' || c.genero === genreFilter
    return matchesQuery && matchesGenre
  })

  return (
    <div className="explore-page">
      <SiteHeader />
      <div className="container">
        <h1 className="display">Descubra uma campanha</h1>
        <p className="text-2">Sem conta, sem senha — escolha uma mesa e entre direto no mapa.</p>

        <div className="explore-page__toolbar">
          <div className="search-field" style={{ maxWidth: 360 }}>
            <IconSearch size={17} aria-hidden />
            <input className="search-field__input" placeholder="Buscar por nome ou sistema…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            <button type="button" className={`chip${genreFilter === 'todos' ? ' is-active' : ''}`} onClick={() => setGenreFilter('todos')}>Todos os gêneros</button>
            {GENRES.map((g) => (
              <button key={g.id} type="button" className={`chip${genreFilter === g.id ? ' is-active' : ''}`} onClick={() => setGenreFilter(g.id)}>{g.label}</button>
            ))}
          </div>
        </div>

        <div className="explore-page__grid">
          {filtered.map((c) => (
            <CampaignCard
              key={c.slug}
              campaign={c}
              linkTo={`/c/${c.slug}`}
              footer={
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
                  <span className="text-3">mestre: {c.mestre}</span>
                  <span className="text-3">{c.ultimaSessao}</span>
                </div>
              }
            />
          ))}
          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}><p>Nenhuma campanha encontrada.</p></div>
          )}
        </div>
      </div>
    </div>
  )
}
