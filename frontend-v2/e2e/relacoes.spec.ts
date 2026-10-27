import { expect, test } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

test("notas mecânicas de PJ e NPC ficam restritas ao mestre", async ({ page }) => {
  test.setTimeout(90_000);
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  const request = page.request;
  const stamp = Date.now();
  const base = `/api/c/${session.slug}`;
  const created: number[] = [];
  const names = [`NPC Mecânico ${stamp}`, `PJ Mecânico ${stamp}`];
  const notes = [`PV 15 ${stamp}`, `Perícia 70 ${stamp}`];
  try {
    await page.goto(`/c/${session.slug}/relacoes`);
    await page.getByRole("button", { name: "Modo GM" }).click();
    for (const [index, tipo] of (["npc", "pj"] as const).entries()) {
      await page.getByRole("button", { name: "+ Personagem" }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("textbox", { name: "Nome" }).fill(names[index]!);
      await dialog.getByRole("combobox", { name: "Tipo de personagem" }).selectOption(tipo);
      await dialog.getByRole("textbox", { name: "Notas mecânicas" }).fill(notes[index]!);
      await dialog.getByRole("button", { name: "Salvar" }).click();
      await expect(dialog).toBeHidden();
      // savePersonagem já seleciona o criado (pick); com perfil aberto a lista do aside some
      await expect(page.getByRole("heading", { name: names[index]! })).toBeVisible();
      await expect(page.getByRole("region", { name: "Notas mecânicas" })).toContainText(
        notes[index]!,
      );
      const adminList = await request.get(`${base}/admin/personagens`);
      const saved = (await adminList.json()) as { id: number; nome: string }[];
      created.push(saved.find((person) => person.nome === names[index])!.id);
    }

    const noNotesName = `Sem notas ${stamp}`;
    await page.getByRole("button", { name: "+ Personagem" }).click();
    const blankDialog = page.getByRole("dialog");
    await blankDialog.getByRole("textbox", { name: "Nome" }).fill(noNotesName);
    await blankDialog.getByRole("button", { name: "Salvar" }).click();
    await expect(blankDialog).toBeHidden();
    await expect(page.getByRole("heading", { name: noNotesName })).toBeVisible();
    await expect(page.getByRole("region", { name: "Notas mecânicas" })).toHaveCount(0);
    const adminList = await request.get(`${base}/admin/personagens`);
    const saved = (await adminList.json()) as { id: number; nome: string }[];
    created.push(saved.find((person) => person.nome === noNotesName)!.id);

    // Reabre o NPC com nota e confirma que some ao sair do modo GM
    await page.getByRole("button", { name: "Fechar perfil" }).click();
    await page.locator("aside").getByRole("button", { name: names[0]! }).click();
    await expect(page.getByRole("region", { name: "Notas mecânicas" })).toContainText(notes[0]!);
    await page.getByRole("button", { name: "Visualização" }).click();
    await expect(page.getByRole("region", { name: "Notas mecânicas" })).toHaveCount(0);
    const publicList = await request.get(`${base}/personagens`);
    expect(publicList.ok()).toBeTruthy();
    const raw = await publicList.text();
    for (const note of notes) expect(raw).not.toContain(note);
    for (const id of created) {
      const detail = await request.get(`${base}/personagens/${id}`);
      expect(detail.ok()).toBeTruthy();
      for (const note of notes) expect(await detail.text()).not.toContain(note);
    }
  } finally {
    for (const id of created) await request.delete(`${base}/admin/personagens/${id}`);
  }
});

test("mestre cria vínculo de duas vias e o jogador não vê o lado desconhecido", async ({
  page,
  request,
}) => {
  test.setTimeout(60_000);
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  await page.goto(`/c/${session.slug}/relacoes`);
  await page.getByRole("button", { name: "Modo GM" }).click();

  const stamp = Date.now();
  const mira = `Mira ${stamp}`;
  const ludo = `Ludo ${stamp}`;
  const secret = `nota-secreta-${stamp}`;

  await page.getByRole("button", { name: "+ Personagem" }).click();
  await page.getByRole("textbox", { name: "Nome" }).fill(mira);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { name: mira })).toBeVisible();

  await page.getByRole("button", { name: "+ Personagem" }).click();
  await page.getByRole("textbox", { name: "Nome" }).fill(ludo);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { name: ludo })).toBeVisible();

  await page.getByRole("button", { name: "+ Conexão" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Personagem A" }).selectOption({ label: mira });
  await dialog.getByRole("combobox", { name: "Personagem B" }).selectOption({ label: ludo });
  await dialog.getByRole("radio", { name: "Duas vias" }).check();
  await dialog.getByRole("combobox", { name: `${mira} vê ${ludo} como` }).selectOption("aliado");
  await dialog.getByLabel(`Qualificador (${mira} → ${ludo})`).fill("Mentor");
  await dialog.getByRole("combobox", { name: `${ludo} vê ${mira} como` }).selectOption("conhecido");
  await dialog.getByLabel(`Qualificador (${ludo} → ${mira})`).fill("Lacaio");
  await dialog.getByRole("textbox", { name: `Nota (${ludo} → ${mira})` }).fill(secret);
  await dialog
    .getByRole("checkbox", { name: `Conhecido pelos jogadores (${ludo} → ${mira})` })
    .uncheck();
  await dialog.getByRole("checkbox", { name: "Visível para jogadores" }).check();
  await dialog.getByRole("button", { name: "Salvar" }).click();
  await expect(dialog).toBeHidden();

  const profile = page.locator("aside");
  await page.locator("aside").getByRole("button", { name: mira }).click();
  await expect(profile.getByText("Aliado (Mentor)")).toBeVisible();
  await expect(profile.getByText("Conhecido (Lacaio)")).toBeVisible();
  await expect(profile.getByText(secret)).toBeVisible();
  await expect(profile.getByText("Sentido desconhecido pelos jogadores")).toBeVisible();

  await page.getByRole("button", { name: "Visualização" }).click();
  await expect(page.getByText(secret)).toHaveCount(0);
  await expect(page.getByText("Lacaio")).toHaveCount(0);
  await expect(page.getByText("Sentido desconhecido pelos jogadores")).toHaveCount(0);
  await expect(profile.getByText("Aliado (Mentor)")).toBeVisible();

  const listed = await request.get(`/api/c/${session.slug}/vinculos`);
  expect(listed.ok()).toBeTruthy();
  const raw = JSON.stringify(await listed.json());
  expect(raw).toContain("Mentor");
  expect(raw).not.toContain("Lacaio");
  expect(raw).not.toContain(secret);
});
