import { expect, test } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

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
