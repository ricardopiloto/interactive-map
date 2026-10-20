import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { EditModeProvider } from "@/auth/EditModeContext";
import type { CampaignConfig } from "@/api/campaign";
import { CodexProvider } from "@/components/codex/codex-context";
import { TopBar } from "@/components/codex/Shell";
import i18n from "@/i18n";
import { Tools } from "./ferramentas";

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

const campaign: CampaignConfig = {
  id: 1,
  slug: "alpha",
  nome: "Alpha",
  sistema: "wfrp4e",
  has_map_image: false,
  map_url: null,
  modulos_ativos: [],
};

function installApi(role: "gm" | "player") {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const respond = (body: unknown, status = 200) =>
        new Response(JSON.stringify(body), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      if (url === "/api/auth/me") {
        return role === "gm"
          ? respond({ id: 1, email: "gm@teste.local", is_admin: false })
          : new Response("{}", { status: 401 });
      }
      if (url.endsWith("/admin/session")) return respond({ papel: "dono" });
      const roll = url.match(/\/admin\/geradores\/(\w+)\?lang=([\w-]+)$/);
      if (roll && (init?.method ?? "GET").toUpperCase() === "POST") {
        calls.push(`${roll[1]}:${roll[2]}`);
        return respond({
          tipo: roll[1],
          resultado: `Resultado ${roll[1]}`,
          sistema_usado: "wfrp4e",
          fallback: roll[1] === "item",
        });
      }
      return new Response("{}", { status: 404 });
    }),
  );
  return calls;
}

function renderTools(role: "gm" | "player", gmToggle: boolean) {
  const calls = installApi(role);
  if (gmToggle) sessionStorage.setItem("codex.editMode.alpha", "1");
  function Frame() {
    return (
      <EditModeProvider slug="alpha">
        <TopBar campaign={campaign} />
        <Outlet context={campaign} />
      </EditModeProvider>
    );
  }
  render(
    <MemoryRouter initialEntries={["/c/alpha/ferramentas"]}>
      <AuthProvider>
        <CodexProvider>
          <Routes>
            <Route path="/c/:slug" element={<Frame />}>
              <Route path="ferramentas" element={<Tools />} />
            </Route>
          </Routes>
        </CodexProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
  return calls;
}

it("mantém o item de navegação visível para o mestre com o toggle de Modo GM desligado", async () => {
  renderTools("gm", false);

  expect(await screen.findByRole("heading", { name: "Ferramentas" })).toBeVisible();
  const nav = screen.getAllByRole("navigation", { name: "Vistas da campanha" })[0]!;
  expect(within(nav).getByRole("link", { name: /Ferramentas/ })).toBeVisible();
  expect(screen.queryByText("Camada de edição ativa")).not.toBeInTheDocument();
});

it("sorteia cada gerador no idioma atual e sinaliza o conteúdo genérico", async () => {
  const calls = renderTools("gm", false);
  await screen.findByRole("heading", { name: "Ferramentas" });

  const panels = screen.getAllByRole("region");
  expect(panels).toHaveLength(4);
  for (const panel of panels)
    fireEvent.click(within(panel).getByRole("button", { name: "Sortear" }));

  expect(await screen.findByText("Resultado nome")).toBeVisible();
  expect(screen.getByText("Resultado rumor")).toBeVisible();
  expect(screen.getByText("Resultado clima")).toBeVisible();
  expect(screen.getByText("Resultado item")).toBeVisible();
  expect(screen.getAllByText("Conteúdo genérico")).toHaveLength(1);
  expect(calls.sort()).toEqual(["clima:pt-BR", "item:pt-BR", "nome:pt-BR", "rumor:pt-BR"]);
});

it("não mostra o item de navegação nem a tela para quem não é mestre", async () => {
  const calls = renderTools("player", false);

  expect(await screen.findByRole("alert")).toHaveTextContent("disponível apenas para o mestre");
  await waitFor(() => expect(screen.queryByRole("button", { name: "Sortear" })).toBeNull());
  const nav = screen.getAllByRole("navigation", { name: "Vistas da campanha" })[0]!;
  expect(within(nav).queryByRole("link", { name: /Ferramentas/ })).toBeNull();
  expect(calls).toEqual([]);
});
