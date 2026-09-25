import { expect, test } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'

for (const locale of ['pt-BR', 'en'] as const) {
  test(`consulta pública mostra tipo e omite personagem oculto (${locale})`, async ({ page, context, browser }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'detalhe do Local validado no viewport desktop')
    const session = loadSession()
    await applyAuth(context, session)
    await preparePage(page, { locale, theme: 'light' })
    const suffix = Date.now().toString()
    const createCharacter = async (nome: string, tipo: 'pj' | 'npc', visible: boolean) => {
      const response = await page.request.post(`/api/c/${session.slug}/admin/npcs`, {
        data: { nome, tipo, descricao: '', visivel_para_todos: visible },
      })
      expect(response.status()).toBe(201)
      return await response.json() as { id: number }
    }
    const visiblePjName = `PJ público ${suffix}`
    const visibleNpcName = `NPC público ${suffix}`
    const hiddenPjName = `PJ secreto ${suffix}`
    const hiddenNpcName = `NPC secreto ${suffix}`
    const visiblePj = await createCharacter(visiblePjName, 'pj', true)
    const visibleNpc = await createCharacter(visibleNpcName, 'npc', true)
    const hiddenPj = await createCharacter(hiddenPjName, 'pj', false)
    const hiddenNpc = await createCharacter(hiddenNpcName, 'npc', false)
    const localResponse = await page.request.post(`/api/c/${session.slug}/admin/locais`, {
      data: {
        nome: `Local público ${suffix}`,
        descricao: '',
        x: 0.3,
        y: 0.4,
        cor_pin: '#123456',
        visivel_para_todos: true,
        npc_ids: [visiblePj.id, visibleNpc.id, hiddenPj.id, hiddenNpc.id],
      },
    })
    expect(localResponse.status()).toBe(201)
    const local = await localResponse.json() as { id: number }
    const anonymousContext = await browser.newContext({ baseURL: session.origin })
    try {
      const publicLocalResponse = await anonymousContext.request.get(`/api/c/${session.slug}/locais/${local.id}`)
      expect(publicLocalResponse.status()).toBe(200)
      expect(new Set((await publicLocalResponse.json()).npc_ids)).toEqual(new Set([visiblePj.id, visibleNpc.id]))
      const publicCharacters = await anonymousContext.request.get(`/api/c/${session.slug}/npcs`)
      const publicIds = (await publicCharacters.json() as Array<{ id: number }>).map((row) => row.id)
      expect(publicIds).toEqual(expect.arrayContaining([visiblePj.id, visibleNpc.id]))
      expect(publicIds).not.toEqual(expect.arrayContaining([hiddenPj.id, hiddenNpc.id]))

      const anonymousPage = await anonymousContext.newPage()
      await preparePage(anonymousPage, { locale, theme: 'light' })
      await anonymousPage.goto(`/c/${session.slug}?local=${local.id}`)
      await expect(anonymousPage.getByText(visiblePjName)).toBeVisible()
      await expect(anonymousPage.getByText(visibleNpcName)).toBeVisible()
      await expect(anonymousPage.getByText(hiddenPjName)).toHaveCount(0)
      await expect(anonymousPage.getByText(hiddenNpcName)).toHaveCount(0)
      await expect(anonymousPage.getByRole('button', { name: locale === 'pt-BR' ? 'Editar local' : 'Edit location' })).toHaveCount(0)
    } finally {
      await anonymousContext.close()
      await page.request.delete(`/api/c/${session.slug}/admin/locais/${local.id}`, { timeout: 5000 }).catch(() => undefined)
      for (const character of [visiblePj, visibleNpc, hiddenPj, hiddenNpc]) {
        await page.request.delete(`/api/c/${session.slug}/admin/npcs/${character.id}`, { timeout: 5000 }).catch(() => undefined)
      }
    }
  })
}
