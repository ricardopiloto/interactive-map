import { expect, test } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

const HIDDEN_ITEM = "Amuleto E2E Oculto";
const VISIBLE_ITEM = "Relíquia E2E Visível";
const VISIBLE_SESSION = "Sessão E2E Visível";
const HIDDEN_SESSION = "Sessão E2E Privada";

async function itemIds(
  request: {
    get: (url: string) => Promise<{ ok: () => boolean; json: () => Promise<unknown> }>;
  },
  slug: string,
) {
  const publicList = await request.get(`/api/c/${slug}/itens`);
  expect(publicList.ok()).toBeTruthy();
  const publicItens = ((await publicList.json()) as { itens: { id: number; nome: string }[] })
    .itens;
  const visibleId = publicItens.find((i) => i.nome === VISIBLE_ITEM)?.id;
  expect(visibleId).toBeDefined();

  const adminList = await request.get(`/api/c/${slug}/admin/itens`);
  expect(adminList.ok()).toBeTruthy();
  const adminItens = ((await adminList.json()) as { itens: { id: number; nome: string }[] }).itens;
  const hiddenId = adminItens.find((i) => i.nome === HIDDEN_ITEM)?.id;
  expect(hiddenId).toBeDefined();
  return { visibleId: visibleId!, hiddenId: hiddenId! };
}

test("sem Modo GM oculta item secreto; Modo GM mostra com badge e deep-link", async ({ page }) => {
  test.setTimeout(60_000);
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  const { hiddenId } = await itemIds(page.request, session.slug);

  await page.goto(`/c/${session.slug}/itens`);
  await expect(page.getByRole("heading", { name: "Itens", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: VISIBLE_ITEM })).toBeVisible();
  await expect(page.getByRole("button", { name: HIDDEN_ITEM })).toHaveCount(0);

  await page.goto(`/c/${session.slug}/itens?item=${hiddenId}`);
  await expect(page.getByRole("status")).toContainText("Item não encontrado");

  await page.goto(`/c/${session.slug}/itens?item=999999`);
  await expect(page.getByRole("status")).toContainText("Item não encontrado");

  await page.goto(`/c/${session.slug}/itens`);
  await page.getByRole("button", { name: "Modo GM" }).click();
  await expect(page.getByRole("button", { name: new RegExp(HIDDEN_ITEM) })).toBeVisible();
  await expect(page.getByText("Oculto").first()).toBeVisible();

  await page.goto(`/c/${session.slug}/itens?item=${hiddenId}`);
  if (await page.getByRole("button", { name: "Modo GM" }).isVisible()) {
    await page.getByRole("button", { name: "Modo GM" }).click();
  }
  await expect(page.getByRole("heading", { name: HIDDEN_ITEM })).toBeVisible();
  await expect(page.getByText("Oculto").first()).toBeVisible();
});

test("chip de sessão oculta não aparece ao jogador; chip visível pré-seleciona sessão", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const session = loadSession();
  await setLocale(page, "pt-BR");
  const publicList = await page.request.get(`/api/c/${session.slug}/itens`);
  expect(publicList.ok()).toBeTruthy();
  const visibleId = (
    (await publicList.json()) as { itens: { id: number; nome: string }[] }
  ).itens.find((i) => i.nome === VISIBLE_ITEM)?.id;
  expect(visibleId).toBeDefined();

  await page.goto(`/c/${session.slug}/itens?item=${visibleId}`);
  await expect(page.getByRole("heading", { name: VISIBLE_ITEM })).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(VISIBLE_SESSION) })).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(HIDDEN_SESSION) })).toHaveCount(0);

  await page.getByRole("link", { name: new RegExp(VISIBLE_SESSION) }).click();
  await expect(page).toHaveURL(new RegExp(`/c/(?:\\d+/)?${session.slug}/sessoes\\?s=901`));
  await expect(page.getByRole("heading", { name: VISIBLE_SESSION })).toBeVisible();
});

test("fluxo feliz: aba Itens → buscar → detalhe → chip de sessão", async ({ page }) => {
  test.setTimeout(60_000);
  const session = loadSession();
  await setLocale(page, "pt-BR");

  await page.goto(`/c/${session.slug}/mapa`);
  await page.getByRole("link", { name: "Itens" }).first().click();
  await expect(page).toHaveURL(new RegExp(`/c/.*/itens`));
  await expect(page.getByRole("heading", { name: "Itens", exact: true })).toBeVisible();

  await page.getByRole("searchbox", { name: "Buscar por nome" }).fill("Relíquia");
  await expect(page.getByRole("button", { name: VISIBLE_ITEM })).toBeVisible();
  await page.getByRole("button", { name: VISIBLE_ITEM }).click();

  await expect(page.getByRole("heading", { name: VISIBLE_ITEM })).toBeVisible();
  await expect(page.locator("article strong").getByText("relíquia", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(VISIBLE_SESSION) })).toBeVisible();

  await page.getByRole("link", { name: new RegExp(VISIBLE_SESSION) }).click();
  await expect(page).toHaveURL(new RegExp(`/c/(?:\\d+/)?${session.slug}/sessoes\\?s=901`));
  await expect(page.getByRole("heading", { name: VISIBLE_SESSION })).toBeVisible();
});
