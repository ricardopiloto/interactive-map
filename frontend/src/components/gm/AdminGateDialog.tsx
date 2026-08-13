import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface AdminGateDialogProps {
  error: boolean
  onSubmit: (password: string) => void
  onCancel: () => void
}

export function AdminGateDialog({ error, onSubmit, onCancel }: AdminGateDialogProps) {
  const { t } = useTranslation('comum')
  const [password, setPassword] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(password)
  }

  return (
    <div className="dialog-backdrop" style={{ zIndex: 100 }}>
      <form className="dialog" onSubmit={handleSubmit} role="dialog" aria-labelledby="gm-gate-title">
        <div className="dialog-title" id="gm-gate-title">
          {t('gate.title')}
        </div>
        <div className="dialog__body">
          <div className="dialog-body">{t('gate.body')}</div>
          <div className="field">
            <label htmlFor="gm-password">{t('form.senha')}</label>
            <input
              id="gm-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('form.senha')}
              autoFocus
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div style={{ fontSize: 12, color: 'var(--color-accent-300)' }}>{t('gate.wrongPassword')}</div>
          )}
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {t('buttons.cancel')}
          </button>
          <button type="submit" className="btn btn-primary">
            {t('buttons.enter')}
          </button>
        </div>
      </form>
    </div>
  )
}
