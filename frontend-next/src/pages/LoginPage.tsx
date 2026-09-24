import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconArrowRight, IconMailCheck } from '@tabler/icons-react'
import { useCampaignGenre } from '../theme/ThemeContext'
import './LoginPage.css'

export function LoginPage() {
  useCampaignGenre('fantasia')
  const navigate = useNavigate()
  const [email, setEmail] = useState('ricardo@example.com')
  const [senha, setSenha] = useState('••••••••')
  const [inviteMode, setInviteMode] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('codex-proto-auth', '1')
    navigate('/painel')
  }

  return (
    <div className="login-page">
      <div className="card login-page__card">
        <h1 style={{ margin: '0 0 4px', fontSize: 22 }}>Entrar como mestre</h1>
        <p className="text-2" style={{ marginBottom: 20 }}>
          {inviteMode ? 'Defina sua senha para ativar a conta.' : 'Só mestres têm conta — jogadores acessam direto pelo link da campanha.'}
        </p>

        {!inviteMode ? (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="login-email">E-mail</label>
              <input id="login-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="login-senha">Senha</label>
              <input id="login-senha" type="password" className="input" value={senha} onChange={(e) => setSenha(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 8 }}>
              Entrar <IconArrowRight size={16} aria-hidden />
            </button>
          </form>
        ) : (
          <div className="stack gap-3">
            <div className="row gap-2" style={{ background: 'var(--color-accent-wash)', padding: 12, borderRadius: 'var(--radius-md)', color: 'var(--color-accent)' }}>
              <IconMailCheck size={18} aria-hidden />
              <span style={{ fontSize: 13 }}>Link de convite reconhecido — este passo é só ilustrativo no protótipo.</span>
            </div>
            <div className="field">
              <label htmlFor="invite-senha">Crie uma senha</label>
              <input id="invite-senha" type="password" className="input" placeholder="Mínimo 8 caracteres" />
            </div>
            <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => { localStorage.setItem('codex-proto-auth', '1'); navigate('/painel') }}>Ativar conta</button>
          </div>
        )}

        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={() => setInviteMode((v) => !v)}>
          {inviteMode ? 'Já tenho conta — entrar' : 'Recebi um convite do super-admin'}
        </button>

        <div className="divider" />
        <Link to="/explorar" className="text-2" style={{ fontSize: 13 }}>← Sou jogador, quero só ver uma campanha</Link>
      </div>
    </div>
  )
}
