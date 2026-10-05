/** Fixed arc colors for the dark theme. "Sem arco" stays neutral and is not in this list. */
export const ARCO_COLOR_PALETTE = [
  '#5b8def',
  '#3dbe8c',
  '#e06c5a',
  '#b07cc6',
  '#e0a045',
  '#2bb5c0',
  '#e07aa4',
  '#8fbf4a',
] as const

/**
 * Pick a palette hex that is not already stored, using `random` in [0, 1].
 * When every palette color is taken, a palette color may repeat.
 */
export function suggestArcoColor(used: readonly string[], random: () => number = Math.random): string {
  const taken = new Set(used.map((color) => color.trim().toLowerCase()))
  const free = ARCO_COLOR_PALETTE.filter((color) => !taken.has(color))
  const pool = free.length > 0 ? free : ARCO_COLOR_PALETTE
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))
  return pool[index]
}
