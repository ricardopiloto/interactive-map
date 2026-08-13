/** Map browser language tags to supported app locales (pt-BR | en). */
export function normalizeLocale(code: string | undefined): 'pt-BR' | 'en' {
  const tag = (code ?? '').toLowerCase()
  if (tag.startsWith('en')) return 'en'
  if (tag.startsWith('pt')) return 'pt-BR'
  return 'pt-BR'
}
