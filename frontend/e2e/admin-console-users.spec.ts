import { expect, test } from '@playwright/test'
import { applyAdminAuth, loadSession, setLocale } from './helpers'

test('admin pesquisa conta, convida, redefine, muda estado e remove usuário descartável', async ({ page, context, request }) => {
  const session = loadSession()
  await applyAdminAuth(context, session)
  await setLocale(page, 'pt-BR')
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Administração da aplicação' })).toBeVisible()

  const email = `admin-console-${Date.now()}@teste.local`
  await page.getByLabel('Convidar por e-mail').fill(email)
  await page.getByRole('button', { name: 'Criar convite' }).click()
  const inviteLink = page.getByLabel('Link gerado')
  await expect(inviteLink).toHaveValue(/\/convite\//)
  const rawToken = (await inviteLink.inputValue()).split('/convite/')[1]
  // Keep invite acceptance isolated from the browser context: the response sets a
  // session cookie for the new account and must not replace the admin's cookie.
  const activation = await request.post('http://127.0.0.1:8001/api/auth/convite/aceitar', {
    headers: { origin: session.origin },
    data: { token: rawToken, password: 'E2E-user-secret-ok' },
  })
  expect(activation.ok()).toBeTruthy()

  await page.reload()
  await page.getByLabel('Pesquisar por e-mail').fill(email)
  const row = page.getByRole('row').filter({ hasText: email })
  await expect(row).toBeVisible()
  await row.getByRole('button', { name: 'Redefinir senha' }).click()
  await expect(page.getByLabel('Link gerado')).toHaveValue(/\/reset\//)
  await page.getByRole('button', { name: 'Fechar' }).click()

  await row.getByRole('button', { name: 'Desativar' }).click()
  await expect(row).toContainText('Inativa')
  await row.getByRole('button', { name: 'Reativar' }).click()
  await expect(row).toContainText('Ativa')
  await row.getByRole('button', { name: 'Excluir' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click()
  await expect(row).toHaveCount(0)
})

test('admin encontra conta proprietária e bloqueia ação destrutiva', async ({ page, context }) => {
  const session = loadSession()
  await applyAdminAuth(context, session)
  await setLocale(page, 'pt-BR')
  await page.goto('/admin')
  await page.getByLabel('Pesquisar por e-mail').fill(session.email)
  const ownerRow = page.getByRole('row').filter({ hasText: session.email }).last()
  await expect(ownerRow).toBeVisible()
  await expect(ownerRow.getByRole('button', { name: 'Excluir' })).toBeDisabled()
})
