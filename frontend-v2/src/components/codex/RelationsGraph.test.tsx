import { fireEvent, render, screen } from "@testing-library/react";
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
