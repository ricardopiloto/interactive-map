import { expect, test, type Page } from "@playwright/test";
import { applyAuth, loadSession, setLocale } from "./helpers";

async function clickStage(page: Page, xRatio: number, yRatio: number) {
  const stage = page.getByTestId("map-stage");
  await expect(stage).toBeVisible();
  await stage.evaluate(
    (element, ratio) => {
      const rect = element.getBoundingClientRect();
      element.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width * ratio.x,
          clientY: rect.top + rect.height * ratio.y,
        }),
      );
    },
    { x: xRatio, y: yRatio },
  );
}

async function clickPin(page: Page, name: string) {
  await page.getByRole("button", { name, exact: true }).evaluate((element) => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
}

test("mestre edita a rede e o plano passa a oferecer as alternativas novas", async ({ page }) => {
  test.setTimeout(90_000);
  const session = loadSession();
  await applyAuth(page.context(), session);
  await setLocale(page, "pt-BR");
  const api = page.request;
  const stamp = Date.now();
  const origin = `Origem ${stamp}`;
  const destination = `Destino ${stamp}`;
  // The e2e map is a 1px image scaled to the library max (4px). Click
  // coordinates are integers, so a ratio only survives inside a quartile.
  const originPoint = { x: 0.3, y: 0.3 };
  const destinationPoint = { x: 0.8, y: 0.8 };

  await page.goto(`/c/${session.slug}/rota`);
  await page.getByRole("button", { name: "Modo GM" }).click();
  await page.getByRole("button", { name: "Rede de rotas" }).click();

  await page.getByRole("textbox", { name: "Nome (opcional)" }).fill(origin);
  await page.getByRole("button", { name: "Novo nó" }).click();
  await clickStage(page, originPoint.x, originPoint.y);
  await expect(page.getByRole("button", { name: origin, exact: true })).toBeVisible();

  await page.getByRole("textbox", { name: "Nome (opcional)" }).fill(destination);
  await page.getByRole("button", { name: "Novo nó" }).click();
  await clickStage(page, destinationPoint.x, destinationPoint.y);
  await expect(page.getByRole("button", { name: destination, exact: true })).toBeVisible();

  const renamed = `${origin} renomeada`;
  await page.getByRole("button", { name: origin, exact: true }).click();
  await page.getByRole("textbox", { name: "Nome", exact: true }).fill(renamed);
  await page.getByRole("button", { name: "Renomear" }).click();
  await expect
    .poll(async () => {
      const rows = (await (await api.get(`/api/c/${session.slug}/admin/waypoints`)).json()) as {
        nome: string | null;
      }[];
      return rows.some((row) => row.nome === renamed);
    })
    .toBe(true);

  const locais = (await (await api.get(`/api/c/${session.slug}/admin/locais`)).json()) as {
    id: number;
    nome: string;
  }[];
  const altdorf = locais.find((row) => row.nome === "Altdorf");
  expect(altdorf).toBeTruthy();
  const link = page.getByRole("combobox", { name: `Local do nó ${renamed}` });
  await expect(link).toBeVisible();
  await link.selectOption(String(altdorf!.id));
  await expect
    .poll(async () => {
      const rows = (await (await api.get(`/api/c/${session.slug}/admin/waypoints`)).json()) as {
        nome: string | null;
        local_id: number | null;
      }[];
      return rows.find((row) => row.nome === renamed)?.local_id;
    })
    .toBe(altdorf!.id);
  await page.getByRole("combobox", { name: `Local do nó ${renamed}` }).selectOption("");
  await expect
    .poll(async () => {
      const rows = (await (await api.get(`/api/c/${session.slug}/admin/waypoints`)).json()) as {
        nome: string | null;
        local_id: number | null;
      }[];
      return rows.find((row) => row.nome === renamed)?.local_id;
    })
    .toBeNull();

  await page.getByRole("combobox", { name: "Tipo de via" }).selectOption("estrada");
  await page.getByRole("button", { name: "Traçar segmento" }).click();
  await clickPin(page, `${renamed}, Visitado`);
  await clickStage(page, originPoint.x, destinationPoint.y);
  await expect(page.getByTestId("draft-mids")).toHaveText("1");
  await clickPin(page, `${destination}, Visitado`);
  await expect(page.getByTestId("draft-mids")).toHaveText("0");
  await expect(page.getByText(/Estrada/).last()).toBeVisible();

  await page.getByRole("combobox", { name: "Tipo de via" }).selectOption("trilha");
  await clickPin(page, `${renamed}, Visitado`);
  await clickStage(page, destinationPoint.x, originPoint.y);
  await expect(page.getByTestId("draft-mids")).toHaveText("1");
  await clickPin(page, `${destination}, Visitado`);
  await expect(page.getByTestId("draft-mids")).toHaveText("0");
  await expect(page.getByText(/Trilha/).last()).toBeVisible();

  const before = (
    (await (await api.get(`/api/c/${session.slug}/admin/route-segments`)).json()) as {
      id: number;
      distancia_milhas: number;
      waypoint_a_id: number;
    }[]
  ).at(-1);
  expect(before).toBeTruthy();
  const scale = page.getByRole("textbox", { name: "Escala (mi / unidade)" });
  const current = Number(await scale.inputValue());
  await scale.fill(String(current * 2));
  await page.getByRole("button", { name: "Salvar escala" }).click();
  await expect
    .poll(async () => {
      const rows = (await (
        await api.get(`/api/c/${session.slug}/admin/route-segments`)
      ).json()) as {
        id: number;
        distancia_milhas: number;
      }[];
      return rows.find((row) => row.id === before!.id)?.distancia_milhas;
    })
    .toBeGreaterThan(before!.distancia_milhas);

  await page.getByRole("button", { name: "Planejar viagem" }).click();
  await page.getByRole("combobox", { name: "Partindo de" }).fill(renamed);
  await page.getByRole("option", { name: renamed }).click();
  await page.getByRole("combobox", { name: "Chegando a" }).fill(destination);
  await page.getByRole("option", { name: destination }).click();
  await page.getByRole("button", { name: "Calcular" }).click();
  await expect(page.getByTestId("route-option")).toHaveCount(2);

  const waypoints = (await (await api.get(`/api/c/${session.slug}/waypoints`)).json()) as {
    id: number;
    nome: string | null;
  }[];
  const from = waypoints.find((row) => row.nome === renamed);
  const to = waypoints.find((row) => row.nome === destination);
  const planned = await api.get(
    `/api/c/${session.slug}/routes/plan?origem_waypoint_id=${from!.id}&destino_waypoint_id=${to!.id}&ritmo=normal&ordenacao=mais_rapida&modo_transporte=pago&preferencia_via=nenhuma`,
  );
  expect(planned.ok()).toBeTruthy();
  const body = (await planned.json()) as {
    rotas: { tempo_texto: string; distancia_milhas: number }[];
  };
  expect(body.rotas.length).toBeGreaterThanOrEqual(2);
  for (const route of body.rotas) {
    await expect(page.getByText(route.tempo_texto, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(`${Math.round(route.distancia_milhas)} mi`).first()).toBeVisible();
  }

  await clickPin(page, `${renamed}, Visitado`);
  await clickPin(page, `${destination}, Visitado`);
  await expect(page.getByTestId("route-option")).toHaveCount(body.rotas.length);

  await page.getByRole("button", { name: "Rede de rotas" }).click();
  await page.getByRole("button", { name: `Apagar ${renamed}`, exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Apagar" }).click();
  await expect
    .poll(async () => {
      const rows = (await (await api.get(`/api/c/${session.slug}/admin/waypoints`)).json()) as {
        nome: string | null;
      }[];
      return rows.some((row) => row.nome === renamed);
    })
    .toBe(false);
  await expect
    .poll(async () => {
      const rows = (await (
        await api.get(`/api/c/${session.slug}/admin/route-segments`)
      ).json()) as {
        waypoint_a_id: number;
        waypoint_b_id: number;
      }[];
      return rows.some((row) => row.waypoint_a_id === from!.id || row.waypoint_b_id === from!.id);
    })
    .toBe(false);
});
