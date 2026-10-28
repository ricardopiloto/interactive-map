import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { CodexProvider } from "@/components/codex/codex-context";
import { AuthProvider } from "@/auth/AuthContext";
import { LoginPage } from "@/auth/Login";
import { RequireSession } from "@/components/site/RequireSession";
import { useCampaignRouteElements } from "@/routes/campaignRoutes";
import { HomePage } from "@/routes/home";
import { ExplorarPage } from "@/routes/explorar";
import { ConvitePage } from "@/routes/convite";
import { ContatoPage } from "@/routes/contato";
import { RegistoPage } from "@/routes/registo";
import { EsqueciSenhaPage } from "@/routes/esqueci-senha";
import { LegalPage } from "@/routes/legal";
import { ResetPage } from "@/routes/reset";
import { ContaPage } from "@/routes/conta";
import { PainelPage } from "@/routes/painel";
import { NovoCodexPage } from "@/routes/novo";
import { AdminConsolePage } from "@/routes/admin";
import { AdminConvitesPage } from "@/routes/admin-convites";
import { NotFoundPage } from "@/routes/not-found";
import { lazy, Suspense } from "react";
import "./styles.css";
import "./i18n";

const StyleGuide = import.meta.env.DEV
  ? lazy(() => import("@/routes/styleguide").then((m) => ({ default: m.StyleGuide })))
  : null;

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CodexProvider>
          <AppRoutes />
        </CodexProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  const campaignRoutes = useCampaignRouteElements();
  const background = (location.state as { background?: typeof location } | null)?.background;
  return (
    <>
      <Routes location={background ?? location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explorar" element={<ExplorarPage />} />
        <Route path="/convite/:token" element={<ConvitePage />} />
        <Route path="/reset/:token" element={<ResetPage />} />
        <Route
          path="/conta"
          element={
            <RequireSession>
              <ContaPage />
            </RequireSession>
          }
        />
        <Route
          path="/painel"
          element={
            <RequireSession>
              <PainelPage />
            </RequireSession>
          }
        />
        <Route
          path="/painel/novo"
          element={
            <RequireSession>
              <NovoCodexPage />
            </RequireSession>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireSession admin>
              <AdminConsolePage />
            </RequireSession>
          }
        />
        <Route
          path="/admin/convites"
          element={
            <RequireSession admin>
              <AdminConvitesPage />
            </RequireSession>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registo" element={<RegistoPage />} />
        <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
        <Route path="/contato" element={<ContatoPage />} />
        <Route path="/termos" element={<LegalPage kind="terms" />} />
        <Route path="/privacidade" element={<LegalPage kind="privacy" />} />
        {campaignRoutes}
        {StyleGuide && (
          <Route
            path="/__styleguide"
            element={
              <Suspense fallback={null}>
                <StyleGuide />
              </Suspense>
            }
          />
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {background && (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registo" element={<RegistoPage />} />
          <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
          <Route path="/contato" element={<ContatoPage />} />
          <Route path="/termos" element={<LegalPage kind="terms" />} />
          <Route path="/privacidade" element={<LegalPage kind="privacy" />} />
        </Routes>
      )}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
