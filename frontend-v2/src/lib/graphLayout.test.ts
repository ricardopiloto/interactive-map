import { expect, it } from "vitest";
import { NODE_BOX, layoutRing, minCenterDistance } from "./graphLayout";

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
