import { useState } from 'react'
import { IconUserPlus, IconCopy, IconServer2 } from '@tabler/icons-react'
import { useCampaigns } from '../data/CampaignsStore'
import { genreById } from '../theme/genres'
import { useCampaignGenre } from '../theme/ThemeContext'
import { Modal } from '../components/common/Modal'
import { SiteHeader } from '../components/layout/SiteHeader'
import './AdminConsole.css'

/**
 * Console do super-admin — ILUSTRATIVO, não representa uma tela real do
 * produto: por decisão de arquitetura (specs 095/099), operações de admin
 * ficam só na CLI (`usuario criar|reset|desactivar`, `campanha
 * atribuir-dono`) — de propósito, pra não expandir a superfície de ataque
 * de uma instância self-hosted. Não existe rota /admin equivalente no app
 * real. Mantido aqui só pra visualizar o conceito, caso a decisão mude.
 */
export function AdminConsole() {
  useCampaignGenre('fantasia')
  const { campaigns } = useCampaigns()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLink, setInviteLink] = useState('')

  const totalGb = campaigns.reduce((s, c) => s + c.cotaUsadaGb, 0)
  const quotaGb = campaigns.reduce((s, c) => s + c.cotaTotalGb, 0)
  const mestres = Array.from(new Set(campaigns.map((c) => c.mestre)))

  function generateInvite() {
    const token = Math.random().toString(36).slice(2, 10)
    setInviteLink(`https://campaign-codex.1nodado.com.br/convite/${token}`)
  }

  return (
    <div className="admin-page">
      <SiteHeader />
      <div className="container">
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="display" style={{ margin: 0 }}>Console do administrador</h1>
            <p className="text-2">Visão geral da instância — convites, campanhas e uso de disco.</p>
          </div>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => { setInviteOpen(true); setInviteLink(''); setInviteEmail('') }}>
            <IconUserPlus size={17} aria-hidden /> Convidar mestre
          </button>
        </div>

        <div className="admin-page__stats">
          <div className="card admin-page__stat"><span className="text-3">Campanhas</span><strong>{campaigns.length}</strong></div>
          <div className="card admin-page__stat"><span className="text-3">Mestres ativos</span><strong>{mestres.length}</strong></div>
          <div className="card admin-page__stat"><span className="text-3">Uploads usados</span><strong>{totalGb.toFixed(1)} / {quotaGb} GB</strong></div>
        </div>

        <h2 style={{ marginTop: 32 }}>Todas as campanhas</h2>
        <div className="card admin-page__table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Campanha</th><th>Mestre</th><th>Sistema</th><th>Gênero</th><th>Visibilidade</th><th>Uploads</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.slug}>
                  <td>{c.nome}<div className="text-3">/c/{c.slug}</div></td>
                  <td>{c.mestre}</td>
                  <td>{c.sistema}</td>
                  <td><span className="badge" style={{ background: genreById(c.genero).swatch, color: '#17140d' }}>{genreById(c.genero).label}</span></td>
                  <td>{c.visibilidade === 'listada' ? 'Listada' : 'Só por link'}</td>
                  <td>{c.cotaUsadaGb.toFixed(1)} / {c.cotaTotalGb} GB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card admin-page__infra">
          <IconServer2 size={18} aria-hidden />
          <div>
            <strong>Instância única — campaign-codex.1nodado.com.br</strong>
            <p className="text-3" style={{ margin: '2px 0 0' }}>Docker Compose · Caddy · Cloudflare Tunnel. Atualizar a app é um único deploy.</p>
          </div>
        </div>
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        eyebrow="Convite de mestre"
        title="Gerar link de acesso único"
        footer={
          !inviteLink ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setInviteOpen(false)}>Cancelar</button>
              <button type="button" className="btn btn-primary" disabled={!inviteEmail.includes('@')} onClick={generateInvite}>Gerar convite</button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setInviteOpen(false)}>Concluído</button>
          )
        }
      >
        {!inviteLink ? (
          <div className="field">
            <label htmlFor="invite-email">E-mail do novo mestre</label>
            <input id="invite-email" type="email" className="input" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="mestre@exemplo.com" autoFocus />
            <span className="field-hint">O link expira em 72h e serve só para essa pessoa definir a própria senha.</span>
          </div>
        ) : (
          <div className="stack gap-2">
            <p className="text-2">Envie este link para {inviteEmail}:</p>
            <div className="row gap-2" style={{ background: 'var(--color-surface-2)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
              <code className="grow" style={{ fontSize: 12.5, wordBreak: 'break-all' }}>{inviteLink}</code>
              <button type="button" className="icon-btn icon-btn-sm" onClick={() => navigator.clipboard?.writeText(inviteLink)} aria-label="Copiar link">
                <IconCopy size={14} aria-hidden />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
