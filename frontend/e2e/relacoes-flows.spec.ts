import { expect, test } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'
import { seedRelations } from './relations-fixtures'

test('search, type filters, list selection, graph selection, and mobile panel stay synchronized', async ({ page, context }, testInfo) => {
  const session = loadSession()
  await applyAuth(context, session)
  const fixture = await seedRelations(page.request, session)

  try {
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto(`/c/${session.slug}/relacoes`, { waitUntil: 'networkidle' })
    const search = page.getByPlaceholder('Buscar personagem…')
    await search.fill(`${fixture.prefix}-11`)
    await expect(page.locator('.relacoes-page__row-title')).toHaveText(`${fixture.prefix}-11`)
    await search.clear()
    await expect(page.locator('.relacoes-page__row-title')).toContainText(fixture.prefix)

    const friendChip = page.getByRole('button', { name: 'Amizade' })
    await friendChip.dblclick()
    await expect(friendChip).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator(`[data-vinculo-id="${fixture.bondIds[0]}"]`)).toHaveCount(0)
    await expect(page.locator(`[data-vinculo-id="${fixture.bondIds[2]}"]`)).toBeVisible()

    const listed = page.locator('.relacoes-page__row-title').filter({ hasText: `${fixture.prefix}-11` })
    await listed.click()
    await expect(page.locator(`[data-node-id="${fixture.characterIds[11]}"]`)).toHaveClass(/graph-node--selected/)
    await page.locator(`[data-node-id="${fixture.characterIds[0]}"]`).click()
    await expect(page.locator(`[data-node-id="${fixture.characterIds[0]}"]`)).toHaveClass(/graph-node--selected/)

    if (testInfo.project.name === 'mobile') {
      const expand = page.getByRole('button', { name: 'Expand panel' })
      if (await expand.isVisible()) await expand.click()
      await expect(page.locator('.map-panel[data-expanded="true"]')).toBeVisible()
      await expect(page.getByPlaceholder('Buscar personagem…')).toBeVisible()
    }

    await page.getByTitle('Modo edição desligado — clicar para editar').click()
    await expect(page.getByRole('button', { name: '+ Conexão' })).toBeVisible()
  } finally {
    await fixture.cleanup()
  }
})

