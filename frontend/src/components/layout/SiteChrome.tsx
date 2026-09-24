import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { UserMenu } from './UserMenu'
import './SiteChrome.css'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('comum')

  return (
    <div className="site-chrome">
      <header className="site-chrome__header">
        <Link to="/" className="site-chrome__brand">
          {t('brand')}
        </Link>
        <nav className="site-chrome__nav" aria-label={t('nav.mainAria')}>
          <Link to="/">{t('home.nav')}</Link>
          <Link to="/explorar">{t('explorar.nav')}</Link>
          <UserMenu />
        </nav>
      </header>
      <main className="site-chrome__main">{children}</main>
    </div>
  )
}
