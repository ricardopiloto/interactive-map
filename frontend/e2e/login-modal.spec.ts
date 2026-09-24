import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { criticalViolations, loadSession, preparePage } from './helpers'

test.describe('login modal navigation', () => {
  test.describe.configure({ retries: 0 })

  test('Home CTA keeps the background, uses SPA navigation, and resumes its safe target', async ({ page }) => {
    const account = loadSession()
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto('/')

    let documentLoads = 0
    page.on('load', () => { documentLoads += 1 })
    await page.getByRole('link', { name: 'Entrar como mestre' }).click()

    const dialog = page.getByRole('dialog', { name: 'Entrar' })
    await expect(dialog).toBeVisible()
    await expect(page.locator('.landing')).toBeVisible()
    await expect(page).toHaveURL(/\/login\?next=/)
    expect(documentLoads).toBe(0)
    const axe = await new AxeBuilder({ page }).analyze()
    expect(criticalViolations(axe), JSON.stringify(criticalViolations(axe))).toEqual([])

    await page.getByLabel('E-mail').fill(account.email)
    await page.getByLabel('Senha').fill(account.password)
    await dialog.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/painel$/)
    await expect(page.getByRole('heading', { name: 'Minhas campanhas' })).toBeVisible()
  })

  test('the final Home CTA resumes its explicit in-app destination', async ({ page }) => {
    const account = loadSession()
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto('/')
    await page.getByRole('link', { name: 'Criar meu primeiro codex' }).click()
    const dialog = page.getByRole('dialog', { name: 'Entrar' })
    await expect(dialog).toBeVisible()
    await page.getByLabel('E-mail').fill(account.email)
    await page.getByLabel('Senha').fill(account.password)
    await dialog.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/painel#criar$/)
  })

  test('invalid credentials and network errors stay in the modal and preserve the email for retry', async ({ page }) => {
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto('/')
    await page.getByRole('link', { name: 'Entrar como mestre' }).click()

    await page.route('**/api/auth/login', (route) => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'invalid credentials' }),
    }))
    await page.getByLabel('E-mail').fill('retry@example.test')
    await page.getByLabel('Senha').fill('incorrect-password')
    await page.getByRole('dialog').getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Não foi possível entrar. Verifique e-mail e senha.')).toBeVisible()
    await expect(page.getByLabel('E-mail')).toHaveValue('retry@example.test')

    await page.unroute('**/api/auth/login')
    await page.route('**/api/auth/login', (route) => route.abort())
    await page.getByRole('dialog').getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByLabel('E-mail')).toHaveValue('retry@example.test')
  })

  test('UserMenu login and cancel remain in the SPA and restore the current page', async ({ page }) => {
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto('/explorar')
    await expect(page.getByRole('button', { name: 'Menu do utilizador' })).toBeVisible()
    await page.getByRole('button', { name: 'Menu do utilizador' }).click()
    await page.getByRole('menuitem', { name: 'Entrar' }).click()

    await expect(page.getByRole('dialog', { name: 'Entrar' })).toBeVisible()
    await expect(page.locator('.explore-page')).toBeVisible()
    await expect(page).toHaveURL(/\/login\?next=/)
    await page.getByRole('button', { name: 'Fechar' }).click()
    await expect(page).toHaveURL('/explorar')
    await expect(page.getByRole('heading', { name: 'Descubra uma campanha' })).toBeVisible()
  })

  test('protected routes use a modal and cancellation falls back without a guard loop', async ({ page }) => {
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    for (const path of ['/painel', '/painel/novo', '/conta']) {
      await page.goto(path)
      await expect(page.getByRole('dialog', { name: 'Entrar' })).toBeVisible()
      await expect(page.locator('.landing')).toBeVisible()
      await page.getByRole('button', { name: 'Fechar' }).click()
      await expect(page).toHaveURL('/')
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await expect(page.getByRole('link', { name: 'Campaign Codex' })).toBeFocused()
    }
    await page.waitForTimeout(300)
    await expect(page).toHaveURL('/')
  })

  test('New Codex guard resumes the protected form after login', async ({ page }) => {
    const account = loadSession()
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto('/painel/novo')
    const dialog = page.getByRole('dialog', { name: 'Entrar' })
    await expect(dialog).toBeVisible()
    await page.getByLabel('E-mail').fill(account.email)
    await page.getByLabel('Senha').fill(account.password)
    await dialog.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('/painel/novo')
    await expect(page.getByRole('heading', { name: 'Como sua campanha se chama?' })).toBeVisible()
  })

  test('close button, Escape, backdrop, browser back, and focus restoration work', async ({ page }) => {
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    await page.goto('/')

    const cta = page.getByRole('link', { name: 'Entrar como mestre' })
    await cta.click()
    await expect(page.getByRole('dialog', { name: 'Entrar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Fechar' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Fechar' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL('/')
    await expect(cta).toBeFocused()

    await cta.click()
    await page.locator('.ui-backdrop').click({ position: { x: 4, y: 4 } })
    await expect(page).toHaveURL('/')

    await cta.click()
    await page.goBack()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('legacy campaign admin entry uses a modal and resumes its campaign destination', async ({ page }) => {
    const account = loadSession()
    await preparePage(page, { locale: 'en', theme: 'light' })
    await page.goto(`/c/${account.slug}/admin`)
    await expect(page.getByRole('dialog', { name: 'Sign in' })).toBeVisible()
    await expect(page.locator('.landing')).toBeVisible()
    await page.getByLabel('Email').fill(account.email)
    await page.getByLabel('Password').fill(account.password)
    await page.getByRole('dialog').getByRole('button', { name: 'Enter' }).click()
    await expect(page).toHaveURL(new RegExp(`/c/${account.slug}$`))
  })
})
