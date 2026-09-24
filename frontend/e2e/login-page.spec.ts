import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { applyAuth, criticalViolations, loadSession, preparePage } from './helpers'

test.describe('full-page login and session transitions', () => {
  test.describe.configure({ retries: 0 })
  test('direct login and refresh stay full-page and reject an external next target', async ({ page }) => {
    const account = loadSession()
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    for (const next of ['https%3A%2F%2Fevil.example', '%2F%2Fevil.example']) {
      await page.goto(`/login?next=${next}`)
      await expect(page.locator('.auth-page')).toBeVisible()
      await expect(page.getByRole('dialog')).toHaveCount(0)
      const axe = await new AxeBuilder({ page }).analyze()
      expect(criticalViolations(axe), JSON.stringify(criticalViolations(axe))).toEqual([])
      if (next.startsWith('https')) {
        await page.reload()
        await expect(page.locator('.auth-page')).toBeVisible()
      }

      await page.getByLabel('E-mail').fill(account.email)
      await page.getByLabel('Senha').fill(account.password)
      await page.locator('.auth-card').getByRole('button', { name: 'Entrar' }).click()
      await expect(page).toHaveURL(/\/painel$/)
    }
  })

  test('refreshing a login modal falls back to the full-page route', async ({ page }) => {
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto('/')
    await page.getByRole('link', { name: 'Entrar como mestre' }).click()
    await expect(page.getByRole('dialog', { name: 'Entrar' })).toBeVisible()
    await page.reload()
    await expect(page.locator('.auth-page')).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('logout returns to full-page login without retaining the account page', async ({ page, context }) => {
    const account = loadSession()
    await applyAuth(context, account)
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto('/conta')
    await expect(page.getByRole('heading', { name: 'Conta' })).toBeVisible()
    await page.getByRole('button', { name: 'Terminar sessão' }).click()

    await expect(page).toHaveURL('/login')
    await expect(page.locator('.auth-page')).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Conta' })).toHaveCount(0)
  })

  test('reset completion and invite/reset links remain full-page routes', async ({ page }) => {
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto('/convite/invalid-token')
    await expect(page.locator('.auth-page')).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Activar conta' })).toBeVisible()

    await page.goto('/reset/test-token')
    await expect(page.getByRole('heading', { name: 'Nova senha' })).toBeVisible()
    await page.route('**/api/auth/reset/confirmar', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ email: 'reset@example.test' }),
    }))
    await page.getByLabel('Senha').fill('new-password-123')
    await page.getByRole('button', { name: 'Guardar senha' }).click()
    await expect(page).toHaveURL('/login')
    await expect(page.locator('.auth-page')).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})
