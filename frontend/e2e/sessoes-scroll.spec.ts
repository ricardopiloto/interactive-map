import { expect, test } from '@playwright/test'
import { applyAuth, loadSession } from './helpers'

test('todas as sessões permanecem alcançáveis após rolar e redimensionar a página', async ({ page, context }, testInfo) => {
  const session = loadSession()
  await applyAuth(context, session)
  const base = `/api/c/${session.slug}/admin`
  const prefix = `Scroll149-${Date.now()}-${testInfo.project.name}`
  const ids: number[] = []
  try {
    const next = await page.request.get(`${base}/sessoes/proximo-numero`)
    expect(next.ok()).toBeTruthy()
    let numero = ((await next.json()) as { numero: number }).numero
    for (let index = 0; index < 12; index += 1) {
      const response = await page.request.post(`${base}/sessoes`, {
        data: {
          numero: numero++,
          // The sessions page sorts descending, so the newest title is at the top.
          titulo: `${prefix}-${index === 0 ? 'ULTIMA' : index === 11 ? 'PRIMEIRA' : `sessao-${index}`}`,
          resumo: 'Resumo extenso para aumentar o espaço vertical da lista. '.repeat(24),
          visivel_para_todos: true,
        },
      })
      expect(response.status()).toBe(201, await response.text())
      ids.push(((await response.json()) as { id: number }).id)
    }

    await page.goto(`/c/${session.slug}/sessoes`)
    await expect(page.getByRole('heading', { name: `${prefix}-PRIMEIRA` })).toBeAttached()
    const main = page.locator('.sessoes-page__main')
    if (testInfo.project.name === 'mobile') {
      // The mobile Chromium project has no swipe API; assert the scroll region
      // itself can reach the end at the narrow viewport, then leave touch for QA.
      await main.evaluate((node) => node.scrollTo({ top: node.scrollHeight, behavior: 'instant' }))
    } else {
      await main.focus()
      const box = await main.boundingBox()
      expect(box).toBeTruthy()
      await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
      await page.mouse.wheel(0, 10000)
      await main.focus()
      await page.keyboard.press('End')
    }
    await expect(page.getByRole('heading', { name: `${prefix}-ULTIMA` })).toBeInViewport()
    const scrollPositions = await page.evaluate(() => ({
      main: document.querySelector('.sessoes-page__main')?.scrollTop ?? 0,
      document: document.scrollingElement?.scrollTop ?? 0,
      mainHeight: document.querySelector('.sessoes-page__main')?.clientHeight ?? 0,
      mainScrollHeight: document.querySelector('.sessoes-page__main')?.scrollHeight ?? 0,
    }))
    const atEnd = scrollPositions.main > 0 || scrollPositions.document > 0
    expect(atEnd).toBeTruthy()

    await page.setViewportSize({ width: 1280, height: 720 })
    await page.locator('.sessoes-page__main').evaluate((node) => { node.scrollTop = node.scrollHeight })
    await expect(page.getByRole('heading', { name: `${prefix}-ULTIMA` })).toBeInViewport()
  } finally {
    for (const id of ids.reverse()) await page.request.delete(`${base}/sessoes/${id}`)
  }
})
