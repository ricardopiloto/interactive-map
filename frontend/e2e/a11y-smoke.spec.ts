import { test, expect } from '@playwright/test'
import { loadSession, preparePage } from './helpers'

test.describe('keyboard + touch smoke', () => {
  test('mapa: controlos focáveis; pinos fora da ordem Tab', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop')
    const session = loadSession()
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto(`/c/${session.slug}`, { waitUntil: 'networkidle' })

    const toolbar = page.getByRole('toolbar')
    await expect(toolbar).toBeVisible()
    await toolbar.locator('button').first().focus()
    await expect(toolbar.locator('button').first()).toBeFocused()

    const pinTabIndex = await page.locator('.campaign-map__pin').first().getAttribute('tabindex')
    expect(pinTabIndex).toBe('-1')
  })

  test('mobile: alvos ui-touch ≥ 44px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile')
    const session = loadSession()
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto(`/c/${session.slug}`, { waitUntil: 'networkidle' })

    const sizes = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.ui-touch, .campaign-bottom-nav__item'))
      return nodes.slice(0, 12).map((el) => {
        const r = (el as HTMLElement).getBoundingClientRect()
        return { w: r.width, h: r.height, tag: el.tagName }
      })
    })
    for (const s of sizes) {
      expect(Math.min(s.w, s.h), JSON.stringify(s)).toBeGreaterThanOrEqual(44)
    }
  })
})
