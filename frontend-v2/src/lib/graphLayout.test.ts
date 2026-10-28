import { expect, it } from "vitest";
import {
  NODE_BOX,
  NODE_GAP,
  SPACING_STEPS,
  layoutRadialByRelation,
  layoutRadialByTipo,
  layoutRing,
  minCenterDistance,
  ringRadius,
  spacingFromSlider,
} from "./graphLayout";

const pad = Math.max(NODE_BOX.width, NODE_BOX.height) / 2 + NODE_GAP;

function assertFinite(frame: ReturnType<typeof layoutRing>) {
  expect(Number.isFinite(frame.width)).toBe(true);
  expect(Number.isFinite(frame.height)).toBe(true);
  for (const node of frame.nodes) {
    expect(Number.isFinite(node.x)).toBe(true);
    expect(Number.isFinite(node.y)).toBe(true);
  }
}

function assertScaled(
  baseline: ReturnType<typeof layoutRing>,
  scaled: ReturnType<typeof layoutRing>,
  spacing: number,
) {
  const oldOrigin = baseline.width / 2;
  const newOrigin = scaled.width / 2;
  expect(newOrigin).toBeCloseTo(pad + (oldOrigin - pad) * spacing);
  expect(scaled.height).toBeCloseTo(scaled.width);
  for (const oldNode of baseline.nodes) {
    const newNode = scaled.nodes.find((node) => node.id === oldNode.id)!;
    expect(newNode.x - newOrigin).toBeCloseTo((oldNode.x - oldOrigin) * spacing);
    expect(newNode.y - newOrigin).toBeCloseTo((oldNode.y - oldOrigin) * spacing);
  }
  assertFinite(scaled);
}

it("mantém o layout anterior com spacing padrão", () => {
  const separation = minCenterDistance();
  const radius = ringRadius(3, separation);
  const origin = radius + pad;
  const expectedRing = {
    nodes: [
      {
        id: 1,
        x: origin + radius * Math.cos(-Math.PI / 2),
        y: origin + radius * Math.sin(-Math.PI / 2),
      },
      {
        id: 2,
        x: origin + radius * Math.cos(-Math.PI / 2 + (1 * 2 * Math.PI) / 3),
        y: origin + radius * Math.sin(-Math.PI / 2 + (1 * 2 * Math.PI) / 3),
      },
      {
        id: 3,
        x: origin + radius * Math.cos(-Math.PI / 2 + (2 * 2 * Math.PI) / 3),
        y: origin + radius * Math.sin(-Math.PI / 2 + (2 * 2 * Math.PI) / 3),
      },
    ],
    width: origin * 2,
    height: origin * 2,
  };
  expect(layoutRing([3, 1, 2])).toEqual(expectedRing);
  expect(layoutRing([3, 1, 2], NODE_BOX, NODE_GAP, 1)).toEqual(layoutRing([3, 1, 2]));
  const cast = [
    { id: 1, tipo: "pj" as const },
    { id: 2, tipo: "pj" as const },
    { id: 3, tipo: "npc" as const },
  ];
  expect(layoutRadialByTipo(cast, NODE_BOX, NODE_GAP, 1)).toEqual(layoutRadialByTipo(cast));
  expect(layoutRadialByRelation([1, 2, 3], 1, [2], NODE_BOX, NODE_GAP, 1)).toEqual(
    layoutRadialByRelation([1, 2, 3], 1, [2]),
  );
});

it("escala os raios e o quadro sem escalar pad", () => {
  const cast = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    tipo: i < 4 ? ("pj" as const) : ("npc" as const),
  }));
  const layouts = [
    (spacing: number) => layoutRing([1, 2, 3, 4], NODE_BOX, NODE_GAP, spacing),
    (spacing: number) => layoutRadialByTipo(cast, NODE_BOX, NODE_GAP, spacing),
    (spacing: number) =>
      layoutRadialByRelation(
        cast.map(({ id }) => id),
        1,
        [2, 3, 4],
        NODE_BOX,
        NODE_GAP,
        spacing,
      ),
  ];
  for (const layout of layouts) {
    for (const spacing of [0.5, 2]) assertScaled(layout(1), layout(spacing), spacing);
  }
});

it("é determinístico com spacing diferente do padrão", () => {
  const cast = Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    tipo: i < 6 ? ("pj" as const) : ("npc" as const),
  }));
  expect(layoutRing([4, 1, 3, 2], NODE_BOX, NODE_GAP, 2)).toEqual(
    layoutRing([2, 3, 1, 4], NODE_BOX, NODE_GAP, 2),
  );
  expect(layoutRadialByTipo([...cast].reverse(), NODE_BOX, NODE_GAP, 0.5)).toEqual(
    layoutRadialByTipo(cast, NODE_BOX, NODE_GAP, 0.5),
  );
  expect(
    layoutRadialByRelation(cast.map(({ id }) => id).reverse(), 1, [4, 3, 2], NODE_BOX, NODE_GAP, 2),
  ).toEqual(
    layoutRadialByRelation(
      cast.map(({ id }) => id),
      1,
      [2, 3, 4],
      NODE_BOX,
      NODE_GAP,
      2,
    ),
  );
});

it("preserva separação num elenco grande para spacing >= 1", () => {
  const cast = Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    tipo: i < 20 ? ("pj" as const) : ("npc" as const),
  }));
  for (const spacing of [1, 2]) {
    const frames = [
      layoutRing(
        cast.map(({ id }) => id),
        NODE_BOX,
        NODE_GAP,
        spacing,
      ),
      layoutRadialByTipo(cast, NODE_BOX, NODE_GAP, spacing),
      layoutRadialByRelation(
        cast.map(({ id }) => id),
        1,
        cast.slice(1, 21).map(({ id }) => id),
        NODE_BOX,
        NODE_GAP,
        spacing,
      ),
    ];
    for (const frame of frames) {
      for (let i = 0; i < frame.nodes.length; i += 1) {
        for (let j = i + 1; j < frame.nodes.length; j += 1) {
          const a = frame.nodes[i]!;
          const b = frame.nodes[j]!;
          expect(
            Math.abs(a.x - b.x) < NODE_BOX.width && Math.abs(a.y - b.y) < NODE_BOX.height,
          ).toBe(false);
        }
      }
    }
  }
});

it("mantém quadros finitos para anéis vazios e unitários", () => {
  for (const ids of [[], [7]]) {
    for (const spacing of [0.5, 2]) {
      const frame = layoutRing(ids, NODE_BOX, NODE_GAP, spacing);
      expect(frame.width).toBe(pad * 2);
      expect(frame.height).toBe(pad * 2);
      assertFinite(frame);
    }
  }
});

it("converte os extremos e o centro do slider", () => {
  expect(SPACING_STEPS).toBe(50);
  expect(spacingFromSlider(-50)).toBe(0.25);
  expect(spacingFromSlider(0)).toBe(1);
  expect(spacingFromSlider(50)).toBe(2);
});

function assertSeparated(ids: number[], box = NODE_BOX) {
  const frame = layoutRing(ids, box);
  const min = minCenterDistance(box);
  for (let i = 0; i < frame.nodes.length; i += 1) {
    for (let j = i + 1; j < frame.nodes.length; j += 1) {
      const a = frame.nodes[i]!;
      const b = frame.nodes[j]!;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      expect(dist).toBeGreaterThanOrEqual(min - 1e-6);
      const overlaps = Math.abs(a.x - b.x) < box.width && Math.abs(a.y - b.y) < box.height;
      expect(overlaps).toBe(false);
    }
  }
  return frame;
}

it("espaça um elenco pequeno sem sobreposição", () => {
  const frame = assertSeparated([1, 2, 3]);
  expect(frame.nodes).toHaveLength(3);
  expect(frame.nodes[0]?.id).toBe(1);
});

it("espaça um elenco grande sem sobreposição", () => {
  assertSeparated(Array.from({ length: 24 }, (_, index) => index + 1));
});

it("repete as mesmas posições para os mesmos ids, em qualquer ordem", () => {
  const first = layoutRing([4, 1, 9, 2]);
  const second = layoutRing([9, 2, 4, 1]);
  expect(second).toEqual(first);
});

it("afasta os centros quando o card é mais largo", () => {
  const narrow = layoutRing([1, 2]);
  const wide = layoutRing([1, 2], { width: 280, height: NODE_BOX.height });
  const span = (frame: ReturnType<typeof layoutRing>) =>
    Math.hypot(frame.nodes[0]!.x - frame.nodes[1]!.x, frame.nodes[0]!.y - frame.nodes[1]!.y);
  expect(span(wide)).toBeGreaterThan(span(narrow));
});

it("coloca PJs no anel interno e NPCs no externo", () => {
  const cast = [
    { id: 5, tipo: "npc" as const },
    { id: 2, tipo: "pj" as const },
    { id: 4, tipo: "npc" as const },
    { id: 1, tipo: "pj" as const },
    { id: 3, tipo: "npc" as const },
  ];
  const frame = layoutRadialByTipo(cast);
  const center = frame.width / 2;
  const radius = (id: number) => {
    const node = frame.nodes.find((point) => point.id === id)!;
    return Math.hypot(node.x - center, node.y - center);
  };
  expect(Math.max(radius(1), radius(2))).toBeLessThan(Math.min(radius(3), radius(4), radius(5)));
  expect(layoutRadialByTipo([...cast].reverse())).toEqual(frame);
});

it("degrada para um anel quando só há um tipo", () => {
  for (const tipo of ["pj", "npc"] as const) {
    expect(layoutRadialByTipo([1, 2, 3].map((id) => ({ id, tipo })))).toEqual(
      layoutRing([1, 2, 3]),
    );
  }
});

it("não sobrepõe caixas num elenco grande em nenhum anel", () => {
  const cast = Array.from({ length: 45 }, (_, index) => ({
    id: index + 1,
    tipo: index < 5 ? ("pj" as const) : ("npc" as const),
  }));
  const frame = layoutRadialByTipo(cast);
  for (let i = 0; i < frame.nodes.length; i += 1) {
    for (let j = i + 1; j < frame.nodes.length; j += 1) {
      const a = frame.nodes[i]!;
      const b = frame.nodes[j]!;
      expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(minCenterDistance() - 1e-6);
    }
  }
});

it("centraliza o selecionado e separa vizinhos diretos dos demais", () => {
  const frame = layoutRadialByRelation([5, 1, 4, 3, 2], 1, [3, 2, 2]);
  const center = frame.width / 2;
  const distance = (id: number) => {
    const node = frame.nodes.find((point) => point.id === id)!;
    return Math.hypot(node.x - center, node.y - center);
  };
  expect(distance(1)).toBe(0);
  expect(distance(2)).toBeCloseTo(distance(3));
  expect(distance(2)).toBeLessThan(distance(4));
  expect(distance(4)).toBeCloseTo(distance(5));
  expect(frame.nodes).toHaveLength(5);
  expect(layoutRadialByRelation([2, 3, 4, 5, 1], 1, [2, 3])).toEqual(frame);
});

it("acomoda grupos vazios e um elenco grande sem sobreposição", () => {
  const cases = [
    layoutRadialByRelation([1], 1, []),
    layoutRadialByRelation([1, 2, 3], 1, []),
    layoutRadialByRelation([1, 2, 3], 1, [2, 3]),
    layoutRadialByRelation(
      Array.from({ length: 51 }, (_, i) => i + 1),
      1,
      Array.from({ length: 25 }, (_, i) => i + 2),
    ),
  ];
  for (const frame of cases) {
    for (let i = 0; i < frame.nodes.length; i += 1) {
      for (let j = i + 1; j < frame.nodes.length; j += 1) {
        const a = frame.nodes[i]!;
        const b = frame.nodes[j]!;
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(minCenterDistance() - 1e-6);
      }
    }
  }
});
