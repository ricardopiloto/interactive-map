import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { latestEmail, loggedEmails } from "./emailLog";
import { loadSession, setLocale } from "./helpers";

test("contato envia ao operador sem confirmação por e-mail à pessoa", async ({ page }) => {
  const email = `contato-${randomUUID()}@example.com`;
  const operatorEmail = process.env.E2E_CONTATO_EMAIL!;

  await setLocale(page, "pt-BR");
  await page.goto("/contato");
  await expect(page.getByTestId("site-footer")).toBeVisible();
  await page.getByLabel("Nome").fill("Pessoa E2E");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Assunto").selectOption("duvida");
  await page.getByLabel("Mensagem").fill("Esta é uma mensagem de contato para o teste E2E.");
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Mensagem enviada. O operador poderá responder ao e-mail informado.",
  );

  await expect
    .poll(async () => (await latestEmail(operatorEmail))?.reply_to, { timeout: 15_000 })
    .toBe(email);
  const message = await latestEmail(operatorEmail);
  expect(message?.to).toBe(operatorEmail);
  expect(message?.reply_to).toBe(email);
  expect((await loggedEmails()).filter((entry) => entry.to === email)).toHaveLength(0);

  await page.goto(`/c/${loadSession().slug}/relacoes`);
  await expect(page.getByTestId("site-footer")).toHaveCount(0);
});
