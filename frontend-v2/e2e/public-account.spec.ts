import { expect, test } from "@playwright/test";
import { applyAdminAuth, applyAuth, loadSession, setLocale } from "./helpers";

test("home carrega sem autenticação", async ({ page }) => {
  await setLocale(page, "pt-BR");
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("O mapa, o elenco");
  await expect(page.getByRole("link", { name: "Ver campanhas abertas" })).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-genre");
});

test("conta exige sessão válida", async ({ page }) => {
  await setLocale(page, "pt-BR");
  await page.goto("/conta");
  await expect(page).toHaveURL(/\/login\?next=/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});

test("explorar mostra a campanha listada e esconde a que ficou só por link", async ({
  page,
  context,
}) => {
  const session = loadSession();
  await applyAuth(context, session);
  await setLocale(page, "pt-BR");
  await page.goto("/explorar");
  await page.getByLabel("Buscar campanhas").fill("E2E Codex");
  await expect(page.getByRole("article", { name: "E2E Codex" })).toBeVisible();

  await page.goto("/painel");
  const card = page.getByRole("article", { name: "E2E Codex" });
  await card.getByRole("button", { name: "Tornar só por link" }).click();
  await expect(card.getByText("Só por link", { exact: true })).toBeVisible();

  await page.goto("/explorar");
  await page.getByLabel("Buscar campanhas").fill("E2E Codex");
  await expect(page.getByRole("article", { name: "E2E Codex" })).toHaveCount(0);

  await page.goto("/painel");
  const hidden = page.getByRole("article", { name: "E2E Codex" });
  await hidden.getByRole("button", { name: "Tornar listada" }).click();
  await expect(hidden.getByText("Listada", { exact: true })).toBeVisible();
});

test("convite e reset rejeitam token inválido", async ({ page }) => {
  await setLocale(page, "pt-BR");
  await page.goto("/convite/token-invalido");
  await page.getByLabel("Senha").fill("senha-valida-8");
  await page.getByRole("button", { name: "Activar" }).click();
  await expect(page.getByRole("alert")).toContainText("Este link é inválido");

  await page.goto("/reset/token-invalido");
  await page.getByLabel("Senha").fill("senha-valida-8");
  await page.getByRole("button", { name: "Guardar senha" }).click();
  await expect(page.getByRole("alert")).toContainText("Este link é inválido");
  await expect(page.getByRole("link", { name: "Pedir novo link" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Pedir novo link" })).toHaveAttribute(
    "href",
    "/esqueci-senha",
  );
});

test("convite ativa a conta, o login seguinte abre a campanha e o reset troca a senha", async ({
  browser,
}) => {
  const session = loadSession();
  const email = `convite-${Date.now()}@teste.local`;
  const password = "E2E-user-secret-ok";
  const adminContext = await browser.newContext();
  await applyAdminAuth(adminContext, session);
  const adminPage = await adminContext.newPage();
  await setLocale(adminPage, "pt-BR");
  const created = await adminPage.request.post("/api/admin/convites", { data: { email } });
  expect(created.ok()).toBeTruthy();
  const inviteLink = ((await created.json()) as { link: string }).link;

  const userContext = await browser.newContext({ extraHTTPHeaders: { origin: session.origin } });
  const page = await userContext.newPage();
  await setLocale(page, "pt-BR");
  await page.goto(inviteLink);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Activar" }).click();
  await expect(page).toHaveURL(/\/painel$/);
  await page.goto("/conta");
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.locator("main").getByRole("link", { name: "Painel" })).toBeVisible();
  await expect(page.locator("main").getByRole("link", { name: "Início" })).toBeVisible();
  await page.getByRole("button", { name: "Terminar sessão" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);
  await page.goto("/c/e2e-codex/relacoes");
  await expect(page.getByRole("searchbox", { name: "Buscar personagem…" })).toBeVisible();

  const users = await adminPage.request.get(
    `/api/admin/usuarios?email=${encodeURIComponent(email)}`,
  );
  const id = ((await users.json()) as { usuarios: { id: number }[] }).usuarios[0].id;
  const reset = await adminPage.request.post(`/api/admin/usuarios/${id}/reset`, { data: {} });
  expect(reset.ok()).toBeTruthy();
  const resetLink = ((await reset.json()) as { link: string }).link;
  const resetContext = await browser.newContext();
  const resetPage = await resetContext.newPage();
  await setLocale(resetPage, "pt-BR");
  await resetPage.goto(resetLink);
  const nextPassword = "E2E-user-secret-2";
  await resetPage.getByLabel("Senha").fill(nextPassword);
  await resetPage.getByRole("button", { name: "Guardar senha" }).click();
  await expect(resetPage).toHaveURL(/\/login$/);
  await resetPage.getByLabel("E-mail").fill(email);
  await resetPage.getByLabel("Senha").fill(nextPassword);
  await resetPage.getByRole("button", { name: "Entrar" }).click();
  await expect(resetPage).not.toHaveURL(/\/login/);
  await resetPage.goto("/conta");
  await expect(resetPage.getByText(email)).toBeVisible();
  await adminContext.close();
  await userContext.close();
  await resetContext.close();
});
