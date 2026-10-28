import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Link, MemoryRouter, Route, Routes, useLocation, useOutletContext } from "react-router-dom";
import { CampaignIndex, CampaignLayout } from "./CampaignLayout";
import { AuthProvider } from "@/auth/AuthContext";
import { CodexProvider } from "@/components/codex/codex-context";
import type { CampaignConfig } from "@/api/campaign";
import i18n from "@/i18n";

afterEach(() => vi.unstubAllGlobals());

function config(
  partial: Partial<CampaignConfig> & Pick<CampaignConfig, "id" | "slug" | "nome">,
): CampaignConfig {
  return {
    sistema: "teste",
    has_map_image: false,
    map_url: null,
    modulos_ativos: [],
    ...partial,
  };
}

function View() {
  const campaign = useOutletContext<CampaignConfig>();
  return <div data-testid="campaign-name">{campaign.nome}</div>;
}

function LocationProbe() {
  const location = useLocation();
  const campaign = useOutletContext<CampaignConfig>();
  return (
    <>
      <div data-testid="alias-location">
        {location.pathname}
        {location.search}
      </div>
      <div data-testid="campaign-name">{campaign.nome}</div>
    </>
  );
}

function Harness() {
  const location = useLocation();
  const canonical = /^\/c\/\d+(?:\/|$)/.test(location.pathname);
  const leaves = (
    <>
      <Route index element={<CampaignIndex />} />
      <Route path="mapa" element={<View />} />
      <Route path="relacoes" element={<LocationProbe />} />
      <Route path="rota" element={<div data-testid="rota-page">Rota</div>} />
      <Route path="ferramentas" element={<View />} />
      <Route path="fios" element={<View />} />
      <Route path="cronologia" element={<View />} />
    </>
  );
  return (
    <Routes>
      {canonical ? (
        <Route path="/c/:id/:slug" element={<CampaignLayout />}>
          {leaves}
        </Route>
      ) : (
        <Route path="/c/:slug" element={<CampaignLayout />}>
          {leaves}
        </Route>
      )}
    </Routes>
  );
}

it("troca a configuração ao trocar slug e redireciona campanha sem mapa para Relações", async () => {
  await i18n.changeLanguage("pt-BR");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) => {
      if (url === "/api/auth/me") return Promise.resolve(new Response("{}", { status: 401 }));
      const primeira = url === "/api/c/primeira/config" || url === "/api/c/1/config";
      return Promise.resolve(
        new Response(
          JSON.stringify(
            config({
              id: primeira ? 1 : 2,
              slug: primeira ? "primeira" : "segunda",
              nome: primeira ? "Primeira" : "Segunda",
              has_map_image: primeira,
            }),
          ),
          { status: 200 },
        ),
      );
    }),
  );
  render(
    <MemoryRouter initialEntries={["/c/primeira"]}>
      <AuthProvider>
        <CodexProvider>
          <Link to="/c/segunda">Trocar</Link>
          <Harness />
        </CodexProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
  await screen.findByText("Primeira");
  expect(screen.queryByTestId("site-footer")).toBeNull();
  for (const href of ["/termos", "/privacidade", "/contato"]) {
    expect(document.querySelector(`a[href="${href}"]`)).toBeNull();
  }
  await waitFor(() => expect(screen.getByTestId("campaign-name")).toHaveTextContent("Primeira"));
  fireEvent.click(screen.getByText("Trocar"));
  await screen.findByText("Segunda");
  expect(screen.queryByText("Primeira")).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByTestId("campaign-name")).toHaveTextContent("Segunda"));
  expect(screen.getAllByRole("link", { name: "Relações" })[0]).toHaveAttribute(
    "aria-current",
    "page",
  );
});

it("corrige o formato antigo para /c/{id}/{slug} sem perder a sub-rota nem a query", async () => {
  await i18n.changeLanguage("pt-BR");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) => {
      if (url === "/api/auth/me") return Promise.resolve(new Response("{}", { status: 401 }));
      if (String(url).endsWith("/config")) {
        return Promise.resolve(
          new Response(JSON.stringify(config({ id: 9, slug: "canonico", nome: "Canônica" })), {
            status: 200,
          }),
        );
      }
      return Promise.resolve(new Response("{}", { status: 404 }));
    }),
  );
  render(
    <MemoryRouter initialEntries={["/c/canonico/relacoes?personagem=42"]}>
      <AuthProvider>
        <CodexProvider>
          <Harness />
        </CodexProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(screen.getByTestId("alias-location")).toHaveTextContent(
      "/c/9/canonico/relacoes?personagem=42",
    ),
  );
  expect(screen.getByTestId("campaign-name")).toHaveTextContent("Canônica");
});

it("trata /c/{id}/rota como slug decorativo e não abre a tela de Rota", async () => {
  await i18n.changeLanguage("pt-BR");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) => {
      if (url === "/api/auth/me") return Promise.resolve(new Response("{}", { status: 401 }));
      if (String(url).endsWith("/config")) {
        return Promise.resolve(
          new Response(JSON.stringify(config({ id: 3, slug: "mesa", nome: "Mesa" })), {
            status: 200,
          }),
        );
      }
      return Promise.resolve(new Response("{}", { status: 404 }));
    }),
  );
  render(
    <MemoryRouter initialEntries={["/c/3/rota"]}>
      <AuthProvider>
        <CodexProvider>
          <Harness />
        </CodexProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(screen.getByTestId("alias-location")).toHaveTextContent("/c/3/mesa/relacoes"),
  );
  expect(screen.queryByTestId("rota-page")).not.toBeInTheDocument();
});

it("carrega a campanha pelo id mesmo com um texto de slug arbitrário", async () => {
  await i18n.changeLanguage("pt-BR");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) => {
      if (url === "/api/auth/me") return Promise.resolve(new Response("{}", { status: 401 }));
      if (url === "/api/c/3/config") {
        return Promise.resolve(
          new Response(JSON.stringify(config({ id: 3, slug: "mesa", nome: "Mesa" })), {
            status: 200,
          }),
        );
      }
      return Promise.resolve(new Response("{}", { status: 404 }));
    }),
  );
  render(
    <MemoryRouter initialEntries={["/c/3/texto-qualquer/relacoes"]}>
      <AuthProvider>
        <CodexProvider>
          <Harness />
        </CodexProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(screen.getByTestId("alias-location")).toHaveTextContent("/c/3/mesa/relacoes"),
  );
  expect(screen.getByTestId("campaign-name")).toHaveTextContent("Mesa");
});

function renderSeoCampaign(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <CodexProvider>
          <Harness />
        </CodexProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

it("mantém noindex desde o carregamento e em falha", async () => {
  await i18n.changeLanguage("pt-BR");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) => {
      if (url === "/api/auth/me") return Promise.resolve(new Response("{}", { status: 401 }));
      return new Promise(() => {});
    }),
  );
  const view = renderSeoCampaign("/c/3/mesa/relacoes");
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  view.unmount();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementation((url: string) =>
        Promise.resolve(new Response("{}", { status: url === "/api/auth/me" ? 401 : 404 })),
      ),
  );
  const failed = renderSeoCampaign("/c/9999/inexistente/relacoes");
  await screen.findByRole("alert");
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  failed.unmount();
});

for (const [section, indexable, expectedSection] of [
  ["relacoes", true, "relacoes"],
  ["relacoes", false, "relacoes"],
  ["rota", true, "rota"],
  ["ferramentas", true, "ferramentas"],
  ["fios", true, "fios"],
  ["cronologia", true, "linha-do-tempo"],
] as const) {
  it(`${section} com indexavel=${indexable} aplica a política e o canônico`, async () => {
    await i18n.changeLanguage("pt-BR");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url === "/api/auth/me") return Promise.resolve(new Response("{}", { status: 401 }));
        return Promise.resolve(
          new Response(
            JSON.stringify(config({ id: 3, slug: "mesa", nome: "Mesa", indexavel: indexable })),
            { status: 200 },
          ),
        );
      }),
    );
    const view = renderSeoCampaign(`/c/3/mesa/${section}`);
    await screen.findByTestId(section === "rota" ? "rota-page" : "campaign-name");
    const expectedRobots =
      indexable && (section === "relacoes" || section === "cronologia")
        ? "index, follow"
        : "noindex, nofollow";
    await waitFor(() =>
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
        "content",
        expectedRobots,
      ),
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${window.location.origin}/c/3/mesa/${expectedSection}`,
    );
    view.unmount();
  });
}
