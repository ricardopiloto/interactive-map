import { expect, test } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

test("formato antigo corrige a URL e o canônico ignora um slug arbitrário", async ({
  page,
  context,
  request,
}) => {
  const session = loadSession();
  await applyAuth(context, session);
  await setLocale(page, "pt-BR");
  const config = await (await request.get(`/api/c/${session.slug}/config`)).json();
  const id = config.id as number;
  const slug = config.slug as string;

  await page.goto(`/c/${slug}/relacoes?personagem=1`);
  await expect(page).toHaveURL(new RegExp(`/c/${id}/${slug}/relacoes\\?personagem=1$`));
  await expect(page.getByRole("searchbox", { name: "Buscar personagem…" })).toBeVisible();
  await expect(
    page.getByTestId("relations-stage").getByRole("button", { name: "Ada" }),
  ).toBeVisible();

  await page.goto(`/c/${id}/texto-qualquer/relacoes`);
  await expect(page).toHaveURL(new RegExp(`/c/${id}/${slug}/relacoes$`));
  await expect(page.getByText("E2E Codex").first()).toBeVisible();

  await page.goto(`/c/${id}/rota`);
  await expect(page).toHaveURL(new RegExp(`/c/${id}/${slug}(?:/mapa)?$`));
  await expect(page.getByText("E2E Codex").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Rota", exact: true }).first()).not.toHaveAttribute(
    "aria-current",
    "page",
  );
});
