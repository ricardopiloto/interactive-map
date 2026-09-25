import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { SiteChrome } from '../components/layout/SiteChrome'
import { AdminUsersSection } from '../components/admin/AdminUsersSection'
import { AdminCampaignsSection } from '../components/admin/AdminCampaignsSection'
import { createLoginModalState, publicLoginBackground } from '../utils/loginNavigation'
import './AdminConsolePage.css'

type AdminTab = 'users' | 'campaigns'

export function AdminConsolePage() {
  const { t } = useTranslation('comum')
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<AdminTab>('users')

  useEffect(() => {
    let cancelled = false
    void authApi.me().then((me) => {
      if (cancelled) return
      if (!me.is_admin) {
        navigate('/painel', { replace: true })
        return
      }
      setReady(true)
    }).catch(() => {
      if (!cancelled) {
        navigate('/login?next=/admin', {
          replace: true,
          state: createLoginModalState(publicLoginBackground(), '/admin', '/'),
        })
      }
    })
    return () => { cancelled = true }
  }, [navigate])

  if (!ready) return null
  return (
    <SiteChrome>
      <main className="admin-console">
        <h1>{t('admin.title')}</h1>
        <div role="tablist" aria-label={t('admin.tabs')} className="admin-console__tabs">
          <button role="tab" aria-selected={tab === 'users'} onClick={() => setTab('users')}>
            {t('admin.users.title')}
          </button>
          <button role="tab" aria-selected={tab === 'campaigns'} onClick={() => setTab('campaigns')}>
            {t('admin.campaigns.title')}
          </button>
        </div>
        {tab === 'users' ? <AdminUsersSection /> : <AdminCampaignsSection />}
      </main>
    </SiteChrome>
  )
}
