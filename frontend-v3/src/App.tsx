import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { SearchPalette } from './components/SearchPalette'
import { Dashboard } from './pages/Dashboard'
import { Codex } from './pages/Codex'
import { Mapa } from './pages/Mapa'
import { Relacoes } from './pages/Relacoes'
import { Timeline } from './pages/Timeline'
import { Prep } from './pages/Prep'
import { Sessoes } from './pages/Sessoes'

const TITLES: Record<string, string> = {
  '/': 'Painel',
  '/codex': 'Codex',
  '/mapa': 'Mapa',
  '/relacoes': 'Rede de Relações',
  '/linha-do-tempo': 'Linha do Tempo',
  '/prep': 'Preparação',
  '/sessoes': 'Sessões',
}

function tituloPara(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname]
  const base = '/' + (pathname.split('/')[1] ?? '')
  return TITLES[base] ?? 'Campaign Codex'
}

export function App() {
  const [gmMode, setGmMode] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar
          title={tituloPara(location.pathname)}
          gmMode={gmMode}
          onToggleGm={() => setGmMode((v) => !v)}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/codex" element={<Codex gmMode={gmMode} />} />
            <Route path="/codex/:tipo" element={<Codex gmMode={gmMode} />} />
            <Route path="/codex/:tipo/:id" element={<Codex gmMode={gmMode} />} />
            <Route path="/mapa" element={<Mapa gmMode={gmMode} />} />
            <Route path="/relacoes" element={<Relacoes gmMode={gmMode} />} />
            <Route path="/linha-do-tempo" element={<Timeline />} />
            <Route path="/prep" element={<Prep />} />
            <Route path="/prep/:capituloId" element={<Prep />} />
            <Route path="/sessoes" element={<Sessoes />} />
          </Routes>
        </main>
      </div>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
