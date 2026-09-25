import { expect, test } from '@playwright/test'
import { applyAdminAuth, loadSession, setLocale } from './helpers'

test('admin pesquisa mesa, distingue estado e visibilidade, e confirma o alvo da exclusão', async ({ page, context }, testInfo) => {
  const session = loadSession()
  await applyAdminAuth(context, session)
  await setLocale(page, 'pt-BR')
  await page.goto('/admin')
  await page.getByRole('tab', { name: 'Mesas' }).click()
  await page.getByLabel('Pesquisar por nome, slug ou proprietário').fill('E2E Codex')
  const row = page.getByRole('row').filter({ hasText: 'e2e-codex' })
  await expect(row).toBeVisible()
  await expect(row).toContainText('Listada')
  await expect(row).toContainText(/\d{1,2}\/\d{1,2}\/\d{4}|Data indisponível/)

  await row.getByRole('button', { name: 'Desativar' }).click()
  await expect(row).toContainText('Inativa')
  await expect(row).toContainText('Listada')
  await row.getByRole('button', { name: 'Reativar' }).click()
  await expect(row).toContainText('Ativa')

  const adminEmail = session.adminEmail
  if (adminEmail) {
    await row.getByLabel('Novo proprietário de E2E Codex').fill(adminEmail)
    await row.getByRole('button', { name: 'Transferir' }).click()
    await expect(row).toContainText(adminEmail)
    await row.getByLabel('Novo proprietário de E2E Codex').fill(session.email)
    await row.getByRole('button', { name: 'Transferir' }).click()
    await expect(row).toContainText(session.email)
  }

  await page.reload()
  await page.getByRole('tab', { name: 'Mesas' }).click()
  const disposableSlug = session.deleteCampaignSlugs?.[testInfo.project.name as 'desktop' | 'mobile']
    ?? session.deleteCampaignSlug
    ?? 'admin-e2e-descartavel'
  const disposable = page.getByRole('row').filter({ hasText: new RegExp(`${disposableSlug.replaceAll('-', '\\-')} · wfrp4e`) })
  await expect(disposable).toBeVisible()
  await disposable.getByRole('button', { name: 'Excluir' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Mesa descartável E2E')
  await expect(dialog).toContainText(disposableSlug)
  await dialog.getByRole('button', { name: 'Excluir permanentemente' }).click()
  await expect(disposable).toHaveCount(0)
  await expect(row).toBeVisible()
})
