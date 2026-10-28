import { randomUUID } from "node:crypto";
import { expect, request, test } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

test("sitemap e metadados respeitam a autorização de indexação", async ({ page, context }) => {
  test.setTimeout(60_000);
  const session = loadSession();
  await applyAuth(context, session);
  await setLocale(page, "pt-BR");

  async function createCampaign(label: string) {
    const slug = `seo-${label}-${randomUUID().slice(0, 16)}`;
    const response = await page.request.post("/api/campanhas", {
      data: { nome: `SEO E2E ${label}`, slug, sistema: "Sistema livre" },
    });
    expect(response.status(), await response.text()).toBe(201);
    return (await response.json()) as { id: number; slug: string };
  }

  const marked = await createCampaign("marked");
  const unmarked = await createCampaign("unmarked");
  const markedPath = `/c/${marked.id}/${marked.slug}`;
  const unmarkedPath = `/c/${unmarked.id}/${unmarked.slug}`;
  const indexation = await page.request.patch(`/api/campanhas/${marked.slug}/indexacao`, {
    data: { indexavel: true },
  });
  expect(indexation.ok(), await indexation.text()).toBeTruthy();

  const anonymous = await request.newContext({
    baseURL: `http://127.0.0.1:${process.env.E2E_API_PORT ?? 8002}`,
  });
  try {
    async function sitemap() {
      const response = await anonymous.get("/sitemap.xml");
      expect(response.ok()).toBeTruthy();
      expect(response.headers()["content-type"]).toContain("xml");
      return response.text();
    }

    const xml = await sitemap();
    for (const route of ["relacoes", "sessoes", "linha-do-tempo", "itens"]) {
      expect(xml).toContain(`${session.origin}${markedPath}/${route}`);
    }
    expect(xml).not.toContain(unmarkedPath);
    expect(xml).not.toContain("lastmod");
    for (const route of ["registo", "login", "painel", "admin", "conta", "convite", "reset"]) {
      expect(xml).not.toMatch(new RegExp(`<loc>[^<]*/${route}(?:/|<|\\?)`));
    }

    await page.goto("/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    const titles: string[] = [];
    for (const route of ["/", "/explorar"]) {
      await page.goto(route);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${session.origin}${route}`,
      );
      titles.push(await page.title());
    }
    expect(titles[0]).not.toBe(titles[1]);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await page.getByRole("combobox", { name: "Idioma" }).selectOption("en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.goto(`${unmarkedPath}/relacoes`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    let releaseConfig!: () => void;
    const configGate = new Promise<void>((resolve) => {
      releaseConfig = resolve;
    });
    let intercepted!: () => void;
    const configIntercepted = new Promise<void>((resolve) => {
      intercepted = resolve;
    });
    await page.route(new RegExp(`/api/c/(${marked.id}|${marked.slug})/config`), async (route) => {
      intercepted();
      await configGate;
      await route.continue();
    });
    const navigation = page.goto(`${markedPath}/relacoes`, { waitUntil: "domcontentloaded" });
    try {
      await configIntercepted;
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    } finally {
      releaseConfig();
    }
    await navigation;
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${session.origin}${markedPath}/relacoes`,
    );
    await page.unrouteAll({ behavior: "wait" });

    await page.goto(`${markedPath}/rota`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    const visibility = await page.request.patch(`/api/campanhas/${marked.slug}/visibilidade`, {
      data: { visibilidade: "so_link" },
    });
    expect(visibility.ok(), await visibility.text()).toBeTruthy();
    expect(await sitemap()).not.toContain(markedPath);
  } finally {
    await anonymous.dispose();
  }
});
