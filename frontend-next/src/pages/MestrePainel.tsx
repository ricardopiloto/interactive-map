import { Link } from 'react-router-dom'
import { IconPlus, IconExternalLink, IconLink } from '@tabler/icons-react'
import { useCampaigns } from '../data/CampaignsStore'
import { CURRENT_MESTRE } from '../data/mock'
import { useCampaignGenre } from '../theme/ThemeContext'
import { SiteHeader } from '../components/layout/SiteHeader'
import { CampaignCard } from '../components/common/CampaignCard'
import './MestrePainel.css'

export function MestrePainel() {
  useCampaignGenre('fantasia')
  const { campaigns } = useCampaigns()
  const mine = campaigns.filter((c) => c.mestre === CURRENT_MESTRE.nome)

  return (
    <div className="painel-page">
      <SiteHeader />
      <div className="container">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="display" style={{ margin: 0 }}>Minhas campanhas</h1>
            <p className="text-2">Só você vê e edita o que está aqui.</p>
          </div>
          <Link to="/painel/novo" className="btn btn-primary btn-lg">
            <IconPlus size={17} aria-hidden /> Criar novo codex
          </Link>
        </div>

        <div className="painel-page__grid">
          {mine.map((c) => {
            const pct = Math.min(100, Math.round((c.cotaUsadaGb / c.cotaTotalGb) * 100))
            return (
              <CampaignCard
                key={c.slug}
                campaign={c}
                footer={
                  <>
                    <span className="badge" style={{ marginTop: 6 }}>{c.visibilidade === 'listada' ? 'Listada' : 'Só por link'}</span>
                    <div className="painel-page__quota">
                      <div className="row" style={{ justifyContent: 'space-between', fontSize: 11.5 }}>
                        <span className="text-3">Uploads</span>
                        <span className="text-3">{c.cotaUsadaGb.toFixed(1)} GB de {c.cotaTotalGb} GB</span>
                      </div>
                      <div className="painel-page__quota-bar"><div className="painel-page__quota-fill" style={{ width: `${pct}%` }} /></div>
                    </div>
                    <div className="row gap-2" style={{ marginTop: 12 }}>
                      <Link to={`/c/${c.slug}`} className="btn btn-secondary btn-sm grow">
                        <IconExternalLink size={14} aria-hidden /> Abrir
                      </Link>
                      <button type="button" className="icon-btn icon-btn-sm" aria-label="Copiar link da campanha" title="Copiar link (mock)">
                        <IconLink size={14} aria-hidden />
                      </button>
                    </div>
                  </>
                }
              />
            )
          })}

          <Link to="/painel/novo" className="painel-page__new-card">
            <IconPlus size={22} aria-hidden />
            <span>Criar novo codex</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
