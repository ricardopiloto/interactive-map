import { expect, test } from '@playwright/test'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { applyAuth, loadSession, setLocale } from './helpers'

test('campanha nova e existente usam o mesmo tema sem seleção de gênero', async ({ page, context }) => {
  const session = loadSession()
  await applyAuth(context, session)
  await setLocale(page, 'pt-BR')
  await page.goto(`/c/${session.slug}`)
  const existingAccent = await page.locator('html').evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--color-accent').trim(),
  )
  await expect(page.locator('html')).not.toHaveAttribute('data-genre')

  await page.goto('/painel/novo')
  await expect(page.getByRole('heading', { name: 'Como sua campanha se chama?' })).toBeVisible()
  const name = `Mesa tema único ${Date.now()}`
  await page.getByLabel('Nome da campanha').fill(name)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByRole('heading', { name: 'Sistema' })).toBeVisible()
  await expect(page.getByRole('radiogroup')).toHaveCount(0)
  await page.getByLabel('Sistema').fill('Sistema livre')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('button', { name: 'Criar campanha' }).click()
  await expect(page.getByRole('link', { name: /Abrir campanha/ })).toBeVisible()
  await page.getByRole('link', { name: /Abrir campanha/ }).click()
  await expect(page.locator('html')).not.toHaveAttribute('data-genre')
  const newAccent = await page.locator('html').evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--color-accent').trim(),
  )
  expect(newAccent).toBe(existingAccent)
  await page.goto('/painel')
  await expect(page.getByLabel('Tema visual da campanha')).toHaveCount(0)
  const card = page.locator('.campaign-card').filter({ hasText: name })
  await expect(card).toHaveCount(1)
  const downloadEvent = page.waitForEvent('download')
  await card.getByRole('button', { name: 'Exportar' }).click()
  const download = await downloadEvent
  const zipPath = path.join(tmpdir(), download.suggestedFilename())
  await download.saveAs(zipPath)
  await page.getByLabel('Slug novo (opcional)').fill(`copia${Date.now()}`)
  await page.getByLabel('Ficheiro ZIP').setInputFiles(zipPath)
  await expect(page.locator('.campaign-card').filter({ hasText: name })).toHaveCount(2)
})
