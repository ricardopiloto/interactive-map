import { expect, test } from "@playwright/test";
import { applyAdminAuth, applyAuth, loadSession, setLocale } from "./helpers";

test("usuário sem is_admin não vê ações do console", async ({ browser }) => {
  const session = loadSession();
  const context = await browser.newContext();
  await applyAuth(context, session);
  const page = await context.newPage();
  await setLocale(page, "pt-BR");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/painel$/);
  await expect(page.getByRole("button", { name: "Criar convite" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Administração" })).toHaveCount(0);
  await context.close();
});

test("convite gerado no console é aceito e o dono transferido passa a ver a mesa no painel", async ({
  browser,
}) => {
  test.setTimeout(90_000);
  const session = loadSession();
  const adminContext = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
  });
  await applyAdminAuth(adminContext, session);
  const page = await adminContext.newPage();
  await setLocale(page, "pt-BR");
  const email = `console-${Date.now()}@teste.local`;
  await page.goto("/admin/convites");
  await page.getByLabel("E-mail do novo mestre").fill(email);
  await page.getByRole("button", { name: "Gerar convite" }).click();
  const link = page.getByLabel("Link de convite gerado");
  await expect(link).toHaveValue(/\/convite\//);
  await page.getByRole("button", { name: "Copiar" }).click();
  await expect(page.getByRole("button", { name: "Copiado!" })).toBeVisible();

  const guest = await browser.newContext({ extraHTTPHeaders: { origin: session.origin } });
  const guestPage = await guest.newPage();
  await setLocale(guestPage, "pt-BR");
  await guestPage.goto(await link.inputValue());
  await guestPage.getByLabel("Senha").fill("E2E-user-secret-ok");
  await guestPage.getByRole("button", { name: "Activar" }).click();
  await expect(guestPage).toHaveURL(/\/painel$/);
  await guest.close();

  await page.goto("/admin");
  await page.getByLabel("Pesquisar por e-mail").fill(email);
  const row = page.getByRole("row").filter({ hasText: email });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Redefinir senha" }).click();
  await expect(page.getByLabel("Link gerado")).toHaveValue(/\/reset\//);
  await page.getByRole("button", { name: "Fechar" }).click();
  await row.getByRole("button", { name: "Desativar" }).click();
  await expect(row).toContainText("Inativa");
  await row.getByRole("button", { name: "Reativar" }).click();
  await expect(row).toContainText("Ativa");
  await row.getByRole("button", { name: "Excluir" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(row).toHaveCount(0);

  await page.getByLabel("Pesquisar por e-mail").fill(session.email);
  const owner = page.getByRole("row").filter({ hasText: session.email }).last();
  await expect(owner.getByRole("button", { name: "Excluir" })).toBeDisabled();

  await page.getByRole("tab", { name: "Mesas" }).click();
  await page.getByLabel("Pesquisar por nome, slug ou proprietário").fill("e2e-codex");
  const campaign = page.getByRole("row").filter({ hasText: "e2e-codex" });
  await campaign.getByLabel("Novo proprietário de E2E Codex").fill(session.adminEmail ?? "");
  await campaign.getByRole("button", { name: "Transferir" }).click();
  await expect(campaign).toContainText(session.adminEmail ?? "");

  const ownerContext = await browser.newContext();
  await applyAdminAuth(ownerContext, session);
  const ownerPage = await ownerContext.newPage();
  await setLocale(ownerPage, "pt-BR");
  await ownerPage.goto("/painel");
  await expect(ownerPage.getByRole("article", { name: "E2E Codex" })).toBeVisible();
  await ownerContext.close();

  await campaign.getByLabel("Novo proprietário de E2E Codex").fill(session.email);
  await campaign.getByRole("button", { name: "Transferir" }).click();
  await expect(campaign).toContainText(session.email);

  const desktopSlug = session.deleteCampaignSlug ?? "admin-e2e-descartavel";
  await page.getByLabel("Pesquisar por nome, slug ou proprietário").fill(desktopSlug);
  const disposable = page.getByRole("row").filter({ hasText: `${desktopSlug} · wfrp4e` });
  await disposable.getByRole("button", { name: "Desativar" }).click();
  await expect(disposable).toContainText("Inativa");
  await page.goto("/explorar");
  await page.getByLabel("Buscar campanhas").fill("Mesa descartável");
  await expect(page.getByRole("link", { name: new RegExp(`/c/${desktopSlug}$`) })).toHaveCount(0);
  await page.goto("/admin");
  await page.getByRole("tab", { name: "Mesas" }).click();
  await page.getByLabel("Pesquisar por nome, slug ou proprietário").fill(desktopSlug);
  const restored = page.getByRole("row").filter({ hasText: `${desktopSlug} · wfrp4e` });
  await restored.getByRole("button", { name: "Reativar" }).click();
  await expect(restored).toContainText("Ativa");
  await restored.getByRole("button", { name: "Excluir" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toContainText(desktopSlug);
  await dialog.getByRole("button", { name: "Excluir permanentemente" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(restored).toHaveCount(0);
  await adminContext.close();
});
