# Tasks: Route Sort Preference

**Input**: Design documents from `/specs/046-route-sort-preference/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) top-6 por preferência rápida/barata no planner+API; US2 (P2) controlo UI + auto-recalc.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e estado actual do planner

- [X] T001 Skim `specs/046-route-sort-preference/contracts/api-route-sort-preference.md`, `research.md`, and `data-model.md` (`ordenacao`, K=6, Dentro primary, auto-recalc)
- [X] T002 [P] Confirm `K_MAX`, `plan_routes`, `build_graph` edge attrs, and `GET /routes/plan` in `backend/app/services/route_planner.py` and `backend/app/routers/public/routes.py`
- [X] T003 [P] Confirm `campaignApi.planRoute` and Calcular UI in `frontend/src/api/campaign.ts` and `frontend/src/components/routes/RoutePlannerPanel.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipo/enum de ordenação e K_MAX=6 partilhados

**⚠️ CRITICAL**: Completar antes das user stories

- [X] T004 Add `OrdenacaoRota` (or equivalent) `mais_rapida` | `mais_barata` in `backend/app/schemas/routes.py` (FR-001/002)
- [X] T005 Set `K_MAX = 6` in `backend/app/services/route_planner.py` (FR-003/004/006)

**Checkpoint**: Schema + limiar 6 prontos; discovery ainda só por tempo até US1

---

## Phase 3: User Story 1 — Top-6 by rápida/barata (Priority: P1) 🎯 MVP

**Goal**: API devolve até 6 rotas descobertas e ordenadas pela preferência (barata = custo Dentro)

**Independent Test**: Chamar `/api/routes/plan` com `ordenacao=mais_rapida` e `mais_barata` no mesmo De/Para; comparar ordem e tamanho ≤ 6

### Implementation for User Story 1

- [X] T006 [US1] Extend `build_graph` / parallel hop selection to pick best edge by preference (tempo vs custo_dentro + Fora + tempo) in `backend/app/services/route_planner.py` (FR-005)
- [X] T007 [US1] Pass `ordenacao` into `plan_routes`; use `shortest_simple_paths` weight `tempo` or Dentro/`peso_barata` (ε·tempo if needed for zero-cost trails) in `backend/app/services/route_planner.py` (FR-003–005, research §3–4)
- [X] T008 [US1] Final-sort candidates by preference keys and return `[:k]` (≤ 6) in `backend/app/services/route_planner.py` (FR-003/004/006)
- [X] T009 [US1] Wire `ordenacao` query (default `mais_rapida`) on `GET /api/routes/plan` in `backend/app/routers/public/routes.py` (FR-001/002)
- [X] T010 [US1] Spot-check invalid `ordenacao` → 422 and omitted param → rápida behavior in `backend/app/routers/public/routes.py`

**Checkpoint**: SC-001 API-side; quickstart curl optional

---

## Phase 4: User Story 2 — Preference control + auto-recalc (Priority: P2)

**Goal**: UI escolhe ordenação; default rápida; muda preferência → recalcula se De/Para válidos; badge na 1ª rota

**Independent Test**: Abrir Calcular rota; trocar preferência com resultados; lista actualiza sem novo clique em Calcular

### Implementation for User Story 2

- [X] T011 [P] [US2] Add `OrdenacaoRota` type and pass `ordenacao` from `planRoute` in `frontend/src/types/index.ts` and `frontend/src/api/campaign.ts` (FR-001)
- [X] T012 [US2] Add Mais rápida / Mais barata control (default rápida) in `frontend/src/components/routes/RoutePlannerPanel.tsx` (+ `RoutePlanner.css` if needed) (FR-001/002, US2)
- [X] T013 [US2] Pass active `ordenacao` into `calcular` / `campaignApi.planRoute` in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-003/004)
- [X] T014 [US2] Auto-recalculate when preference changes and De/Para are valid in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-009, SC-005)
- [X] T015 [US2] First-row cue shows “mais rápida” or “mais barata” matching preference; select index 0 after plan in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-007)

**Checkpoint**: SC-002–005; quickstart A–D

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressão, quickstart, changelog

- [X] T016 Confirm costs Dentro/Fora still shown; ritmo/velocidade unchanged; digitizer untouched (FR-008/010); run quickstart E–F
- [X] T017 Run scenarios A–F from `specs/046-route-sort-preference/quickstart.md`; tune planner only if top-6/order wrong
- [X] T018 [P] Note change in `CHANGELOG.md` under next patch (e.g. 0.6.7): ordenação rápida/barata + até 6 rotas no Calcular rota

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T003) → **Foundational** (T004–T005) → **US1** (T006–T010) → **US2** (T011–T015) → **Polish** (T016–T018)
- US2 FE types (T011) can start after T004 in parallel with late US1 if API shape is known

### User Story Dependencies

- **US1 (P1)**: MVP API/planner
- **US2 (P2)**: UI depends on US1 API param

### Parallel Opportunities

- T002 ∥ T003
- T011 ∥ T006–T009 (after T004)
- T017 ∥ T018 após implementação

---

## Parallel Example: After T005

```bash
Task: "Preference-aware build_graph / hops in route_planner.py"
Task: "Add OrdenacaoRota + planRoute param in frontend types/api"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T005 schema + K=6
2. T006–T010 discovery + API
3. T011–T015 UI + auto-recalc
4. T016–T018 polish

### Incremental Delivery

1. Foundational: enum + K
2. US1: correct top-6 API
3. US2: usable preference UX
4. Polish

---

## Notes

- Do not client-only reorder a time-only response for barata
- Keep displayed bp costs exact; ε·tempo only for enumeration weight if needed
