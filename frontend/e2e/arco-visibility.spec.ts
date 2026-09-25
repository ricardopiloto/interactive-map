import { test, expect } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'

test('mestre alterna visibilidade e associação nula em Local', async ({ page, context }) => {
  const session = loadSession()
  await applyAuth(context, session)
  await preparePage(page, { locale: 'pt-BR', theme: 'light' })
  await page.goto(`/c/${session.slug}`)
  await page.getByTitle('Modo edição desligado — clicar para editar').click()
  await page.getByRole('button', { name: 'Menu de ferramentas do mapa' }).click()
  await page.getByRole('menuitem', { name: 'Gerenciar arcos' }).click()
  const arc = page.locator('.list-row').first()
  const hiddenTitle = await arc.locator('.list-row__title').innerText()
  await arc.getByRole('button', { name: 'Acções da linha' }).click()
  await page.getByRole('menuitem', { name: 'Editar' }).click()
  await page.locator('.ui-drawer input[type="checkbox"]').uncheck()
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByLabel('Arco oculto aos jogadores')).toBeVisible()
  const publicArcos = await page.request.get(`/api/c/${session.slug}/arcos`)
  expect((await publicArcos.json()).some((item: { titulo: string }) => item.titulo === hiddenTitle)).toBe(false)

  const visibleArcResponse = await page.request.post(`/api/c/${session.slug}/admin/arcos`, { data: {
    titulo: 'Arco E2E visível', ordem: 10, visivel_para_todos: true,
  } })
  expect(visibleArcResponse.status()).toBe(201)
  const visibleArc = await visibleArcResponse.json()
  const localResponse = await page.request.post(`/api/c/${session.slug}/admin/locais`, { data: {
    nome: 'Local E2E sem arco', x: 0.2, y: 0.3, cor_pin: '#123456', arco_id: null,
  } })
  expect(localResponse.status()).toBe(201)
  const local = await localResponse.json()
  const assigned = await page.request.put(`/api/c/${session.slug}/admin/locais/${local.id}`, { data: { arco_id: visibleArc.id } })
  expect(assigned.status()).toBe(200)
  const unassigned = await page.request.put(`/api/c/${session.slug}/admin/locais/${local.id}`, { data: { arco_id: null } })
  expect(unassigned.status()).toBe(200)
  expect((await unassigned.json()).arco_id).toBeNull()
})
