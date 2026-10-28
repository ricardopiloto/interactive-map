import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { latestEmailMatching, loggedEmails } from "./emailLog";
import { setLocale } from "./helpers";

const verificationLink = /https?:\/\/[^\s]+\/convite\/[^\s]+/;
const resetLink = /https?:\/\/[^\s]+\/reset\/[^\s]+/;

test("recupera a senha de uma conta criada pela UI", async ({ page, context }) => {
  const email = `reset-${randomUUID()}@example.com`;
  const oldPassword = "E2E-reset-old-secret";
  const newPassword = "E2E-reset-new-secret";

  await setLocale(page, "pt-BR");
  await page.goto("/registo");
  await page.getByLabel("E-mail").fill(email);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Pedir link de verificação" }).click();
  await expect(page.getByRole("status")).toHaveText("Verifique o seu e-mail.");

  await expect
    .poll(() => latestEmailMatching(email, verificationLink), { timeout: 15_000 })
    .not.toBeUndefined();
  const verificationEmail = await latestEmailMatching(email, verificationLink);
  const inviteUrl = verificationEmail?.text.match(verificationLink)?.[0];
  expect(inviteUrl).toBeTruthy();
  await page.goto(inviteUrl!);
  await page.getByLabel("Senha").fill(oldPassword);
  await page.getByRole("button", { name: "Activar" }).click();
  await expect(page).toHaveURL(/\/painel$/);

  await context.clearCookies();
  await page.goto("/login");
  await page.getByRole("link", { name: "Esqueci a senha" }).click();
  await expect(page).toHaveURL(/\/esqueci-senha$/);
  await page.reload();
  await page.getByLabel("E-mail").fill(email);
  await expect(page.getByLabel("E-mail")).toHaveValue(email);
  await page.getByRole("button", { name: "Pedir link de redefinição" }).click();
  await expect(page.getByRole("status")).toHaveText(/Se existir uma conta/);

  await expect
    .poll(() => latestEmailMatching(email, resetLink), { timeout: 15_000 })
    .not.toBeUndefined();
  const resetEmail = await latestEmailMatching(email, resetLink);
  const resetUrl = resetEmail?.text.match(resetLink)?.[0];
  expect(resetUrl).toBeTruthy();
  await page.goto(resetUrl!);
  await page.getByLabel("Senha").fill(newPassword);
  await page.getByRole("button", { name: "Guardar senha" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/login?next=/painel");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(newPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/painel$/);
});

test("e-mail inexistente recebe a mesma confirmação sem envio", async ({ page }) => {
  const email = `reset-unknown-${randomUUID()}@example.com`;
  await setLocale(page, "pt-BR");
  await page.goto("/esqueci-senha");
  await page.getByLabel("E-mail").fill(email);
  await page.getByRole("button", { name: "Pedir link de redefinição" }).click();
  await expect(page.getByRole("status")).toHaveText(/Se existir uma conta/);
  expect((await loggedEmails()).filter((message) => message.to === email)).toHaveLength(0);
});
