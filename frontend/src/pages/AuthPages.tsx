import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/client'
import { Button, Dialog } from '../components/ui'
import {
  createLoginModalState,
  locationPath,
  publicLoginBackground,
  readLoginModalState,
  safeInternalPath,
} from '../utils/loginNavigation'

export function LoginPage({ modal = false }: { modal?: boolean } = {}) {
  const { t } = useTranslation('comum')
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const modalState = modal ? readLoginModalState(location.state) : null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await authApi.login(email.trim(), password)
      const target = modalState
        ? modalState.postLoginTarget ?? locationPath(modalState.backgroundLocation)
        : safeInternalPath(params.get('next')) ?? '/painel'
      navigate(target, { replace: true, state: null })
    } catch {
      setError(t('auth.loginError'))
    } finally {
      setBusy(false)
    }
  }

  function closeModal() {
    if (!modalState) return
    if (modalState.closeFallback) {
      navigate(modalState.closeFallback, { replace: true, state: null })
      return
    }
    navigate(-1)
  }

  const form = (
    <form className={`auth-card${modalState ? ' auth-card--modal' : ''}`} onSubmit={onSubmit}>
        {modalState ? null : <h1>{t('auth.loginTitle')}</h1>}
        <p className="auth-card__hint">{t('auth.loginHint')}</p>
        <label>
          {t('auth.email')}
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          {t('form.senha')}
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="auth-card__error" role="alert">{error}</p>}
        <Button variant="primary" type="submit" disabled={busy}>
          {t('buttons.enter')}
        </Button>
    </form>
  )

  if (modalState) {
    return (
      <Dialog open onClose={closeModal} title={t('auth.loginTitle')}>
        <div className="auth-login-modal__close-row">
          <Button className="auth-login-close" variant="ghost" onClick={closeModal}>
            {t('buttons.close')}
          </Button>
        </div>
        {form}
      </Dialog>
    )
  }

  return <div className="auth-page">{form}</div>
}

export function ConvitePage() {
  const { t } = useTranslation('comum')
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setBusy(true)
    setError(null)
    try {
      await authApi.aceitarConvite(token, password)
      navigate('/painel', { replace: true })
    } catch {
      setError(t('auth.inviteError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>{t('auth.inviteTitle')}</h1>
        <p className="auth-card__hint">{t('auth.inviteHint')}</p>
        <label>
          {t('form.senha')}
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <p className="auth-card__error">{error}</p>}
        <Button variant="primary" type="submit" disabled={busy}>
          {t('auth.activate')}
        </Button>
      </form>
    </div>
  )
}

export function ResetPage() {
  const { t } = useTranslation('comum')
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setBusy(true)
    setError(null)
    try {
      await authApi.confirmarReset(token, password)
      navigate('/login', { replace: true, state: null })
    } catch {
      setError(t('auth.resetError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>{t('auth.resetTitle')}</h1>
        <p className="auth-card__hint">{t('auth.resetHint')}</p>
        <label>
          {t('form.senha')}
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <p className="auth-card__error">{error}</p>}
        <Button variant="primary" type="submit" disabled={busy}>
          {t('auth.resetSubmit')}
        </Button>
      </form>
    </div>
  )
}

export function ContaPage() {
  const { t } = useTranslation('comum')
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void authApi
      .me()
      .then((me) => {
        if (!cancelled) setEmail(me.email)
      })
      .catch(() => {
        if (!cancelled) navigate('/login', {
          replace: true,
          state: createLoginModalState(publicLoginBackground(), locationPath(location), '/'),
        })
      })
    return () => {
      cancelled = true
    }
  }, [location, navigate])

  async function logout() {
    await authApi.logout().catch(() => undefined)
    navigate('/login', { replace: true, state: null })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{t('auth.accountTitle')}</h1>
        <p>{email ?? '…'}</p>
        <p className="auth-card__hint">{t('auth.accountHint')}</p>
        <Button variant="primary" block type="button" onClick={() => void logout()}>
          {t('auth.logout')}
        </Button>
        <p>
          <Link to="/painel">{t('painel.nav')}</Link>
          {' · '}
          <Link to="/">{t('home.nav')}</Link>
        </p>
      </div>
    </div>
  )
}
