import { render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import i18n from "@/i18n";
import { HomePage } from "./home";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubHomeRequests(authenticated: boolean) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) => {
      if (String(url).includes("/api/auth/me")) {
        return Promise.resolve(
          authenticated
            ? new Response(JSON.stringify({ id: 1, email: "gm@example.com", is_admin: false }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              })
            : new Response("{}", { status: 401 }),
        );
      }
      if (String(url).includes("/api/campanhas/catalogo")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              campanhas: [{ slug: "mesa-aberta", nome: "Mesa Aberta", sistema: "wfrp4e" }],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        );
      }
      return Promise.resolve(new Response("{}", { status: 404 }));
    }),
  );
}

function renderHome() {
  render(
    <MemoryRouter>
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

it("carrega a home sem autenticação, com vitrine", async () => {
  await i18n.changeLanguage("pt-BR");
  stubHomeRequests(false);
  renderHome();

  expect(await screen.findByRole("heading", { level: 1, name: /mapa, o elenco/i })).toBeVisible();
  expect(
    screen.getByRole("img", {
      name: "Mapa interativo de uma campanha no Campaign Codex, com locais, rotas e o grupo",
    }),
  ).toHaveAttribute("width", "1200");
  expect(await screen.findByRole("article", { name: "Mesa Aberta" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Ver campanhas abertas" })).toHaveAttribute(
    "href",
    "/explorar",
  );
  expect(screen.getByRole("heading", { level: 2, name: "Modo mestre" })).toBeVisible();
  expect(
    screen.getByText(
      "Edite tudo na mesma tela em que joga. O que ainda não foi revelado, os jogadores não veem.",
    ),
  ).toBeVisible();
  const section = screen
    .getByRole("heading", { level: 2, name: "Os dados da mesa são seus" })
    .closest("section");
  expect(section).not.toBeNull();
  const content = within(section!);
  expect(content.getByRole("heading", { level: 3, name: "Hospede você mesmo" })).toBeVisible();
  expect(
    content.getByRole("heading", { level: 3, name: "Ou use a versão hospedada" }),
  ).toBeVisible();
  expect(content.getByText(/Suba na sua própria infraestrutura/)).toBeVisible();
  expect(content.getByText(/Crie sua conta de mestre agora/)).toBeVisible();
  expect(content.getByRole("link", { name: "Ver repositório no GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/ricardopiloto/interactive-map",
  );
  expect(content.getByRole("link", { name: "Ver repositório no GitHub" })).toHaveAttribute(
    "target",
    "_blank",
  );
  expect(content.getByRole("link", { name: "Ver repositório no GitHub" })).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  expect(content.getByRole("link", { name: "Entrar como mestre" })).toHaveAttribute(
    "href",
    "/login?next=/painel",
  );

  expect(document.documentElement).not.toHaveAttribute("data-genre");
});

it("mostra o novo conteúdo em inglês e leva mestres autenticados ao painel", async () => {
  await i18n.changeLanguage("en");
  stubHomeRequests(true);
  renderHome();

  expect(
    screen.getByRole("img", {
      name: "Interactive campaign map in Campaign Codex, showing places, routes and the party",
    }),
  ).toBeVisible();
  expect(screen.getByRole("heading", { level: 2, name: "GM mode" })).toBeVisible();
  expect(
    screen.getByText(
      "Edit everything on the same screen you play from. What hasn't been revealed yet, players don't see.",
    ),
  ).toBeVisible();
  const section = screen
    .getByRole("heading", { level: 2, name: "Your table's data is yours" })
    .closest("section");
  expect(section).not.toBeNull();
  const content = within(section!);
  expect(content.getByRole("heading", { level: 3, name: "Self-host it" })).toBeVisible();
  expect(
    content.getByRole("heading", { level: 3, name: "Or use the hosted version" }),
  ).toBeVisible();
  expect(content.getByText(/Run it on your own infrastructure/)).toBeVisible();
  expect(content.getByText(/Create your GM account now/)).toBeVisible();
  expect(content.getByRole("link", { name: "View repository on GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/ricardopiloto/interactive-map",
  );
  expect(await content.findByRole("link", { name: "Sign in as GM" })).toHaveAttribute(
    "href",
    "/painel",
  );
});
