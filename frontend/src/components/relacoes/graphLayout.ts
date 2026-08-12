/** Layout math for the Relações graph — rings of nodes around a center point.
 *  Pure functions, no React: reused by GraphStage and, if needed, by tests. */

export interface Point {
  x: number
  y: number
}

/** Node "box" used for layout math (disc + name + papel label, per spec). */
export const NODE_W = 172
export const NODE_H = 112
/** Disc diameter. */
export const DISC = 58
/** Must match `.graph-node` `padding-top` in GraphStage.css. */
export const DISC_PAD_TOP = 2
/** Idle vínculo line opacity when nothing is selected (spec 068). */
export const EDGE_OPACITY_DIM = 0.18
/** Non-focus vínculo line opacity while a personagem is selected. */
export const EDGE_OPACITY_DIM_SELECTED = 0.08
/** Highlighted focus-edge opacity after layout animation (spec 068). */
export const EDGE_OPACITY_FOCUS = 0.9

/** Geometric centre of the initials disc, given the layout point (node-box centre). */
export function discCenterFromNodePos(pos: Point): Point {
  return {
    x: pos.x,
    y: pos.y - NODE_H / 2 + DISC_PAD_TOP + DISC / 2,
  }
}

/** Smallest radius at which `count` node-boxes fit around a ring without
 *  overlapping, given the desired gap (`spacing`) between adjacent boxes. */
export function ringMinRadius(count: number, spacing: number): number {
  if (count <= 0) return 0
  if (count === 1) return NODE_H / 2 + spacing / 2
  const circumference = count * (NODE_W + spacing)
  return circumference / (2 * Math.PI)
}

/** Places `ids` evenly around a circle of `radius` centered at `center`,
 *  widened as needed so nodes never overlap given `spacing`. */
export function layoutRings(
  ids: number[],
  center: Point,
  radius: number,
  spacing: number,
): Map<number, Point> {
  const positions = new Map<number, Point>()
  const n = ids.length
  if (n === 0) return positions

  const r = Math.max(radius, ringMinRadius(n, spacing))
  ids.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    positions.set(id, {
      x: center.x + r * Math.cos(angle),
      y: center.y + r * Math.sin(angle),
    })
  })
  return positions
}

const MIN_INNER_RADIUS = NODE_H

/** Initial ("visão geral") layout: PJs on an inner ring, NPCs on an outer
 *  ring, nothing at the center. */
export function computeInitialLayout(
  pjIds: number[],
  npcIds: number[],
  center: Point,
  spacing: number,
): Map<number, Point> {
  const innerRadius = Math.max(MIN_INNER_RADIUS, ringMinRadius(pjIds.length, spacing))
  const outerRadius = innerRadius + NODE_H + spacing

  const positions = layoutRings(pjIds, center, innerRadius, spacing)
  for (const [id, p] of layoutRings(npcIds, center, outerRadius, spacing)) {
    positions.set(id, p)
  }
  return positions
}

/** Focus ("seleção") layout: the selected personagem at the center, its
 *  direct vínculos on an inner ring, everyone else on an outer ring. */
export function computeFocusLayout(
  selectedId: number,
  directIds: number[],
  otherIds: number[],
  center: Point,
  spacing: number,
): Map<number, Point> {
  const positions = new Map<number, Point>()
  positions.set(selectedId, { ...center })

  const innerRadius = Math.max(NODE_W, ringMinRadius(directIds.length, spacing))
  const outerRadius = innerRadius + NODE_H + spacing

  for (const [id, p] of layoutRings(directIds, center, innerRadius, spacing)) {
    positions.set(id, p)
  }
  for (const [id, p] of layoutRings(otherIds, center, outerRadius, spacing)) {
    positions.set(id, p)
  }
  return positions
}

/** Outer bound (radius from center) reached by a given layout, for sizing
 *  scroll/zoom-to-fit behaviour. */
export function outermostRadius(positions: Map<number, Point>, center: Point): number {
  let max = 0
  for (const p of positions.values()) {
    const d = Math.hypot(p.x - center.x, p.y - center.y)
    if (d > max) max = d
  }
  return max
}
