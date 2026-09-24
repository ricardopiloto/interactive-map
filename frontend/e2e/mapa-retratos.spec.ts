import { expect, test } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'
import {
  brokenPortraitUrl,
  mockCharacterPortraitResponses,
  seedCharacterPortraits,
  validPortraitUrl,
} from './personagem-retratos-fixtures'

test('map character list shows portraits and keeps initials as fallback', async ({ page, context }) => {
  const session = loadSession()
  await applyAuth(context, session)
  const fixture = await seedCharacterPortraits(page.request, session)

  try {
    await mockCharacterPortraitResponses(page)
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    const brokenImageResponse = page.waitForResponse(
      (response) => response.url() === brokenPortraitUrl && response.status() === 404,
    )
    await page.goto(`/c/${session.slug}`, { waitUntil: 'networkidle' })
    await page.getByPlaceholder('Buscar local ou personagem…').fill(fixture.prefix)
    await page.getByRole('button', { name: 'Personagens', exact: true }).click()

    const portraitRow = page.locator('.map-page__row').filter({ hasText: fixture.characters.withPortrait.name })
    const portraitAvatar = portraitRow.locator('.map-page__avatar')
    await expect(portraitAvatar.locator('img')).toHaveAttribute('src', validPortraitUrl)
    await expect(portraitAvatar.locator('img')).toHaveAttribute('alt', '')
    await expect(portraitAvatar.locator('img')).toHaveJSProperty('naturalWidth', 40)

    const noPortraitRow = page.locator('.map-page__row').filter({ hasText: fixture.characters.withoutPortrait.name })
    await expect(noPortraitRow.locator('.map-page__avatar')).toHaveText('S')
    await expect(noPortraitRow.locator('.map-page__avatar img')).toHaveCount(0)

    const brokenPortraitRow = page.locator('.map-page__row').filter({ hasText: fixture.characters.brokenPortrait.name })
    await brokenImageResponse
    await expect(brokenPortraitRow.locator('.map-page__avatar img')).toHaveCount(0)
    await expect(brokenPortraitRow.locator('.map-page__avatar')).toHaveText('R')

    await portraitRow.click()
    await expect(page.locator('.map-page__detail-title')).toHaveText(fixture.characters.withPortrait.name)
  } finally {
    await fixture.cleanup()
  }
})
