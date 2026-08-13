import type { VinculoDirecao } from '../../types'

export function formatTipoWithQual(tipoLabel: string, qualificador?: string | null): string {
  const q = (qualificador ?? '').trim()
  if (!q) return tipoLabel
  return `${tipoLabel} (${q})`
}

/** Mid fragment for duas vias: `(Qual)` and/or `→` — never empty parens. */
export function midQualDirFragment(
  qualificador?: string | null,
  direcao?: VinculoDirecao | null,
): string {
  const q = (qualificador ?? '').trim()
  const parts: string[] = []
  if (q) parts.push(`(${q})`)
  if (direcao) parts.push('→')
  return parts.join(' ')
}

/** Reciprocal / detail primary: `Tipo (Qual)` + optional ` →`. */
export function formatVinculoTipoLabel(
  tipoLabel: string,
  qualificador?: string | null,
  direcao?: VinculoDirecao | null,
): string {
  let s = formatTipoWithQual(tipoLabel, qualificador)
  if (direcao) s += ' →'
  return s
}

export function estimateLabelWidth(text: string, charPx = 7, pad = 16): number {
  return Math.max(48, Math.ceil(text.length * charPx) + pad)
}
