import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

const cover = path.join(import.meta.dirname, "fixtures", "cover.png");

async function openNewSession(page: import("@playwright/test").Page) {
  const toggle = page.getByRole("button", { name: /Modo GM|Visualização/ });
  if ((await toggle.getAttribute("aria-pressed")) !== "true") await toggle.click();
  await page.getByRole("button", { name: "Nova sessão" }).click();
}

// O módulo ia_arcos é compartilhado pela campanha "e2e-codex" entre todos os
// specs desta suíte (DATA_DIR isolado por execução, não por arquivo) — nunca
// assuma o estado herdado de outro spec, defina-o explicitamente.
async function setIaArcosSwitch(
  switchLocator: import("@playwright/test").Locator,
  desired: boolean,
) {
  const checked = (await switchLocator.getAttribute("aria-checked")) === "true";
  if (checked !== desired) await switchLocator.click();
}

test("painel alterna visibilidade, módulo de IA, capa, exportação e importação", async ({
  page,
  context,
}) => {
  test.setTimeout(90_000);
  const session = loadSession();
  await applyAuth(context, session);
  await setLocale(page, "pt-BR");
  await page.goto("/painel");
  const seeded = page.getByRole("article", { name: "E2E Codex" });
  await setIaArcosSwitch(seeded.getByRole("switch", { name: "IA para sugerir arcos" }), true);
  await expect(seeded.getByRole("switch", { name: "IA para sugerir arcos" })).toBeChecked();

  await page.goto("/c/e2e-codex/sessoes");
  await openNewSession(page);
  await expect(page.getByRole("button", { name: "Sugerir locais e personagens" })).toBeVisible();

  await page.goto("/painel");
  const seededAgain = page.getByRole("article", { name: "E2E Codex" });
  await setIaArcosSwitch(seededAgain.getByRole("switch", { name: "IA para sugerir arcos" }), false);
  await expect(
    seededAgain.getByRole("switch", { name: "IA para sugerir arcos" }),
  ).not.toBeChecked();
  await page.goto("/c/e2e-codex/sessoes");
  await openNewSession(page);
  await expect(page.getByRole("button", { name: "Sugerir locais e personagens" })).toHaveCount(0);

  const nome = `Mesa ${Date.now()}`;
  await page.goto("/painel/novo");
  await page.getByLabel("Nome da campanha").fill(nome);
  const slug = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  await expect(page.getByLabel("Endereço da campanha")).toHaveValue(slug);
  await expect(page.getByText("O endereço final inclui um número gerado na criação.")).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-genre");
  await page.getByLabel("Sistema").fill("Traveller");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("radio", { name: /Listada/ }).check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Criar campanha" }).click();
  await expect(page.getByRole("heading", { name: new RegExp(nome) })).toBeVisible();
  await page.getByRole("link", { name: "Ir para o painel" }).click();
  const created = page.getByRole("article", { name: nome });
  await expect(created).toBeVisible();

  await created.getByLabel(`Capa: ${nome}`).setInputFiles(cover);
  await expect(created.locator("img")).toBeVisible();
  await page.reload();
  const persisted = page.getByRole("article", { name: nome });
  await expect(persisted.locator("img")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await persisted.getByRole("button", { name: "Exportar" }).click();
  const download = await downloadPromise;
  const zipPath = path.join(tmpdir(), download.suggestedFilename());
  await download.saveAs(zipPath);
  const importedSlug = `imp${Date.now().toString().slice(-8)}`;
  await page.getByLabel("Slug novo (opcional)").fill(importedSlug);
  await page.getByLabel("Ficheiro ZIP").setInputFiles(zipPath);
  await expect(page.getByRole("article", { name: nome })).toHaveCount(2);
  await page.goto(`/c/${importedSlug}/relacoes`);
  await expect(page.getByText(nome).first()).toBeVisible();
  fs.unlinkSync(zipPath);
});
