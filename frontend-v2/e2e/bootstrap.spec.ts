import { expect, test } from "@playwright/test";
import { setLocale } from "./helpers";

test("preview serve uma rota React Router com backend seedado", async ({ page, request }) => {
  const config = await request.get("/api/c/e2e-codex/config");
  expect(config.ok()).toBeTruthy();

  await setLocale(page, "pt-BR");
  await page.goto("/c/e2e-codex/relacoes");
  await expect(page.getByRole("searchbox", { name: "Buscar personagem…" })).toBeVisible();
  await expect(
    page.getByTestId("relations-stage").getByRole("button", { name: "Ada" }),
  ).toBeVisible();
});
