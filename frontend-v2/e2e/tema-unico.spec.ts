import { expect, test } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

test("paleta única em duas campanhas nos modos claro e escuro", async ({ page, context }) => {
  const session = loadSession();
  await applyAuth(context, session);
  await setLocale(page, "pt-BR");
  const slug = `tema${Date.now()}`;
  const created = await context.request.post("/api/campanhas", {
    data: { nome: "Campanha de tema único", slug, sistema: "Sistema livre" },
  });
  expect(created.status()).toBe(201);
  const campaign = (await created.json()) as { id: number; slug: string };

  async function palette(url: string, dark: boolean) {
    await page.goto(url);
    await expect(page.locator("html")).not.toHaveAttribute("data-genre");
    return page.locator("html").evaluate((root, isDark) => {
      root.classList.toggle("dark", isDark);
      const style = getComputedStyle(root);
      return [style.getPropertyValue("--seal"), style.getPropertyValue("--background")];
    }, dark);
  }

  for (const dark of [false, true]) {
    const existing = await palette(`/c/${session.slug}`, dark);
    const fresh = await palette(`/c/${campaign.id}/${campaign.slug}`, dark);
    expect(fresh).toEqual(existing);
  }
});
