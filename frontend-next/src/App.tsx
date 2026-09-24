import { HashRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeContext'
import { CampaignsProvider } from './data/CampaignsStore'
import { LandingPage } from './pages/LandingPage'
import { ExplorePage } from './pages/ExplorePage'
import { LoginPage } from './pages/LoginPage'
import { CampaignLayout } from './pages/CampaignLayout'
import { MapPage } from './pages/MapPage'
import { RelacoesPage } from './pages/RelacoesPage'
import { RotaPage } from './pages/RotaPage'
import { SessoesPage } from './pages/SessoesPage'
import { MestrePainel } from './pages/MestrePainel'
import { NovoCodexWizard } from './pages/NovoCodexWizard'
import { AdminConsole } from './pages/AdminConsole'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProtoNav } from './components/layout/ProtoNav'

/**
 * HashRouter porque este protótipo é aberto direto de um arquivo/preview
 * estático, sem servidor configurado para reescrever rotas.
 */
export default function App() {
  return (
    <HashRouter>
      <CampaignsProvider>
        <ThemeProvider>
          <ProtoNav />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explorar" element={<ExplorePage />} />
            <Route path="/entrar" element={<LoginPage />} />
            <Route path="/painel" element={<MestrePainel />} />
            <Route path="/painel/novo" element={<NovoCodexWizard />} />
            <Route path="/admin" element={<AdminConsole />} />
            <Route path="/c/:slug" element={<CampaignLayout />}>
              <Route index element={<MapPage />} />
              <Route path="relacoes" element={<RelacoesPage />} />
              <Route path="rota" element={<RotaPage />} />
              <Route path="sessoes" element={<SessoesPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ThemeProvider>
      </CampaignsProvider>
    </HashRouter>
  )
}
