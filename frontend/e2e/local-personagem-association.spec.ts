import { expect, test } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'

for (const locale of ['pt-BR', 'en'] as const) {
  test(`mestre associa PJ e NPC ao Local, reabre e remove apenas um vínculo (${locale})`, async ({ page, context }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'edição de Local validada no viewport desktop')
    const session = loadSession()
    await applyAuth(context, session)
    await preparePage(page, { locale, theme: 'light' })

    const suffix = Date.now().toString()
    const createCharacter = async (nome: string, tipo: 'pj' | 'npc') => {
      const response = await page.request.post(`/api/c/${session.slug}/admin/npcs`, {
        data: { nome, tipo, descricao: '', visivel_para_todos: true },
      })
      expect(response.status()).toBe(201)
      return await response.json() as { id: number }
    }
    const pjName = `PJ Local ${suffix}`
    const npcName = `NPC Local ${suffix}`
    const pj = await createCharacter(pjName, 'pj')
    const npc = await createCharacter(npcName, 'npc')
    const created = await page.request.post(`/api/c/${session.slug}/admin/locais`, {
      data: { nome: `Associação ${suffix}`, descricao: '', x: 0.25, y: 0.35, cor_pin: '#123456', npc_ids: [] },
    })
    expect(created.status()).toBe(201)
    const local = await created.json() as { id: number }

    try {
      await page.goto(`/c/${session.slug}?local=${local.id}`)
      const toggle = page.locator('.codex-header__edit-toggle')
      if ((await toggle.getAttribute('aria-pressed')) !== 'true') await toggle.click()
      await page.getByRole('button', { name: locale === 'pt-BR' ? 'Editar local' : 'Edit location' }).click()

      await expect(page.getByText(locale === 'pt-BR' ? 'Personagens presentes' : 'Characters present')).toBeVisible()
      const pjChip = page.getByRole('button', { name: new RegExp(`${locale === 'pt-BR' ? 'PJ' : 'PC'}.*${pjName}`) })
      const npcChip = page.getByRole('button', { name: new RegExp(`NPC.*${npcName}`) })
      await pjChip.click()
      await npcChip.click()
      await page.getByRole('button', { name: locale === 'pt-BR' ? 'Salvar' : 'Save', exact: true }).click()

      const readLocal = async () => {
        const response = await page.request.get(`/api/c/${session.slug}/admin/locais`)
        const rows = await response.json() as Array<{ id: number; npc_ids: number[] }>
        return rows.find((row) => row.id === local.id)!
      }
      await expect.poll(async () => new Set((await readLocal()).npc_ids)).toEqual(new Set([pj.id, npc.id]))

      await page.reload()
      const openEditor = async () => {
        const modeToggle = page.locator('.codex-header__edit-toggle')
        if ((await modeToggle.getAttribute('aria-pressed')) !== 'true') {
          const locaisLoaded = page.waitForResponse((response) =>
            response.url().endsWith(`/api/c/${session.slug}/admin/locais`) && response.request().method() === 'GET',
          )
          const personagensLoaded = page.waitForResponse((response) =>
            response.url().endsWith(`/api/c/${session.slug}/admin/npcs`) && response.request().method() === 'GET',
          )
          await modeToggle.click()
          await Promise.all([locaisLoaded, personagensLoaded])
        }
        const editButton = page.getByRole('button', { name: locale === 'pt-BR' ? 'Editar local' : 'Edit location' })
        if (!(await editButton.isVisible().catch(() => false))) {
          await page.getByTitle(`Associação ${suffix}`).evaluate((element) => (element as HTMLButtonElement).click())
        }
        await expect(page.getByRole('heading', { name: `Associação ${suffix}` })).toBeVisible()
        await editButton.click()
      }
      await openEditor()
      await expect(page.getByRole('button', { name: new RegExp(`${pjName}`) })).toHaveAttribute('aria-pressed', 'true')
      await expect(page.getByRole('button', { name: new RegExp(`${npcName}`) })).toHaveAttribute('aria-pressed', 'true')
      await page.getByRole('button', { name: new RegExp(`${pjName}`) }).click()
      await page.getByRole('button', { name: locale === 'pt-BR' ? 'Salvar' : 'Save', exact: true }).click()
      await expect.poll(async () => (await readLocal()).npc_ids).toEqual([npc.id])
      const characters = await page.request.get(`/api/c/${session.slug}/admin/npcs`)
      expect((await characters.json()).map((row: { id: number }) => row.id)).toEqual(expect.arrayContaining([pj.id, npc.id]))
    } finally {
      await page.request.delete(`/api/c/${session.slug}/admin/locais/${local.id}`, { timeout: 5000 }).catch(() => undefined)
      await page.request.delete(`/api/c/${session.slug}/admin/npcs/${pj.id}`, { timeout: 5000 }).catch(() => undefined)
      await page.request.delete(`/api/c/${session.slug}/admin/npcs/${npc.id}`, { timeout: 5000 }).catch(() => undefined)
    }
  })
}

test('falha ao salvar associação mantém editor aberto e comunica o erro', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'edição de Local validada no viewport desktop')
  const session = loadSession()
  await applyAuth(context, session)
  await preparePage(page, { locale: 'pt-BR', theme: 'light' })
  const name = `Falha associação ${Date.now()}`
  const response = await page.request.post(`/api/c/${session.slug}/admin/locais`, {
    data: { nome: name, descricao: '', x: 0.3, y: 0.4, cor_pin: '#123456', npc_ids: [] },
  })
  expect(response.status()).toBe(201)
  const local = await response.json() as { id: number }
  try {
    await page.goto(`/c/${session.slug}?local=${local.id}`)
    const toggle = page.locator('.codex-header__edit-toggle')
    if ((await toggle.getAttribute('aria-pressed')) !== 'true') await toggle.click()
    await page.getByRole('button', { name: 'Editar local' }).click()
    await page.route(`**/api/c/${session.slug}/admin/locais/${local.id}`, (route) => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({ status: 500, contentType: 'application/json', body: '{"detail":"simulated save failure"}' })
      }
      return route.continue()
    })
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Editar local' })).toBeVisible()
    expect((await page.request.get(`/api/c/${session.slug}/admin/locais`)).ok()).toBe(true)
  } finally {
    await page.unrouteAll({ behavior: 'ignoreErrors' })
    await page.request.delete(`/api/c/${session.slug}/admin/locais/${local.id}`, { timeout: 5000 }).catch(() => undefined)
  }
})
