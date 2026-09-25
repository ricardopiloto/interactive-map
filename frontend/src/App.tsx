import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigationType,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { setCampaignSlug } from './api/campaignSlug'
import { EditModeProvider } from './context/EditModeContext'
import { getCachedInstanceConfig, useInstanceConfig } from './hooks/useInstanceConfig'
import { AdminConvitesPage } from './pages/AdminConvitesPage'
import { AdminConsolePage } from './pages/AdminConsolePage'
import { ContaPage, ConvitePage, LoginPage, ResetPage } from './pages/AuthPages'
import { CampaignMissingPage } from './pages/CampaignMissingPage'
import { HomePage } from './pages/HomePage'
import { ExplorarPage } from './pages/ExplorarPage'
import { MapPage } from './pages/MapPage'
import { PainelPage } from './pages/PainelPage'
import { NovoCodexPage } from './pages/NovoCodexPage'
import { RelacoesPage } from './pages/RelacoesPage'
import { RotaPage } from './pages/RotaPage'
import { SessoesPage } from './pages/SessoesPage'
import { LinhaTempoPage } from './pages/LinhaTempoPage'
import { StyleGuidePage } from './pages/StyleGuidePage'
import { createLoginModalState, publicLoginBackground, readLoginModalState } from './utils/loginNavigation'
import { applyCampaignGenre, clearCampaignGenre } from './theme/campaignGenre'

function CampaignShell({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>()
  const { config, loading, notFound, error } = useInstanceConfig(slug)
  const cfg = (slug ? getCachedInstanceConfig(slug) : null) ?? config

  useEffect(() => {
    setCampaignSlug(slug ?? null)
    return () => setCampaignSlug(null)
  }, [slug])

  useEffect(() => {
    if (!cfg?.nome) {
      document.title = 'Campaign Codex'
      return
    }
    document.title = `${cfg.nome} · Campaign Codex`
  }, [cfg?.nome])

  useEffect(() => {
    if (!cfg) return
    applyCampaignGenre(cfg.genero)
    return () => clearCampaignGenre()
  }, [cfg, cfg?.genero])

  if (!slug) return <CampaignMissingPage />
  if (loading && !cfg) return null
  if (notFound || error) return <CampaignMissingPage />
  return <EditModeProvider slug={slug}>{children}</EditModeProvider>
}

function CampaignMapRoute() {
  return <MapPage />
}

function AdminRedirect() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  useEffect(() => {
    if (!slug) return
    const next = `/c/${slug}`
    navigate(`/login?next=${encodeURIComponent(next)}`, {
      replace: true,
      state: createLoginModalState(publicLoginBackground(), next, '/'),
    })
  }, [navigate, slug])
  return null
}

function AppRoutes() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const loginModalState = readLoginModalState(location.state)
  const isLoginModal =
    location.pathname === '/login' && navigationType !== 'POP' && loginModalState !== null

  return (
    <>
      <Routes location={isLoginModal ? loginModalState!.backgroundLocation : location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explorar" element={<ExplorarPage />} />
        <Route path="/painel" element={<PainelPage />} />
        <Route path="/painel/novo" element={<NovoCodexPage />} />
        <Route path="/admin/convites" element={<AdminConvitesPage />} />
        <Route path="/admin" element={<AdminConsolePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/convite/:token" element={<ConvitePage />} />
        <Route path="/reset/:token" element={<ResetPage />} />
        <Route path="/conta" element={<ContaPage />} />
        <Route path="/relacoes" element={<Navigate to="/" replace />} />
        <Route
          path="/c/:slug"
          element={
            <CampaignShell>
              <CampaignMapRoute />
            </CampaignShell>
          }
        />
        <Route
          path="/c/:slug/relacoes"
          element={
            <CampaignShell>
              <RelacoesPage />
            </CampaignShell>
          }
        />
        <Route
          path="/c/:slug/rota"
          element={
            <CampaignShell>
              <RotaPage />
            </CampaignShell>
          }
        />
        <Route
          path="/c/:slug/sessoes"
          element={
            <CampaignShell>
              <SessoesPage />
            </CampaignShell>
          }
        />
        <Route
          path="/c/:slug/linha-do-tempo"
          element={
            <CampaignShell>
              <LinhaTempoPage />
            </CampaignShell>
          }
        />
        <Route
          path="/c/:slug/admin"
          element={
            <CampaignShell>
              <AdminRedirect />
            </CampaignShell>
          }
        />
        {import.meta.env.DEV ? (
          <Route path="/__styleguide" element={<StyleGuidePage />} />
        ) : null}
        <Route path="*" element={<CampaignMissingPage />} />
      </Routes>
      {isLoginModal ? (
        <Routes>
          <Route path="/login" element={<LoginPage modal />} />
        </Routes>
      ) : null}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
