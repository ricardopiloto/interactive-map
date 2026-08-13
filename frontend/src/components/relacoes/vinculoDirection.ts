import type { Vinculo, VinculoTipo } from '../../types'
import { vinculoStyle } from './vinculoStyles'

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

export function edgeMatchesTipos(v: Vinculo, active: Set<VinculoTipo>): boolean {
  if (v.tipo_ab != null && active.has(v.tipo_ab)) return true
  if (v.tipo_ba != null && active.has(v.tipo_ba)) return true
  if (v.tipo_ab == null && v.tipo_ba == null) return false
  // reciprocal-like: only ab or only effective
  if (v.tipo_ab != null && v.tipo_ba == null) return active.has(v.tipo_ab)
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

export function edgeIsDashed(v: Vinculo): boolean {
  if (isDuasVias(v)) {
    return vinculoStyle(v.tipo_ab!).dashed || vinculoStyle(v.tipo_ba!).dashed
  }
  return vinculoStyle(edgeDisplayTipo(v)).dashed
}
