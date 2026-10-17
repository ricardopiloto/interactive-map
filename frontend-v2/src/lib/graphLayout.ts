/**
 * One circle, sized from the parchment card box.
 * Neighbour centres stay at least a card-diagonal plus a gap apart,
 * so the boxes never overlap. The same ids always land on the same points.
 */

export const NODE_BOX = { width: 96, height: 124 };
export const NODE_GAP = 40;

export interface GraphPoint {
  id: number;
  x: number;
  y: number;
}

export interface GraphFrame {
  nodes: GraphPoint[];
  width: number;
  height: number;
}

export function minCenterDistance(
  box: { width: number; height: number } = NODE_BOX,
  gap = NODE_GAP,
) {
  return Math.hypot(box.width, box.height) + gap;
}

/** Radius of a regular polygon whose side equals `separation`. */
export function ringRadius(count: number, separation: number) {
  if (count < 2) return 0;
  return separation / (2 * Math.sin(Math.PI / count));
}

export function layoutRing(
  ids: readonly number[],
  box: { width: number; height: number } = NODE_BOX,
  gap = NODE_GAP,
): GraphFrame {
  const ordered = [...ids].sort((a, b) => a - b);
  const count = ordered.length;
  const separation = minCenterDistance(box, gap);
  const radius = ringRadius(count, separation);
  const pad = Math.max(box.width, box.height) / 2 + gap;
  const origin = radius + pad;
  const span = count <= 1 ? pad * 2 : origin * 2;
  const nodes = ordered.map((id, index) => {
    if (count <= 1) return { id, x: pad, y: pad };
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    return {
      id,
      x: origin + radius * Math.cos(angle),
      y: origin + radius * Math.sin(angle),
    };
  });
  return { nodes, width: span, height: span };
}

export function layoutRadialByTipo(
  personagens: readonly { id: number; tipo: "pj" | "npc" }[],
  box: { width: number; height: number } = NODE_BOX,
  gap = NODE_GAP,
): GraphFrame {
  const pjs = personagens.filter((person) => person.tipo === "pj").map((person) => person.id);
  const npcs = personagens.filter((person) => person.tipo === "npc").map((person) => person.id);
  if (!pjs.length || !npcs.length) return layoutRing(pjs.length ? pjs : npcs, box, gap);

  const separation = minCenterDistance(box, gap);
  const innerRadius = ringRadius(pjs.length, separation);
  const outerRadius = Math.max(ringRadius(npcs.length, separation), innerRadius + separation);
  const pad = Math.max(box.width, box.height) / 2 + gap;
  const origin = outerRadius + pad;
  const onRing = (ids: number[], radius: number): GraphPoint[] =>
    ids
      .sort((a, b) => a - b)
      .map((id, index) => {
        const angle = -Math.PI / 2 + (index * 2 * Math.PI) / ids.length;
        return { id, x: origin + radius * Math.cos(angle), y: origin + radius * Math.sin(angle) };
      });
  return {
    nodes: [...onRing(pjs, innerRadius), ...onRing(npcs, outerRadius)],
    width: origin * 2,
    height: origin * 2,
  };
}

/** The selected person anchors two deterministic rings of direct and other connections. */
export function layoutRadialByRelation(
  ids: readonly number[],
  selectedId: number,
  relatedIds: readonly number[],
  box: { width: number; height: number } = NODE_BOX,
  gap = NODE_GAP,
): GraphFrame {
  const visible = new Set(ids);
  if (!visible.has(selectedId)) return layoutRing(ids, box, gap);

  const related = new Set(relatedIds.filter((id) => id !== selectedId && visible.has(id)));
  const inner = [...related].sort((a, b) => a - b);
  const outer = [...visible]
    .filter((id) => id !== selectedId && !related.has(id))
    .sort((a, b) => a - b);
  const separation = minCenterDistance(box, gap);
  const innerRadius = inner.length ? Math.max(separation, ringRadius(inner.length, separation)) : 0;
  const outerRadius = outer.length
    ? Math.max(ringRadius(outer.length, separation), innerRadius + separation)
    : 0;
  const pad = Math.max(box.width, box.height) / 2 + gap;
  const origin = Math.max(innerRadius, outerRadius) + pad;
  const onRing = (group: number[], radius: number): GraphPoint[] =>
    group.map((id, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / group.length;
      return { id, x: origin + radius * Math.cos(angle), y: origin + radius * Math.sin(angle) };
    });

  return {
    nodes: [
      { id: selectedId, x: origin, y: origin },
      ...onRing(inner, innerRadius),
      ...onRing(outer, outerRadius),
    ],
    width: origin * 2,
    height: origin * 2,
  };
}
