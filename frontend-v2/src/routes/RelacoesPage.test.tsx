import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, Outlet, Route, Routes, useParams } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { EditModeProvider, useEditMode } from "@/auth/EditModeContext";
import type { CampaignConfig } from "@/api/campaign";
import type { Personagem, Vinculo, VinculoPayload } from "@/api/relacoes";
import i18n from "@/i18n";
import { Relations } from "./relacoes";

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

function person(patch: Partial<Personagem> & Pick<Personagem, "id" | "nome">): Personagem {
  return {
    tipo: "npc",
    papel: null,
    descricao: "",
    faccao: null,
    status: "vivo",
    retrato_url: null,
    visivel_para_todos: true,
    extensoes_mecanica: {},
    local_ids: [],
    ...patch,
  };
}

function bond(patch: Partial<Vinculo> & Pick<Vinculo, "id">): Vinculo {
  return {
    personagem_a_id: 1,
    personagem_b_id: 2,
    tipo_ab: "aliado",
    publico: true,
    qualificador_ab: "",
    qualificador_ba: "",
    nota_ab: "",
    nota_ba: "",
    conhecido_ab: true,
    conhecido_ba: true,
    ...patch,
  };
}

interface Store {
  personagens: Personagem[];
  vinculos: Vinculo[];
  nextId: number;
  created?: VinculoPayload;
}

function config(slug: string, modules: string[] = []): CampaignConfig {
  return {
    id: 1,
    slug,
    nome: slug,
    sistema: "wfrp4e",
    has_map_image: true,
    map_url: "/mapas/alpha.jpg",
    modulos_ativos: modules,
  };
}

function publicBond(v: Vinculo) {
  if (!v.publico) return null;
  const duas = v.tipo_ab != null && v.tipo_ba != null && v.tipo_ab !== v.tipo_ba;
  if (!duas) {
    return {
      id: v.id,
      personagem_a_id: v.personagem_a_id,
      personagem_b_id: v.personagem_b_id,
      tipo_ab: v.tipo_ab ?? v.tipo_ba,
      nota_ab: v.nota_ab ?? "",
      publico: true,
      qualificador_ab: v.qualificador_ab ?? v.qualificador_ba ?? "",
      direcao: v.direcao ?? null,
    };
  }
  const knownA = v.conhecido_ab !== false;
  const knownB = v.conhecido_ba !== false;
  if (knownA && !knownB) {
    return {
      id: v.id,
      personagem_a_id: v.personagem_a_id,
      personagem_b_id: v.personagem_b_id,
      tipo_ab: v.tipo_ab,
      nota_ab: v.nota_ab ?? "",
      publico: true,
      qualificador_ab: v.qualificador_ab ?? "",
      direcao: v.direcao ?? null,
    };
  }
  return {
    id: v.id,
    personagem_a_id: v.personagem_a_id,
    personagem_b_id: v.personagem_b_id,
    ...(knownA
      ? { tipo_ab: v.tipo_ab, nota_ab: v.nota_ab ?? "", qualificador_ab: v.qualificador_ab ?? "" }
      : {}),
    ...(knownB
      ? { tipo_ba: v.tipo_ba, nota_ba: v.nota_ba ?? "", qualificador_ba: v.qualificador_ba ?? "" }
      : {}),
    publico: true,
    direcao: v.direcao ?? null,
  };
}

function installApi(store: Store, signedIn: boolean) {
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
      if (url.endsWith("/admin/session")) return respond({ papel: "dono" });
      if (url.endsWith("/locais") || url.endsWith("/admin/locais")) return respond([]);
      if (url.endsWith("/admin/personagens") && method === "POST") {
        const body = JSON.parse(String(init?.body)) as Personagem;
        const created = person({ ...body, id: store.nextId++ });
        store.personagens.push(created);
        return respond(created, 201);
      }
      if (url.endsWith("/admin/vinculos") && method === "POST") {
        const body = JSON.parse(String(init?.body)) as VinculoPayload;
        store.created = body;
        const created = bond({ ...body, id: store.nextId++ });
        store.vinculos.push(created);
        return respond(created, 201);
      }
      if (url.endsWith("/admin/personagens")) return respond(store.personagens);
      if (url.endsWith("/admin/vinculos")) return respond(store.vinculos);
      if (url.endsWith("/personagens")) return respond(store.personagens);
      if (url.endsWith("/vinculos")) return respond(store.vinculos.map(publicBond).filter(Boolean));
      return new Response("{}", { status: 404 });
    }),
  );
}

function ModeSwitch() {
  const { canEdit, enabled, setEnabled } = useEditMode();
  if (!canEdit) return null;
  return (
    <button type="button" onClick={() => setEnabled(!enabled)}>
      {enabled ? "Visualização" : "Modo GM"}
    </button>
  );
}

function renderRelations(path: string, store: Store, signedIn = false, modules: string[] = []) {
  installApi(store, signedIn);
  function Frame() {
    const { slug = "" } = useParams();
    return (
      <EditModeProvider slug={slug}>
        <ModeSwitch />
        <Outlet context={config(slug, modules)} />
      </EditModeProvider>
    );
  }
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/c/:slug" element={<Frame />}>
            <Route path="relacoes" element={<Relations />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const cast = [
  person({ id: 1, nome: "Ada", tipo: "pj", descricao: "Uma **capitã**." }),
  person({ id: 2, nome: "Bruno", status: "morto" }),
  person({ id: 3, nome: "Carla" }),
];

it("mostra todos os personagens e vínculos da campanha e abre o deep-link", async () => {
  renderRelations("/c/alpha/relacoes?personagem=1", {
    personagens: cast,
    vinculos: [
      bond({ id: 10, tipo_ab: "aliado" }),
      bond({ id: 11, personagem_a_id: 2, personagem_b_id: 3, tipo_ab: "amizade" }),
    ],
    nextId: 12,
  });

  expect(await screen.findByRole("heading", { name: "Ada" })).toBeVisible();
  expect(screen.getByText("capitã")).toBeVisible();
  expect(screen.queryByText("**")).not.toBeInTheDocument();
  expect(document.querySelectorAll("[data-vinculo-id]")).toHaveLength(2);
  expect(document.querySelector("[data-node-id='2']")).toBeTruthy();
  expect(document.querySelector("[data-node-id='3']")).toBeTruthy();
});

it("exibe retrato cadastrado no perfil e grafo, sem espaço de imagem para outro personagem", async () => {
  const ada = person({ id: 1, nome: "Ada", tipo: "pj", retrato_url: "/media/portraits/ada.webp" });
  const bruno = person({ id: 2, nome: "Bruno" });
  renderRelations("/c/alpha/relacoes?personagem=1", {
    personagens: [ada, bruno],
    vinculos: [],
    nextId: 3,
  });

  expect(await screen.findByRole("img", { name: "Ilustração de Ada" })).toHaveAttribute(
    "src",
    ada.retrato_url,
  );
  expect(document.querySelector("[data-node-id='1'] image")?.getAttribute("href")).toBe(
    ada.retrato_url,
  );
  fireEvent.click(screen.getByRole("button", { name: "Bruno" }));
  expect(await screen.findByRole("heading", { name: "Bruno" })).toBeVisible();
  expect(screen.queryByRole("img", { name: /Ilustração de/ })).not.toBeInTheDocument();
});

it("filtra por tipo e status e isola a seleção", async () => {
  renderRelations("/c/alpha/relacoes", {
    personagens: cast,
    vinculos: [
      bond({ id: 10, tipo_ab: "aliado" }),
      bond({ id: 11, personagem_a_id: 2, personagem_b_id: 3, tipo_ab: "amizade" }),
    ],
    nextId: 12,
  });

  await screen.findByRole("button", { name: "Ada" });
  fireEvent.change(screen.getByRole("searchbox", { name: "Buscar personagem…" }), {
    target: { value: "Car" },
  });
  expect(screen.getByText("Personagens · 1")).toBeVisible();
  fireEvent.change(screen.getByRole("searchbox", { name: "Buscar personagem…" }), {
    target: { value: "" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Amizade/ }));
  expect(screen.getByRole("button", { name: /Amizade/ })).toHaveAttribute("aria-pressed", "true");
  expect(document.querySelector("[data-vinculo-id='10']")).toBeNull();
  expect(document.querySelector("[data-vinculo-id='11']")).toBeTruthy();

  fireEvent.change(screen.getByRole("combobox", { name: "Estado" }), {
    target: { value: "morto" },
  });
  expect(screen.getByRole("button", { name: "Bruno" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "Ada" })).not.toBeInTheDocument();

  fireEvent.change(screen.getByRole("combobox", { name: "Estado" }), {
    target: { value: "todos" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Amizade/ }));
  fireEvent.click(screen.getByRole("button", { name: "Ada" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Isolar seleção" }));
  expect(document.querySelector("[data-node-id='3']")).toHaveAttribute("data-dimmed", "true");
  expect(document.querySelector("[data-node-id='2']")).toHaveAttribute("data-dimmed", "false");
});

it("cria um vínculo de duas vias e esconde o lado desconhecido na visão de jogador", async () => {
  const store: Store = {
    personagens: cast,
    vinculos: [],
    nextId: 20,
  };
  renderRelations("/c/alpha/relacoes", store, true, ["fadiga"]);

  fireEvent.click(await screen.findByRole("button", { name: "Modo GM" }));
  fireEvent.click(await screen.findByRole("button", { name: "+ Personagem" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Nome" }), { target: { value: "Mira" } });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Fadiga" }), { target: { value: "3" } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

  await screen.findByRole("heading", { name: "Mira" });
  expect(store.personagens.find((p) => p.nome === "Mira")?.extensoes_mecanica).toEqual({
    fadiga: 3,
  });

  fireEvent.click(screen.getByRole("button", { name: "+ Conexão" }));
  const dialog = await screen.findByRole("dialog");
  fireEvent.change(within(dialog).getByRole("combobox", { name: "Personagem A" }), {
    target: { value: "1" },
  });
  fireEvent.change(within(dialog).getByRole("combobox", { name: "Personagem B" }), {
    target: { value: String(store.personagens.find((p) => p.nome === "Mira")!.id) },
  });
  fireEvent.click(within(dialog).getByRole("radio", { name: "Duas vias" }));
  fireEvent.change(within(dialog).getByRole("combobox", { name: /Ada vê Mira como/ }), {
    target: { value: "aliado" },
  });
  fireEvent.change(within(dialog).getByRole("combobox", { name: /Qualificador \(Ada → Mira\)/ }), {
    target: { value: "Mentor" },
  });
  fireEvent.change(within(dialog).getByRole("combobox", { name: /Mira vê Ada como/ }), {
    target: { value: "conhecido" },
  });
  fireEvent.change(within(dialog).getByRole("combobox", { name: /Qualificador \(Mira → Ada\)/ }), {
    target: { value: "Lacaio" },
  });
  fireEvent.change(within(dialog).getByRole("textbox", { name: /Nota \(Mira → Ada\)/ }), {
    target: { value: "nota-secreta" },
  });
  fireEvent.click(
    within(dialog).getByRole("checkbox", { name: /Conhecido pelos jogadores \(Mira → Ada\)/ }),
  );
  fireEvent.click(within(dialog).getByRole("checkbox", { name: "Visível para jogadores" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(store.created?.qualificador_ba).toBe("Lacaio"));
  expect(store.created).toMatchObject({
    tipo_ab: "aliado",
    tipo_ba: "conhecido",
    qualificador_ab: "Mentor",
    conhecido_ba: false,
    publico: true,
  });

  expect((await screen.findAllByText(/Aliado \(Mentor\)/)).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Conhecido \(Lacaio\)/).length).toBeGreaterThan(0);
  expect(screen.getAllByText("nota-secreta").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Sentido desconhecido pelos jogadores").length).toBeGreaterThan(0);

  fireEvent.click(screen.getByRole("button", { name: "Visualização" }));
  await waitFor(() => expect(screen.queryByText("nota-secreta")).not.toBeInTheDocument());
  expect(screen.queryByText(/Lacaio/)).not.toBeInTheDocument();
  expect(screen.queryByText("Sentido desconhecido pelos jogadores")).not.toBeInTheDocument();
  expect(screen.getAllByText(/Aliado \(Mentor\)/).length).toBeGreaterThan(0);
});
