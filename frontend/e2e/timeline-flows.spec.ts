import { expect, test } from '@playwright/test'
import { applyAuth, loadSession, preparePage } from './helpers'
import { seedTimeline } from './timeline-fixtures'

test.describe('Linha do Tempo — alinhamento ao protótipo (144)', () => {
  test('jogador expande cards, vê sessão e redação', async ({ page, context }) => {
    const session = loadSession()
    await applyAuth(context, session)
    const fixture = await seedTimeline(page.request, session)

    try {
      await preparePage(page, { locale: 'pt-BR', theme: 'light' })
      await page.goto(`/c/${session.slug}/linha-do-tempo`, { waitUntil: 'networkidle' })

      await expect(
        page.getByText('Relembre a história que o grupo já viveu.'),
      ).toBeVisible()
      await expect(page.getByRole('button', { name: /Novo evento/i })).toHaveCount(0)

      const expandFull = page.getByRole('button', {
        name: new RegExp(`Expandir: ${fixture.titles.visibleFull}`),
      })
      await expect(expandFull).toBeVisible()
      await expect(
        page.getByText(
          `Sessão ${fixture.sessionVisible.numero}: ${fixture.sessionVisible.titulo}`,
        ),
      ).toBeVisible()
      await expect(page.getByText(`${fixture.prefix}-descricao-visivel`)).toHaveCount(0)

      await expandFull.click()
      await expect(
        page.getByRole('button', {
          name: new RegExp(`Recolher: ${fixture.titles.visibleFull}`),
        }),
      ).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByText(`${fixture.prefix}-descricao-visivel`)).toBeVisible()
      await expect(page.getByText(`Local: ${fixture.localVisibleName}`)).toBeVisible()
      await expect(page.getByText(`Personagem: ${fixture.personagemVisibleName}`)).toBeVisible()

      await expect(page.getByText(fixture.titles.hiddenEvent)).toHaveCount(0)
      await expect(page.getByText(fixture.localHiddenName)).toHaveCount(0)
      await expect(page.getByText(fixture.personagemHiddenName)).toHaveCount(0)
      await expect(page.getByText(fixture.sessionHidden.titulo)).toHaveCount(0)
      await expect(
        page.getByText(`Sessão ${fixture.sessionHidden.numero}:`),
      ).toHaveCount(0)

      await expect(page.getByText(fixture.titles.visibleHiddenSession)).toBeVisible()
      await expect(
        page.getByText('Acontecimentos ainda ausentes nesta lista podem não ter sido revelados'),
      ).toBeVisible()

      await expect(page.getByRole('button', { name: /Editar evento/i })).toHaveCount(0)
      await expect(page.getByRole('button', { name: /Excluir evento/i })).toHaveCount(0)
    } finally {
      await fixture.cleanup()
    }
  })

  test('mestre expande cards, vê ocultos e preserva mês ao editar', async ({ page, context }) => {
    const session = loadSession()
    await applyAuth(context, session)
    const fixture = await seedTimeline(page.request, session)

    try {
      await preparePage(page, { locale: 'pt-BR', theme: 'light' })
      await page.goto(`/c/${session.slug}/linha-do-tempo`, { waitUntil: 'networkidle' })
      await page.getByTitle('Modo edição desligado — clicar para editar').click()

      await expect(
        page.getByText('Cadastre e acompanhe os acontecimentos da campanha.'),
      ).toBeVisible()
      await expect(page.getByRole('button', { name: /Novo evento/i })).toBeVisible()

      const expandFull = page.getByRole('button', {
        name: new RegExp(`Expandir: ${fixture.titles.visibleFull}`),
      })
      await expect(expandFull).toBeVisible()
      await expect(page.getByText(`${fixture.prefix}-descricao-visivel`)).toHaveCount(0)
      await expandFull.click()
      await expect(
        page.getByRole('button', {
          name: new RegExp(`Recolher: ${fixture.titles.visibleFull}`),
        }),
      ).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByText(`${fixture.prefix}-descricao-visivel`)).toBeVisible()
      await expect(
        page.getByText(
          `Sessão ${fixture.sessionVisible.numero}: ${fixture.sessionVisible.titulo}`,
        ),
      ).toBeVisible()

      await expect(page.getByText(fixture.titles.hiddenEvent)).toBeVisible()
      await expect(page.getByText('Oculto').first()).toBeVisible()

      const monthItem = page.locator('.linha-tempo-page__item', {
        hasText: fixture.titles.withMonth,
      })
      await expect(monthItem.locator('.linha-tempo-page__kicker-year')).toHaveText(
        /Ano \d+\/7/,
      )
      await monthItem
        .getByRole('button', {
          name: new RegExp(`Expandir: ${fixture.titles.withMonth}`),
        })
        .click()
      await monthItem.getByRole('button', { name: 'Editar evento' }).click()
      const drawer = page.locator('.ui-drawer, [role="dialog"]').last()
      await expect(drawer.getByText('Mês', { exact: true })).toHaveCount(0)
      await drawer.locator('textarea').first().fill(`${fixture.prefix}-desc-editada`)
      await drawer.getByRole('button', { name: /Salvar|Save/i }).click()
      await expect(
        page.getByRole('button', {
          name: new RegExp(`Recolher: ${fixture.titles.withMonth}`),
        }),
      ).toBeVisible()
      // Re-expand if collapsed after refresh — refresh remounts list
      const afterSave = page.getByRole('button', {
        name: new RegExp(`(Expandir|Recolher): ${fixture.titles.withMonth}`),
      })
      if ((await afterSave.getAttribute('aria-expanded')) !== 'true') {
        await afterSave.click()
      }
      await expect(page.getByText(`${fixture.prefix}-desc-editada`)).toBeVisible()

      const updated = await page.request.get(
        `/api/c/${session.slug}/admin/eventos/${fixture.eventWithMonthId}`,
      )
      expect(updated.ok()).toBeTruthy()
      expect((await updated.json()).mes).toBe(7)
    } finally {
      await fixture.cleanup()
    }
  })

  test('acessibilidade, i18n, temas e viewport estreito', async ({ page, context }) => {
    const session = loadSession()
    await applyAuth(context, session)
    const fixture = await seedTimeline(page.request, session)

    try {
      await preparePage(page, { locale: 'en', theme: 'dark' })
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(`/c/${session.slug}/linha-do-tempo`, { waitUntil: 'networkidle' })

      await expect(
        page.getByText('Recall the story the party has already lived.'),
      ).toBeVisible()

      const expandPlayer = page.getByRole('button', {
        name: new RegExp(`Expand: ${fixture.titles.visibleFull}`),
      })
      await expandPlayer.click()
      const chip = page.getByRole('link', {
        name: new RegExp(`Location: ${fixture.localVisibleName}`),
      })
      await expect(chip).toBeVisible()
      await expect(chip).toHaveAttribute('href', new RegExp(`/c/${session.slug}\\?local=`))

      const overflow = await page.evaluate(() => {
        const el = document.querySelector('.linha-tempo-page')
        if (!el) return true
        return el.scrollWidth > el.clientWidth + 1
      })
      expect(overflow).toBe(false)

      await page.getByTitle('Edit mode off — click to edit').click()
      await expect(
        page.getByText('Record and follow the campaign’s events.'),
      ).toBeVisible()
      const expand = page.getByRole('button', {
        name: new RegExp(`Expand: ${fixture.titles.visibleFull}`),
      })
      await expand.focus()
      await expect(expand).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(
        page.getByRole('button', {
          name: new RegExp(`Collapse: ${fixture.titles.visibleFull}`),
        }),
      ).toHaveAttribute('aria-expanded', 'true')
      await expect(
        page.getByRole('link', {
          name: new RegExp(`Character: ${fixture.personagemVisibleName}`),
        }),
      ).toHaveAttribute('href', new RegExp(`/c/${session.slug}/relacoes\\?personagem=`))
    } finally {
      await fixture.cleanup()
    }
  })
})
