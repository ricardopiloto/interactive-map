import { useOutletContext } from 'react-router-dom'
import { IconBook2 } from '@tabler/icons-react'
import type { CampaignCtx } from './CampaignLayout'
import './SessoesPage.css'

/** Prévia da crônica de sessões — próxima fronteira do roadmap (pesquisa de mercado, MR). */
export function SessoesPage() {
  const { campaign } = useOutletContext<CampaignCtx>()
  const sessoes = [...campaign.sessoes].sort((a, b) => b.numero - a.numero)
  const npcById = new Map(campaign.personagens.map((p) => [p.id, p]))
  const localById = new Map(campaign.locais.map((l) => [l.id, l]))

  return (
    <div className="sessoes-page">
      <div className="sessoes-page__intro">
        <h1 className="display">Crônica de {campaign.nome}</h1>
        <p className="text-2">Um resumo por sessão, para os jogadores lembrarem "o que aconteceu da última vez" sem precisar perguntar ao mestre.</p>
      </div>
      <div className="sessoes-page__timeline">
        {sessoes.map((s) => (
          <article key={s.id} className="sessao-card card">
            <div className="sessao-card__rail" aria-hidden><IconBook2 size={16} /></div>
            <div className="grow">
              <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                <span className="badge badge-accent">Sessão {s.numero}</span>
                <span className="text-3">{s.data}</span>
              </div>
              <h3 style={{ margin: '6px 0 4px' }}>{s.titulo}</h3>
              <p className="text-2" style={{ margin: 0 }}>{s.resumo}</p>
              {(s.localIds.length > 0 || s.npcIds.length > 0) && (
                <div className="row gap-2" style={{ marginTop: 10, flexWrap: 'wrap' }}>
                  {s.localIds.map((id) => localById.get(id) && <span key={id} className="badge">{localById.get(id)!.nome}</span>)}
                  {s.npcIds.map((id) => npcById.get(id) && <span key={id} className="badge">{npcById.get(id)!.nome}</span>)}
                </div>
              )}
            </div>
          </article>
        ))}
        {sessoes.length === 0 && <div className="empty-state"><p>Nenhuma sessão registrada ainda.</p></div>}
      </div>
    </div>
  )
}
