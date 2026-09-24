import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Page, BrowserContext } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type E2ESession = {
  slug: string
  email: string
  password: string
  cookieName: string
  cookieValue: string
  origin: string
}

export function loadSession(): E2ESession {
  const p = path.join(__dirname, '.auth', 'session.json')
  if (!fs.existsSync(p)) {
    throw new Error(`Missing ${p} — run: cd backend && DATA_DIR=../frontend/e2e/.data uv run python ../frontend/e2e/seed_e2e.py`)
  }
  return JSON.parse(fs.readFileSync(p, 'utf8')) as E2ESession
}

export async function applyAuth(context: BrowserContext, session = loadSession()) {
  await context.addCookies([
    {
      name: session.cookieName,
      value: session.cookieValue,
      url: session.origin,
      httpOnly: true,
      sameSite: 'Lax',
    },
  ])
}

export async function setLocale(page: Page, locale: 'pt-BR' | 'en') {
  await page.addInitScript((lng) => {
    localStorage.setItem('i18nextLng', lng)
  }, locale)
}

export async function setTheme(page: Page, theme: 'light' | 'dark') {
  await page.addInitScript((t) => {
    localStorage.setItem('codex.theme', t)
  }, theme)
}

export async function preparePage(
  page: Page,
  opts: { locale: 'pt-BR' | 'en'; theme: 'light' | 'dark' },
) {
  await setLocale(page, opts.locale)
  await setTheme(page, opts.theme)
}

/** axe: fail only on critical */
export function criticalViolations(results: { violations: Array<{ impact?: string | null; id: string; help: string; nodes: unknown[] }> }) {
  return results.violations.filter((v) => v.impact === 'critical')
}
