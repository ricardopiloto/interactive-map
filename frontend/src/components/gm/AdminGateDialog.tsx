import { useState, type FormEvent } from 'react'

interface AdminGateDialogProps {
  error: boolean
  onSubmit: (password: string) => void
  onCancel: () => void
}

export function AdminGateDialog({ error, onSubmit, onCancel }: AdminGateDialogProps) {
  const [password, setPassword] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(password)
  }

  return (
    <div className="dialog-backdrop" style={{ zIndex: 100 }}>
      <form className="dialog" onSubmit={handleSubmit} role="dialog" aria-labelledby="gm-gate-title">
        <div className="dialog-title" id="gm-gate-title">
          Acesso do Mestre
        </div>
        <div className="dialog-body">Área restrita de edição da campanha.</div>
        <div className="field">
          <label htmlFor="gm-password">Senha</label>
          <input
            id="gm-password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            autoFocus
            autoComplete="current-password"
          />
        </div>
        {error && (
          <div style={{ fontSize: 12, color: 'var(--color-accent-300)' }}>Senha incorreta.</div>
        )}
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Entrar
          </button>
        </div>
      </form>
    </div>
  )
}
