import { test, expect } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'

test('ficha do NPC persiste e não aparece na leitura pública', async ({ page, context }, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile',
    'no mapa estreito a lista fica sob a navegação inferior; o fluxo completo corre no desktop',
  )
  const session = loadSession()
  await applyAuth(context, session)
  await preparePage(page, { locale: 'pt-BR', theme: 'light' })
  const nome = `NPC ficha ${testInfo.project.name} ${Date.now()}`
  await page.goto(`/c/${session.slug}`)
  await page.getByTitle('Modo edição desligado — clicar para editar').click()
  await page.getByRole('button', { name: 'Menu de ferramentas do mapa' }).click()
  await page.getByRole('menuitem', { name: 'Novo NPC' }).click()
  const dialog = page.getByRole('dialog', { name: 'Novo NPC' })
  await dialog.getByRole('textbox').first().fill(nome)
  await expect(dialog.locator('table.stat-block__table')).toBeVisible()
  await dialog.getByLabel('CA', { exact: true }).fill('4')
  await page.locator('#stat-pericias').fill('E2E-Pericia')
  const created = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith(`/api/c/${session.slug}/admin/npcs`),
  )
  await dialog.getByRole('button', { name: 'Salvar' }).click()
  expect((await created).status()).toBe(201)

  const admin = await page.request.get(`/api/c/${session.slug}/admin/npcs`)
  const saved = (await admin.json()).find((item: { nome: string }) => item.nome === nome)
  expect(saved.stat_block.ca).toBe(4)
  expect(saved.stat_block.pericias).toEqual(['E2E-Pericia'])

  await page.getByRole('button', { name: 'Personagens', exact: true }).click()
  await page.getByRole('button', { name: nome }).click()
  await expect(page.getByText('E2E-Pericia')).toHaveCount(0)
  await page.locator('.map-page__detail').getByRole('button', { name: 'Editar' }).click()
  const editDialog = page.getByRole('dialog', { name: 'Editar NPC' })
  await expect(editDialog.locator('table.stat-block__table')).toBeVisible()
  await expect(editDialog.getByLabel('CA', { exact: true })).toHaveValue('4')

  const publicNpc = await page.request.get(`/api/c/${session.slug}/npcs/${saved.id}`)
  const body = await publicNpc.json()
  expect(body.nome).toBe(nome)
  expect(body.stat_block).toBeUndefined()
})
