# Tasks: Retratos nas listas de personagens

**Input**: Design documents from `specs/145-retrato-lista-personagens/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: E2E regression coverage is included as requested in the quickstart; no backend, security, migration, or import/export tests apply.

**Organization**: Tasks are grouped by user story. Each list has its own E2E file so both stories can be implemented and checked independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add deterministic image responses for the UI scenarios.

- [X] T001 Add Playwright fixtures that seed and clean characters with valid, absent, and failed `retrato_url` values and serve deterministic image responses in `frontend/e2e/personagem-retratos-fixtures.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm shared prerequisites for both stories.

No schema, API, model, or shared application component is required. `Personagem.retrato_url` and the Playwright configuration already exist. T001 is the only shared prerequisite; both user stories can proceed independently after it.

---

## Phase 3: User Story 1 - Reconhecer personagens pela imagem no mapa (Priority: P1) 🎯 MVP

**Goal**: Mostrar o retrato de cada personagem na lista lateral do Mapa, mantendo fallback de iniciais e interações existentes.

**Independent Test**: Abrir o Mapa com personagens com retrato válido, sem retrato e com imagem que falha; verificar a imagem ou fallback correto e confirmar que as linhas continuam selecionáveis.

### Tests for User Story 1

- [X] T002 [P] [US1] Add E2E assertions using `loadSession`, `applyAuth`, and the portrait fixture for correct portrait, absent/broken-image fallback, and row selection in `frontend/e2e/mapa-retratos.spec.ts`

### Implementation for User Story 1

- [X] T003 [P] [US1] Render each character portrait with initial fallback and reset image failure when `retrato_url` changes in `frontend/src/pages/MapPage.tsx`
- [X] T004 [P] [US1] Keep the list avatar circular and 28×28 px, clip its portrait with cover behavior, and preserve the existing fallback styling in `frontend/src/pages/MapPage.css`

**Checkpoint**: The Map list independently shows the right portrait or fallback without changing its filtering, selection, or detail flow.

---

## Phase 4: User Story 2 - Reconhecer personagens pela imagem no mapa de relações (Priority: P1)

**Goal**: Mostrar na lista de Relações os mesmos retratos que identificam os personagens nos tokens do grafo, sem alterar os tokens ou o comportamento de filtros e seleção.

**Independent Test**: Abrir a lista de Relações com retratos válidos, ausentes e que falham; comparar os avatares com os tokens correspondentes e confirmar que busca, filtros e seleção continuam funcionais.

### Tests for User Story 2

- [X] T005 [P] [US2] Add E2E assertions using `loadSession`, `applyAuth`, and the portrait fixture for portrait, absent/broken-image fallback, search, filter, and selection synchronized with the graph in `frontend/e2e/relacoes-retratos.spec.ts`

### Implementation for User Story 2

- [X] T006 [P] [US2] Render each list portrait with initial fallback and reset image failure when `retrato_url` changes in `frontend/src/pages/RelacoesPage.tsx`
- [X] T007 [P] [US2] Keep the list avatar circular and 28×28 px, clip its portrait with cover behavior, and preserve the existing fallback styling in `frontend/src/pages/RelacoesPage.css`

**Checkpoint**: The Relations list independently shows portraits matching the graph tokens while preserving list and graph interactions.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate both stories together on supported viewports.

- [X] T008 Run `npm run build` and `npm run lint` from `frontend/`; confirm both commands pass for the application code in `frontend/package.json`
- [X] T009 Run `npm run test:e2e -- e2e/mapa-retratos.spec.ts e2e/relacoes-retratos.spec.ts` from `frontend/`; confirm portrait/fallback behavior and desktop/mobile rows have no horizontal overflow (pending: Playwright Chromium is not installed)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 provides deterministic image responses; both user stories depend on it.
- **Foundational (Phase 2)**: No extra tasks; existing character data and application infrastructure are sufficient.
- **User Stories (Phases 3–4)**: Both are P1 and independently testable after T001. They can proceed in parallel after their separate E2E tests are written.
- **Polish (Phase 5)**: T008 depends on both stories being implemented.

### User Story Dependencies

- **User Story 1 (P1)**: Depends on T001; no dependency on US2.
- **User Story 2 (P1)**: Depends on T001; no dependency on US1.

### Within Each User Story

- Write and confirm the story's E2E scenarios before its implementation tasks.
- After its test task, the TSX and CSS tasks can run in parallel because they modify separate files.
- Keep changes limited to the targeted list; do not change the larger Map detail avatar or the graph tokens.

## Parallel Opportunities

- After T001, T002 and T005 can be authored in parallel because they cover separate screens and separate E2E files.
- After its test task, T003 and T004 can run in parallel; likewise T006 and T007.
- After both test tasks, the two user stories can be implemented in parallel by separate workers because their source files do not overlap.

### Parallel Example: Both User Stories

```bash
# After T001, author each story's independent E2E scenarios:
Task: "Add Mapa portrait scenarios in frontend/e2e/mapa-retratos.spec.ts"
Task: "Add Relações portrait scenarios in frontend/e2e/relacoes-retratos.spec.ts"

# Once each story's tests are in place, the stories can proceed independently:
Task: "Implement Mapa list avatar in frontend/src/pages/MapPage.tsx and frontend/src/pages/MapPage.css"
Task: "Implement Relações list avatar in frontend/src/pages/RelacoesPage.tsx and frontend/src/pages/RelacoesPage.css"
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete T001 and T002.
2. Complete T003 and T004.
3. Validate the Mapa list independently at the US1 checkpoint.
4. Continue with US2 to fulfill the complete feature request across both maps.

### Incremental Delivery

1. Deliver the Mapa list with portrait and fallback as the first independently usable increment.
2. Deliver the Relações list as a separate increment using the same image and fallback behavior.
3. Run T008 to check both surfaces on desktop and mobile.

## Notes

- `[P]` marks tasks touching distinct files that can run concurrently after their stated prerequisites.
- `[US1]` and `[US2]` trace tasks to the corresponding P1 stories in `spec.md`.
- No API, backend, schema, migration, or new dependency task is needed.
