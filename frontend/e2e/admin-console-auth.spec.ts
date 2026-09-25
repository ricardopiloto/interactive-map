import { expect, test } from '@playwright/test'
import { applyAdminAuth, applyAuth, loadSession, setLocale } from './helpers'

test('anonymous and non-admin users cannot open the global administration page', async ({ page, context }) => {
  const session = loadSession()
  await setLocale(page, 'pt-BR')
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login\?next=(?:%2F|\/)admin/)

  await applyAuth(context, session)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/painel$/)
})

test('only admins see administration navigation and old invite route remains available', async ({ page, context }) => {
  const session = loadSession()
  await applyAdminAuth(context, session)
  await setLocale(page, 'pt-BR')
  await page.goto('/')
  await page.getByRole('button', { name: /Menu do utilizador|User menu/ }).click()
  await expect(page.getByText(/Administração|Administration/)).toBeVisible()
  await page.goto('/admin/convites')
  await expect(page.getByRole('heading', { name: /Convites|Invites|Convidar/ })).toBeVisible()
})
