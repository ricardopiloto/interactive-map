import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { criticalViolations, loadSession, setLocale } from './helpers'

const LOCALES = [
  { locale: 'pt-BR' as const, labels: ['Auto', 'Claro', 'Escuro'] },
  { locale: 'en' as const, labels: ['Auto', 'Light', 'Dark'] },
]

test.describe('campaign theme selector menu', () => {
  test.beforeAll(() => {
    loadSession()
  })

  for (const { locale, labels } of LOCALES) {
    test(`supports preference selection, persistence, and axe in ${locale}`, async ({ page }) => {
      const session = loadSession()
      await setLocale(page, locale)
      await page.addInitScript(() => localStorage.setItem('codex.theme', 'auto'))
      await page.goto(`/c/${session.slug}`, { waitUntil: 'networkidle' })

      const trigger = page.getByRole('button', {
        name: locale === 'pt-BR' ? 'Tema da interface' : 'Interface theme',
      })
      const closedAxe = await new AxeBuilder({ page }).analyze()
      expect(criticalViolations(closedAxe)).toEqual([])

      await trigger.click()
      const menu = page.getByRole('menu', {
        name: locale === 'pt-BR' ? 'Escolher tema' : 'Choose theme',
      })
      await expect(menu.getByRole('menuitemradio')).toHaveText(labels)
      await expect(menu.getByRole('menuitemradio', { name: labels[0] })).toHaveAttribute(
        'aria-checked',
        'true',
      )
      const openAxe = await new AxeBuilder({ page }).analyze()
      expect(criticalViolations(openAxe)).toEqual([])

      for (const [index, value] of ['auto', 'light', 'dark'].entries()) {
        await trigger.click()
        await menu.getByRole('menuitemradio', { name: labels[index] }).click()
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
        await expect(page.locator('html')).toHaveAttribute(
          'data-theme',
          value === 'auto' ? /light|dark/ : value,
        )
        await expect
          .poll(() => page.evaluate(() => localStorage.getItem('codex.theme')))
          .toBe(value)
        await page.reload()
        await trigger.click()
        await expect(
          page.getByRole('menuitemradio', { name: labels[index] }),
        ).toHaveAttribute('aria-checked', 'true')
        await trigger.click()
      }

      await trigger.focus()
      await page.keyboard.press('Enter')
      const radios = page.getByRole('menuitemradio')
      await expect(radios.nth(2)).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(radios.nth(0)).toBeFocused()
      await page.keyboard.press('ArrowUp')
      await expect(radios.nth(2)).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(trigger).toBeFocused()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await trigger.click()
      await page.keyboard.press('Tab')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await trigger.click()
      await page.locator('body').click({ position: { x: 4, y: 4 } })
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toBeFocused()
    })
  }
})
