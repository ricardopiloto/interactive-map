import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconUserCircle, IconLogout, IconLogin2 } from '@tabler/icons-react'
import { CURRENT_MESTRE } from '../../data/mock'
import { LanguageSelector } from './LanguageSelector'
import { ThemeSelector } from './ThemeSelector'

/**
 * @param includeTheme Quando true (padrão), o seletor de tema mora aqui —
 *   Home/Painel/Admin. O chrome de campanha usa <ThemeSelector /> à parte e
 *   passa false, igual ao app real (CodexHeader usa ThemeSelector + este
 *   componente lado a lado).
 */
export function UserMenu({ includeTheme = true }: { includeTheme?: boolean }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const loggedIn = typeof window !== 'undefined' && localStorage.getItem('codex-proto-auth') === '1'

  function logout() {
    localStorage.removeItem('codex-proto-auth')
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="row gap-1">
      {includeTheme && <ThemeSelector />}
      <LanguageSelector />
      <div className="dropdown" onMouseLeave={() => setOpen(false)}>
        <button type="button" className="icon-btn icon-btn-plain" onClick={() => setOpen((o) => !o)} aria-label="Menu do usuário">
          <IconUserCircle size={20} aria-hidden />
        </button>
        {open && (
          <div className="dropdown__panel">
            {loggedIn ? (
              <>
                <div className="text-3" style={{ padding: '4px 10px 6px' }}>{CURRENT_MESTRE.email}</div>
                <Link to="/painel" className="dropdown__item" onClick={() => setOpen(false)}>Minhas campanhas</Link>
                <button type="button" className="dropdown__item is-danger" onClick={logout}>
                  <span className="row gap-2"><IconLogout size={14} aria-hidden /> Sair</span>
                </button>
              </>
            ) : (
              <Link to="/entrar" className="dropdown__item" onClick={() => setOpen(false)}>
                <span className="row gap-2"><IconLogin2 size={14} aria-hidden /> Entrar</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
