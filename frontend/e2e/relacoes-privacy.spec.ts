import { expect, test } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'
import { seedRelations } from './relations-fixtures'

test('rede de relações mantém segredos apenas na perspectiva GM', async ({ page, context }) => {
  const session = loadSession()
  await applyAuth(context, session)
  const fixture = await seedRelations(page.request, session)

  try {
    await preparePage(page, { locale: 'pt-BR', theme: 'light' })
    const publicResponse = await page.request.get(`/api/c/${session.slug}/vinculos`)
    expect(publicResponse.ok()).toBeTruthy()
    const publicBonds = (await publicResponse.json()) as Array<Record<string, unknown>>
    expect(publicBonds.some((bond) => bond.id === fixture.bondIds[9])).toBe(false)
    const partial = publicBonds.find((bond) => bond.id === fixture.bondIds[8])
    expect(partial).toMatchObject({ tipo_ba: 'amizade', nota_ba: `${fixture.prefix}-nota-conhecida` })
    expect(JSON.stringify(partial)).not.toContain('nota-secreta')
    expect(JSON.stringify(partial)).not.toContain('qual-secreto')
    expect(partial?.tipo_ab).toBeUndefined()

    await page.goto(`/c/${session.slug}/relacoes`, { waitUntil: 'networkidle' })
    await expect(page.locator('.graph-stage')).toBeVisible()
    await page.locator(`[data-node-id="${fixture.characterIds[1]}"]`).click()
    await expect(page.getByText(`${fixture.prefix}-nota-secreta`)).toHaveCount(0)
    await expect(page.getByText('Vínculo privado')).toHaveCount(0)
    await expect(page.getByText('Sentido desconhecido pelos jogadores')).toHaveCount(0)

    await page.getByTitle('Modo edição desligado — clicar para editar').click()
    await expect(page.getByText('Vínculo privado', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Sentido desconhecido pelos jogadores', { exact: true }).first()).toBeVisible()
    await expect(page.getByText(`${fixture.prefix}-nota-secreta`)).toBeVisible()

    await page.getByTitle('Modo edição ligado — clicar para ver como jogador').click()
    await expect(page.getByText('Vínculo privado')).toHaveCount(0)
    await expect(page.getByText('Sentido desconhecido pelos jogadores')).toHaveCount(0)
    await expect(page.getByText(`${fixture.prefix}-nota-secreta`)).toHaveCount(0)
  } finally {
    await fixture.cleanup()
  }
})
