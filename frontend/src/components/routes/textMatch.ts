/** Case- and accent-insensitive fold for substring search (FR-003). */
export function foldText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

/** Empty/whitespace query matches all labels. */
export function labelMatchesQuery(label: string, query: string): boolean {
  const q = foldText(query.trim())
  if (!q) return true
  return foldText(label).includes(q)
}
