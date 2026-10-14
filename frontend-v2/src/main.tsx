import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { CodexProvider } from "@/components/codex/codex-context";
import { AuthProvider } from "@/auth/AuthContext";
import { LoginPage } from "@/auth/Login";
import { CampaignLayout, CampaignIndex } from "@/routes/CampaignLayout";
import { MapPage } from "@/routes/index";
import { Relations } from "@/routes/relacoes";
import { RoutePage } from "@/routes/rota";
import { Sessions } from "@/routes/sessoes";
import { Timeline } from "@/routes/cronologia";
import { lazy, Suspense } from "react";
import "./styles.css";
import "./i18n";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("comum");
  const location = useLocation();
  const background = (location.state as { background?: typeof location } | null)?.background;
  return (
    <>
      <Routes location={background ?? location}>
        <Route
          path="/"
          element={<main className="p-8 font-display text-2xl">{t("v2.codex")}</main>}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/c/:slug" element={<CampaignLayout />}>
          <Route index element={<CampaignIndex />} />
          <Route path="mapa" element={<MapPage />} />
          <Route path="relacoes" element={<Relations />} />
          <Route path="rota" element={<RoutePage />} />
          <Route path="sessoes" element={<Sessions />} />
          <Route path="cronologia" element={<Timeline />} />
        </Route>
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
      </Routes>
      {background && (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
