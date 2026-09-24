import { expect, test } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'
import { seedRelations } from './relations-fixtures'

test('overview and focus keep PJ/NPC nodes in the usable graph viewport', async ({ page, context }) => {
  const session = loadSession()
  await applyAuth(context, session)
  const fixture = await seedRelations(page.request, session)

  try {
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto(`/c/${session.slug}/relacoes`, { waitUntil: 'networkidle' })
    await expect(page.locator('.graph-stage [data-node-id]')).toHaveCount(12)

    const panel = page.locator('.map-panel')
    const stage = page.locator('.graph-stage')
    const initialPanel = await panel.boundingBox()
    const stageBox = await stage.boundingBox()
    expect(initialPanel).toBeTruthy()
    expect(stageBox).toBeTruthy()

    for (const index of [0, 4, 7, 11]) {
      const node = page.locator(`[data-node-id="${fixture.characterIds[index]}"]`)
      await expect(node).toBeVisible()
      const box = await node.boundingBox()
      expect(box).toBeTruthy()
      expect(box!.x).toBeGreaterThanOrEqual(stageBox!.x)
      expect(box!.x + box!.width).toBeLessThanOrEqual(stageBox!.x + stageBox!.width)
    }

    await page.locator(`[data-node-id="${fixture.characterIds[0]}"]`).click()
    await expect(page.locator(`[data-node-id="${fixture.characterIds[0]}"]`)).toHaveClass(/graph-node--selected/)
    await expect(page.locator('.graph-stage [data-node-id]')).toHaveCount(12)

    const expand = page.getByRole('button', { name: 'Expandir painel' })
    if (await expand.isVisible()) await expand.click()
    const expanded = await panel.boundingBox()
    expect(expanded).toBeTruthy()
    expect(expanded!.height).toBeGreaterThan(initialPanel!.height)
  } finally {
    await fixture.cleanup()
  }
})

