import type { Vinculo, VinculoTipo } from '../../types'
import { vinculoStyle } from './vinculoStyles'

/** Reciprocal when tipo_ba is null or equals tipo_ab. */
export function isDuasVias(v: Pick<Vinculo, 'tipo_ab' | 'tipo_ba'>): boolean {
  return v.tipo_ba != null && v.tipo_ba !== v.tipo_ab
}

export function effectiveTipoBa(v: Pick<Vinculo, 'tipo_ab' | 'tipo_ba'>): VinculoTipo {
  return v.tipo_ba ?? v.tipo_ab
}

/** How `fromId` sees the other endpoint of this pair. */
export function tipoFromPerspective(v: Vinculo, fromId: number): VinculoTipo {
  if (fromId === v.personagem_a_id) return v.tipo_ab
  if (fromId === v.personagem_b_id) return effectiveTipoBa(v)
  return v.tipo_ab
}

export function notaFromPerspective(v: Vinculo, fromId: number): string {
  if (fromId === v.personagem_a_id) return v.nota_ab
  if (fromId === v.personagem_b_id) return isDuasVias(v) ? v.nota_ba : v.nota_ab
  return v.nota_ab
}

export function edgeMatchesTipos(v: Vinculo, active: Set<VinculoTipo>): boolean {
  if (active.has(v.tipo_ab)) return true
  return active.has(effectiveTipoBa(v))
}

export function tipColors(v: Vinculo): { colorA: string; colorB: string } {
  return {
    colorA: vinculoStyle(v.tipo_ab).color,
    colorB: vinculoStyle(effectiveTipoBa(v)).color,
  }
}

export function edgeIsDashed(v: Vinculo): boolean {
  return vinculoStyle(v.tipo_ab).dashed || vinculoStyle(effectiveTipoBa(v)).dashed
}
