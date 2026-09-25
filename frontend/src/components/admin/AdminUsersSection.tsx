import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminConsoleApi, type AdminUser, type AdminUserState } from '../../api/adminConsole'
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage'
import { Button, ConfirmDialog, Input, Select } from '../ui'

export function AdminUsersSection() {
  const { t } = useTranslation('comum')
  const apiError = useApiErrorMessage()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [email, setEmail] = useState('')
  const [stateFilter, setStateFilter] = useState<AdminUserState | ''>('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [link, setLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminConsoleApi.users({ email, estado: stateFilter || undefined })
      setUsers(response.usuarios)
    } catch (err) { setError(apiError(err)) } finally { setLoading(false) }
  }, [email, stateFilter, apiError])

  useEffect(() => { void load() }, [load])

  async function run(id: number, action: () => Promise<unknown>) {
    setBusy(id); setError(null)
    try { await action(); await load() } catch (err) { setError(apiError(err)) } finally { setBusy(null) }
  }

  async function invite() {
    setError(null)
    try {
      const result = await adminConsoleApi.invite(inviteEmail.trim())
      setLink(result.link)
      setInviteEmail('')
      await load()
    } catch (err) { setError(apiError(err)) }
  }

  async function copyLink() {
    if (link) await navigator.clipboard.writeText(link)
  }

  return (
    <section aria-labelledby="admin-users-heading" className="admin-section">
      <h2 id="admin-users-heading">{t('admin.users.title')}</h2>
      <div className="admin-console__filters">
        <label>{t('admin.users.search')}<Input value={email} onChange={(e) => setEmail(e.target.value)} type="search" /></label>
        <label>{t('admin.users.state')}<Select value={stateFilter} onChange={(e) => setStateFilter(e.target.value as AdminUserState | '')}>
          <option value="">{t('admin.filters.all')}</option>
          <option value="ativa">{t('admin.users.active')}</option>
          <option value="pendente">{t('admin.users.pending')}</option>
          <option value="inativa">{t('admin.users.inactive')}</option>
        </Select></label>
      </div>
      <form className="admin-console__invite" onSubmit={(e) => { e.preventDefault(); void invite() }}>
        <label>{t('admin.users.inviteEmail')}<Input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} /></label>
        <Button type="submit" variant="primary">{t('admin.users.invite')}</Button>
      </form>
      {link && <div role="status" className="admin-console__link"><Input readOnly value={link} aria-label={t('admin.users.generatedLink')} /><Button onClick={() => void copyLink()}>{t('admin.users.copy')}</Button><Button onClick={() => setLink(null)}>{t('buttons.close')}</Button></div>}
      {error && <p role="alert" className="auth-card__error">{error}</p>}
      {loading ? <p>{t('admin.loading')}</p> : users.length === 0 ? <p>{t('admin.empty')}</p> : (
        <div className="admin-console__table-wrap"><table className="admin-console__table">
          <thead><tr><th>{t('admin.users.email')}</th><th>{t('admin.users.state')}</th><th>{t('admin.users.admin')}</th><th>{t('admin.users.created')}</th><th>{t('admin.actions')}</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id}>
            <td>{user.email}{user.mesas_proprietarias.length > 0 && <small>{user.mesas_proprietarias.map((c) => c.nome).join(', ')}</small>}</td>
            <td>{t(`admin.users.${user.estado}`)}</td><td>{user.is_admin ? t('admin.users.yes') : t('admin.users.no')}</td>
            <td>{new Date(user.criado_em).toLocaleString()}</td>
            <td className="admin-console__actions">
              <Button size="sm" disabled={busy === user.id || user.estado !== 'ativa'} onClick={() => void run(user.id, async () => { const result = await adminConsoleApi.reset(user.id); setLink(result.link) })}>{t('admin.users.reset')}</Button>
              <Button size="sm" disabled={busy === user.id || user.estado === 'pendente' || user.mesas_proprietarias.length > 0 || (user.is_admin && user.estado === 'ativa')} onClick={() => void run(user.id, () => adminConsoleApi.setUserActive(user.id, user.estado !== 'ativa'))}>{user.estado === 'inativa' ? t('admin.users.reactivate') : t('admin.users.deactivate')}</Button>
              <Button size="sm" variant="danger" disabled={busy === user.id || user.mesas_proprietarias.length > 0 || (user.is_admin && user.estado === 'ativa')} onClick={() => setDeleteTarget(user)}>{t('buttons.delete')}</Button>
            </td>
          </tr>)}</tbody>
        </table></div>
      )}
      <ConfirmDialog open={deleteTarget !== null} title={t('admin.users.deleteTitle')} description={t('admin.users.deleteConfirm', { email: deleteTarget?.email })} danger confirmLabel={t('buttons.delete')} onCancel={() => setDeleteTarget(null)} onConfirm={() => {
        const target = deleteTarget
        setDeleteTarget(null)
        if (target) void run(target.id, () => adminConsoleApi.deleteUser(target.id))
      }} />
    </section>
  )
}
