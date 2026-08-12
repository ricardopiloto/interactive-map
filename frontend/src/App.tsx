import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { MapPage } from './pages/MapPage'
import { RelacoesPage } from './pages/RelacoesPage'

function AdminRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/?gm=1', { replace: true })
  }, [navigate])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/relacoes" element={<RelacoesPage />} />
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
