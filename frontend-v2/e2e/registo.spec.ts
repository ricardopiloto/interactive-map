import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { setLocale } from "./helpers";

type LoggedEmail = { to: string; text: string };

async function latestEmail(to: string): Promise<LoggedEmail | undefined> {
  try {
    const contents = await readFile(process.env.E2E_EMAIL_LOG_FILE!, "utf8");
    return contents
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LoggedEmail)
      .filter((email) => email.to === to)
      .at(-1);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

test("registo confirma e-mail e ativa a conta", async ({ page }) => {
  const email = `registo-${randomUUID()}@example.com`;
  await setLocale(page, "pt-BR");
  await page.goto("/registo");
  await page.getByLabel("E-mail").fill(email);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Pedir link de verificação" }).click();
  await expect(page.getByRole("status")).toHaveText("Verifique o seu e-mail.");

  await expect.poll(() => latestEmail(email), { timeout: 15_000 }).not.toBeUndefined();
  const message = await latestEmail(email);
  const link = message?.text.match(/https?:\/\/[^\s]+\/convite\/[^\s]+/)?.[0];
  expect(link).toBeTruthy();

  await page.goto(link!);
  await page.getByLabel("Senha").fill("E2E-registo-secret-ok");
  await page.getByRole("button", { name: "Activar" }).click();
  await expect(page).toHaveURL(/\/painel$/);
});
