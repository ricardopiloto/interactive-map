import i18n from "@/i18n";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HomePage } from "./home";
import { ExplorarPage } from "./explorar";
import { NovoCodexPage } from "./novo";
import { PainelPage } from "./painel";
import { ContaPage } from "./conta";
import { AdminConsolePage } from "./admin";
import { AdminConvitesPage } from "./admin-convites";
import { ConvitePage } from "./convite";
import { ResetPage } from "./reset";
import { RegistoPage } from "./registo";
import { EsqueciSenhaPage } from "./esqueci-senha";
import { LegalPage } from "./legal";
import { NotFoundPage } from "./not-found";

vi.mock("@/auth/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false, logout: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/components/site/SiteHeader", () => ({ SiteHeader: () => null }));
vi.mock("@/components/admin/AdminUsersSection", () => ({ AdminUsersSection: () => null }));
vi.mock("@/components/admin/AdminCampaignsSection", () => ({ AdminCampaignsSection: () => null }));
vi.mock("@/api/campanhas", () => ({
  campanhasApi: {
    catalogo: () => Promise.resolve({ campanhas: [] }),
    minhas: () => Promise.resolve({ campanhas: [] }),
  },
}));
vi.mock("@/api/adminConsole", () => ({
  adminConsoleApi: { inviteConfig: () => Promise.resolve({ envio_email_disponivel: false }) },
}));
vi.mock("@/api/auth", () => ({
  authApi: {
    registerConfig: () => Promise.resolve({ modo: "fechado" }),
    resetConfig: () => Promise.resolve({ disponivel: false, turnstile_site_key: null }),
  },
}));

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
});
afterEach(cleanup);

const pages = [
  ["home", <HomePage />],
  ["explorar", <ExplorarPage />],
  ["novo", <NovoCodexPage />],
  ["painel", <PainelPage />],
  ["conta", <ContaPage />],
  ["admin", <AdminConsolePage />],
  ["admin-convites", <AdminConvitesPage />],
  ["convite", <ConvitePage />],
  ["reset", <ResetPage />],
  ["registo", <RegistoPage />],
  ["esqueci-senha", <EsqueciSenhaPage />],
  ["legal", <LegalPage kind="terms" />],
  ["not-found", <NotFoundPage />],
] as const;

for (const [name, element] of pages) {
  it(`shows footer on ${name}`, () => {
    render(<MemoryRouter>{element}</MemoryRouter>);
    expect(screen.getByTestId("site-footer")).toBeTruthy();
  });
}
