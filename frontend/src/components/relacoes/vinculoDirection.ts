import type { Vinculo, VinculoTipo } from '../../types'
import { vinculoStyle, type VinculoPattern } from './vinculoStyles'

/** Reciprocal-like when not both tips present and distinct. */
export function isDuasVias(v: Pick<Vinculo, 'tipo_ab' | 'tipo_ba'>): boolean {
  return v.tipo_ab != null && v.tipo_ba != null && v.tipo_ba !== v.tipo_ab
}

/** Single display tipo when edge is not full duas vias (reciprocal or one known tip). */
export function edgeDisplayTipo(v: Pick<Vinculo, 'tipo_ab' | 'tipo_ba'>): VinculoTipo {
  return (v.tipo_ab ?? v.tipo_ba ?? 'conhecido') as VinculoTipo
}

export function effectiveTipoBa(v: Pick<Vinculo, 'tipo_ab' | 'tipo_ba'>): VinculoTipo | null {
  if (v.tipo_ba != null) return v.tipo_ba
  return v.tipo_ab
}

/** How `fromId` sees the other endpoint; null if that tip is hidden from this viewer. */
export function tipoFromPerspective(v: Vinculo, fromId: number): VinculoTipo | null {
  if (fromId === v.personagem_a_id) return v.tipo_ab
  if (fromId === v.personagem_b_id) {
    if (v.tipo_ba != null) return v.tipo_ba
    return v.tipo_ab // reciprocal
  }
  return v.tipo_ab
}

export function notaFromPerspective(v: Vinculo, fromId: number): string {
  if (fromId === v.personagem_a_id) return v.tipo_ab != null ? v.nota_ab : ''
  if (fromId === v.personagem_b_id) {
    if (v.tipo_ba != null) return v.nota_ba
    return v.tipo_ab != null ? v.nota_ab : ''
  }
  return v.nota_ab
}

/** Qualifier for how `fromId` sees the other endpoint; empty when tip hidden. */
export function qualFromPerspective(v: Vinculo, fromId: number): string {
  if (fromId === v.personagem_a_id) return v.qualificador_ab ?? ''
  if (fromId === v.personagem_b_id) {
    if (v.tipo_ba != null) return v.qualificador_ba ?? ''
    return v.qualificador_ab ?? ''
  }
  return v.qualificador_ab ?? ''
}

export function edgeMatchesTipos(v: Vinculo, active: Set<VinculoTipo>): boolean {
  if (active.size === 0) return true
  if (v.tipo_ab != null && active.has(v.tipo_ab)) return true
  if (v.tipo_ba != null && active.has(v.tipo_ba)) return true
  return false
}

export function tipColors(v: Vinculo): { colorA: string; colorB: string } {
  if (isDuasVias(v)) {
    return {
      colorA: vinculoStyle(v.tipo_ab!).color,
      colorB: vinculoStyle(v.tipo_ba!).color,
    }
  }
  const c = vinculoStyle(edgeDisplayTipo(v)).color
  return { colorA: c, colorB: c }
}

function preferPattern(a: VinculoPattern, b: VinculoPattern): VinculoPattern {
  if (a === b) return a
  const rank: VinculoPattern[] = ['double', 'dotted', 'dashed', 'dashShort', 'solid']
  return rank.find((p) => p === a || p === b) ?? 'solid'
}

export function edgePattern(v: Vinculo): VinculoPattern {
  if (isDuasVias(v)) {
    return preferPattern(vinculoStyle(v.tipo_ab!).pattern, vinculoStyle(v.tipo_ba!).pattern)
  }
  return vinculoStyle(edgeDisplayTipo(v)).pattern
}

export function edgeWidth(v: Vinculo): number {
  if (isDuasVias(v)) {
    return Math.max(vinculoStyle(v.tipo_ab!).width, vinculoStyle(v.tipo_ba!).width)
  }
  return vinculoStyle(edgeDisplayTipo(v)).width
}
