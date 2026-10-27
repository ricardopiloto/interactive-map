import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Link, MemoryRouter, Outlet, Route, Routes, useParams } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { EditModeProvider } from "@/auth/EditModeContext";
import type { CampaignConfig } from "@/api/campaign";
import type { AlertaInconsistencia, SessaoPayload, SugestaoAssociacoes } from "@/api/sessoes";
import { CodexProvider } from "@/components/codex/codex-context";
import { TopBar } from "@/components/codex/Shell";
import i18n from "@/i18n";
import { Sessions } from "./sessoes";

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

interface Place {
  id: number;
  nome: string;
  visivel_para_todos: boolean;
}

interface Person {
  id: number;
  nome: string;
  tipo: string;
  visivel_para_todos: boolean;
}

interface Row {
  id: number;
  numero: number;
  titulo: string;
  data_rotulo: string | null;
  resumo: string;
  notas_preparo: string;
  visivel_para_todos: boolean;
  local_ids: number[];
  personagem_ids: number[];
  arco_id: number | null;
}

interface Store {
  rows: Row[];
  fios?: {
    id: number;
    titulo: string;
    descricao: string;
    estado: "aberto" | "resolvido";
    origem: "manual" | "ia";
    sessao_origem_id: number | null;
    ordem: number;
    criado_em: string;
  }[];
  locais: Place[];
  personagens: Person[];
  arcos: { id: number; titulo: string }[];
  nextId: number;
  papel: "dono" | "membro";
  modules: string[];
  suggestCalls: number;
  exposeAlerts: boolean;
  suggestion: SugestaoAssociacoes;
}

function config(slug: string, modules: string[]): CampaignConfig {
  return {
    id: 1,
    slug,
    nome: slug,
    sistema: "wfrp4e",
    has_map_image: false,
    map_url: null,
    modulos_ativos: modules,
  };
}

function ordered(rows: Row[]) {
  return [...rows].sort((a, b) => b.numero - a.numero || b.id - a.id);
}

function alertsFor(store: Store, row: Row): AlertaInconsistencia[] {
  if (!row.visivel_para_todos) return [];
  if (store.papel !== "dono" && !store.exposeAlerts) return [];
  const found: AlertaInconsistencia[] = [];
  for (const personagemId of row.personagem_ids) {
    const personagem = store.personagens.find((item) => item.id === personagemId);
    if (!personagem) continue;
    for (const other of store.rows) {
      if (other.id === row.id || other.visivel_para_todos || other.numero >= row.numero) continue;
      if (!other.personagem_ids.includes(personagemId)) continue;
      found.push({
        personagem_id: personagemId,
        personagem_nome: personagem.nome,
        sessao_visivel_id: row.id,
        sessao_visivel_numero: row.numero,
        sessao_oculta_id: other.id,
        sessao_oculta_numero: other.numero,
        sessao_oculta_titulo: other.titulo,
      });
    }
  }
  return found;
}

function view(store: Store, row: Row, hide: boolean) {
  const locais = row.local_ids
    .map((id) => store.locais.find((local) => local.id === id))
    .filter((local): local is Place => local != null)
    .filter((local) => !hide || local.visivel_para_todos)
    .map((local) => ({ id: local.id, nome: local.nome }));
  const personagens = row.personagem_ids
    .map((id) => store.personagens.find((personagem) => personagem.id === id))
    .filter((personagem): personagem is Person => personagem != null)
    .filter((personagem) => !hide || personagem.visivel_para_todos)
    .map((personagem) => ({ id: personagem.id, nome: personagem.nome, tipo: personagem.tipo }));
  return {
    id: row.id,
    numero: row.numero,
    titulo: row.titulo,
    data_rotulo: row.data_rotulo,
    resumo: row.resumo,
    locais,
    personagens,
    arco_id: row.arco_id,
    arco_transicao_id: null,
    ...(hide
      ? {}
      : {
          notas_preparo: row.notas_preparo,
          visivel_para_todos: row.visivel_para_todos,
          alertas_inconsistencia: alertsFor(store, row),
        }),
  };
}

function installApi(stores: Record<string, Store>, signedIn: boolean) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? "GET").toUpperCase();
      const respond = (body: unknown, status = 200) =>
        Promise.resolve(
          new Response(status === 204 ? null : JSON.stringify(body), {
            status,
            headers: { "Content-Type": "application/json" },
          }),
        );
      if (url === "/api/auth/me") {
        return signedIn
          ? respond({ id: 1, email: "gm@teste.local", is_admin: false })
          : new Response("{}", { status: 401 });
      }
      const slug = url.match(/\/api\/c\/([^/]+)/)?.[1];
      if (!slug) return new Response("{}", { status: 404 });
      const store = stores[decodeURIComponent(slug)];
      if (!store) return new Response("{}", { status: 404 });
      if (url.includes("/admin/fios") && method === "GET") {
        const params = new URL(url, "http://localhost").searchParams;
        return respond(
          (store.fios ?? []).filter(
            (fio) =>
              (!params.has("sessao_origem_id") ||
                fio.sessao_origem_id === Number(params.get("sessao_origem_id"))) &&
              (!params.has("estado") || fio.estado === params.get("estado")),
          ),
        );
      }
      if (url.endsWith("/admin/fios") && method === "POST") {
        const body = JSON.parse(String(init?.body));
        const fio = {
          ...body,
          id: (store.fios?.length ?? 0) + 1,
          estado: "aberto",
          ordem: store.fios?.length ?? 0,
          criado_em: "2026-01-01",
        };
        store.fios = [...(store.fios ?? []), fio];
        return respond(fio, 201);
      }
      const fioPath = url.match(/\/admin\/fios\/(\d+)$/);
      if (fioPath && method === "PATCH") {
        const fio = store.fios?.find((item) => item.id === Number(fioPath[1]));
        if (!fio) return respond({}, 404);
        Object.assign(fio, JSON.parse(String(init?.body)));
        return respond(fio);
      }
      if (fioPath && method === "DELETE") {
        store.fios = (store.fios ?? []).filter((item) => item.id !== Number(fioPath[1]));
        return new Response(null, { status: 204 });
      }
      if (url.endsWith("/admin/session")) return respond({ papel: store.papel });
      if (url.endsWith("/config")) return respond(config(decodeURIComponent(slug), store.modules));
      if (url.endsWith("/admin/sessoes/proximo-numero")) {
        const numero = store.rows.reduce((max, row) => Math.max(max, row.numero), 0) + 1;
        return respond({ numero });
      }
      if (url.endsWith("/admin/sessoes/sugerir-associacoes") && method === "POST") {
        store.suggestCalls += 1;
        return respond(store.suggestion);
      }
      const one = url.match(/\/admin\/sessoes\/(\d+)$/);
      if (one && method === "PATCH") {
        const id = Number(one[1]);
        const body = JSON.parse(String(init?.body)) as SessaoPayload;
        const row = store.rows.find((item) => item.id === id);
        if (!row) return new Response("{}", { status: 404 });
        Object.assign(row, body);
        return respond(view(store, row, false));
      }
      if (one && method === "DELETE") {
        store.rows = store.rows.filter((item) => item.id !== Number(one[1]));
        return new Response(null, { status: 204 });
      }
      if (url.endsWith("/admin/sessoes") && method === "POST") {
        const body = JSON.parse(String(init?.body)) as SessaoPayload;
        const row: Row = {
          id: store.nextId++,
          numero: body.numero,
          titulo: body.titulo,
          data_rotulo: body.data_rotulo,
          resumo: body.resumo,
          notas_preparo: body.notas_preparo,
          visivel_para_todos: body.visivel_para_todos,
          local_ids: body.local_ids,
          personagem_ids: body.personagem_ids,
          arco_id: null,
        };
        store.rows.push(row);
        return respond(view(store, row, false), 201);
      }
      if (url.endsWith("/admin/sessoes") && method === "GET") {
        return respond({ sessoes: ordered(store.rows).map((row) => view(store, row, false)) });
      }
      if (url.endsWith("/sessoes") && method === "GET") {
        return respond({
          sessoes: ordered(store.rows)
            .filter((row) => row.visivel_para_todos)
            .map((row) => view(store, row, true)),
        });
      }
      if (url.endsWith("/admin/locais") || url.endsWith("/locais")) return respond(store.locais);
      if (url.endsWith("/admin/personagens") || url.endsWith("/personagens")) {
        return respond(store.personagens);
      }
      if (url.endsWith("/admin/arcos") || url.endsWith("/arcos")) return respond(store.arcos);
      return new Response("{}", { status: 404 });
    }),
  );
}

function renderSessions(path: string, stores: Record<string, Store>, signedIn = false) {
  installApi(stores, signedIn);
  if (signedIn) {
    const slug = path.match(/\/c\/([^/?]+)/)?.[1];
    if (slug) sessionStorage.setItem(`codex.editMode.${decodeURIComponent(slug)}`, "1");
  }
  function Frame() {
    const { slug = "" } = useParams();
    const store = stores[slug];
    const campaign = config(slug, store?.modules ?? []);
    return (
      <EditModeProvider slug={slug}>
        <TopBar campaign={campaign} />
        <Outlet context={campaign} />
      </EditModeProvider>
    );
  }
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <CodexProvider>
          <Link to="/c/beta/sessoes">Trocar campanha</Link>
          <Routes>
            <Route path="/c/:slug" element={<Frame />}>
              <Route path="sessoes" element={<Sessions />} />
            </Route>
          </Routes>
        </CodexProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function emptyStore(patch: Partial<Store> = {}): Store {
  return {
    rows: [],
    locais: [
      { id: 1, nome: "Altdorf", visivel_para_todos: true },
      { id: 2, nome: "Covil", visivel_para_todos: false },
    ],
    personagens: [{ id: 7, nome: "Ada", tipo: "pj", visivel_para_todos: true }],
    arcos: [{ id: 3, titulo: "O Império" }],
    nextId: 10,
    papel: "dono",
    modules: [],
    suggestCalls: 0,
    exposeAlerts: false,
    suggestion: { estado: "sugestoes", mensagem: "", local_ids: [2], personagem_ids: [7] },
    ...patch,
  };
}

function row(patch: Partial<Row> & Pick<Row, "id" | "numero" | "titulo">): Row {
  return {
    data_rotulo: null,
    resumo: "",
    notas_preparo: "",
    visivel_para_todos: true,
    local_ids: [],
    personagem_ids: [],
    arco_id: null,
    ...patch,
  };
}

it("mostra o resumo em Markdown com chips e sem o micro-formato do template", async () => {
  renderSessions("/c/alpha/sessoes", {
    alpha: emptyStore({
      rows: [
        row({
          id: 1,
          numero: 4,
          titulo: "A chegada",
          resumo: "**Chegada**\n\n- Primeiro\n\n<script>alert('x')</script>",
          local_ids: [1, 2],
          personagem_ids: [7],
          arco_id: 3,
          data_rotulo: "Nachgeheim",
        }),
      ],
    }),
  });

  expect(await screen.findByRole("heading", { name: "A chegada" })).toBeVisible();
  expect(screen.getByText("Chegada").tagName).toBe("STRONG");
  expect(screen.getByText("Primeiro").tagName).toBe("LI");
  expect(screen.getByRole("article").querySelector("script")).toBeNull();
  expect(document.body.textContent).not.toContain("[[loc:");
  expect(document.body.textContent).not.toContain("**Chegada**");
  expect(screen.getByText(/Arco “O Império”/)).toBeVisible();
  expect(screen.queryByText("Covil")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Local: Altdorf" })).toHaveAttribute(
    "href",
    "/c/alpha/mapa?local=1",
  );
  expect(screen.getByRole("link", { name: "Personagem: Ada" })).toHaveAttribute(
    "href",
    "/c/alpha/relacoes?personagem=7",
  );
  expect(screen.queryByRole("button", { name: "Nova sessão" })).not.toBeInTheDocument();
  expect(screen.queryByText(/sessão oculta/)).not.toBeInTheDocument();
});

it("prepara a próxima sessão oculta com notas de preparo em foco", async () => {
  const store = emptyStore({
    rows: [row({ id: 1, numero: 3, titulo: "Já jogada" })],
  });
  renderSessions("/c/alpha/sessoes", { alpha: store }, true);

  fireEvent.click(await screen.findByRole("button", { name: "Preparar próxima sessão" }));
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByRole("spinbutton", { name: "Número" })).toHaveValue(4);
  expect(within(dialog).getByRole("checkbox", { name: "Visível para todos" })).not.toBeChecked();
  const notas = within(dialog).getByRole("textbox", { name: "Notas de preparo" });
  expect(notas).toHaveFocus();
  fireEvent.change(within(dialog).getByRole("textbox", { name: "Título" }), {
    target: { value: "Próxima" },
  });
  fireEvent.change(notas, { target: { value: "Cena do barão" } });
  fireEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));

  expect(await screen.findByRole("heading", { name: "Próxima" })).toBeVisible();
  expect(screen.getByText("Oculta")).toBeVisible();
  expect(screen.getByText("Cena do barão")).toBeVisible();
  const created = store.rows.find((item) => item.titulo === "Próxima");
  expect(created?.visivel_para_todos).toBe(false);
  expect(created?.notas_preparo).toBe("Cena do barão");
});

it("cria, edita, oculta e exclui uma sessão, e não chama a sugestão com o módulo desligado", async () => {
  const store = emptyStore();
  renderSessions("/c/alpha/sessoes", { alpha: store }, true);

  fireEvent.click(await screen.findByRole("button", { name: "Nova sessão" }));
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByRole("spinbutton", { name: "Número" })).toHaveValue(1);
  expect(within(dialog).queryByRole("button", { name: "Sugerir com IA" })).not.toBeInTheDocument();
  expect(
    within(dialog).queryByRole("button", { name: "Sugerir locais e personagens" }),
  ).not.toBeInTheDocument();
  fireEvent.change(within(dialog).getByRole("textbox", { name: "Título" }), {
    target: { value: "A chegada" },
  });
  fireEvent.change(within(dialog).getByRole("textbox", { name: "Resumo" }), {
    target: { value: "**Olá** mesa" },
  });
  fireEvent.click(within(dialog).getByRole("checkbox", { name: "Altdorf" }));
  fireEvent.click(within(dialog).getByRole("checkbox", { name: "Ada" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));

  expect(await screen.findByRole("heading", { name: "A chegada" })).toBeVisible();
  expect(screen.getByText("Olá").tagName).toBe("STRONG");
  expect(screen.getByRole("link", { name: "Local: Altdorf" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Personagem: Ada" })).toBeVisible();
  expect(store.suggestCalls).toBe(0);

  fireEvent.click(screen.getByRole("button", { name: "Editar sessão" }));
  const editor = await screen.findByRole("dialog");
  fireEvent.change(within(editor).getByRole("textbox", { name: "Título" }), {
    target: { value: "A partida" },
  });
  fireEvent.click(within(editor).getByRole("checkbox", { name: "Visível para todos" }));
  fireEvent.click(within(editor).getByRole("button", { name: "Salvar" }));

  expect(await screen.findByRole("heading", { name: "A partida" })).toBeVisible();
  expect(screen.getByText("Oculta")).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "Visualização" }));
  expect(await screen.findByText("Ainda não há sessões visíveis nesta campanha.")).toBeVisible();
  expect(screen.queryByText("A partida")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Modo GM" }));
  expect(await screen.findByRole("heading", { name: "A partida" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Excluir sessão" }));
  fireEvent.click(
    within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Excluir" }),
  );
  await waitFor(() =>
    expect(screen.getByText("Ainda não há sessões. Crie a primeira em Modo edição.")).toBeVisible(),
  );
  expect(store.suggestCalls).toBe(0);
});

it("mostra o alerta de inconsistência só para o dono", async () => {
  const rows = [
    row({
      id: 1,
      numero: 1,
      titulo: "Segredo",
      visivel_para_todos: false,
      personagem_ids: [7],
    }),
    row({
      id: 2,
      numero: 2,
      titulo: "Pública",
      personagem_ids: [7],
      local_ids: [2],
    }),
  ];
  const first = renderSessions(
    "/c/alpha/sessoes",
    { alpha: emptyStore({ rows, papel: "dono" }) },
    true,
  );
  expect(await screen.findByText(/Ada também está na sessão oculta 1 \(Segredo\)/)).toBeVisible();
  first.unmount();

  renderSessions(
    "/c/alpha/sessoes",
    { alpha: emptyStore({ rows, papel: "membro", exposeAlerts: true }) },
    true,
  );
  expect(await screen.findByRole("heading", { name: "Pública" })).toBeVisible();
  expect(screen.queryByText(/sessão oculta/)).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Nova sessão" })).toBeVisible();
});

it("sugere associações só com o módulo ia_arcos e preserva a seleção atual", async () => {
  const store = emptyStore({ modules: ["ia_arcos"] });
  renderSessions("/c/alpha/sessoes", { alpha: store }, true);

  fireEvent.click(await screen.findByRole("button", { name: "Nova sessão" }));
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getAllByRole("button", { name: "Sugerir com IA" })).toHaveLength(1);
  fireEvent.click(within(dialog).getByRole("checkbox", { name: "Visível para todos" }));
  expect(within(dialog).getAllByRole("button", { name: "Sugerir com IA" })).toHaveLength(2);
  expect(within(dialog).getByRole("button", { name: "Fios narrativos" })).toBeVisible();
  const suggest = within(dialog).getByRole("button", { name: "Sugerir locais e personagens" });
  expect(suggest).toBeDisabled();
  expect(
    within(dialog).getByText("Escreva o resumo para sugerir locais e personagens."),
  ).toBeVisible();

  fireEvent.change(within(dialog).getByRole("textbox", { name: "Resumo" }), {
    target: { value: "Ada entra no covil." },
  });
  fireEvent.click(within(dialog).getByRole("checkbox", { name: "Altdorf" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Sugerir locais e personagens" }));
  await waitFor(() =>
    expect(within(dialog).getByRole("checkbox", { name: "Covil" })).toBeChecked(),
  );
  expect(within(dialog).getByRole("checkbox", { name: "Altdorf" })).toBeChecked();
  expect(within(dialog).getByRole("checkbox", { name: "Ada" })).toBeChecked();
  expect(store.suggestCalls).toBe(1);

  store.suggestion = { estado: "vazio", mensagem: "", local_ids: [], personagem_ids: [] };
  fireEvent.click(within(dialog).getByRole("button", { name: "Sugerir locais e personagens" }));
  expect(await within(dialog).findByText("Nenhum local ou personagem identificado.")).toBeVisible();
  expect(within(dialog).getByRole("checkbox", { name: "Altdorf" })).toBeChecked();
  expect(store.suggestCalls).toBe(2);
});

it("não reaproveita sessões ao trocar de campanha", async () => {
  renderSessions("/c/alpha/sessoes", {
    alpha: emptyStore({ rows: [row({ id: 1, numero: 1, titulo: "Sessão Alpha" })] }),
    beta: emptyStore({ rows: [row({ id: 2, numero: 1, titulo: "Sessão Beta" })] }),
  });

  expect(await screen.findByRole("heading", { name: "Sessão Alpha" })).toBeVisible();
  fireEvent.click(screen.getByRole("link", { name: "Trocar campanha" }));
  expect(await screen.findByRole("heading", { name: "Sessão Beta" })).toBeVisible();
  expect(screen.queryByText("Sessão Alpha")).not.toBeInTheDocument();
});

it("separa a leitura do dono e esconde os fios ao desligar o Modo GM", async () => {
  const owner = emptyStore({
    rows: [
      row({
        id: 1,
        numero: 1,
        titulo: "A partida",
        resumo: "Texto público",
        notas_preparo: "Plano secreto",
      }),
    ],
    fios: [
      {
        id: 7,
        titulo: "Pista secreta",
        descricao: "Descrição privada",
        estado: "aberto",
        origem: "manual",
        sessao_origem_id: 1,
        ordem: 0,
        criado_em: "2026-01-01",
      },
    ],
  });
  renderSessions("/c/alpha/sessoes?s=1", { alpha: owner }, true);
  const notes = await screen.findByRole("region", { name: "Notas de preparo" });
  const threads = screen.getByRole("region", { name: "Fios Narrativos" });
  const summary = screen.getByRole("region", { name: "Resumo" });
  expect(notes.compareDocumentPosition(threads) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(threads.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(await within(threads).findByText("Pista secreta")).toBeVisible();
  expect(within(summary).getByText("Texto público")).toBeVisible();
  expect(within(summary).queryByText("Plano secreto")).not.toBeInTheDocument();
  expect(within(summary).queryByText("Pista secreta")).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Fios em aberto" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Visualização" }));
  await waitFor(() =>
    expect(screen.queryByRole("region", { name: "Notas de preparo" })).not.toBeInTheDocument(),
  );
  expect(screen.queryByRole("region", { name: "Fios Narrativos" })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Fios em aberto" })).not.toBeInTheDocument();
  expect(screen.queryByText("Plano secreto")).not.toBeInTheDocument();
  expect(screen.queryByText("Pista secreta")).not.toBeInTheDocument();
  expect(screen.getByText("Texto público")).toBeVisible();
});

it("mostra apenas o resumo ao visitante", async () => {
  renderSessions("/c/alpha/sessoes?s=1", {
    alpha: emptyStore({
      rows: [
        row({
          id: 1,
          numero: 1,
          titulo: "A partida",
          resumo: "Texto público",
          notas_preparo: "Plano secreto",
        }),
      ],
      fios: [
        {
          id: 7,
          titulo: "Pista secreta",
          descricao: "Descrição privada",
          estado: "aberto",
          origem: "manual",
          sessao_origem_id: 1,
          ordem: 0,
          criado_em: "2026-01-01",
        },
      ],
    }),
  });
  expect(await screen.findByText("Texto público")).toBeVisible();
  expect(screen.queryByText("Plano secreto")).not.toBeInTheDocument();
  expect(screen.queryByText("Pista secreta")).not.toBeInTheDocument();
  expect(screen.queryByText("Fios Narrativos")).not.toBeInTheDocument();
  expect(screen.queryByText("Só para o mestre")).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Resumo" })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Fios em aberto" })).not.toBeInTheDocument();
});
