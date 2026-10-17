import { expect, test } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

function cast(countPj: number, countNpc: number) {
  return Array.from({ length: countPj + countNpc }, (_, index) => ({
    id: index + 1,
    nome: `Personagem ${index + 1}`,
    tipo: index < countPj ? "pj" : "npc",
    papel: null,
    descricao: "",
    faccao: null,
    status: "vivo",
    retrato_url: null,
    visivel_para_todos: true,
    extensoes_mecanica: {},
    local_ids: [],
  }));
}

function bonds(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    personagem_a_id: (index % 6) + 1,
    personagem_b_id: ((index + 1) % 6) + 1,
    tipo_ab: "aliado",
    publico: true,
    qualificador_ab: "",
    qualificador_ba: "",
    nota_ab: "",
    nota_ba: "",
    conhecido_ab: true,
    conhecido_ba: true,
  }));
}

test("grafo com contagem da maior cópia disponível permite ajustar, zoom e pan", async ({
  page,
}) => {
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  // Largest local production copy: 4 PJ, 2 NPC, 6 bonds (1-wfrp.campanha.db).
  await page.route(/\/api\/c\/[^/]+\/personagens$/, (route) => route.fulfill({ json: cast(4, 2) }));
  await page.route(/\/api\/c\/[^/]+\/vinculos$/, (route) => route.fulfill({ json: bonds(6) }));
  await page.goto(`/c/${session.slug}/relacoes`);
  const stage = page.getByTestId("relations-stage");
  await expect(stage.locator("[data-node-id]")).toHaveCount(6);
  const viewport = async () =>
    stage.evaluate((element) => ({
      scale: Number(element.dataset.viewportScale),
      x: Number(element.dataset.viewportX),
      y: Number(element.dataset.viewportY),
    }));
  await page
    .getByRole("button", { name: "Ajustar à tela para mostrar todos os personagens" })
    .click();
  await expect.poll(async () => (await viewport()).scale).toBeGreaterThan(0);
  const fitted = await viewport();

  const box = await stage.boundingBox();
  if (!box) throw new Error("Graph stage has no bounding box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -400);
  await expect.poll(async () => (await viewport()).scale).toBeGreaterThan(fitted.scale);
  const zoomed = await viewport();

  const emptyPoint = await stage.evaluate((element) => {
    const wrapper = element.querySelector(".react-transform-wrapper")!;
    const rect = wrapper.getBoundingClientRect();
    for (let y = rect.top + 80; y < rect.bottom - 80; y += 40) {
      for (let x = rect.left + 80; x < rect.right - 80; x += 40) {
        const target = document.elementFromPoint(x, y);
        if (target && wrapper.contains(target) && !target.closest("[data-node-id]")) {
          return { x, y };
        }
      }
    }
    throw new Error("No empty graph area available for pan");
  });
  await page.mouse.move(emptyPoint.x, emptyPoint.y);
  await page.mouse.down();
  await page.mouse.move(emptyPoint.x + 70, emptyPoint.y, { steps: 5 });
  await page.mouse.up();
  await expect.poll(async () => (await viewport()).x).not.toBe(zoomed.x);
  expect((await viewport()).scale).toBeCloseTo(zoomed.scale);

  await page
    .getByRole("button", { name: "Ajustar à tela para mostrar todos os personagens" })
    .click();
  await page.waitForTimeout(250);

  const first = stage.locator("[data-node-id='1']");
  const second = stage.locator("[data-node-id='2']");
  await expect(first.locator("circle").first()).toBeInViewport();
  const firstBefore = await first.getAttribute("transform");
  const secondBefore = await second.getAttribute("transform");
  const beforeDrag = await viewport();
  await first.locator("circle").first().hover();
  const nodeBox = await first.locator("circle").first().boundingBox();
  if (!nodeBox) throw new Error("Character node has no bounding box");
  await page.mouse.down();
  await expect(first).toHaveClass(/cursor-grabbing/);
  await page.mouse.move(nodeBox.x + nodeBox.width / 2 + 40, nodeBox.y + nodeBox.height / 2, {
    steps: 5,
  });
  await page.mouse.up();
  await expect(first).not.toHaveAttribute("transform", firstBefore!);
  await expect(second).toHaveAttribute("transform", secondBefore!);
  expect(await viewport()).toEqual(beforeDrag);
});

test("ajustar à tela reduz escala de um elenco maior que o viewport", async ({ page }) => {
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  await page.route(/\/api\/c\/[^/]+\/personagens$/, (route) =>
    route.fulfill({ json: cast(5, 40) }),
  );
  await page.route(/\/api\/c\/[^/]+\/vinculos$/, (route) => route.fulfill({ json: bonds(45) }));
  await page.goto(`/c/${session.slug}/relacoes`);
  const stage = page.getByTestId("relations-stage");
  await expect(stage.locator("[data-node-id]")).toHaveCount(45);
  const fitted = Number(await stage.getAttribute("data-viewport-scale"));
  await page.getByRole("button", { name: "Aumentar zoom" }).click();
  await expect
    .poll(async () => Number(await stage.getAttribute("data-viewport-scale")))
    .toBeGreaterThan(fitted);
  await page
    .getByRole("button", { name: "Ajustar à tela para mostrar todos os personagens" })
    .click();
  await expect
    .poll(async () => Number(await stage.getAttribute("data-viewport-scale")))
    .toBeLessThan(1);
  await expect
    .poll(async () => Number(await stage.getAttribute("data-viewport-scale")))
    .toBeCloseTo(fitted, 2);
});

test("pan na área vazia preserva seleção e URL", async ({ page }) => {
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  await page.route(/\/api\/c\/[^/]+\/personagens$/, (route) => route.fulfill({ json: cast(4, 2) }));
  await page.route(/\/api\/c\/[^/]+\/vinculos$/, (route) => route.fulfill({ json: bonds(6) }));
  await page.goto(`/c/${session.slug}/relacoes?personagem=1`);
  const stage = page.getByTestId("relations-stage");
  await expect(stage.locator("[data-node-id]")).toHaveCount(6);
  await expect(page).toHaveURL(/personagem=1/);
  // Selected ring uses strokeWidth 3; PJ also has a thinner outer seal ring.
  await expect(stage.locator("[data-node-id='1'] circle[stroke-width='3']")).toHaveCount(1);

  const viewport = async () =>
    stage.evaluate((element) => ({
      scale: Number(element.dataset.viewportScale),
      x: Number(element.dataset.viewportX),
      y: Number(element.dataset.viewportY),
    }));
  const before = await viewport();

  const emptyPoint = await stage.evaluate((element) => {
    const wrapper = element.querySelector(".react-transform-wrapper")!;
    const rect = wrapper.getBoundingClientRect();
    for (let y = rect.top + 80; y < rect.bottom - 80; y += 40) {
      for (let x = rect.left + 80; x < rect.right - 80; x += 40) {
        const target = document.elementFromPoint(x, y);
        if (target && wrapper.contains(target) && !target.closest("[data-node-id]")) {
          return { x, y };
        }
      }
    }
    throw new Error("No empty graph area available for pan");
  });
  await page.mouse.move(emptyPoint.x, emptyPoint.y);
  await page.mouse.down();
  await page.mouse.move(emptyPoint.x + 80, emptyPoint.y + 20, { steps: 5 });
  await page.mouse.up();

  await expect.poll(async () => (await viewport()).x).not.toBe(before.x);
  await expect(page).toHaveURL(/personagem=1/);
  await expect(stage.locator("[data-node-id='1'] circle[stroke-width='3']")).toHaveCount(1);
});

for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`seleção centraliza personagem e separa anéis em ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const session = loadSession();
    await applyAuth(page.context(), session);
    await setLocale(page, "pt-BR");
    await page.route(/\/api\/c\/[^/]+\/personagens$/, (route) =>
      route.fulfill({ json: cast(5, 40) }),
    );
    await page.route(/\/api\/c\/[^/]+\/vinculos$/, (route) => route.fulfill({ json: bonds(45) }));
    await page.goto(`/c/${session.slug}/relacoes?personagem=1`);
    const stage = page.getByTestId("relations-stage");
    await expect(stage.locator("[data-node-id]")).toHaveCount(45);
    await expect
      .poll(async () =>
        stage.evaluate((element) => {
          const wrapper = element
            .querySelector(".react-transform-wrapper")!
            .getBoundingClientRect();
          const selected = element
            .querySelector("[data-node-id='1'] circle")!
            .getBoundingClientRect();
          return Math.abs(selected.left + selected.width / 2 - (wrapper.left + wrapper.width / 2));
        }),
      )
      .toBeLessThan(2);
    const rings = await stage.evaluate((element) => {
      const svg = element.querySelector("svg")!;
      const center = Number(svg.getAttribute("width")) / 2;
      const radius = (id: number) => {
        const raw = element.querySelector(`[data-node-id='${id}']`)!.getAttribute("transform")!;
        const [, x, y] = /translate\(([^,]+),([^)]+)\)/.exec(raw)!;
        return Math.hypot(Number(x) - center, Number(y) - center);
      };
      return [radius(1), radius(2), radius(7)];
    });
    expect(rings[0]).toBe(0);
    expect(rings[1]).toBeLessThan(rings[2]!);
  });
}
