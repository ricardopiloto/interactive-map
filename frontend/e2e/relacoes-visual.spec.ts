import { expect, test } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'
import { seedRelations } from './relations-fixtures'

for (const theme of ['light', 'dark'] as const) {
  test(`rede de relações usa segmentos retos e oito amostras distintas em ${theme}`, async ({ page, context }) => {
    const session = loadSession()
    await applyAuth(context, session)
    const fixture = await seedRelations(page.request, session)

    try {
      await preparePage(page, { locale: 'pt-BR', theme })
      await page.addInitScript((selectedTheme) => localStorage.setItem('codex.theme', selectedTheme), theme)
      await page.goto(`/c/${session.slug}/relacoes`, { waitUntil: 'networkidle' })
      await page.getByTitle('Modo edição desligado — clicar para editar').click()

      const lines = page.locator('.graph-stage__edge-line')
      await expect(lines.first()).toBeVisible()
      for (const path of await lines.all()) {
        expect(await path.getAttribute('d')).not.toMatch(/\bQ\b/)
      }

      const chips = page.locator('.relacoes-page__chip-swatch')
      await expect(chips).toHaveCount(8)
      const computedColors = await chips.locator('line').evaluateAll((elements) =>
        elements.map((line) => getComputedStyle(line).stroke),
      )
      expect(new Set(computedColors).size).toBe(8)
      const sampleTypes = await chips.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('data-pattern')),
      )
      expect(sampleTypes).toContain('dotted')
      expect(sampleTypes).toContain('dashed')
      expect(sampleTypes).toContain('double')

      await expect(page.locator(`[data-vinculo-id="${fixture.bondIds[0]}"]`)).toHaveAttribute(
        'data-direction',
        'a_para_b',
      )
      await expect(page.locator(`[data-vinculo-id="${fixture.bondIds[1]}"]`)).toHaveAttribute(
        'data-direction',
        'b_para_a',
      )
    } finally {
      await fixture.cleanup()
    }
  })
}

