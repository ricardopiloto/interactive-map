import { test, expect } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'

test('capítulo oculto não aparece para o jogador', async ({ page, context }, testInfo) => {
  const session = loadSession()
  await applyAuth(context, session)
  await preparePage(page, { locale: 'pt-BR', theme: 'light' })
  const titulo = `Arco vis ${testInfo.project.name} ${Date.now()}`

  const arc = await page.request.post(`/api/c/${session.slug}/admin/arcos`, {
    data: { titulo, ordem: 41, visivel_para_todos: true },
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
  await novo.getByRole('textbox').first().fill('Capítulo secreto')
  const created = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/api/c/${session.slug}/admin/capitulos`),
  )
  await novo.getByRole('button', { name: 'Salvar' }).click()
  expect((await created).status()).toBe(201)

  const admin = await page.request.get(`/api/c/${session.slug}/admin/capitulos?arco_id=${arcoId}`)
  const publicList = await page.request.get(`/api/c/${session.slug}/capitulos?arco_id=${arcoId}`)
  expect(
    (await admin.json()).capitulos.some((item: { titulo: string }) => item.titulo === 'Capítulo secreto'),
  ).toBe(true)
  expect(
    (await publicList.json()).capitulos.some(
      (item: { titulo: string }) => item.titulo === 'Capítulo secreto',
    ),
  ).toBe(false)
})

test('rótulos de capítulo seguem o idioma da interface', async ({ page, context }, testInfo) => {
  const session = loadSession()
  await applyAuth(context, session)
  await preparePage(page, { locale: 'en', theme: 'light' })
  const titulo = `Arc labels ${testInfo.project.name} ${Date.now()}`

  const arc = await page.request.post(`/api/c/${session.slug}/admin/arcos`, {
    data: { titulo, ordem: 42, visivel_para_todos: true },
  })
  expect(arc.status()).toBe(201)

  await page.goto(`/c/${session.slug}/linha-do-tempo`)
  await page.getByTitle('Edit mode off — click to edit').click()
  await page.getByRole('button', { name: 'Manage arcs' }).click()
  const row = page.locator('.list-row', { hasText: titulo })
  await row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Edit' }).click()
  await expect(page.getByRole('heading', { name: 'Chapters' })).toBeVisible()
  await expect(page.getByRole('button', { name: '+ New chapter' })).toBeVisible()
  await expect(page.getByText('Novo capítulo')).toHaveCount(0)
})
