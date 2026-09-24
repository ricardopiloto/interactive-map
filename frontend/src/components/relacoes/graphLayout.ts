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
/** Compact the focus inner ring only when visible directs exceed this count. */
export const COMPACT_INNER_THRESHOLD = 6
/** «About one third less» than the default ring gap (spec 086). */
export const COMPACT_INNER_FACTOR = 2 / 3
/** Floor so name/disc boxes still clear each other (086/087). Do not clamp 088 to this.
 *  Spec 138: was 120 → 84 (−30%). */
export const COMPACT_INNER_SPACING_MIN = 84
/** Further −30% after the 086 compact (spec 088). 160 × 0.7 = 112. */
export const COMPACT_INNER_TIGHTEN = 0.6
/** Unselected (overview) ring gap — same floor as COMPACT_INNER_SPACING_MIN (spec 087). */
export const OVERVIEW_SPACING = COMPACT_INNER_SPACING_MIN

export function compactInnerSpacing(spacing: number): number {
  const after086 = Math.max(
    COMPACT_INNER_SPACING_MIN,
    Math.round(spacing * COMPACT_INNER_FACTOR),
  )
  return Math.round(after086 * COMPACT_INNER_TIGHTEN)
}

/** Spread the focus inner ring when visible directs are at or below this count. */
export const SPARSE_INNER_THRESHOLD = 3
/** +30% vs default focus gap (spec 089). With espacamento 168: 168 × 1.3 ≈ 218. */
export const SPARSE_INNER_FACTOR = 1.3

export function sparseInnerSpacing(spacing: number): number {
  return Math.round(spacing * SPARSE_INNER_FACTOR)
}

/** Inner-ring gap for focus layout: 1–3 sparse, 4–6 default, >6 compact. */
export function focusInnerSpacing(spacing: number, directCount: number): number {
  if (directCount > COMPACT_INNER_THRESHOLD) return compactInnerSpacing(spacing)
  if (directCount > 0 && directCount <= SPARSE_INNER_THRESHOLD) {
    return sparseInnerSpacing(spacing)
  }
  return spacing
}

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
  innerSpacing: number = spacing,
): Map<number, Point> {
  const positions = new Map<number, Point>()
  positions.set(selectedId, { ...center })

  const innerRadius = Math.max(NODE_W, ringMinRadius(directIds.length, innerSpacing))
  const outerRadius = innerRadius + NODE_H + spacing

  for (const [id, p] of layoutRings(directIds, center, innerRadius, innerSpacing)) {
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

/** Axis-aligned bbox of node boxes (layout centres ± NODE_W/2, NODE_H/2). */
export interface BBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** Padding (px each side) applied to content size before fit scale (spec 139). */
export const FIT_PADDING = 28

/** Build AABB from node layout centres. Empty iterable → null. */
export function bboxFromNodePositions(positions: Iterable<Point>): BBox | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let any = false
  for (const p of positions) {
    any = true
    minX = Math.min(minX, p.x - NODE_W / 2)
    maxX = Math.max(maxX, p.x + NODE_W / 2)
    minY = Math.min(minY, p.y - NODE_H / 2)
    maxY = Math.max(maxY, p.y + NODE_H / 2)
  }
  if (!any) return null
  return { minX, minY, maxX, maxY }
}

/**
 * Scale + pan so `bbox` fits in the usable viewport under
 * `translate(viewportCenter + pan) scale(scale)` with origin (0,0).
 * Caps zoom-in at 1.0 (never enlarge past “natural” 1∶1).
 */
export function fitScalePan(opts: {
  bbox: BBox
  usableW: number
  usableH: number
  padding?: number
  minScale: number
  maxScale: number
}): { scale: number; pan: Point } {
  const pad = opts.padding ?? FIT_PADDING
  const cw = Math.max(1, opts.bbox.maxX - opts.bbox.minX)
  const ch = Math.max(1, opts.bbox.maxY - opts.bbox.minY)
  const cx = (opts.bbox.minX + opts.bbox.maxX) / 2
  const cy = (opts.bbox.minY + opts.bbox.maxY) / 2
  let scale = Math.min(opts.usableW / (cw + 2 * pad), opts.usableH / (ch + 2 * pad))
  scale = Math.min(scale, 1)
  scale = Math.min(opts.maxScale, Math.max(opts.minScale, scale))
  return { scale, pan: { x: -scale * cx, y: -scale * cy } }
}
