import { expect, test } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'
import {
  brokenPortraitUrl,
  mockCharacterPortraitResponses,
  seedCharacterPortraits,
  validPortraitUrl,
} from './personagem-retratos-fixtures'

test('relations character list uses portraits and preserves filtering and selection', async ({ page, context }) => {
  const session = loadSession()
  await applyAuth(context, session)
  const fixture = await seedCharacterPortraits(page.request, session)

  try {
    await mockCharacterPortraitResponses(page)
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    const brokenImageResponse = page.waitForResponse(
      (response) => response.url() === brokenPortraitUrl && response.status() === 404,
    )
    await page.goto(`/c/${session.slug}/relacoes`, { waitUntil: 'networkidle' })
    const search = page.getByPlaceholder('Buscar personagem…')
    await search.fill(fixture.prefix)

    const portraitRow = page.locator('.relacoes-page__row').filter({ hasText: fixture.characters.withPortrait.name })
    const portraitAvatar = portraitRow.locator('.relacoes-page__avatar')
    await expect(portraitAvatar.locator('img')).toHaveAttribute('src', validPortraitUrl)
    await expect(portraitAvatar.locator('img')).toHaveAttribute('alt', '')
    await expect(portraitAvatar.locator('img')).toHaveJSProperty('naturalWidth', 40)

    const noPortraitRow = page.locator('.relacoes-page__row').filter({ hasText: fixture.characters.withoutPortrait.name })
    await expect(noPortraitRow.locator('.relacoes-page__avatar')).toHaveText('S')
    await expect(noPortraitRow.locator('.relacoes-page__avatar img')).toHaveCount(0)

    const brokenPortraitRow = page.locator('.relacoes-page__row').filter({ hasText: fixture.characters.brokenPortrait.name })
    await brokenImageResponse
    await expect(brokenPortraitRow.locator('.relacoes-page__avatar img')).toHaveCount(0)
    await expect(brokenPortraitRow.locator('.relacoes-page__avatar')).toHaveText('R')

    const statusFilter = page.locator('.relacoes-page__status-filter select')
    await statusFilter.selectOption('morto')
    await expect(page.locator('.relacoes-page__row')).toHaveCount(1)
    await expect(page.locator('.relacoes-page__row-title')).toHaveText(fixture.characters.brokenPortrait.name)
    await statusFilter.selectOption('todos')
    await search.fill(fixture.characters.withPortrait.name)
    await portraitRow.click()
    await expect(page.locator(`[data-node-id="${fixture.characters.withPortrait.id}"]`)).toHaveClass(/graph-node--selected/)
    await expect(
      page.locator(`[data-node-id="${fixture.characters.withPortrait.id}"] .graph-node__disc img`),
    ).toHaveAttribute('src', validPortraitUrl)
  } finally {
    await fixture.cleanup()
  }
})
