import { expect, test, type Page } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

async function expectPinCentered(page: Page, id: number, x: number, y: number) {
  const alignment = await page.locator(`#map-pin-${id}`).evaluate((pin) => {
    const dot = pin.querySelector("span")!.getBoundingClientRect();
    const stage = pin.closest('[data-testid="map-stage"]')!.getBoundingClientRect();
    return {
      dotX: dot.left + dot.width / 2,
      dotY: dot.top + dot.height / 2,
      stageX: stage.left,
      stageY: stage.top,
      stageW: stage.width,
      stageH: stage.height,
    };
  });
  expect(Math.abs(alignment.dotX - (alignment.stageX + alignment.stageW * x))).toBeLessThan(1);
  expect(Math.abs(alignment.dotY - (alignment.stageY + alignment.stageH * y))).toBeLessThan(1);
}

test("local e nó acompanham reposicionamento nas duas direções", async ({ page }) => {
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  const api = page.request;
  const name = `Local sincronizado ${Date.now()}`;
  const created = await api.post(`/api/c/${session.slug}/admin/locais`, {
    data: { nome: name, x: 0.2, y: 0.3, cor_pin: "#123456" },
  });
  expect(created.status()).toBe(201);
  const local = await created.json();
  expect(local.waypoint_id).toBeTruthy();
  let otherId: number | null = null;
  let segmentId: number | null = null;

  try {
    const other = await api.post(`/api/c/${session.slug}/admin/waypoints`, {
      data: { x: 0.8, y: 0.3 },
    });
    expect(other.status()).toBe(201);
    otherId = (await other.json()).id;
    const segment = await api.post(`/api/c/${session.slug}/admin/route-segments`, {
      data: {
        waypoint_a_id: local.waypoint_id,
        waypoint_b_id: otherId,
        tipo: "estrada",
        pontos_intermediarios: [],
      },
    });
    expect(segment.status()).toBe(201);
    segmentId = (await segment.json()).id;
    await page.goto(`/c/${session.slug}/mapa`);
    await page.getByRole("button", { name: "Modo GM" }).click();
    await page.locator(`#map-pin-${local.id}`).evaluate((element) => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await page.getByRole("button", { name: "Editar", exact: true }).click();
    await page.getByRole("button", { name: "Reposicionar no mapa", exact: true }).click();
    const mapStage = page.getByTestId("map-stage");
    await mapStage.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      element.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: rect.left + rect.width * 0.4,
          clientY: rect.top + rect.height * 0.3,
        }),
      );
    });
    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect
      .poll(async () => {
        const rows = await (await api.get(`/api/c/${session.slug}/admin/waypoints`)).json();
        return rows.find((node: { id: number }) => node.id === local.waypoint_id)?.x;
      })
      .not.toBe(0.2);
    const waypoints = await (await api.get(`/api/c/${session.slug}/admin/waypoints`)).json();
    const movedX = waypoints.find((node: { id: number }) => node.id === local.waypoint_id).x;
    const movedY = waypoints.find((node: { id: number }) => node.id === local.waypoint_id).y;
    await expectPinCentered(page, local.id, movedX, movedY);
    const segments = await (await api.get(`/api/c/${session.slug}/admin/route-segments`)).json();
    expect(
      segments.find((edge: { id: number }) => edge.id === segmentId).distancia_milhas,
    ).not.toBe(60);

    await page.goto(`/c/${session.slug}/rota`);
    await page.getByRole("button", { name: "Rede de rotas" }).click();
    await expectPinCentered(page, local.waypoint_id, movedX, movedY);
    const segmentPath = page.getByTestId("map-stage").locator("svg path").first();
    const beforePath = await segmentPath.getAttribute("d");
    await page.getByRole("button", { name, exact: true }).click();
    await page.getByRole("button", { name: "Mover nó" }).click();
    const stage = page.getByTestId("map-stage");
    await stage.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      element.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: rect.left + rect.width * 0.7,
          clientY: rect.top + rect.height * 0.6,
        }),
      );
    });
    await expect
      .poll(async () => {
        const rows = await (await api.get(`/api/c/${session.slug}/admin/locais`)).json();
        return rows.find((row: { id: number }) => row.id === local.id)?.x;
      })
      .not.toBe(movedX);
    await expect(segmentPath).not.toHaveAttribute("d", beforePath!);
    await expect
      .poll(async () => {
        const rows = await (await api.get(`/api/c/${session.slug}/admin/route-segments`)).json();
        return rows.find((edge: { id: number }) => edge.id === segmentId)?.distancia_milhas;
      })
      .not.toBe(segments.find((edge: { id: number }) => edge.id === segmentId).distancia_milhas);
    const updatedLocal = (await (await api.get(`/api/c/${session.slug}/admin/locais`)).json()).find(
      (row: { id: number }) => row.id === local.id,
    );
    await page.goto(`/c/${session.slug}/mapa`);
    await expect(page.locator(`#map-pin-${local.id}`)).toBeVisible();
    await expectPinCentered(page, local.id, updatedLocal.x, updatedLocal.y);
  } finally {
    if (segmentId != null)
      await api.delete(`/api/c/${session.slug}/admin/route-segments/${segmentId}`);
    if (otherId != null) await api.delete(`/api/c/${session.slug}/admin/waypoints/${otherId}`);
    await api.delete(`/api/c/${session.slug}/admin/locais/${local.id}`);
  }
});
