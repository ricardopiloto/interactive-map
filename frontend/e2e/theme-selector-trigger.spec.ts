import { test, expect } from '@playwright/test'
import { loadSession, overrideCampaignGenre, setLocale } from './helpers'

const GENRES = ['fantasia', 'gotico', 'scifi', 'urbano'] as const

test.describe('campaign theme selector trigger', () => {
  test.beforeAll(() => {
    loadSession()
  })

  test.beforeEach(async ({ page }) => {
    const session = loadSession()
    await setLocale(page, 'pt-BR')
    await page.addInitScript(() => {
      if (localStorage.getItem('codex.theme') === null) localStorage.setItem('codex.theme', 'auto')
    })
    await page.goto(`/c/${session.slug}`, { waitUntil: 'networkidle' })
  })

  test('is icon-only, named accessibly, and keeps a 32px target', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Tema da interface' })
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveText('')
    await expect(trigger.locator('svg')).toHaveCount(1)
    const target = await trigger.boundingBox()
    expect(target?.height).toBeGreaterThanOrEqual(32)
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
  })

  test('shows the resolved system theme while Auto is selected', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Tema da interface' })
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(trigger.locator('svg')).toHaveClass(/tabler-icon-sun/)

    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(trigger.locator('svg')).toHaveClass(/tabler-icon-moon/)
  })

  test('keeps the explicit preference stable when system theme changes', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('codex.theme', 'light'))
    await page.reload()
    const trigger = page.getByRole('button', { name: 'Tema da interface' })
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(trigger.locator('svg')).toHaveClass(/tabler-icon-sun/)

    await page.evaluate(() => localStorage.setItem('codex.theme', 'dark'))
    await page.reload()
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(trigger.locator('svg')).toHaveClass(/tabler-icon-moon/)
  })

  for (const genero of GENRES) {
    test(`Auto tracks system changes and explicit choices remain stable in ${genero}`, async ({ page }) => {
      const session = loadSession()
      await page.evaluate(() => localStorage.setItem('codex.theme', 'auto'))
      await overrideCampaignGenre(page, session.slug, genero)
      await page.emulateMedia({ colorScheme: 'light' })
      await page.reload()

      const root = page.locator('html')
      const trigger = page.getByRole('button', { name: 'Tema da interface' })
      await expect(root).toHaveAttribute('data-genre', genero)
      await expect(root).toHaveAttribute('data-theme', 'light')
      await expect(trigger.locator('svg')).toHaveClass(/tabler-icon-sun/)

      await page.emulateMedia({ colorScheme: 'dark' })
      await expect(root).toHaveAttribute('data-theme', 'dark')
      await expect(trigger.locator('svg')).toHaveClass(/tabler-icon-moon/)

      await page.evaluate(() => localStorage.setItem('codex.theme', 'light'))
      await page.reload()
      await expect(root).toHaveAttribute('data-genre', genero)
      await expect(root).toHaveAttribute('data-theme', 'light')
      await page.emulateMedia({ colorScheme: 'dark' })
      await expect(root).toHaveAttribute('data-theme', 'light')

      await page.evaluate(() => localStorage.setItem('codex.theme', 'dark'))
      await page.reload()
      await expect(root).toHaveAttribute('data-genre', genero)
      await expect(root).toHaveAttribute('data-theme', 'dark')
      await page.emulateMedia({ colorScheme: 'light' })
      await expect(root).toHaveAttribute('data-theme', 'dark')
    })
  }
})
