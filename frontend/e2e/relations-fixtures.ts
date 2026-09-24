import type { APIRequestContext } from '@playwright/test'
import type { E2ESession } from './helpers'

const TYPES = [
  'aliado',
  'vinculo_sangue',
  'amizade',
  'inimizade',
  'adversario',
  'romance',
  'familia',
  'conhecido',
] as const

export type RelationsFixture = {
  prefix: string
  characterIds: number[]
  bondIds: number[]
  cleanup: () => Promise<void>
}

export async function seedRelations(
  request: APIRequestContext,
  session: E2ESession,
): Promise<RelationsFixture> {
  const prefix = `Spec128-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const characterIds: number[] = []
  const bondIds: number[] = []
  const base = `/api/c/${session.slug}/admin`

  for (let index = 0; index < 12; index += 1) {
    const response = await request.post(`${base}/personagens`, {
      data: {
        nome: `${prefix}-${index}`,
        tipo: index < 4 ? 'pj' : 'npc',
        visivel_para_todos: true,
        status: 'vivo',
      },
    })
    if (!response.ok()) throw new Error(`Could not seed relation character: ${response.status()} ${await response.text()}`)
    characterIds.push((await response.json()).id as number)
  }

  async function createBond(payload: Record<string, unknown>) {
    const response = await request.post(`${base}/vinculos`, { data: payload })
    if (!response.ok()) throw new Error(`Could not seed relation bond: ${response.status()} ${await response.text()}`)
    bondIds.push((await response.json()).id as number)
  }

  for (const [index, type] of TYPES.entries()) {
    await createBond({
      personagem_a_id: characterIds[0],
      personagem_b_id: characterIds[index + 4],
      tipo_ab: type,
      tipo_ba: null,
      publico: true,
      conhecido_ab: true,
      conhecido_ba: true,
      direcao: index === 0 ? 'a_para_b' : index === 1 ? 'b_para_a' : null,
    })
  }

  await createBond({
    personagem_a_id: characterIds[1],
    personagem_b_id: characterIds[2],
    tipo_ab: 'romance',
    tipo_ba: 'amizade',
    nota_ab: `${prefix}-nota-secreta`,
    nota_ba: `${prefix}-nota-conhecida`,
    qualificador_ab: `${prefix}-qual-secreto`,
    qualificador_ba: 'Amizade conhecida',
    publico: true,
    conhecido_ab: false,
    conhecido_ba: true,
  })
  await createBond({
    personagem_a_id: characterIds[2],
    personagem_b_id: characterIds[3],
    tipo_ab: 'aliado',
    publico: false,
    conhecido_ab: true,
    conhecido_ba: true,
  })

  return {
    prefix,
    characterIds,
    bondIds,
    cleanup: async () => {
      for (const id of bondIds) await request.delete(`${base}/vinculos/${id}`)
      for (const id of characterIds) await request.delete(`${base}/personagens/${id}`)
    },
  }
}

