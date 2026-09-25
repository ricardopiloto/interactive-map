import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminConsoleApi, type AdminCampaign, type AdminCampaignState } from '../../api/adminConsole'
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage'
import { Button, ConfirmDialog, Input, Select } from '../ui'

export function AdminCampaignsSection() {
  const { t } = useTranslation('comum')
  const apiError = useApiErrorMessage()
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<AdminCampaignState | ''>('')
  const [owners, setOwners] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminCampaign | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const response = await adminConsoleApi.campaigns({ q: query, estado: filter || undefined })
      setCampaigns(response.campanhas)
    } catch (err) { setError(apiError(err)) } finally { setLoading(false) }
  }, [query, filter, apiError])
  useEffect(() => { void load() }, [load])

  async function run(id: number, action: () => Promise<unknown>) {
    setBusy(id); setError(null)
    try { await action(); await load() } catch (err) { setError(apiError(err)) } finally { setBusy(null) }
  }

  return (
    <section aria-labelledby="admin-campaigns-heading" className="admin-section">
      <h2 id="admin-campaigns-heading">{t('admin.campaigns.title')}</h2>
      <div className="admin-console__filters">
        <label>{t('admin.campaigns.search')}<Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <label>{t('admin.campaigns.state')}<Select value={filter} onChange={(e) => setFilter(e.target.value as AdminCampaignState | '')}>
          <option value="">{t('admin.filters.all')}</option><option value="ativa">{t('admin.campaigns.active')}</option><option value="inativa">{t('admin.campaigns.inactive')}</option>
        </Select></label>
      </div>
      {error && <p role="alert" className="auth-card__error">{error}</p>}
      {loading ? <p>{t('admin.loading')}</p> : campaigns.length === 0 ? <p>{t('admin.empty')}</p> : (
        <div className="admin-console__table-wrap"><table className="admin-console__table">
          <thead><tr><th>{t('admin.campaigns.name')}</th><th>{t('admin.campaigns.owner')}</th><th>{t('admin.campaigns.state')}</th><th>{t('admin.campaigns.visibility')}</th><th>{t('admin.campaigns.modified')}</th><th>{t('admin.actions')}</th></tr></thead>
          <tbody>{campaigns.map((campaign) => <tr key={campaign.id}>
            <td>{campaign.nome}<small>{campaign.slug} · {campaign.sistema}</small></td>
            <td>{campaign.proprietario.email}</td><td>{campaign.activa ? t('admin.campaigns.active') : t('admin.campaigns.inactive')}</td>
            <td>{t(`admin.campaigns.visibilityValues.${campaign.visibilidade}`, { defaultValue: campaign.visibilidade })}</td>
            <td>{campaign.ultima_alteracao_em ? new Date(campaign.ultima_alteracao_em).toLocaleString() : t('admin.campaigns.dateUnknown')}</td>
            <td className="admin-console__actions">
              <div className="admin-console__transfer"><Input aria-label={t('admin.campaigns.transferEmail', { name: campaign.nome })} type="email" placeholder={t('admin.campaigns.newOwner')} value={owners[campaign.id] ?? ''} onChange={(e) => setOwners((old) => ({ ...old, [campaign.id]: e.target.value }))} />
                <Button size="sm" disabled={busy === campaign.id || !owners[campaign.id]?.trim()} onClick={() => void run(campaign.id, () => adminConsoleApi.transferCampaign(campaign.id, owners[campaign.id].trim()))}>{t('admin.campaigns.transfer')}</Button></div>
              <Button size="sm" disabled={busy === campaign.id} onClick={() => void run(campaign.id, () => adminConsoleApi.setCampaignActive(campaign.id, !campaign.activa))}>{campaign.activa ? t('admin.campaigns.deactivate') : t('admin.campaigns.reactivate')}</Button>
              <Button size="sm" variant="danger" disabled={busy === campaign.id} onClick={() => setDeleteTarget(campaign)}>{t('buttons.delete')}</Button>
            </td>
          </tr>)}</tbody>
        </table></div>
      )}
      <ConfirmDialog open={deleteTarget !== null} title={t('admin.campaigns.deleteTitle')} description={t('admin.campaigns.deleteConfirm', { name: deleteTarget?.nome, slug: deleteTarget?.slug })} danger confirmLabel={t('admin.campaigns.deletePermanent')} onCancel={() => setDeleteTarget(null)} onConfirm={() => {
        const target = deleteTarget; setDeleteTarget(null)
        if (target) void run(target.id, () => adminConsoleApi.deleteCampaign(target.id))
      }} />
    </section>
  )
}
