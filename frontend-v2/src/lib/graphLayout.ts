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
