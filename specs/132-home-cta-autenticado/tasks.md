---

description: "Task list template for feature implementation"
---

# Tasks: CTAs da Home respeitam sessão já autenticada

**Input**: Design documents from `/specs/132-home-cta-autenticado/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md)

**Tests**: UI de navegação/polimento (Constitution II) — validação por `quickstart.md`, sem teste automatizado obrigatório.

**Organization**: Uma única user story (P1) — correção pontual, sem paralelismo real entre as tarefas.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivo diferente, sem dependência de tarefa incompleta)
- **[Story]**: US1 (única história desta feature)

## Path Conventions

`frontend/src/` — produção.

---

## Phase 1: User Story 1 - Mestre já autenticado vai direto pro destino (Priority: P1)

**Goal**: os dois CTAs da Home respeitam sessão existente.

**Independent Test**: autenticado, clicar em cada CTA e confirmar que vai direto ao destino, sem login aparecer.

### Implementation for User Story 1

- [X] T001 [US1] Em `frontend/src/pages/HomePage.tsx`: adicionar `const [isAuthenticated, setIsAuthenticated] = useState(false)` e um `useEffect` que chama `authApi.me()` no mount, setando `true` no sucesso (mesmo padrão de `UserMenu.tsx`/`NovoCodexPage.tsx`); importar `authApi` de `../api/client`
- [X] T002 [US1] O `<Link>` de "Entrar como mestre" (linhas ~56-63) passa a usar `to={isAuthenticated ? '/painel' : '/login?next=/painel'}` e omitir/ajustar o `state` de `createLoginModalState` quando autenticado (não faz sentido passar estado de modal de login pra uma navegação que não abre login) (depende de T001)
- [X] T003 [US1] O `<Link>` de "Criar meu primeiro codex" (linhas ~177-183) passa a usar `to={isAuthenticated ? '/painel#criar' : '/login?next=/painel%23criar'}`, mesmo ajuste de `state` condicional (depende de T001)

**Checkpoint**: os dois CTAs respeitam sessão; sem sessão, comportamento idêntico ao anterior.

---

## Phase Final: Polish & Validação

- [X] T004 [P] Rodar `cd frontend && npx tsc --noEmit`
- [X] T005 Executar os 4 cenários (A–D) do `quickstart.md`

---

## Dependencies & Execution Order

T001 → T002 → T003 (mesmo arquivo, tocam blocos diferentes mas dependem do mesmo estado) → T004/T005 em paralelo.

## Notes

- Achado ao planejar (ver `research.md`): a Home já renderiza `<SiteChrome>`, que já chama `authApi.me()` via `UserMenu` — esta feature adiciona uma segunda chamada independente à mesma rota, seguindo o padrão já existente na aplicação (nenhuma página compartilha esse resultado hoje). Não é regressão, é o padrão já aceito; compartilhar a checagem entre `SiteChrome` e páginas filhas fica como possível otimização futura, fora do escopo desta correção pontual.
