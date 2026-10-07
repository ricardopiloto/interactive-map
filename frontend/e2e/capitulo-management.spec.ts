import { test, expect } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'

test('mestre cria, edita, reordena e apaga capítulo', async ({ page, context }, testInfo) => {
  const session = loadSession()
  await applyAuth(context, session)
  await preparePage(page, { locale: 'pt-BR', theme: 'light' })
  const titulo = `Arco cap ${testInfo.project.name} ${Date.now()}`

  const arc = await page.request.post(`/api/c/${session.slug}/admin/arcos`, {
    data: { titulo, ordem: 40, visivel_para_todos: true },
  })
  expect(arc.status()).toBe(201)
  const arcoId = (await arc.json()).id as number

  await page.goto(`/c/${session.slug}/linha-do-tempo`)
  await page.getByTitle('Modo edição desligado — clicar para editar').click()
  await page.getByRole('button', { name: 'Gerenciar arcos' }).click()
  const row = page.locator('.list-row', { hasText: titulo })
  await row.getByRole('button', { name: 'Acções da linha' }).click()
  await page.getByRole('menuitem', { name: 'Editar' }).click()

  await page.getByRole('button', { name: '+ Novo capítulo' }).click()
  const novo = page.getByRole('dialog', { name: 'Novo capítulo' })
  await novo.getByRole('textbox').first().fill('Capítulo um')
  const createOne = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/api/c/${session.slug}/admin/capitulos`),
  )
  await novo.getByRole('button', { name: 'Salvar' }).click()
  expect((await createOne).status()).toBe(201)

  await page.getByRole('button', { name: '+ Novo capítulo' }).click()
  const novoDois = page.getByRole('dialog', { name: 'Novo capítulo' })
  await novoDois.getByRole('textbox').first().fill('Capítulo dois')
  const createTwo = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/api/c/${session.slug}/admin/capitulos`),
  )
  await novoDois.getByRole('button', { name: 'Salvar' }).click()
  expect((await createTwo).status()).toBe(201)

  const second = page.locator('.list-row', { hasText: 'Capítulo dois' })
  await second.getByRole('button', { name: 'Mover para cima' }).click()
  await expect(page.locator('.form-drawer__section .list-row .list-row__title').first()).toHaveText(
    'Capítulo dois',
  )

  await page.locator('.list-row', { hasText: 'Capítulo um' }).getByRole('button', { name: 'Editar' }).click()
  const editar = page.getByRole('dialog', { name: 'Editar capítulo' })
  await editar.getByRole('textbox').first().fill('Capítulo editado')
  const update = page.waitForResponse(
    (response) =>
      response.request().method() === 'PATCH' &&
      response.url().includes(`/api/c/${session.slug}/admin/capitulos/`),
  )
  await editar.getByRole('button', { name: 'Salvar' }).click()
  expect((await update).status()).toBe(200)

  const listed = await page.request.get(
    `/api/c/${session.slug}/admin/capitulos?arco_id=${arcoId}`,
  )
  const titulos = (await listed.json()).capitulos.map((item: { titulo: string }) => item.titulo)
  expect(titulos).toEqual(['Capítulo dois', 'Capítulo editado'])

  const edited = page.locator('.list-row', { hasText: 'Capítulo editado' })
  await edited.getByRole('button', { name: 'Excluir' }).click()
  await page.getByRole('button', { name: 'Excluir', exact: true }).last().click()
  await expect(page.getByText('Capítulo editado')).toHaveCount(0)
})
