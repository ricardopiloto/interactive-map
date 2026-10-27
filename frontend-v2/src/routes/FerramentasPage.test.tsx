import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { EditModeProvider } from "@/auth/EditModeContext";
import type { CampaignConfig } from "@/api/campaign";
import { CodexProvider } from "@/components/codex/codex-context";
import { TopBar } from "@/components/codex/Shell";
import i18n from "@/i18n";
import { acrescentarNota } from "@/api/geradores";
import { Tools } from "./ferramentas";

beforeEach(async () => {
  rows = [];
  patches = [];
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

interface Row {
  id: number;
  numero: number;
  titulo: string;
  notas_preparo: string;
  visivel_para_todos: boolean;
  resumo: string;
}

let rows: Row[] = [];
let patches: { id: number; body: Record<string, unknown> }[] = [];

function installApi(role: "gm" | "editor" | "player" | "visitor") {
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
        return role === "gm" || role === "editor"
          ? respond({ id: 1, email: "gm@teste.local", is_admin: false })
          : new Response("{}", { status: 401 });
      }
      if (url.endsWith("/admin/session"))
        return respond({ papel: role === "gm" ? "dono" : "membro" });
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
      const method = (init?.method ?? "GET").toUpperCase();
      if (url.endsWith("/admin/sessoes") && method === "GET") return respond({ sessoes: rows });
      const one = url.match(/\/admin\/sessoes\/(\d+)$/);
      const row = one ? rows.find((item) => item.id === Number(one[1])) : undefined;
      if (row && method === "GET") return respond(row);
      if (row && method === "PATCH") {
        const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
        patches.push({ id: row.id, body });
        Object.assign(row, body);
        return respond(row);
      }
      return new Response("{}", { status: 404 });
    }),
  );
  return calls;
}

function renderTools(role: "gm" | "editor" | "player" | "visitor", gmToggle: boolean) {
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

function row(patch: Partial<Row> & Pick<Row, "id" | "numero" | "titulo">): Row {
  return { notas_preparo: "", visivel_para_todos: true, resumo: "", ...patch };
}

async function rollRumor() {
  renderTools("gm", false);
  await screen.findByRole("heading", { name: "Ferramentas" });
  const panel = screen.getAllByRole("region")[1]!;
  fireEvent.click(within(panel).getByRole("button", { name: "Sortear" }));
  await within(panel).findByText("Resultado rumor");
  return panel;
}

it("acrescenta o resultado ao fim das notas de uma sessão oculta, sem tocar no resto", async () => {
  rows = [
    row({ id: 1, numero: 3, titulo: "Já jogada", visivel_para_todos: true }),
    row({
      id: 2,
      numero: 5,
      titulo: "A emboscada",
      visivel_para_todos: false,
      notas_preparo: "Cena 1: taverna",
      resumo: "texto do resumo",
    }),
  ];
  const panel = await rollRumor();

  fireEvent.click(within(panel).getByRole("button", { name: "Enviar para preparo" }));
  const group = await within(panel).findByRole("group");
  expect(within(group).getAllByRole("button")).toHaveLength(1);
  expect(within(group).queryByText(/Já jogada/)).not.toBeInTheDocument();
  fireEvent.click(within(group).getByRole("button", { name: /A emboscada/ }));

  expect(
    await within(panel).findByText("Acrescentado às notas de preparo da sessão 5."),
  ).toBeVisible();
  expect(patches).toEqual([
    { id: 2, body: { notas_preparo: "Cena 1: taverna\n- Rumor: Resultado rumor" } },
  ]);
  expect(rows[1]!.resumo).toBe("texto do resumo");
});

it("monta o item sem linha em branco inicial quando as notas estão vazias", () => {
  expect(acrescentarNota("", "Rumor", " Algo ")).toBe("- Rumor: Algo");
  expect(acrescentarNota("a\n\n", "Item", "x")).toBe("a\n- Item: x");
});

it("não escreve em nenhuma sessão e orienta quando não há sessão em preparo", async () => {
  rows = [row({ id: 1, numero: 3, titulo: "Já jogada", visivel_para_todos: true })];
  const panel = await rollRumor();

  fireEvent.click(within(panel).getByRole("button", { name: "Enviar para preparo" }));

  expect(await within(panel).findByText(/Nenhuma sessão em preparo/)).toBeVisible();
  expect(within(panel).getByRole("link", { name: "Ir para Sessões" })).toBeVisible();
  expect(within(panel).queryByRole("group")).not.toBeInTheDocument();
  expect(patches).toEqual([]);
});

it("recusa o envio se a sessão foi revelada depois de a lista ser carregada", async () => {
  rows = [row({ id: 2, numero: 5, titulo: "A emboscada", visivel_para_todos: false })];
  const panel = await rollRumor();

  fireEvent.click(within(panel).getByRole("button", { name: "Enviar para preparo" }));
  const group = await within(panel).findByRole("group");
  rows[0]!.visivel_para_todos = true;
  fireEvent.click(within(group).getByRole("button", { name: /A emboscada/ }));

  expect(await within(panel).findByRole("alert")).toHaveTextContent(
    "já está visível aos jogadores",
  );
  expect(patches).toEqual([]);
});

it.each([
  ["gm", true, true],
  ["gm", false, false],
  ["editor", true, false],
  ["player", false, false],
  ["visitor", false, false],
] as const)("mostra Fios só ao dono com Modo GM: %s, toggle %s", async (role, toggle, visible) => {
  renderTools(role, toggle);
  if (role === "gm" || role === "editor")
    await screen.findByRole("heading", { name: "Ferramentas" });
  else await screen.findByRole("alert");
  if (visible)
    await waitFor(() => expect(screen.getAllByRole("link", { name: "Fios" })).toHaveLength(2));
  const navs = screen.getAllByRole("navigation", { name: "Vistas da campanha" });
  for (const nav of navs) {
    if (visible) {
      expect(within(nav).getAllByRole("link")).toHaveLength(7);
      expect(within(nav).getByRole("link", { name: "Fios" })).toHaveAttribute(
        "href",
        "/c/1/alpha/fios",
      );
    } else expect(within(nav).queryByRole("link", { name: "Fios" })).not.toBeInTheDocument();
  }
});

it("mantém os nomes acessíveis na barra superior compacta do dono", async () => {
  renderTools("gm", true);
  await screen.findByRole("heading", { name: "Ferramentas" });

  const topNav = screen.getAllByRole("navigation", { name: "Vistas da campanha" })[0]!;
  const labels = ["Mapa", "Relações", "Rota", "Sessões", "Cronologia", "Ferramentas", "Fios"];
  const links = within(topNav).getAllByRole("link");
  expect(links).toHaveLength(7);
  for (const [index, link] of links.entries()) {
    expect(link).toHaveAttribute("aria-label", labels[index]);
    expect(link).toHaveAttribute("title", labels[index]);
    expect(link.querySelector("span")).toHaveClass("hidden", "xl:inline");
    expect(link).toHaveClass("px-3", "xl:px-3.5");
  }
  expect(screen.getByRole("button", { name: "Sair" })).toBeVisible();
});
