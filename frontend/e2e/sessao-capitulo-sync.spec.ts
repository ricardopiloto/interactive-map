import { test, expect } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'

test('vincular sessão a um capítulo sincroniza o arco exibido', async ({ page, context }, testInfo) => {
  const session = loadSession()
  await applyAuth(context, session)
  await preparePage(page, { locale: 'pt-BR', theme: 'light' })
  const suffix = `${testInfo.project.name} ${Date.now()}`
  const base = `/api/c/${session.slug}/admin`

  const arc = await page.request.post(`${base}/arcos`, {
    data: { titulo: `Arco sync ${suffix}`, ordem: 41, visivel_para_todos: true },
  })
  expect(arc.status()).toBe(201)
  const arcoId = (await arc.json()).id as number
  const arcoTitulo = (await arc.json()).titulo as string

  const cap = await page.request.post(`${base}/capitulos`, {
    data: { arco_id: arcoId, titulo: `Capítulo sync ${suffix}` },
  })
  expect(cap.status()).toBe(201)
  const capituloId = (await cap.json()).id as number

  await page.goto(`/c/${session.slug}/sessoes`)
  await page.getByTitle('Modo edição desligado — clicar para editar').click()
  await page.getByRole('button', { name: 'Nova sessão' }).click()

  const dialog = page.getByRole('dialog', { name: 'Nova sessão' })
  await dialog.getByLabel('Título').fill(`Sessão sync ${suffix}`)
  await dialog.getByLabel('Capítulo jogado').selectOption(String(capituloId))
  await expect(dialog.getByText(`Arco: ${arcoTitulo}`)).toBeVisible()

  const createResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().includes(`${base}/sessoes`),
  )
  await dialog.getByRole('button', { name: 'Salvar' }).click()
  const created = await (await createResponse).json()
  expect(created.capitulo_id).toBe(capituloId)
  expect(created.arco_id).toBe(arcoId)

  const reread = await page.request.get(`${base}/sessoes/${created.id}`)
  const body = await reread.json()
  expect(body.capitulo_id).toBe(capituloId)
  expect(body.arco_id).toBe(arcoId)
})
