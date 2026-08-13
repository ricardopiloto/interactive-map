import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useInstanceConfig } from './hooks/useInstanceConfig'
import { MapPage } from './pages/MapPage'
import { RelacoesPage } from './pages/RelacoesPage'

function AdminRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/?gm=1', { replace: true })
  }, [navigate])
  return null
}

function RootRoute() {
  const { config, loading } = useInstanceConfig()
  if (loading) return null
  if (config && !config.has_map_image) {
    return <Navigate to="/relacoes" replace />
  }
  return <MapPage />
}

function CatchAllRoute() {
  const { config, loading } = useInstanceConfig()
  if (loading) return null
  const target = config?.has_map_image ? '/' : '/relacoes'
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
