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

  await page.mouse.move(box.x + 100, box.y + 120);
  await page.mouse.down();
  await page.mouse.move(box.x + 170, box.y + 120, { steps: 5 });
  await page.mouse.up();
  await expect.poll(async () => (await viewport()).x).not.toBe(zoomed.x);
  expect((await viewport()).scale).toBeCloseTo(zoomed.scale);

  await page
    .getByRole("button", { name: "Ajustar à tela para mostrar todos os personagens" })
    .click();

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
