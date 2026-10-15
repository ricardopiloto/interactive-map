import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Link, MemoryRouter, Outlet, Route, Routes, useParams } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { EditModeProvider } from "@/auth/EditModeContext";
import type { CampaignConfig } from "@/api/campaign";
import { DEFAULT_PIN_COLOR, type GrupoPosicao, type Local, type Npc } from "@/api/map";
import i18n from "@/i18n";
import { MapPage } from "./index";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(async () => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  await i18n.changeLanguage("pt-BR");
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

function local(patch: Partial<Local> & Pick<Local, "id" | "nome">): Local {
  return {
    descricao: "",
    x: 0.2,
    y: 0.3,
    imagem_url: null,
    data_sessao: null,
    estado_exploracao: "conhecido",
    arco_id: null,
    npc_ids: [],
    saida_ids: [],
    cor_pin: "#112233",
    waypoint_id: null,
    visivel_para_todos: true,
    ...patch,
  };
}

function npc(patch: Partial<Npc> & Pick<Npc, "id" | "nome">): Npc {
  return {
    descricao: "",
    faccao: null,
    papel: null,
    status: "vivo",
    retrato_url: null,
    local_ids: [],
    visivel_para_todos: true,
    tipo: "npc",
    ...patch,
  };
}

interface Store {
  locais: Local[];
  npcs: Npc[];
  grupo: GrupoPosicao;
  mapUrl: string | null;
  nextId: number;
}

function config(slug: string, mapUrl: string | null): CampaignConfig {
  return {
    id: 1,
    slug,
    nome: slug,
    sistema: "wfrp4e",
    has_map_image: Boolean(mapUrl),
    map_url: mapUrl,
    modulos_ativos: [],
  };
}

function installApi(stores: Record<string, Store>, signedIn: boolean) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? "GET").toUpperCase();
      const respond = (body: unknown, status = 200) =>
        Promise.resolve(
          new Response(status === 204 ? null : JSON.stringify(body), {
            status,
            headers: { "Content-Type": "application/json" },
          }),
        );
      if (url === "/api/auth/me") {
        return signedIn
          ? respond({ id: 1, email: "gm@teste.local", is_admin: false })
          : new Response("{}", { status: 401 });
      }
      const slug = url.match(/\/api\/c\/([^/]+)/)?.[1];
      if (!slug) return new Response("{}", { status: 404 });
      const decoded = decodeURIComponent(slug);
      const store = stores[decoded];
      if (!store) return new Response("{}", { status: 404 });
      if (url.endsWith("/admin/session")) return respond({ papel: "dono" });
      if (url.endsWith("/config")) return respond(config(decoded, store.mapUrl));
      if (url.endsWith("/grupo") && method === "GET") return respond(store.grupo);
      if (url.endsWith("/admin/grupo") && method === "PUT") {
        store.grupo = { ...store.grupo, ...(JSON.parse(String(init?.body)) as GrupoPosicao) };
        return respond(store.grupo);
      }
      if (url.endsWith("/arcos") || url.endsWith("/waypoints")) return respond([]);
      if (url.endsWith("/admin/uploads") && init?.body instanceof FormData) {
        const category = String(init.body.get("category"));
        const uploaded = `/api/c/${decoded}/media/${category}/novo.png`;
        if (category === "map") store.mapUrl = uploaded;
        return respond({ url: uploaded });
      }
      const localMatch = url.match(/\/admin\/locais\/(\d+)$/);
      if (localMatch && method === "PUT") {
        const id = Number(localMatch[1]);
        const body = JSON.parse(String(init?.body)) as Local;
        store.locais = store.locais.map((item) =>
          item.id === id ? { ...item, ...body, id } : item,
        );
        return respond(store.locais.find((item) => item.id === id));
      }
      if (localMatch && method === "DELETE") {
        store.locais = store.locais.filter((item) => item.id !== Number(localMatch[1]));
        return new Response(null, { status: 204 });
      }
      if (url.endsWith("/admin/locais") && method === "POST") {
        const body = JSON.parse(String(init?.body)) as Local;
        const created = local({ ...body, id: store.nextId++ });
        store.locais = [...store.locais, created];
        return respond(created);
      }
      const npcMatch = url.match(/\/admin\/npcs\/(\d+)$/);
      if (npcMatch && method === "PUT") {
        const id = Number(npcMatch[1]);
        const body = JSON.parse(String(init?.body)) as Npc;
        store.npcs = store.npcs.map((item) => (item.id === id ? { ...item, ...body, id } : item));
        return respond(store.npcs.find((item) => item.id === id));
      }
      if (npcMatch && method === "DELETE") {
        store.npcs = store.npcs.filter((item) => item.id !== Number(npcMatch[1]));
        return new Response(null, { status: 204 });
      }
      if (url.endsWith("/admin/npcs") && method === "POST") {
        const body = JSON.parse(String(init?.body)) as Npc;
        const created = npc({ ...body, id: store.nextId++ });
        store.npcs = [...store.npcs, created];
        return respond(created);
      }
      if (url.endsWith("/locais") || url.endsWith("/admin/locais")) {
        const rows =
          signedIn && url.includes("/admin/")
            ? store.locais
            : store.locais.filter((item) => item.visivel_para_todos !== false);
        return respond(rows.map((item) => ({ ...item, npc_ids: [...item.npc_ids] })));
      }
      if (url.endsWith("/npcs") || url.endsWith("/admin/npcs")) {
        return respond(
          store.npcs.map((item) => ({
            ...item,
            local_ids: store.locais
              .filter((place) => place.npc_ids.includes(item.id))
              .map((place) => place.id),
          })),
        );
      }
      return new Response("{}", { status: 404 });
    }),
  );
}

function renderMap(path: string, stores: Record<string, Store>, signedIn = false) {
  installApi(stores, signedIn);
  if (signedIn) {
    const slug = path.match(/\/c\/([^/?]+)/)?.[1];
    if (slug) sessionStorage.setItem(`codex.editMode.${decodeURIComponent(slug)}`, "1");
  }
  function Frame() {
    const { slug = "" } = useParams();
    const store = stores[slug];
    return (
      <EditModeProvider slug={slug}>
        <Outlet context={config(slug, store?.mapUrl ?? null)} />
      </EditModeProvider>
    );
  }
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Link to="/c/beta/mapa">Trocar campanha</Link>
        <Routes>
          <Route path="/c/:slug" element={<Frame />}>
            <Route path="mapa" element={<MapPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function baseStore(nome: string, mapUrl: string): Store {
  return {
    locais: [
      local({ id: 1, nome, descricao: "**Capital** do Império", saida_ids: [2] }),
      local({ id: 2, nome: "Outro", x: 0.6, y: 0.7 }),
    ],
    npcs: [],
    grupo: { x: 0.5, y: 0.4, formato: "bandeira", atualizado_em: "2026-01-01T00:00:00Z" },
    mapUrl,
    nextId: 3,
  };
}

it("mostra pins e imagem da campanha da URL e abre o local do deep-link", async () => {
  renderMap("/c/alpha/mapa?local=1", {
    alpha: baseStore("Altdorf", "/mapas/alpha.jpg"),
    beta: baseStore("Middenheim", "/mapas/beta.jpg"),
  });

  expect(await screen.findByRole("heading", { name: "Altdorf" })).toBeVisible();
  expect(screen.getByRole("img", { name: "Mapa da campanha" })).toHaveAttribute(
    "src",
    "/mapas/alpha.jpg",
  );
  expect(screen.getByText("Capital")).toBeVisible();
  expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Adicionar local no mapa" })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("link", { name: "Outro" }));
  expect(await screen.findByRole("heading", { name: "Outro" })).toBeVisible();

  fireEvent.click(screen.getByRole("link", { name: "Trocar campanha" }));
  expect(await screen.findByRole("button", { name: /Middenheim/ })).toBeVisible();
  expect(screen.getByRole("img", { name: "Mapa da campanha" })).toHaveAttribute(
    "src",
    "/mapas/beta.jpg",
  );
  expect(screen.queryByRole("heading", { name: "Altdorf" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Altdorf/ })).not.toBeInTheDocument();
});

it("cria, edita e exclui um local e reflete na lista pública", async () => {
  const store = baseStore("Altdorf", "/mapas/alpha.jpg");
  store.locais = [local({ id: 1, nome: "Altdorf" })];
  renderMap("/c/alpha/mapa", { alpha: store }, true);

  fireEvent.click(await screen.findByRole("button", { name: "Adicionar local no mapa" }));
  fireEvent.click(screen.getByTestId("map-stage"));
  fireEvent.change(await screen.findByRole("textbox", { name: "Nome" }), {
    target: { value: "Ponte" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  expect(await screen.findByRole("heading", { name: "Ponte" })).toBeVisible();
  expect(store.locais.find((item) => item.nome === "Ponte")?.cor_pin).toBe(DEFAULT_PIN_COLOR);

  fireEvent.click(screen.getByRole("button", { name: "Editar" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Nome" }), {
    target: { value: "Ponte Nova" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  expect(await screen.findByRole("heading", { name: "Ponte Nova" })).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
  fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Excluir" }));
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: /Ponte Nova/ })).not.toBeInTheDocument(),
  );
  expect(store.locais.some((item) => item.nome === "Ponte Nova")).toBe(false);
});

it("cria um NPC e mostra o nome entre os presentes do local", async () => {
  const store = baseStore("Altdorf", "/mapas/alpha.jpg");
  store.locais = [local({ id: 1, nome: "Altdorf" })];
  renderMap("/c/alpha/mapa?local=1", { alpha: store }, true);

  await waitFor(() => {
    expect(screen.queryByText("Carregando campanha…")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo NPC" })).toBeVisible();
  });
  fireEvent.click(screen.getByRole("button", { name: "Novo NPC" }));
  fireEvent.change(await screen.findByRole("textbox", { name: "Nome" }), {
    target: { value: "Greta" },
  });
  expect(screen.getByRole("checkbox", { name: "Altdorf" })).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  expect(await screen.findByRole("link", { name: "Greta" })).toBeVisible();
  expect(store.locais[0]?.npc_ids).toEqual([expect.any(Number)]);
});

it("move o grupo e alterna o formato do marcador", async () => {
  const store = baseStore("Altdorf", "/mapas/alpha.jpg");
  store.locais = [local({ id: 1, nome: "Altdorf" })];
  renderMap("/c/alpha/mapa", { alpha: store }, true);

  fireEvent.click(await screen.findByRole("button", { name: "Mover grupo" }));
  fireEvent.click(screen.getByTestId("map-stage"));
  await waitFor(() => expect(store.grupo.x).toBe(0));
  expect(document.getElementById("map-party")).toHaveAttribute("data-formato", "bandeira");

  fireEvent.click(screen.getByRole("button", { name: "Usar brasão" }));
  await waitFor(() => expect(store.grupo.formato).toBe("brasao"));
  expect(document.getElementById("map-party")).toHaveAttribute("data-formato", "brasao");
});

it("substitui a imagem e passa a exibir map_url da configuração", async () => {
  const store = baseStore("Altdorf", "/mapas/alpha.jpg");
  store.locais = [local({ id: 1, nome: "Altdorf" })];
  renderMap("/c/alpha/mapa", { alpha: store }, true);

  const input = document.querySelector(
    'input[type="file"][aria-label="Substituir mapa"]',
  ) as HTMLInputElement;
  const file = new File(["mapa"], "mapa.png", { type: "image/png" });
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() =>
    expect(screen.getByRole("img", { name: "Mapa da campanha" })).toHaveAttribute(
      "src",
      "/api/c/alpha/media/map/novo.png",
    ),
  );
  expect(store.mapUrl).toBe("/api/c/alpha/media/map/novo.png");
});
