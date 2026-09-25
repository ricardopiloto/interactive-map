import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {
  criticalViolations,
  loadSession,
  overrideCampaignGenre,
  setLocale,
} from './helpers'

const GENRES = ['fantasia', 'gotico', 'scifi', 'urbano'] as const
const ACCENTS = {
  light: {
    fantasia: '#7c5110',
    gotico: '#873f52',
    scifi: '#176579',
    urbano: '#315d8e',
  },
  dark: {
    fantasia: '#d8aa5a',
    gotico: '#de7384',
    scifi: '#51c0d6',
    urbano: '#73a5de',
  },
} as const

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
      await page.addInitScript(() => {
        if (localStorage.getItem('codex.theme') === null) localStorage.setItem('codex.theme', 'auto')
      })
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
      const menuItems = menu.getByRole('menuitemradio')
      for (const [index, label] of labels.entries()) {
        await expect(menuItems.nth(index)).toHaveAccessibleName(label)
      }
      await expect(menu.getByRole('menuitemradio', { name: labels[0] })).toHaveAttribute(
        'aria-checked',
        'true',
      )
      const openAxe = await new AxeBuilder({ page }).analyze()
      expect(criticalViolations(openAxe)).toEqual([])

      for (const [index, value] of ['auto', 'light', 'dark'].entries()) {
        if (index > 0) await trigger.click()
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
    })
  }

  for (const genero of GENRES) {
    test(`applies explicit light and dark in ${genero}`, async ({ page }) => {
      const session = loadSession()
      await setLocale(page, 'pt-BR')
      await page.addInitScript(() => {
        if (localStorage.getItem('codex.theme') === null) localStorage.setItem('codex.theme', 'auto')
      })
      await overrideCampaignGenre(page, session.slug, genero)
      await page.goto(`/c/${session.slug}`, { waitUntil: 'networkidle' })

      const root = page.locator('html')
      const trigger = page.getByRole('button', { name: 'Tema da interface' })
      const menu = page.getByRole('menu', { name: 'Escolher tema' })
      await expect(root).toHaveAttribute('data-genre', genero)

      for (const [label, value] of [
        ['Claro', 'light'],
        ['Escuro', 'dark'],
      ] as const) {
        await trigger.click()
        await menu.getByRole('menuitemradio', { name: label }).click()
        await expect(root).toHaveAttribute('data-theme', value)
        await expect(root).toHaveAttribute('data-genre', genero)
        await expect
          .poll(() => root.evaluate((element) => getComputedStyle(element).getPropertyValue('--color-accent').trim()))
          .toBe(ACCENTS[value][genero])
        await expect
          .poll(() => page.evaluate(() => localStorage.getItem('codex.theme')))
          .toBe(value)

        await page.reload()
        await expect(root).toHaveAttribute('data-genre', genero)
        await expect(root).toHaveAttribute('data-theme', value)
      }
    })
  }

  test('keeps different theme choices isolated in separate browser contexts', async ({ browser }) => {
    const session = loadSession()
    const contexts = await Promise.all([
      browser.newContext({ baseURL: session.origin }),
      browser.newContext({ baseURL: session.origin }),
    ])
    try {
      const [lightPage, darkPage] = await Promise.all(contexts.map((context) => context.newPage()))
      await Promise.all([
        setLocale(lightPage, 'pt-BR'),
        setLocale(darkPage, 'pt-BR'),
        lightPage.addInitScript(() => localStorage.setItem('codex.theme', 'light')),
        darkPage.addInitScript(() => localStorage.setItem('codex.theme', 'dark')),
        overrideCampaignGenre(lightPage, session.slug, 'urbano'),
        overrideCampaignGenre(darkPage, session.slug, 'urbano'),
      ])
      await Promise.all([
        lightPage.goto(`/c/${session.slug}`, { waitUntil: 'networkidle' }),
        darkPage.goto(`/c/${session.slug}`, { waitUntil: 'networkidle' }),
      ])

      await expect(lightPage.locator('html')).toHaveAttribute('data-genre', 'urbano')
      await expect(darkPage.locator('html')).toHaveAttribute('data-genre', 'urbano')
      await expect(lightPage.locator('html')).toHaveAttribute('data-theme', 'light')
      await expect(darkPage.locator('html')).toHaveAttribute('data-theme', 'dark')
    } finally {
      await Promise.all(contexts.map((context) => context.close()))
    }
  })
})
