import type { TFunction } from 'i18next'
import type { Personagem, Vinculo, VinculoDirecao } from '../../types'
import { edgeDisplayTipo, isDuasVias } from './vinculoDirection'
import { getVinculoTipoLabel } from './vinculoStyles'

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

/** GM-only edge aria-label: names + tipo(s), flagged when hidden from players (spec 128). */
export function edgeAccessibleLabel(
  v: Vinculo,
  personagens: Personagem[],
  t: TFunction,
): string {
  const nomeA = personagens.find((p) => p.id === v.personagem_a_id)?.nome ?? '?'
  const nomeB = personagens.find((p) => p.id === v.personagem_b_id)?.nome ?? '?'
  const tipo = isDuasVias(v)
    ? `${formatVinculoTipoLabel(getVinculoTipoLabel(t, v.tipo_ab!), v.qualificador_ab)} / ${formatVinculoTipoLabel(getVinculoTipoLabel(t, v.tipo_ba!), v.qualificador_ba)}`
    : formatVinculoTipoLabel(
        getVinculoTipoLabel(t, edgeDisplayTipo(v)),
        v.qualificador_ab ?? v.qualificador_ba,
        v.direcao,
      )
  const base = t('graph.edgeAria', { ns: 'relacoes', nomeA, nomeB, tipo })
  return v.publico ? base : t('graph.edgeAriaOculto', { ns: 'relacoes', label: base })
}
