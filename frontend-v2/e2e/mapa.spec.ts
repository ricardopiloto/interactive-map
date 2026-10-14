import { expect, test, type Page } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

async function clickStage(page: Page, xRatio: number, yRatio: number) {
  const stage = page.getByTestId("map-stage");
  await expect(stage).toBeVisible();
  const box = await stage.boundingBox();
  if (!box) throw new Error("O palco do mapa não tem caixa visível.");
  await page.mouse.click(box.x + box.width * xRatio, box.y + box.height * yRatio);
}

test("mapa público mostra locais da campanha e abre o deep-link", async ({ page, request }) => {
  const session = loadSession();
  const locais = await request.get(`/api/c/${session.slug}/locais`);
  expect(locais.ok()).toBeTruthy();
  const rows = (await locais.json()) as { id: number; nome: string }[];
  const first = rows.find((row) => row.nome === "Altdorf");
  expect(first).toBeTruthy();

  await setLocale(page, "pt-BR");
  await page.goto(`/c/${session.slug}/mapa?local=${first!.id}`);
  await expect(page.getByRole("heading", { name: "Altdorf" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Ubersreik/ })).toBeVisible();
  await expect(page.getByRole("img", { name: "Mapa da campanha" })).toBeVisible();
});

test("mestre cria, edita e exclui local, cria NPC e move o grupo", async ({ page, request }) => {
  test.setTimeout(60_000);
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  await page.goto(`/c/${session.slug}/mapa`);
  await page.getByRole("button", { name: "Modo GM" }).click();

  await page.getByRole("button", { name: "Adicionar local no mapa" }).click();
  await clickStage(page, 0.18, 0.22);
  await page.getByRole("textbox", { name: "Nome" }).fill(`Ponte ${Date.now()}`);
  const createdName = await page.getByRole("textbox", { name: "Nome" }).inputValue();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { name: createdName })).toBeVisible();

  const listed = await request.get(`/api/c/${session.slug}/locais`);
  const created = ((await listed.json()) as { id: number; nome: string }[]).find(
    (row) => row.nome === createdName,
  );
  expect(created).toBeTruthy();

  await page.getByRole("button", { name: "Editar" }).click();
  const editedName = `${createdName} editada`;
  await page.getByRole("textbox", { name: "Nome" }).fill(editedName);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { name: editedName })).toBeVisible();

  await page.getByRole("button", { name: "Novo NPC" }).click();
  await page.getByRole("textbox", { name: "Nome" }).fill(`Greta ${Date.now()}`);
  const npcName = await page.getByRole("textbox", { name: "Nome" }).inputValue();
  await page.getByRole("checkbox", { name: editedName }).check();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("link", { name: npcName })).toBeVisible();

  const before = await (await request.get(`/api/c/${session.slug}/grupo`)).json();
  await page.getByRole("button", { name: "Fechar detalhes" }).click();
  await page.getByRole("button", { name: "Mover grupo" }).click();
  // Ponto bem distante do local criado em (0.18, 0.22) para não disputar o clique
  // com o pin (desabilitado, mas ainda presente no layout) durante o modo de posicionamento.
  await clickStage(page, 0.85, 0.8);
  await expect
    .poll(async () => (await (await request.get(`/api/c/${session.slug}/grupo`)).json()).x)
    .not.toBe(before.x);

  await page.reload();
  await expect(page.locator("#map-party")).toBeVisible();
  const afterReload = await (await request.get(`/api/c/${session.slug}/grupo`)).json();
  expect(afterReload.x).not.toBe(before.x);

  await page.goto(`/c/${session.slug}/mapa?local=${created!.id}`);
  await page.getByRole("button", { name: "Excluir" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();
  await expect(page.getByRole("button", { name: new RegExp(editedName) })).toHaveCount(0);
});

test("upload do mapa atualiza map_url da configuração", async ({ page, request }) => {
  test.setTimeout(60_000);
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  const before = await (await request.get(`/api/c/${session.slug}/config`)).json();
  await page.goto(`/c/${session.slug}/mapa`);
  await page.getByRole("button", { name: "Modo GM" }).click();
  await page.locator('input[type="file"][aria-label="Substituir mapa"]').setInputFiles({
    name: "mapa.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await expect
    .poll(async () => (await (await request.get(`/api/c/${session.slug}/config`)).json()).map_url)
    .not.toBe(before.map_url);
  const next = await (await request.get(`/api/c/${session.slug}/config`)).json();
  await expect(page.getByRole("img", { name: "Mapa da campanha" })).toHaveAttribute(
    "src",
    next.map_url,
  );
});
