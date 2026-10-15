import { expect, test } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

test("three modes preserve local filters and reset on revisit", async ({ page }) => {
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  await page.goto(`/c/${session.slug}/linha-do-tempo`);
  await expect(page.getByRole("button", { name: "Cronológica" })).toBeVisible();
  await page.getByRole("button", { name: "Por arcos", exact: true }).click();
  await expect(page.getByLabel("Filtrar por arco")).toBeVisible();
  await page.getByRole("button", { name: "Por descoberta" }).click();
  await page.getByLabel("Filtrar por tipo de entidade").selectOption("personagem");
  await page.getByRole("button", { name: "Por arcos", exact: true }).click();
  await page.getByRole("button", { name: "Por descoberta" }).click();
  await expect(page.getByLabel("Filtrar por tipo de entidade")).toHaveValue("personagem");
  await page.reload();
  await expect(page.getByRole("button", { name: "Cronológica" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("GM reviews AI suggestions, creates event, arc and item, and module gate hides AI", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  const base = `/api/c/${session.slug}`;
  const stamp = Date.now();
  const title = `Evento ${stamp}`;
  const arcTitle = `Arco ${stamp}`;
  const itemName = `Item ${stamp}`;
  let eventId: number | undefined, arcId: number | undefined, itemId: number | undefined;
  try {
    await page.request.patch(`/api/campanhas/${session.slug}/modulos`, {
      data: { modulo: "ia_arcos", ativo: true },
    });
    await page.goto(`/c/${session.slug}/linha-do-tempo`);
    await page.getByRole("button", { name: "Modo GM" }).click();
    await page.route("**/admin/eventos/sugerir-associacoes", async (route) =>
      route.fulfill({
        json: { estado: "sugestoes", mensagem: "", local_ids: [], personagem_ids: [] },
      }),
    );
    await page.getByRole("button", { name: "Novo evento" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Título" }).fill(title);
    await dialog.getByRole("spinbutton", { name: "Ano" }).fill("2520");
    await dialog.getByRole("textbox", { name: "Descrição" }).fill("**Descoberta** no Reikland");
    await dialog.getByRole("button", { name: "Sugerir locais e personagens" }).click();
    const before = await page.request.get(`${base}/admin/eventos`);
    expect(
      ((await before.json()) as { eventos: { titulo: string }[] }).eventos.some(
        (e) => e.titulo === title,
      ),
    ).toBe(false);
    await dialog.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText(title)).toBeVisible();
    const ev = await page.request.get(`${base}/admin/eventos`);
    eventId = ((await ev.json()) as { eventos: { id: number; titulo: string }[] }).eventos.find(
      (e) => e.titulo === title,
    )?.id;
    expect(eventId).toBeDefined();
    await page.getByRole("button", { name: "Gerir arcos" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Novo arco" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Título" }).fill(arcTitle);
    await dialog.getByRole("button", { name: "Salvar" }).click();
    await page.getByRole("button", { name: "Por arcos", exact: true }).click();
    await expect(page.getByText(arcTitle).last()).toBeVisible();
    const ar = await page.request.get(`${base}/admin/arcos`);
    arcId = ((await ar.json()) as { id: number; titulo: string }[]).find(
      (a) => a.titulo === arcTitle,
    )?.id;
    expect(arcId).toBeDefined();
    await page.getByRole("button", { name: "Itens" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Novo item" }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Nome" }).fill(itemName);
    await dialog.getByRole("checkbox", { name: title }).check();
    await dialog.getByRole("button", { name: "Salvar" }).click();
    await page.getByRole("button", { name: "Por descoberta" }).click();
    await expect(page.getByText(itemName)).toBeVisible();
    const it = await page.request.get(`${base}/admin/itens`);
    itemId = ((await it.json()) as { itens: { id: number; nome: string }[] }).itens.find(
      (i) => i.nome === itemName,
    )?.id;
    expect(itemId).toBeDefined();
    await page.request.patch(`/api/campanhas/${session.slug}/modulos`, {
      data: { modulo: "ia_arcos", ativo: false },
    });
    await page.reload();
    if (await page.getByRole("button", { name: "Modo GM" }).isVisible())
      await page.getByRole("button", { name: "Modo GM" }).click();
    await expect(page.getByRole("button", { name: "Propor arcos com IA" })).toHaveCount(0);
    await page.getByRole("button", { name: "Novo evento" }).click();
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "Sugerir locais e personagens" }),
    ).toHaveCount(0);
    await page.getByRole("dialog").getByRole("button", { name: "Cancelar" }).click();
    await page.getByRole("button", { name: "Itens" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Editar item" }).last().click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Nome" }).fill(`${itemName} revisto`);
    await dialog.getByRole("button", { name: "Salvar" }).click();
    await page.getByRole("button", { name: "Itens" }).click();
    await expect(page.getByRole("dialog")).toContainText(`${itemName} revisto`);
    page.once("dialog", (d) => d.accept());
    await page.getByRole("dialog").getByRole("button", { name: "Excluir item" }).last().click();
    await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
    await page.getByRole("button", { name: "Por arcos", exact: true }).click();
    await page.getByRole("button", { name: "Editar arco" }).last().click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Título" }).fill(`${arcTitle} revisto`);
    await dialog.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText(`${arcTitle} revisto`).last()).toBeVisible();
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Excluir arco" }).last().click();
    await page.getByRole("button", { name: "Cronológica" }).click();
    await page.getByText(title).click();
    await page.getByRole("button", { name: "Editar evento" }).last().click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Título" }).fill(`${title} revisto`);
    await dialog.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText(`${title} revisto`)).toBeVisible();
    await page.getByText(`${title} revisto`).click();
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Excluir evento" }).last().click();
  } finally {
    if (itemId) await page.request.delete(`${base}/admin/itens/${itemId}`);
    if (arcId) await page.request.delete(`${base}/admin/arcos/${arcId}`);
    if (eventId) await page.request.delete(`${base}/admin/eventos/${eventId}`);
    await page.request.patch(`/api/campanhas/${session.slug}/modulos`, {
      data: { modulo: "ia_arcos", ativo: true },
    });
  }
});

test("dated events group by era and discovery shows first appearance and recurrence", async ({
  page,
}) => {
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  const base = `/api/c/${session.slug}`;
  const stamp = Date.now();
  const name = `Viajante ${stamp}`;
  let personId: number | undefined;
  const eventIds: number[] = [];
  try {
    const person = await page.request.post(`${base}/admin/personagens`, {
      data: { nome: name, tipo: "npc", descricao: "", visivel_para_todos: true },
    });
    expect(person.status()).toBe(201);
    personId = ((await person.json()) as { id: number }).id;
    for (const [ano, era] of [
      [2400, "Era Antiga"],
      [2500, "Era Nova"],
    ] as const) {
      const response = await page.request.post(`${base}/admin/eventos`, {
        data: {
          titulo: `${name} ${ano}`,
          ano,
          mes: 1,
          rotulo_era: era,
          descricao: "",
          personagem_ids: [personId],
          visivel_para_todos: true,
        },
      });
      expect(response.status()).toBe(201);
      eventIds.push(((await response.json()) as { id: number }).id);
    }
    await page.goto(`/c/${session.slug}/linha-do-tempo`);
    await expect(page.getByRole("heading", { name: /Era Antiga/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Era Nova/ })).toBeVisible();
    await page.getByRole("button", { name: "Por descoberta" }).click();
    const entity = page.getByRole("article").filter({ has: page.getByRole("heading", { name }) });
    await expect(entity).toContainText("Primeira aparição");
    await expect(entity).toContainText("Reaparição");
  } finally {
    for (const id of eventIds) await page.request.delete(`${base}/admin/eventos/${id}`);
    if (personId) await page.request.delete(`${base}/admin/personagens/${personId}`);
  }
});

test("arc AI proposal can be reviewed without persistence and insufficient sessions offer manual creation", async ({
  page,
}) => {
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  await page.request.patch(`/api/campanhas/${session.slug}/modulos`, {
    data: { modulo: "ia_arcos", ativo: true },
  });
  await page.goto(`/c/${session.slug}/linha-do-tempo`);
  await page.getByRole("button", { name: "Modo GM" }).click();
  let calls = 0;
  await page.route("**/admin/arcos/propor", async (route) => {
    calls++;
    await route.fulfill({ json: { estado: "sessoes_insuficientes", mensagem: "", propostas: [] } });
  });
  await page.getByRole("button", { name: "Propor arcos com IA" }).click();
  await expect(page.getByText(/Sessões sem arco insuficientes/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Gerir arcos" })).toHaveCount(2);
  expect(calls).toBe(1);
  await page.unroute("**/admin/arcos/propor");
  await page.route("**/admin/arcos/propor", async (route) =>
    route.fulfill({
      json: {
        estado: "propostas",
        mensagem: "",
        propostas: [
          {
            titulo: "Rascunho de teste",
            resumo: "Resumo",
            sessao_ids: [],
            sessao_transicao_id: null,
            local_ids: [],
          },
        ],
      },
    }),
  );
  await page.getByRole("button", { name: "Propor arcos com IA" }).click();
  await expect(page.getByText("Rascunho de teste")).toBeVisible();
  const before = await page.request.get(`/api/c/${session.slug}/admin/arcos`);
  expect(
    ((await before.json()) as { titulo: string }[]).some((a) => a.titulo === "Rascunho de teste"),
  ).toBe(false);
  await page.getByRole("button", { name: "Revisar proposta" }).click();
  await expect(page.getByRole("dialog").getByRole("textbox", { name: "Título" })).toHaveValue(
    "Rascunho de teste",
  );
  await page.getByRole("dialog").getByRole("button", { name: "Cancelar" }).click();
  const after = await page.request.get(`/api/c/${session.slug}/admin/arcos`);
  expect(
    ((await after.json()) as { titulo: string }[]).some((a) => a.titulo === "Rascunho de teste"),
  ).toBe(false);
  await page.getByRole("button", { name: "Descartar" }).click();
  await expect(page.getByText("Rascunho de teste")).toHaveCount(0);
});

test("arc lanes show each arc’s own sessions, with unassigned sessions still visible", async ({
  page,
}) => {
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  const base = `/api/c/${session.slug}`;
  const stamp = Date.now();
  const sessionIds: number[] = [],
    arcIds: number[] = [],
    eventIds: number[] = [];
  try {
    for (let i = 0; i < 3; i++) {
      const next = await page.request.get(`${base}/admin/sessoes/proximo-numero`);
      const numero = ((await next.json()) as { numero: number }).numero;
      const response = await page.request.post(`${base}/admin/sessoes`, {
        data: {
          numero,
          titulo: `Raia ${stamp}-${i}`,
          data_rotulo: null,
          resumo: "",
          local_ids: [],
          personagem_ids: [],
          visivel_para_todos: true,
        },
      });
      expect(response.status()).toBe(201);
      sessionIds.push(((await response.json()) as { id: number }).id);
      const event = await page.request.post(`${base}/admin/eventos`, {
        data: {
          titulo: `Data ${stamp}-${i}`,
          ano: 2500 + i,
          mes: 1,
          sessao_id: sessionIds[i],
          visivel_para_todos: true,
        },
      });
      expect(event.status()).toBe(201);
      eventIds.push(((await event.json()) as { id: number }).id);
    }
    for (let i = 0; i < 2; i++) {
      const response = await page.request.post(`${base}/admin/arcos`, {
        data: {
          titulo: `Arco da raia ${stamp}-${i}`,
          ordem: i,
          cor: i ? "#376c72" : "#a34834",
          sessao_ids: [sessionIds[i]],
          visivel_para_todos: true,
        },
      });
      expect(response.status()).toBe(201);
      arcIds.push(((await response.json()) as { id: number }).id);
    }
    await page.goto(`/c/${session.slug}/linha-do-tempo`);
    await page.getByRole("button", { name: "Por arcos", exact: true }).click();
    for (let i = 0; i < 2; i++) {
      const row = page.getByRole("article").filter({ hasText: `Raia ${stamp}-${i}` });
      await expect(row).toContainText(`Arco da raia ${stamp}-${i}`);
    }
    await expect(page.getByRole("article").filter({ hasText: `Raia ${stamp}-2` })).toContainText(
      "Sem arco",
    );
  } finally {
    for (const id of arcIds) await page.request.delete(`${base}/admin/arcos/${id}`);
    for (const id of eventIds) await page.request.delete(`${base}/admin/eventos/${id}`);
    for (const id of sessionIds) await page.request.delete(`${base}/admin/sessoes/${id}`);
  }
});

test("player discovery omits hidden appearances and owner sees them only in GM mode", async ({
  page,
}) => {
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  const base = `/api/c/${session.slug}`;
  const name = `Segredo ${Date.now()}`;
  let personId: number | undefined;
  let eventId: number | undefined;
  try {
    const person = await page.request.post(`${base}/admin/personagens`, {
      data: { nome: name, tipo: "npc", descricao: "", visivel_para_todos: true },
    });
    expect(person.status()).toBe(201);
    personId = ((await person.json()) as { id: number }).id;
    const event = await page.request.post(`${base}/admin/eventos`, {
      data: {
        titulo: `Evento ${name}`,
        ano: 2400,
        descricao: "",
        personagem_ids: [personId],
        visivel_para_todos: false,
      },
    });
    expect(event.status()).toBe(201);
    eventId = ((await event.json()) as { id: number }).id;
    await page.goto(`/c/${session.slug}/linha-do-tempo`);
    await page.getByRole("button", { name: "Por descoberta" }).click();
    await expect(page.getByRole("heading", { name })).toHaveCount(0);
    await page.getByRole("button", { name: "Modo GM" }).click();
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await page.getByRole("button", { name: "Visualização" }).click();
    await expect(page.getByRole("heading", { name })).toHaveCount(0);
  } finally {
    if (eventId) await page.request.delete(`${base}/admin/eventos/${eventId}`);
    if (personId) await page.request.delete(`${base}/admin/personagens/${personId}`);
  }
});

test("manual arc keeps selected session and location after reload", async ({ page }) => {
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  const base = `/api/c/${session.slug}`;
  const stamp = Date.now();
  const arcTitle = `Arco com local ${stamp}`;
  const localName = `Local do arco ${stamp}`;
  const sessionTitle = `Sessão do arco ${stamp}`;
  let localId: number | undefined;
  let sessionId: number | undefined;
  let arcId: number | undefined;
  let eventId: number | undefined;
  try {
    const local = await page.request.post(`${base}/admin/locais`, {
      data: {
        nome: localName,
        descricao: "",
        x: 0.2,
        y: 0.2,
        cor_pin: "#112233",
        visivel_para_todos: true,
      },
    });
    expect(local.status()).toBe(201);
    localId = ((await local.json()) as { id: number }).id;
    const next = await page.request.get(`${base}/admin/sessoes/proximo-numero`);
    const numero = ((await next.json()) as { numero: number }).numero;
    const createdSession = await page.request.post(`${base}/admin/sessoes`, {
      data: {
        numero,
        titulo: sessionTitle,
        data_rotulo: null,
        resumo: "",
        local_ids: [],
        personagem_ids: [],
        visivel_para_todos: true,
      },
    });
    expect(createdSession.status()).toBe(201);
    sessionId = ((await createdSession.json()) as { id: number }).id;
    const event = await page.request.post(`${base}/admin/eventos`, {
      data: { titulo: `Data ${stamp}`, ano: 2520, sessao_id: sessionId, visivel_para_todos: true },
    });
    expect(event.status()).toBe(201);
    eventId = ((await event.json()) as { id: number }).id;
    await page.goto(`/c/${session.slug}/linha-do-tempo`);
    await page.getByRole("button", { name: "Modo GM" }).click();
    await page.getByRole("button", { name: "Gerir arcos" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Novo arco" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox", { name: "Título" }).fill(arcTitle);
    await dialog.getByRole("checkbox", { name: localName }).check();
    await dialog.getByRole("checkbox", { name: `${numero}. ${sessionTitle}` }).check();
    await dialog.getByRole("button", { name: "Salvar" }).click();
    await expect(dialog).toBeHidden();
    const arcs = await page.request.get(`${base}/admin/arcos`);
    arcId = ((await arcs.json()) as { id: number; titulo: string }[]).find(
      (a) => a.titulo === arcTitle,
    )?.id;
    expect(arcId).toBeDefined();
    const locals = await page.request.get(`${base}/admin/locais`);
    expect(
      ((await locals.json()) as { id: number; arco_id: number | null }[]).find(
        (l) => l.id === localId,
      )?.arco_id,
    ).toBe(arcId);
    await page.reload();
    await page.getByRole("button", { name: "Por arcos", exact: true }).click();
    await expect(page.getByRole("article").filter({ hasText: sessionTitle })).toContainText(
      arcTitle,
    );
  } finally {
    if (arcId) await page.request.delete(`${base}/admin/arcos/${arcId}`);
    if (eventId) await page.request.delete(`${base}/admin/eventos/${eventId}`);
    if (sessionId) await page.request.delete(`${base}/admin/sessoes/${sessionId}`);
    if (localId) await page.request.delete(`${base}/admin/locais/${localId}`);
  }
});
