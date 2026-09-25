import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {
  applyAuth,
  criticalViolations,
  loadSession,
  preparePage,
} from './helpers'

const LOCALES = ['pt-BR', 'en'] as const
const SCREENS = [
  { id: 'home', path: '/', auth: false },
  { id: 'explorar', path: '/explorar', auth: false },
  { id: 'painel', path: '/painel', auth: true },
  { id: 'mapa', path: (slug: string) => `/c/${slug}`, auth: false },
  { id: 'relacoes', path: (slug: string) => `/c/${slug}/relacoes`, auth: false },
  { id: 'sessoes', path: (slug: string) => `/c/${slug}/sessoes`, auth: false },
  { id: 'rota', path: (slug: string) => `/c/${slug}`, auth: false, tab: 'rota' },
] as const

type Locale = (typeof LOCALES)[number]

test.describe('quality gate (axe + visual)', () => {
  test.beforeAll(() => {
    loadSession()
  })

  for (const locale of LOCALES) {
    for (const screen of SCREENS) {
      test(`desktop light ${screen.id} ${locale}`, async ({ page, context }, testInfo) => {
        test.skip(testInfo.project.name !== 'desktop', 'desktop only')
        await runScreen(page, context, {
          screen,
          locale,
          theme: 'light',
          shot: `${screen.id}-${locale}-light-desktop`,
        })
      })

      test(`desktop dark ${screen.id} ${locale}`, async ({ page, context }, testInfo) => {
        test.skip(testInfo.project.name !== 'desktop', 'desktop only')
        await runScreen(page, context, {
          screen,
          locale,
          theme: 'dark',
          shot: `${screen.id}-${locale}-dark-desktop`,
        })
      })

      test(`mobile light ${screen.id} ${locale}`, async ({ page, context }, testInfo) => {
        test.skip(testInfo.project.name !== 'mobile', 'mobile only')
        await runScreen(page, context, {
          screen,
          locale,
          theme: 'light',
          shot: `${screen.id}-${locale}-light-mobile`,
        })
      })
    }
  }
})

async function runScreen(
  page: import('@playwright/test').Page,
  context: import('@playwright/test').BrowserContext,
  opts: {
    screen: (typeof SCREENS)[number]
    locale: Locale
    theme: 'light' | 'dark'
    shot: string
  },
) {
  const session = loadSession()
  if (opts.screen.auth) {
    await applyAuth(context, session)
  }
  await preparePage(page, { locale: opts.locale, theme: opts.theme })

  const path =
    typeof opts.screen.path === 'function' ? opts.screen.path(session.slug) : opts.screen.path
  await page.goto(path, { waitUntil: 'networkidle' })

  if ('tab' in opts.screen && opts.screen.tab === 'rota') {
    const seg = page.locator('.seg-opt', { hasText: /^Rota$|^Route$/i })
    if (await seg.count()) {
      await seg.click({ timeout: 10_000 })
    } else {
      await page.getByRole('button', { name: /^Rota$|^Route$/i }).click({ timeout: 10_000 })
    }
  }

  await page.waitForTimeout(400)

  const axe = await new AxeBuilder({ page }).analyze()
  const critical = criticalViolations(axe)
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([])

  await expect(page).toHaveScreenshot(`${opts.shot}.png`)
}
