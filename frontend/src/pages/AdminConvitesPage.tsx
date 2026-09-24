import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { adminConvitesApi, authApi } from '../api/client'
import { Button, Input } from '../components/ui'
import { SiteChrome } from '../components/layout/SiteChrome'
import { useApiErrorMessage } from '../hooks/useApiErrorMessage'
import { createLoginModalState, publicLoginBackground } from '../utils/loginNavigation'

export function AdminConvitesPage() {
  const { t } = useTranslation('comum')
  const navigate = useNavigate()
  const apiError = useApiErrorMessage()
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ email: string; link: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    void authApi
      .me()
      .then((me) => {
        if (cancelled) return
        if (!me.is_admin) {
          navigate('/painel', { replace: true })
          return
        }
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) {
          navigate('/login?next=/admin/convites', {
            replace: true,
            state: createLoginModalState(publicLoginBackground(), '/admin/convites', '/'),
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const result = await adminConvitesApi.criar(email.trim())
      setCreated(result)
      setCopied(false)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  function copyLink() {
    if (!created) return
    void navigator.clipboard.writeText(created.link).then(() => setCopied(true))
  }

  function again() {
    setCreated(null)
    setEmail('')
    setError(null)
    setCopied(false)
  }

  if (!ready) return null

  return (
    <SiteChrome>
      <div className="auth-card" style={{ margin: '48px auto' }}>
        <h1>{t('adminConvites.title')}</h1>
        <p className="auth-card__hint">{t('adminConvites.hint')}</p>

        {created ? (
          <>
            <div className="field">
              <label>{t('adminConvites.linkLabel')}</label>
              <Input value={created.link} readOnly onFocus={(e) => e.currentTarget.select()} />
              <p className="text-muted">{t('adminConvites.linkHint')}</p>
            </div>
            <Button type="button" variant="primary" block onClick={copyLink}>
              {copied ? t('adminConvites.copied') : t('adminConvites.copy')}
            </Button>
            <Button type="button" block onClick={again}>
              {t('adminConvites.another')}
            </Button>
          </>
        ) : (
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="admin-convite-email">{t('adminConvites.emailLabel')}</label>
              <Input
                id="admin-convite-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="auth-card__error">{error}</p>}
            <Button variant="primary" type="submit" disabled={busy} block>
              {t('adminConvites.submit')}
            </Button>
          </form>
        )}
      </div>
    </SiteChrome>
  )
}
