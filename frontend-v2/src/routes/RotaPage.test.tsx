import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, Outlet, Route, Routes, useParams } from "react-router-dom";
import type { CampaignConfig } from "@/api/campaign";
import type { Local, Waypoint } from "@/api/map";
import type { MapScale, RoutePlanItem, RouteSegment } from "@/api/routes";
import { AuthProvider } from "@/auth/AuthContext";
import { EditModeProvider } from "@/auth/EditModeContext";
import i18n from "@/i18n";
import { RoutePage } from "./rota";

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

interface Store {
  locais: Local[];
  waypoints: Waypoint[];
  segments: RouteSegment[];
  scale: MapScale;
  nextId: number;
  plans: string[];
  planResults?: RoutePlanItem[];
}

function local(id: number, nome: string): Local {
  return {
    id,
    nome,
    descricao: "",
    x: 0.2,
    y: 0.3,
    imagem_url: null,
    data_sessao: null,
    estado_exploracao: "visitado",
    arco_id: null,
    npc_ids: [],
    saida_ids: [],
    cor_pin: "#112233",
    waypoint_id: null,
    visivel_para_todos: true,
  };
}

function waypoint(
  id: number,
  nome: string,
  x: number,
  y: number,
  localId: number | null = null,
): Waypoint {
  return { id, nome, x, y, local_id: localId };
}

function planItem(id: number, miles: number, texto: string): RoutePlanItem {
  return {
    waypoint_ids: [1, id],
    distancia_milhas: miles,
    tempo_horas: 20,
    tempo_dias: 3,
    tempo_horas_resto: 2,
    tempo_texto: texto,
    tipos: id === 1 ? ["estrada"] : ["trilha"],
    geometria: [
      { x: 0.1, y: 0.2 },
      { x: 0.5, y: 0.25 },
      { x: 0.9, y: 0.8 },
    ],
    custo_dentro_bp: 4,
    custo_fora_bp: 1.5,
    pernoites: [{ dia: 1, tipo: "local", local_id: 7, nome: "Estalagem", x: 0.4, y: 0.4 }],
    fadiga_saldo: 0,
    fadiga_pico: 0,
    fadiga_aviso: false,
    fadiga_morte: false,
    dias_visuais: [],
  };
}

function config(unit: "mi" | "km" = "mi"): CampaignConfig {
  return {
    id: 1,
    slug: "alpha",
    nome: "Alpha",
    sistema: "wfrp4e",
    has_map_image: true,
    map_url: "/mapas/alpha.jpg",
    modulos_ativos: [],
    unidade_distancia: unit,
  };
}

function installApi(store: Store, signedIn: boolean) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? "GET").toUpperCase();
      const body = () => JSON.parse(String(init?.body)) as Record<string, unknown>;
      const respond = (payload: unknown, status = 200) =>
        Promise.resolve(
          new Response(status === 204 ? null : JSON.stringify(payload), {
            status,
            headers: { "Content-Type": "application/json" },
          }),
        );
      if (url === "/api/auth/me") {
        return signedIn
          ? respond({ id: 1, email: "gm@teste.local", is_admin: false })
          : new Response("{}", { status: 401 });
      }
      if (url.endsWith("/admin/session")) return respond({ papel: "dono" });
      if (url.includes("/routes/plan")) {
        store.plans.push(url);
        const routes =
          store.planResults ??
          (store.segments.length >= 2
            ? [planItem(1, 10, "3 dias e 2 h"), planItem(2, 18, "5 dias e 1 h")]
            : [planItem(1, 10, "3 dias e 2 h")]);
        return respond({ rotas: routes });
      }
      if (url.endsWith("/admin/map-scale") && method === "PUT") {
        const miles = Number(body()["miles_per_map_unit"]);
        const ratio = miles / store.scale.miles_per_map_unit;
        store.scale = { ...store.scale, miles_per_map_unit: miles };
        store.segments = store.segments.map((segment) => ({
          ...segment,
          distancia_milhas: segment.distancia_milhas * ratio,
        }));
        return respond(store.scale);
      }
      if (url.endsWith("/admin/map-scale")) return respond(store.scale);
      if (url.endsWith("/admin/route-segments") && method === "POST") {
        const payload = body();
        const created: RouteSegment = {
          id: store.nextId++,
          waypoint_a_id: Number(payload["waypoint_a_id"]),
          waypoint_b_id: Number(payload["waypoint_b_id"]),
          tipo: payload["tipo"] as RouteSegment["tipo"],
          pontos_intermediarios:
            (payload["pontos_intermediarios"] as RouteSegment["pontos_intermediarios"]) ?? [],
          distancia_milhas: 10,
          modificador_velocidade: null,
        };
        store.segments = [...store.segments, created];
        return respond(created, 201);
      }
      const segmentMatch = url.match(/\/admin\/route-segments\/(\d+)$/);
      if (segmentMatch && method === "DELETE") {
        store.segments = store.segments.filter((segment) => segment.id !== Number(segmentMatch[1]));
        return new Response(null, { status: 204 });
      }
      if (url.endsWith("/admin/route-segments") || url.endsWith("/route-segments")) {
        return respond(store.segments);
      }
      const waypointMatch = url.match(/\/admin\/waypoints\/(\d+)$/);
      if (waypointMatch && method === "PUT") {
        const id = Number(waypointMatch[1]);
        const payload = body();
        store.waypoints = store.waypoints.map((item) =>
          item.id === id ? { ...item, ...payload, id } : item,
        );
        if (payload["x"] != null || payload["y"] != null) {
          const updated = store.waypoints.find((item) => item.id === id)!;
          store.locais = store.locais.map((item) =>
            item.id === updated.local_id ? { ...item, x: updated.x, y: updated.y } : item,
          );
        }
        return respond(store.waypoints.find((item) => item.id === id));
      }
      if (waypointMatch && method === "DELETE") {
        const id = Number(waypointMatch[1]);
        store.waypoints = store.waypoints.filter((item) => item.id !== id);
        store.segments = store.segments.filter(
          (segment) => segment.waypoint_a_id !== id && segment.waypoint_b_id !== id,
        );
        return new Response(null, { status: 204 });
      }
      if (url.endsWith("/admin/waypoints") && method === "POST") {
        const payload = body();
        const created = waypoint(
          store.nextId++,
          String(payload["nome"] ?? ""),
          Number(payload["x"]),
          Number(payload["y"]),
          (payload["local_id"] as number | null) ?? null,
        );
        if (!created.nome) created.nome = null;
        store.waypoints = [...store.waypoints, created];
        return respond(created, 201);
      }
      if (url.endsWith("/admin/waypoints") || url.endsWith("/waypoints"))
        return respond(store.waypoints);
      if (url.endsWith("/admin/locais") || url.endsWith("/locais")) return respond(store.locais);
      return new Response("{}", { status: 404 });
    }),
  );
}

function renderRoute(path: string, store: Store, signedIn = false, unit: "mi" | "km" = "mi") {
  installApi(store, signedIn);
  if (signedIn) sessionStorage.setItem("codex.editMode.alpha", "1");
  function Frame() {
    const { slug = "" } = useParams();
    return (
      <EditModeProvider slug={slug}>
        <Outlet context={config(unit)} />
      </EditModeProvider>
    );
  }
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/c/:slug" element={<Frame />}>
            <Route path="rota" element={<RoutePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function baseStore(): Store {
  return {
    locais: [local(7, "Altdorf")],
    waypoints: [waypoint(1, "Porto", 0.1, 0.2), waypoint(2, "Vila", 0.9, 0.8)],
    segments: [
      {
        id: 3,
        waypoint_a_id: 1,
        waypoint_b_id: 2,
        tipo: "estrada",
        pontos_intermediarios: [{ x: 0.5, y: 0.25 }],
        distancia_milhas: 10,
        modificador_velocidade: null,
      },
    ],
    scale: { id: 1, miles_per_map_unit: 100, notas: null },
    nextId: 4,
    plans: [],
  };
}

async function choose(label: "Partindo de" | "Chegando a", option: string) {
  const box = await screen.findByRole("combobox", { name: label });
  fireEvent.focus(box);
  fireEvent.click(await screen.findByRole("option", { name: option }));
}

it("mostra distância, tempo e custo vindos do plano da API", async () => {
  const store = baseStore();
  renderRoute("/c/alpha/rota", store, false, "km");

  await choose("Partindo de", "Porto");
  await choose("Chegando a", "Vila");
  fireEvent.click(screen.getByRole("button", { name: "Calcular" }));

  const option = await screen.findByTestId("route-option");
  expect(option).toHaveTextContent("16 km");
  expect(option).toHaveTextContent("3 dias e 2 h");
  expect(option).toHaveTextContent("Via 4 bp");
  expect(option).toHaveTextContent("Fora da via 1.5 bp");
  expect(screen.getAllByText(/Estalagem/).length).toBeGreaterThan(0);
  expect(screen.getByTestId("distance-unit")).toHaveTextContent("quilômetros");
  expect(store.plans[0]).toContain("origem_waypoint_id=1");
  expect(store.plans[0]).toContain("destino_waypoint_id=2");
  expect(store.plans[0]).toContain("ritmo=normal");
  expect(store.plans[0]).toContain("modo_transporte=pago");
  expect(store.plans[0]).toContain("ordenacao=mais_rapida");
  expect(store.plans[0]).toContain("preferencia_via=nenhuma");
  const geometry = document.querySelector('[data-testid="map-stage"] svg path');
  expect(geometry?.getAttribute("d")).toBe("M10.00,20.00 L50.00,25.00 L90.00,80.00");
  expect(geometry?.parentElement?.innerHTML.includes("Q")).toBe(false);
});

it("clique no mapa e combobox pedem o mesmo par ao motor", async () => {
  const store = baseStore();
  renderRoute("/c/alpha/rota", store);

  fireEvent.click(await screen.findByRole("button", { name: "Porto, Visitado" }));
  fireEvent.click(screen.getByRole("button", { name: "Vila, Visitado" }));
  await waitFor(() => expect(store.plans).toHaveLength(1));

  await choose("Partindo de", "Porto");
  await choose("Chegando a", "Vila");
  fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
  await waitFor(() => expect(store.plans).toHaveLength(2));

  const query = (url: string) => url.slice(url.indexOf("?"));
  expect(query(store.plans[0]!)).toBe(query(store.plans[1]!));
});

it("edita nós, segmento com ponto intermediário e escala, e a rota nova entra no plano", async () => {
  const store = baseStore();
  renderRoute("/c/alpha/rota", store, true);

  fireEvent.click(await screen.findByRole("button", { name: "Rede de rotas" }));
  fireEvent.change(screen.getByRole("combobox", { name: "Tipo de via" }), {
    target: { value: "trilha" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Traçar segmento" }));
  fireEvent.click(screen.getByRole("button", { name: "Porto, Visitado" }));
  fireEvent.click(screen.getByTestId("map-stage"));
  expect(screen.getByTestId("draft-mids")).toHaveTextContent("1");
  fireEvent.click(screen.getByRole("button", { name: "Vila, Visitado" }));
  await waitFor(() => expect(store.segments).toHaveLength(2));
  expect(store.segments[1]?.tipo).toBe("trilha");
  expect(store.segments[1]?.pontos_intermediarios).toEqual([{ x: 0, y: 0 }]);
  expect(await screen.findByTestId("segment-4-distance")).toBeVisible();
  expect(screen.getByTestId("segment-4-distance").parentElement).toHaveTextContent("Trilha");

  fireEvent.change(screen.getByRole("textbox", { name: "Nome (opcional)" }), {
    target: { value: "Desvio" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Novo nó" }));
  fireEvent.click(screen.getByTestId("map-stage"));
  expect(await screen.findByRole("button", { name: "Desvio" })).toBeVisible();
  expect(store.waypoints.find((item) => item.nome === "Desvio")?.x).toBe(0);

  fireEvent.change(screen.getByRole("textbox", { name: "Nome" }), {
    target: { value: "Desvio Norte" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Renomear" }));
  await waitFor(() =>
    expect(store.waypoints.find((item) => item.id === 5)?.nome).toBe("Desvio Norte"),
  );

  const link = await screen.findByRole("combobox", { name: "Local do nó Desvio Norte" });
  fireEvent.change(link, { target: { value: "7" } });
  await waitFor(() => expect(store.waypoints.find((item) => item.id === 5)?.local_id).toBe(7));
  fireEvent.change(screen.getByRole("combobox", { name: "Local do nó Desvio Norte" }), {
    target: { value: "" },
  });
  await waitFor(() =>
    expect(screen.getByRole("combobox", { name: "Local do nó Desvio Norte" })).toHaveValue(""),
  );

  fireEvent.change(screen.getByRole("textbox", { name: "Escala (mi / unidade)" }), {
    target: { value: "200" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar escala" }));
  await waitFor(() => expect(store.scale.miles_per_map_unit).toBe(200));
  await waitFor(() => expect(screen.getByTestId("segment-3-distance")).toHaveTextContent("20 mi"));

  fireEvent.click(screen.getByRole("button", { name: "Planejar viagem" }));
  await choose("Partindo de", "Porto");
  await choose("Chegando a", "Vila");
  fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
  expect(await screen.findAllByTestId("route-option")).toHaveLength(2);

  fireEvent.click(screen.getByRole("button", { name: "Rede de rotas" }));
  fireEvent.click(screen.getByRole("button", { name: "Apagar Porto" }));
  fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Apagar" }));
  await waitFor(() => expect(store.waypoints.some((item) => item.nome === "Porto")).toBe(false));
  await waitFor(() =>
    expect(store.segments.some((segment) => segment.waypoint_a_id === 1)).toBe(false),
  );
  await waitFor(() => expect(screen.queryByTestId("segment-3-distance")).not.toBeInTheDocument());
}, 15000);

it("move nó vinculado no mapa e redesenha o segmento sem recarregar a página", async () => {
  const store = baseStore();
  store.waypoints[0]!.local_id = 7;
  renderRoute("/c/alpha/rota", store, true);
  fireEvent.click(await screen.findByRole("button", { name: "Rede de rotas" }));
  const stage = screen.getByTestId("map-stage");
  const path = stage.querySelector("svg path")!;
  expect(path.getAttribute("d")).toContain("M10.00,20.00");
  fireEvent.click(screen.getByRole("button", { name: "Porto" }));
  fireEvent.click(screen.getByRole("button", { name: "Mover nó" }));
  vi.spyOn(stage, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
  } as DOMRect);
  fireEvent.click(stage, { clientX: 40, clientY: 50 });
  await waitFor(() => expect(store.waypoints[0]).toMatchObject({ x: 0.4, y: 0.5 }));
  await waitFor(() => expect(store.locais[0]).toMatchObject({ x: 0.4, y: 0.5 }));
  await waitFor(() =>
    expect(stage.querySelector("svg path")?.getAttribute("d")).toContain("M40.00,50.00"),
  );
  expect(store.segments[0]?.pontos_intermediarios).toEqual([{ x: 0.5, y: 0.25 }]);
  expect(screen.getByRole("button", { name: "Porto, Visitado" })).toBeVisible();
});

async function calculate(store: Store) {
  renderRoute("/c/alpha/rota", store);
  await choose("Partindo de", "Porto");
  await choose("Chegando a", "Vila");
  fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
  await screen.findAllByTestId("route-option");
}

it("lê as fatias e a fadiga da resposta mockada e mantém as alternativas sem pernoites", async () => {
  const store = baseStore();
  const selected = planItem(1, 10, "3 dias");
  selected.tipos = ["trilha"];
  selected.pernoites = [{ dia: 1, tipo: "relento", local_id: null, nome: null, x: 0.4, y: 0.45 }];
  selected.fadiga_saldo = 1;
  selected.fadiga_pico = 2;
  selected.fadiga_aviso = false;
  selected.fadiga_morte = false;
  selected.dias_visuais = [
    {
      dia: 1,
      residual: true,
      fadiga_apos: 1,
      geometria: [
        { x: 0.1, y: 0.2 },
        { x: 0.4, y: 0.45 },
      ],
    },
    {
      dia: 2,
      residual: false,
      fadiga_apos: 0,
      geometria: [
        { x: 0.4, y: 0.45 },
        { x: 0.9, y: 0.8 },
      ],
    },
  ];
  const alternative = planItem(2, 18, "5 dias");
  alternative.pernoites = [{ dia: 1, tipo: "relento", local_id: null, nome: null, x: 0.7, y: 0.7 }];
  store.planResults = [selected, alternative];
  await calculate(store);
  const days = screen.getAllByTestId("route-day");
  expect(days).toHaveLength(2);
  expect(days[0]).toHaveAttribute("stroke", "#b45309");
  expect(days[1]).not.toHaveAttribute("stroke", "#b45309");
  expect(days[0]?.getAttribute("stroke-dasharray")).toBe(days[1]?.getAttribute("stroke-dasharray"));
  expect(days[0]?.getAttribute("stroke-dasharray")).toBe("0.3 0.5");
  expect(screen.getAllByTestId("route-alternative")).toHaveLength(1);
  expect(screen.getAllByTestId("overnight-camp")).toHaveLength(1);
  const camp = screen.getByTestId("overnight-camp");
  expect(camp.tagName).toBe("DIV");
  expect(camp.closest("svg")).toBeNull();
  expect(camp).toHaveClass("h-3", "w-3", "rounded-full", "pointer-events-none");
  expect(camp).toHaveStyle({ left: "40%", top: "45%" });
  expect(camp).toHaveAttribute("title", "Noite 1: ao relento");
});

it("destaca o Waypoint do Local abrigado e usa marcador avulso sem vínculo", async () => {
  const store = baseStore();
  store.waypoints[0]!.local_id = 7;
  const selected = planItem(1, 10, "3 dias");
  selected.pernoites = [
    { dia: 1, tipo: "local", local_id: 7, nome: "Altdorf", x: 0.1, y: 0.2 },
    { dia: 2, tipo: "local", local_id: 8, nome: "Abrigo", x: 0.5, y: 0.6 },
  ];
  store.planResults = [selected];
  await calculate(store);
  expect(screen.getByTestId("overnight-pin-1")).toBeInTheDocument();
  expect(screen.queryByTestId("overnight-pin-2")).not.toBeInTheDocument();
  const fallback = screen.getByTestId("overnight-local-fallback");
  expect(fallback.tagName).toBe("DIV");
  expect(fallback.closest("svg")).toBeNull();
  expect(fallback).toHaveClass("h-3", "w-3", "rounded-full", "pointer-events-none");
  expect(fallback).toHaveStyle({ left: "50%", top: "60%" });
  expect(fallback).toHaveAttribute("title", "Abrigo");
});

it("sem pernoites mantém os pins comuns e a cor do tipo de via", async () => {
  const store = baseStore();
  store.waypoints[0]!.local_id = 7;
  const selected = planItem(1, 10, "3 dias");
  selected.pernoites = [];
  selected.dias_visuais = [
    { dia: 1, residual: false, fadiga_apos: 0, geometria: selected.geometria },
  ];
  store.planResults = [selected];
  await calculate(store);
  expect(screen.queryByTestId("overnight-pin-1")).not.toBeInTheDocument();
  expect(screen.queryByTestId("overnight-camp")).not.toBeInTheDocument();
  expect(screen.getByTestId("route-day")).not.toHaveAttribute("stroke", "#b45309");
});

it("destaca o Local fora da rota calculada quando o abrigo é por raio", async () => {
  const store = baseStore();
  store.waypoints.push(waypoint(4, "Cidade lateral", 0.5, 0.01, 7));
  const selected = planItem(1, 10, "3 dias");
  selected.pernoites = [{ dia: 1, tipo: "local", local_id: 7, nome: "Altdorf", x: 0.5, y: 0 }];
  store.planResults = [selected];
  await calculate(store);
  expect(screen.getByTestId("overnight-pin-4")).toBeInTheDocument();
  expect(screen.queryByTestId("overnight-local-fallback")).not.toBeInTheDocument();
});
