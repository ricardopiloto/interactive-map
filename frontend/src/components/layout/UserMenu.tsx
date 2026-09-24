import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/client'
import { DropdownMenu } from '../ui'
import { LanguageSelector } from './LanguageSelector'
import {
  readThemePreference,
  setThemePreference,
  type ThemePreference,
} from '../../theme/themePreference'
import { createLoginModalState, locationPath } from '../../utils/loginNavigation'

/**
 * @param includeTheme When true (default), theme Auto/Light/Dark lives in this menu
 *   (Home/Painel). Campaign chrome uses ThemeSelector instead and passes false.
 */
export function UserMenu({ includeTheme = true }: { includeTheme?: boolean }) {
  const { t } = useTranslation('comum')
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState<string | null | undefined>(undefined)
  const [isAdmin, setIsAdmin] = useState(false)
  const [theme, setTheme] = useState<ThemePreference>(() => readThemePreference())

  useEffect(() => {
    let cancelled = false
    void authApi
      .me()
      .then((me) => {
        if (cancelled) return
        setEmail(me.email)
        setIsAdmin(me.is_admin)
      })
      .catch(() => {
        if (!cancelled) {
          setEmail(null)
          setIsAdmin(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function logout() {
    await authApi.logout().catch(() => undefined)
    setEmail(null)
    window.location.href = '/'
  }

  function chooseTheme(next: ThemePreference) {
    setThemePreference(next)
    setTheme(next)
  }

  const next = encodeURIComponent(locationPath(location))
  const items: { id: string; label: string; onSelect: () => void; danger?: boolean }[] = []

  if (email) {
    if (isAdmin) {
      items.push({
        id: 'admin-convites',
        label: t('adminConvites.navLabel'),
        onSelect: () => navigate('/admin/convites'),
      })
    }
    items.push({
      id: 'logout',
      label: t('auth.logout'),
      onSelect: () => void logout(),
      danger: true,
    })
  } else if (email === null) {
    items.push({
      id: 'login',
      label: t('buttons.enter'),
      onSelect: () => {
        navigate(`/login?next=${next}`, {
          state: createLoginModalState(location, locationPath(location)),
        })
      },
    })
  }

  if (includeTheme) {
    items.push(
      {
        id: 'theme-auto',
        label: `${t('theme.auto')}${theme === 'auto' ? ' ✓' : ''}`,
        onSelect: () => chooseTheme('auto'),
      },
      {
        id: 'theme-light',
        label: `${t('theme.light')}${theme === 'light' ? ' ✓' : ''}`,
        onSelect: () => chooseTheme('light'),
      },
      {
        id: 'theme-dark',
        label: `${t('theme.dark')}${theme === 'dark' ? ' ✓' : ''}`,
        onSelect: () => chooseTheme('dark'),
      },
    )
  }

  return (
    <div className="user-menu">
      {email ? (
        <Link to="/painel" className="user-menu__painel">
          {t('painel.nav')}
        </Link>
      ) : null}
      <LanguageSelector />
      <DropdownMenu label={t('userMenu.aria')} items={items} />
    </div>
  )
}
