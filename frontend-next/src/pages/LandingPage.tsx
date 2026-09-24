import { Link } from 'react-router-dom'
import {
  IconMap2, IconUsers, IconRoute2, IconArrowRight, IconCheck,
} from '@tabler/icons-react'
import { useCampaigns } from '../data/CampaignsStore'
import { GENRES } from '../theme/genres'
import { useCampaignGenre, useTheme } from '../theme/ThemeContext'
import { SiteHeader } from '../components/layout/SiteHeader'
import { CampaignCard } from '../components/common/CampaignCard'
import './LandingPage.css'

export function LandingPage() {
  useCampaignGenre('fantasia')
  const { genre, setGenre } = useTheme()
  const { campaigns } = useCampaigns()
  const featured = campaigns.filter((c) => c.visibilidade === 'listada').slice(0, 3)

  return (
    <div className="landing">
      <SiteHeader />
      <section className="landing__hero">
        <div className="container landing__hero-grid">
          <div className="landing__hero-copy">
            <span className="badge badge-accent">Protótipo · nova versão</span>
            <h1 className="display landing__title">O mapa, o elenco e as rotas da sua mesa, num só lugar.</h1>
            <p className="text-2 landing__lede">
              Campaign Codex é o codex vivo de campanhas de RPG de mesa — um mapa que os jogadores exploram como um mapa de verdade,
              uma rede de relações que revela quem conhece quem, e um mestre que edita tudo isso sem sair da mesma tela.
            </p>
            <div className="row gap-3" style={{ marginTop: 24, flexWrap: 'wrap' }}>
              <Link to="/entrar" className="btn btn-primary btn-lg">
                Entrar como mestre <IconArrowRight size={17} aria-hidden />
              </Link>
              <Link to="/explorar" className="btn btn-secondary btn-lg">Ver campanhas abertas</Link>
            </div>
            <ul className="landing__checks">
              <li><IconCheck size={15} aria-hidden /> Sem conta para jogadores — é só abrir o link</li>
              <li><IconCheck size={15} aria-hidden /> Qualquer sistema de RPG, qualquer gênero</li>
              <li><IconCheck size={15} aria-hidden /> Self-hosted — os dados da mesa ficam com o mestre</li>
            </ul>
          </div>
          <div className="landing__mock" aria-hidden>
            <div className="landing__mock-bar">
              <span className="landing__mock-dot" /><span className="landing__mock-dot" /><span className="landing__mock-dot" />
            </div>
            <div className="landing__mock-body">
              <div className="landing__mock-panel">
                <div className="landing__mock-search" />
                <div className="landing__mock-row" /><div className="landing__mock-row" /><div className="landing__mock-row short" />
              </div>
              <div className="landing__mock-map">
                <span className="landing__mock-pin" style={{ left: '30%', top: '35%' }} />
                <span className="landing__mock-pin" style={{ left: '55%', top: '55%' }} />
                <span className="landing__mock-pin landing__mock-pin--group" style={{ left: '68%', top: '30%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container landing__steps">
        <div className="landing__step">
          <div className="icon-btn icon-btn-accent" style={{ pointerEvents: 'none' }}><IconMap2 size={20} aria-hidden /></div>
          <h3>Mapa vivo</h3>
          <p className="text-2">Zoom e pan como num mapa de verdade. Pinos revelam o que o grupo já descobriu — e só isso.</p>
        </div>
        <div className="landing__step">
          <div className="icon-btn icon-btn-accent" style={{ pointerEvents: 'none' }}><IconUsers size={20} aria-hidden /></div>
          <h3>Rede de relações</h3>
          <p className="text-2">Quem é aliado, quem é inimigo, quem esconde o quê — num grafo que os jogadores exploram sozinhos.</p>
        </div>
        <div className="landing__step">
          <div className="icon-btn icon-btn-accent" style={{ pointerEvents: 'none' }}><IconRoute2 size={20} aria-hidden /></div>
          <h3>Rotas e distâncias</h3>
          <p className="text-2">Calcule viagens pela rede de estradas, rios e trilhas que o mestre desenhou no próprio mapa.</p>
        </div>
      </section>

      <section className="landing__genres">
        <div className="container">
          <h2>Um tema para cada mundo</h2>
          <p className="text-2" style={{ maxWidth: 560 }}>Cada campanha escolhe um gênero na criação, e a interface inteira se adapta — cores, e a sensação da mesa. Experimente:</p>
          <div className="landing__genre-grid">
            {GENRES.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`landing__genre-card${genre === g.id ? ' is-active' : ''}`}
                onClick={() => setGenre(g.id)}
              >
                <span className="landing__genre-swatch" style={{ background: g.swatch }} />
                <span className="landing__genre-label">{g.label}</span>
                <span className="text-3">{g.tagline}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container landing__showcase">
          <h2>Campanhas em jogo agora</h2>
          <div className="landing__showcase-grid">
            {featured.map((c) => (
              <CampaignCard key={c.slug} campaign={c} linkTo={`/c/${c.slug}`} compact />
            ))}
          </div>
        </section>
      )}

      <section className="landing__cta">
        <div className="container stack gap-3" style={{ alignItems: 'center', textAlign: 'center' }}>
          <h2 style={{ margin: 0 }}>Pronto para organizar a sua mesa?</h2>
          <Link to="/painel/novo" className="btn btn-primary btn-lg">Criar meu primeiro codex</Link>
        </div>
      </section>
    </div>
  )
}
