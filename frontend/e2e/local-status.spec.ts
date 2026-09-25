import { expect, test } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'

test('mestre alterna o estado do local sem alterar cor ou rótulo de sessão', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'o editor de estado do Local é validado no viewport desktop')
  const session = loadSession()
  await applyAuth(context, session)
  await preparePage(page, { locale: 'pt-BR', theme: 'light' })

  const name = `Estado E2E ${Date.now()}`
  const created = await page.request.post(`/api/c/${session.slug}/admin/locais`, {
    data: {
      nome: name,
      descricao: '',
      x: 0.25,
      y: 0.35,
      data_sessao: 'Rótulo independente',
      cor_pin: '#123456',
      visivel_para_todos: true,
    },
  })
  expect(created.status()).toBe(201)
  const local = await created.json() as { id: number }
  const readLocal = async () => {
    const response = await page.request.get(`/api/c/${session.slug}/admin/locais`)
    const rows = await response.json() as Array<{ id: number; estado_exploracao: string; data_sessao: string; cor_pin: string }>
    return rows.find((row) => row.id === local.id)!
  }

  try {
    await page.goto(`/c/${session.slug}?local=${local.id}`)
    const enterEditor = async () => {
      const toggle = page.locator('.codex-header__edit-toggle')
      if ((await toggle.getAttribute('aria-pressed')) !== 'true') await toggle.click()
      await page.getByRole('button', { name, exact: true }).first().click()
      await page.getByRole('button', { name: 'Editar local' }).click()
    }
    await enterEditor()
    const color = page.getByLabel('Seletor de cor do pin')
    await expect(color).toHaveValue('#123456')

    await page.getByRole('button', { name: 'Visitado', exact: true }).click()
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    await expect.poll(async () => (await readLocal()).estado_exploracao).toBe('visitado')
    await page.reload()
    let body = await readLocal()
    expect(body).toMatchObject({ estado_exploracao: 'visitado', data_sessao: 'Rótulo independente', cor_pin: '#123456' })

    await enterEditor()
    await page.getByRole('button', { name: 'Conhecido', exact: true }).click()
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    await page.reload()
    body = await readLocal()
    expect(body).toMatchObject({ estado_exploracao: 'conhecido', data_sessao: 'Rótulo independente', cor_pin: '#123456' })
  } finally {
    await page.request.delete(`/api/c/${session.slug}/admin/locais/${local.id}`)
  }
})
