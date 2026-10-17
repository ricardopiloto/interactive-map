import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Personagem, Vinculo, VinculoTipo } from "@/api/relacoes";
import i18n from "@/i18n";
import { RelationsGraph } from "./RelationsGraph";

class GraphPointerEvent extends MouseEvent {
  pointerId: number;

  constructor(type: string, init: MouseEventInit & { pointerId?: number } = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
  }
}

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
  sessionStorage.clear();
  vi.stubGlobal("PointerEvent", GraphPointerEvent);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

function person(id: number, nome: string): Personagem {
  return {
    id,
    nome,
    tipo: "npc",
    papel: null,
    descricao: "",
    faccao: null,
    status: "vivo",
    retrato_url: null,
    visivel_para_todos: true,
    extensoes_mecanica: {},
    local_ids: [],
  };
}

function bond(): Vinculo {
  return {
    id: 10,
    personagem_a_id: 1,
    personagem_b_id: 2,
    tipo_ab: "aliado",
    publico: true,
    qualificador_ab: "",
    qualificador_ba: "",
    nota_ab: "",
    nota_ba: "",
    conhecido_ab: true,
    conhecido_ba: true,
  };
}

function renderGraph(campaignSlug = "alpha", onSelect = vi.fn()) {
  const view = render(
    <RelationsGraph
      campaignSlug={campaignSlug}
      personagens={[person(1, "Ada"), person(2, "Bruno"), person(3, "Carla")]}
      vinculos={[bond()]}
      selectedId={null}
      isolate={false}
      activeTipos={new Set<VinculoTipo>()}
      query=""
      isGm={false}
      onSelect={onSelect}
    />,
  );
  return { ...view, onSelect };
}

function translation(id: number) {
  const raw = document.querySelector(`[data-node-id='${id}']`)?.getAttribute("transform") ?? "";
  const matched = /translate\(\s*(-?\d+(?:\.\d+)?)(?:[,\s]+)(-?\d+(?:\.\d+)?)\s*\)/.exec(raw);
  if (!matched) throw new Error(`transform ilegível: ${raw}`);
  return { x: Number(matched[1]), y: Number(matched[2]), raw };
}

function edgeGeometry() {
  const edge = document.querySelector("[data-vinculo-id] line");
  const x1 = edge?.getAttribute("x1") ?? "";
  const y2 = edge?.getAttribute("y2") ?? "";
  return `${x1},${y2}`;
}

function grab(name: string, dx: number, dy: number) {
  const node = screen.getByRole("button", { name });
  fireEvent.pointerDown(node, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
  fireEvent.pointerMove(node, { pointerId: 1, clientX: dx, clientY: dy });
  fireEvent.pointerUp(node, { pointerId: 1, clientX: dx, clientY: dy });
}

it("desloca só o nó arrastado, sem persistir e sem mexer no anel dos outros", () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  const stored = localStorage.length + sessionStorage.length;
  const { rerender, onSelect } = renderGraph();
  const stage = document.querySelector("svg");
  const width = stage?.getAttribute("width");
  const height = stage?.getAttribute("height");
  const ada = translation(1);
  const bruno = translation(2);
  const carla = translation(3);
  const lineBefore = edgeGeometry();

  grab("Ada", 80, -40);

  const moved = translation(1);
  expect(moved.x).toBeCloseTo(ada.x + 80);
  expect(moved.y).toBeCloseTo(ada.y - 40);
  expect(translation(2).raw).toBe(bruno.raw);
  expect(translation(3).raw).toBe(carla.raw);
  expect(stage?.getAttribute("width")).toBe(width);
  expect(stage?.getAttribute("height")).toBe(height);
  const lineAfter = edgeGeometry();
  expect(lineAfter).not.toBe(lineBefore);
  expect(onSelect).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
  expect(localStorage.length + sessionStorage.length).toBe(stored);

  rerender(
    <RelationsGraph
      campaignSlug="beta"
      personagens={[person(1, "Ada"), person(2, "Bruno"), person(3, "Carla")]}
      vinculos={[bond()]}
      selectedId={null}
      isolate={false}
      activeTipos={new Set<VinculoTipo>()}
      query=""
      isGm={false}
      onSelect={onSelect}
    />,
  );

  expect(translation(1).raw).toBe(ada.raw);
  expect(translation(2).raw).toBe(bruno.raw);
  expect(fetchMock).not.toHaveBeenCalled();
});

it("mostra retrato circular e mantém iniciais sem retrato ou após erro", () => {
  const ada = { ...person(1, "Ada Lovelace"), tipo: "pj" as const, retrato_url: "/portrait.jpg" };
  render(
    <RelationsGraph
      campaignSlug="alpha"
      personagens={[ada, person(2, "Bruno Costa")]}
      vinculos={[]}
      selectedId={null}
      isolate={false}
      activeTipos={new Set<VinculoTipo>()}
      query=""
      isGm={false}
      onSelect={vi.fn()}
    />,
  );
  const portrait = document.querySelector("[data-node-id='1'] image");
  expect(portrait?.getAttribute("href")).toBe("/portrait.jpg");
  expect(portrait?.getAttribute("clip-path")).toBe("url(#avatar-clip-1)");
  expect(document.querySelector("#avatar-clip-1 circle")).not.toBeNull();
  expect(document.querySelector("[data-node-id='1']")?.textContent).not.toContain("AL");
  expect(document.querySelector("[data-node-id='2']")?.textContent).toContain("BC");
  expect(document.querySelector("[data-node-id='1'] circle[stroke='var(--seal)']")).not.toBeNull();

  fireEvent.error(portrait!);
  expect(document.querySelector("[data-node-id='1'] image")).toBeNull();
  expect(document.querySelector("[data-node-id='1']")?.textContent).toContain("AL");
});

it("renderiza PJs mais perto do centro que NPCs", () => {
  render(
    <RelationsGraph
      campaignSlug="alpha"
      personagens={[{ ...person(1, "Ada"), tipo: "pj" }, person(2, "Bruno"), person(3, "Carla")]}
      vinculos={[]}
      selectedId={null}
      isolate={false}
      activeTipos={new Set<VinculoTipo>()}
      query=""
      isGm={false}
      onSelect={vi.fn()}
    />,
  );
  const svg = document.querySelector("svg")!;
  const center = Number(svg.getAttribute("width")) / 2;
  const distance = (id: number) => {
    const node = translation(id);
    return Math.hypot(node.x - center, node.y - center);
  };
  expect(distance(1)).toBeLessThan(distance(2));
  expect(distance(1)).toBeLessThan(distance(3));
  expect(document.querySelector("[data-node-id='1'] circle[stroke='var(--seal)']")).not.toBeNull();
});

it("arrastar um nó não inicia pan nem zoom da viewport", () => {
  renderGraph();
  const stage = screen.getByTestId("relations-stage");
  const viewportBefore = [
    stage.dataset["viewportScale"],
    stage.dataset["viewportX"],
    stage.dataset["viewportY"],
  ];
  const positions = [1, 2, 3].map((id) => translation(id).raw);
  const node = screen.getByRole("button", { name: "Ada" });
  fireEvent.pointerDown(node, { button: 0, pointerId: 7, clientX: 20, clientY: 20 });
  fireEvent.mouseDown(node, { button: 0, clientX: 20, clientY: 20 });
  fireEvent.pointerMove(window, { pointerId: 7, clientX: 70, clientY: 40 });
  fireEvent.mouseMove(window, { clientX: 70, clientY: 40 });
  fireEvent.pointerUp(window, { pointerId: 7, clientX: 70, clientY: 40 });
  fireEvent.mouseUp(window, { clientX: 70, clientY: 40 });
  expect(translation(1).raw).not.toBe(positions[0]);
  expect(translation(2).raw).toBe(positions[1]);
  expect(translation(3).raw).toBe(positions[2]);
  expect([
    stage.dataset["viewportScale"],
    stage.dataset["viewportX"],
    stage.dataset["viewportY"],
  ]).toEqual(viewportBefore);
});

it("pan na área vazia não desseleciona; clique simples limpa a seleção", () => {
  const onSelect = vi.fn();
  render(
    <RelationsGraph
      campaignSlug="alpha"
      personagens={[person(1, "Ada"), person(2, "Bruno"), person(3, "Carla")]}
      vinculos={[bond()]}
      selectedId={1}
      isolate={false}
      activeTipos={new Set<VinculoTipo>()}
      query=""
      isGm={false}
      onSelect={onSelect}
    />,
  );
  const svg = document.querySelector("svg");
  expect(svg).not.toBeNull();

  fireEvent.pointerDown(svg!, { button: 0, pointerId: 3, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(window, { pointerId: 3, clientX: 80, clientY: 10 });
  fireEvent.pointerUp(window, { pointerId: 3, clientX: 80, clientY: 10 });
  fireEvent.click(svg!);
  expect(onSelect).not.toHaveBeenCalled();

  fireEvent.pointerDown(svg!, { button: 0, pointerId: 4, clientX: 12, clientY: 12 });
  fireEvent.pointerUp(window, { pointerId: 4, clientX: 12, clientY: 12 });
  fireEvent.click(svg!);
  expect(onSelect).toHaveBeenCalledWith(null);
});

it("usa a escala da viewport para converter o arrasto em unidades do grafo", async () => {
  renderGraph();
  const stage = screen.getByTestId("relations-stage");
  fireEvent.click(screen.getByRole("button", { name: "Aumentar zoom" }));
  await waitFor(() => expect(Number(stage.dataset["viewportScale"])).toBeGreaterThan(1));
  const scale = Number(stage.dataset["viewportScale"]);
  const before = translation(1);
  grab("Ada", 80, 0);
  expect(translation(1).x - before.x).toBeCloseTo(80 / scale, 1);
});

it("reorganiza o grafo ao selecionar e ao mudar o filtro de vínculo", () => {
  const people = [person(1, "Ada"), person(2, "Bruno"), person(3, "Carla")];
  const renderSelected = (activeTipos: Set<VinculoTipo>, selectedId: number | null) => (
    <RelationsGraph
      campaignSlug="alpha"
      personagens={people}
      vinculos={[bond()]}
      selectedId={selectedId}
      isolate={false}
      activeTipos={activeTipos}
      query=""
      isGm={false}
      onSelect={vi.fn()}
    />
  );
  const view = render(renderSelected(new Set(), 1));
  const distance = (id: number) => {
    const center = Number(document.querySelector("svg")!.getAttribute("width")) / 2;
    return Math.hypot(translation(id).x - center, translation(id).y - center);
  };
  expect(distance(1)).toBe(0);
  expect(distance(2)).toBeLessThan(distance(3));

  view.rerender(renderSelected(new Set(["adversario"]), 1));
  expect(distance(1)).toBe(0);
  expect(distance(2)).toBeCloseTo(distance(3));

  view.rerender(renderSelected(new Set(), 2));
  expect(distance(2)).toBe(0);
  expect(distance(1)).toBeLessThan(distance(3));

  view.rerender(renderSelected(new Set(), null));
  expect(distance(2)).toBeGreaterThan(0);
});

it("aplica passos graduais de zoom mesmo com delta grande da roda", async () => {
  renderGraph();
  const stage = screen.getByTestId("relations-stage");
  const wrapper = stage.querySelector(".react-transform-wrapper")!;
  const scales = [Number(stage.dataset["viewportScale"])];
  for (let i = 0; i < 4; i += 1) {
    fireEvent.wheel(wrapper, { deltaY: -1200, clientX: 100, clientY: 100 });
    await waitFor(() => expect(Number(stage.dataset["viewportScale"])).toBeGreaterThan(scales[i]!));
    scales.push(Number(stage.dataset["viewportScale"]));
  }
  for (let i = 1; i < scales.length; i += 1) {
    expect(scales[i]! / scales[i - 1]!).toBeLessThanOrEqual(1.15);
  }
  fireEvent.wheel(wrapper, { deltaY: 1200, clientX: 100, clientY: 100 });
  await waitFor(() => expect(Number(stage.dataset["viewportScale"])).toBeLessThan(scales.at(-1)!));
});

it("centraliza a seleção na viewport e volta ao enquadramento geral ao limpar", async () => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1000);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(700);
  const people = [person(1, "Ada"), person(2, "Bruno"), person(3, "Carla")];
  const draw = (selectedId: number | null) => (
    <RelationsGraph
      campaignSlug="alpha"
      personagens={people}
      vinculos={[bond()]}
      selectedId={selectedId}
      isolate={false}
      activeTipos={new Set<VinculoTipo>()}
      query=""
      isGm={false}
      onSelect={vi.fn()}
    />
  );
  const view = render(draw(1));
  const stage = screen.getByTestId("relations-stage");
  await waitFor(() => {
    const selected = translation(1);
    const scale = Number(stage.dataset["viewportScale"]);
    expect(selected.x * scale + Number(stage.dataset["viewportX"])).toBeCloseTo(500);
    expect(selected.y * scale + Number(stage.dataset["viewportY"])).toBeCloseTo(350);
  });
  view.rerender(draw(2));
  await waitFor(() => {
    const selected = translation(2);
    const scale = Number(stage.dataset["viewportScale"]);
    expect(selected.x * scale + Number(stage.dataset["viewportX"])).toBeCloseTo(500);
  });
  view.rerender(draw(null));
  await waitFor(() => expect(Number(stage.dataset["viewportScale"])).toBeLessThanOrEqual(1));
});
