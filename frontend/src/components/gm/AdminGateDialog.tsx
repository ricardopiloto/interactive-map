import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Dialog, Input } from '../ui'

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
    <Dialog open onClose={onCancel} title={t('gate.title')}>
      <form onSubmit={handleSubmit}>
        <div className="ui-dialog__body">{t('gate.body')}</div>
        <div className="field">
          <label htmlFor="gm-password">{t('form.senha')}</label>
          <Input
            id="gm-password"
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
        <div className="ui-dialog__actions">
          <Button type="button" onClick={onCancel}>
            {t('buttons.cancel')}
          </Button>
          <Button variant="primary" type="submit">
            {t('buttons.enter')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
