import type { APIRequestContext, Page } from '@playwright/test'
import type { E2ESession } from './helpers'

export const validPortraitUrl = 'https://portrait-fixture.test/valid.svg'
export const brokenPortraitUrl = 'https://portrait-fixture.test/broken.svg'

export type CharacterPortraitFixture = {
  prefix: string
  characters: {
    withPortrait: { id: number; name: string }
    withoutPortrait: { id: number; name: string }
    brokenPortrait: { id: number; name: string }
  }
  cleanup: () => Promise<void>
}

export async function mockCharacterPortraitResponses(page: Page) {
  await page.route(validPortraitUrl, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#d4a72c"/></svg>',
    }),
  )
  await page.route(brokenPortraitUrl, (route) =>
    route.fulfill({ status: 404, contentType: 'image/svg+xml', body: '' }),
  )
}

export async function seedCharacterPortraits(
  request: APIRequestContext,
  session: E2ESession,
): Promise<CharacterPortraitFixture> {
  const prefix = `Spec145-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const createdIds: number[] = []
  const endpoint = `/api/c/${session.slug}/admin/personagens`

  async function createCharacter(
    suffix: string,
    retrato_url: string | null,
    status: 'vivo' | 'morto' | 'desaparecido',
  ) {
    const name = `${prefix}-${suffix}`
    const response = await request.post(endpoint, {
      data: {
        nome: name,
        tipo: 'npc',
        status,
        retrato_url,
        visivel_para_todos: true,
      },
    })
    if (!response.ok()) {
      throw new Error(`Could not seed character ${name}: ${response.status()} ${await response.text()}`)
    }
    const created = (await response.json()) as { id: number }
    createdIds.push(created.id)
    return { id: created.id, name }
  }

  const withPortrait = await createCharacter('ComRetrato', validPortraitUrl, 'vivo')
  const withoutPortrait = await createCharacter('SemRetrato', null, 'desaparecido')
  const brokenPortrait = await createCharacter('RetratoFalhou', brokenPortraitUrl, 'morto')

  return {
    prefix,
    characters: { withPortrait, withoutPortrait, brokenPortrait },
    cleanup: async () => {
      for (const id of createdIds.reverse()) {
        const response = await request.delete(`${endpoint}/${id}`)
        if (!response.ok() && response.status() !== 404) {
          throw new Error(`Could not clean up character ${id}: ${response.status()}`)
        }
      }
    },
  }
}
