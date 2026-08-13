import type { VinculoTipo } from '../../types'

const MEDO = 'Medo'

const BY_TIPO: Record<VinculoTipo, string[]> = {
  aliado: ['Mentor', 'Protegido', 'Patrono', 'Devedor', 'Segredo', 'Lacaio'],
  vinculo_sangue: ['Lacaio'],
  amizade: ['Segredo', 'Companheiro de guerra'],
  inimizade: ['Rival', 'Traidor', 'Antigo aliado'],
  adversario: ['Rival', 'Traidor', 'Antigo aliado'],
  romance: [],
  familia: ['Pai/Mãe', 'Irmão/Irmã', 'Tutor'],
  conhecido: ['Rival', 'Desconfiança', 'Contato'],
}

/** Suggestions for one or more tip tipos (+ Medo once). Duas vias = union. */
export function suggestionsForTipos(...tipos: VinculoTipo[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const tipo of tipos) {
    for (const s of BY_TIPO[tipo] ?? []) {
      if (!seen.has(s)) {
        seen.add(s)
        out.push(s)
      }
    }
  }
  if (!seen.has(MEDO)) out.push(MEDO)
  return out
}
