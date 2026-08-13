import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { hasAdminCredentials } from './api/client'
import { getCachedInstanceConfig, useInstanceConfig } from './hooks/useInstanceConfig'
import { MapPage } from './pages/MapPage'
import { RelacoesPage } from './pages/RelacoesPage'

function AdminRedirect() {
  const navigate = useNavigate()
  const { config, loading } = useInstanceConfig()
  useEffect(() => {
    if (loading) return
    const cfg = getCachedInstanceConfig() ?? config
    if (cfg && !cfg.has_map_image) {
      navigate('/relacoes', { replace: true })
      return
    }
    navigate('/?gm=1', { replace: true })
  }, [navigate, config, loading])
  return null
}

function RootRoute() {
  const { config, loading } = useInstanceConfig()
  const cfg = getCachedInstanceConfig() ?? config
  if (loading && !cfg) return null
  if (cfg && !cfg.has_map_image && !hasAdminCredentials()) {
    return <Navigate to="/relacoes" replace />
  }
  return <MapPage />
}

function CatchAllRoute() {
  const { config, loading } = useInstanceConfig()
  const cfg = getCachedInstanceConfig() ?? config
  if (loading && !cfg) return null
  const target = cfg?.has_map_image ? '/' : '/relacoes'
  return <Navigate to={target} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/relacoes" element={<RelacoesPage />} />
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="*" element={<CatchAllRoute />} />
      </Routes>
    </BrowserRouter>
  )
}
