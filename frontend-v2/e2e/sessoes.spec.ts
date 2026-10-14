import { expect, test, type APIRequestContext } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

test("mestre cria sessão com associações e o módulo de IA desligado não sugere", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");

  const stamp = Date.now();
  const localName = `Porto ${stamp}`;
  const personName = `Nara ${stamp}`;
  const title = `Crônica ${stamp}`;
  const edited = `${title} revista`;
  const base = `/api/c/${session.slug}`;
  const created: { localId?: number; personId?: number } = {};
  const request = page.request;
  const suggestions: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("sugerir-associacoes")) suggestions.push(req.url());
  });

  try {
    const moduleOff = await request.patch(`/api/campanhas/${session.slug}/modulos`, {
      data: { modulo: "ia_arcos", ativo: false },
    });
    expect(moduleOff.ok()).toBeTruthy();

    const local = await request.post(`${base}/admin/locais`, {
      data: {
        nome: localName,
        descricao: "",
        x: 0.2,
        y: 0.3,
        cor_pin: "#112233",
        visivel_para_todos: true,
      },
    });
    expect(local.status()).toBe(201);
    created.localId = ((await local.json()) as { id: number }).id;

    const person = await request.post(`${base}/admin/personagens`, {
      data: { nome: personName, tipo: "npc", descricao: "", visivel_para_todos: true },
    });
    expect(person.status()).toBe(201);
    created.personId = ((await person.json()) as { id: number }).id;

    await page.goto(`/c/${session.slug}/sessoes`);
    await page.getByRole("button", { name: "Modo GM" }).click();
    await page.getByRole("button", { name: "Nova sessão" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("button", { name: "Sugerir locais e personagens" })).toHaveCount(
      0,
    );
    await dialog.getByRole("textbox", { name: "Título" }).fill(title);
    await dialog.getByRole("textbox", { name: "Resumo" }).fill("**Chegada** ao porto");
    await dialog.getByRole("checkbox", { name: localName }).check();
    await dialog.getByRole("checkbox", { name: personName }).check();
    await dialog.getByRole("button", { name: "Salvar" }).click();
    await expect(dialog).toBeHidden();

    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("Chegada")).toBeVisible();
    await expect(page.getByRole("link", { name: `Local: ${localName}` })).toBeVisible();
    await expect(page.getByRole("link", { name: `Personagem: ${personName}` })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("[[loc:");
    expect(suggestions).toEqual([]);

    await page.getByRole("button", { name: "Editar sessão" }).click();
    const editor = page.getByRole("dialog");
    await editor.getByRole("textbox", { name: "Título" }).fill(edited);
    await editor.getByRole("checkbox", { name: "Visível para todos" }).uncheck();
    await editor.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByRole("heading", { name: edited })).toBeVisible();
    await expect(page.getByText("Oculta")).toBeVisible();

    await page.getByRole("button", { name: "Visualização" }).click();
    await expect(page.getByText(edited)).toHaveCount(0);

    await page.getByRole("button", { name: "Modo GM" }).click();
    await expect(page.getByRole("heading", { name: edited })).toBeVisible();
    await page.getByRole("button", { name: "Excluir sessão" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();
    await expect(page.getByText(edited)).toHaveCount(0);
    expect(suggestions).toEqual([]);
  } finally {
    await cleanup(request, session.slug, created, title);
  }
});

async function cleanup(
  request: APIRequestContext,
  slug: string,
  created: { localId?: number; personId?: number },
  titlePrefix: string,
) {
  const listed = await request.get(`/api/c/${slug}/admin/sessoes`);
  if (listed.ok()) {
    const body = (await listed.json()) as { sessoes: { id: number; titulo: string }[] };
    for (const sessao of body.sessoes) {
      if (sessao.titulo.startsWith(titlePrefix)) {
        await request.delete(`/api/c/${slug}/admin/sessoes/${sessao.id}`);
      }
    }
  }
  if (created.personId != null) {
    await request.delete(`/api/c/${slug}/admin/personagens/${created.personId}`);
  }
  if (created.localId != null) {
    await request.delete(`/api/c/${slug}/admin/locais/${created.localId}`);
  }
}
