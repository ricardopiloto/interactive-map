# Tasks: Calcular Rota entre Quaisquer Nós da Rede

**Input**: Design documents from `/specs/028-route-any-waypoint/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação via `quickstart.md` na fase Polish.

**Organization**: Duas user stories (P1 cálculo por qualquer nó; P2 rótulos FR-008). Backend plan endpoint + FE panel/MapPage.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline Local-based e contratos 028

- [x] T001 Confirm `origem_local_id` / `destino_local_id` lookup in `backend/app/routers/public/routes.py` and `planRoute` local IDs in `frontend/src/api/campaign.ts`
- [x] T002 [P] Confirm `RoutePlannerPanel` filters `locais` by `linkedLocalIds` in `frontend/src/components/routes/RoutePlannerPanel.tsx` and `MapPage` uses `listWaypoints(true)` in `frontend/src/pages/MapPage.tsx`
- [x] T003 [P] Skim `specs/028-route-any-waypoint/contracts/api-routes-plan-waypoints.md` and `specs/028-route-any-waypoint/contracts/ui-route-planner-waypoints.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API e client aceitam só waypoint IDs (bloqueia UI)

**⚠️ CRITICAL**: Completar antes das user stories de UI

- [x] T004 Change `GET /api/routes/plan` to require `origem_waypoint_id` / `destino_waypoint_id`, load waypoints by PK, reject missing/equal IDs, call `plan_routes` in `backend/app/routers/public/routes.py`
- [x] T005 [P] Update `campaignApi.planRoute` to pass `origem_waypoint_id` / `destino_waypoint_id` query params in `frontend/src/api/campaign.ts`
- [x] T006 [P] Update plan endpoint mention from local to waypoint query params in `backend/README.md`

**Checkpoint**: curl com `*_waypoint_id` funciona; params antigos de Local já não são a API suportada

---

## Phase 3: User Story 1 — Calcular entre quaisquer nós (Priority: P1) 🎯 MVP

**Goal**: Painel lista todos os nós; calcula por IDs de nó; nós sem Local utilizáveis

**Independent Test**: Abrir Calcular rota → ver nó sem Local → calcular com outro nó → rotas ou “nenhuma rota” sem erro de Local

### Implementation for User Story 1

- [x] T007 [US1] Replace `locais`/`linkedLocalIds` props with `waypoints: Waypoint[]` (keep `locais` only if needed later for labels) and build select options from all waypoints in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T008 [US1] Wire `MapPage` to `listWaypoints(false)` (or default) and pass full waypoint list into `RoutePlannerPanel`; remove planner dependency on `linkedLocalIds` in `frontend/src/pages/MapPage.tsx`
- [x] T009 [US1] Call `planRoute` with selected waypoint IDs and update empty-result / validation copy to speak of nós in `frontend/src/components/routes/RoutePlannerPanel.tsx`

**Checkpoint**: US1 testável — SC-001 / SC-002 / SC-003; FR-001–FR-004 / FR-009

---

## Phase 4: User Story 2 — Rótulos FR-008 (Priority: P2)

**Goal**: label = nome do nó → nome do Local → `Nó {id}`; ordenação alfabética

**Independent Test**: Inspecionar opções: nó nomeado; nó sem nome sem Local → `Nó N`; nó sem nome com Local → nome do Local; nó nomeado com Local → nome do nó

### Implementation for User Story 2

- [x] T010 [US2] Add `waypointOptionLabel(wp, locaisById)` helper implementing FR-008 in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T011 [US2] Sort select options by label and ensure `locais` (or id→nome map) is available for Local fallback in `frontend/src/components/routes/RoutePlannerPanel.tsx` / `frontend/src/pages/MapPage.tsx` as needed

**Checkpoint**: US2 testável — FR-008; cenários US2 1–4

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Docs + quickstart

- [x] T012 Run API + UI steps from `specs/028-route-any-waypoint/quickstart.md`; fix only files in this feature scope if needed
- [x] T013 [P] Grep leftover `origem_local_id` / planner-`linkedLocalIds` usage in `frontend/` and `backend/app/` (exclude archived specs) and fix stragglers if any

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T004–T006)** → **US1** → **US2** → **Polish**
- MVP = Phase 3 (US1); rótulos mínimos podem ser `Nó {id}` / `nome` até T010
- T005 ∥ T004 no sentido de ficheiros diferentes; FE quebra até T007–T009 alinharem

### User Story Dependencies

- **US1**: Após T004–T005
- **US2**: Após US1 (mesmos selects); pode implementar label helper no mesmo PR que T007

### Parallel Opportunities

- T001 ∥ T002 ∥ T003
- T004 ∥ T005 ∥ T006
- T012 / T013 com cuidado

---

## Parallel Example: Foundational

```bash
Task: "Switch plan endpoint to waypoint IDs in routes.py"
Task: "Update campaignApi.planRoute query params in campaign.ts"
Task: "Fix backend/README.md plan query docs"
```

---

## Implementation Strategy

### MVP First (US1)

1. T004–T005 API + client
2. T007–T009 panel + MapPage com todos os nós
3. T010–T011 rótulos FR-008
4. T012–T013 quickstart + grep

### Incremental Delivery

1. Foundational: plan por nó
2. US1: UI qualquer nó
3. US2: rótulos
4. Polish: validação

---

## Notes

- Sem migration; `plan_routes` inalterado
- Não reintroduzir filtro `linked_only` no planner
- Specs 021/024 históricas podem ainda mencionar Local — não reescrever; contrato 028 é a fonte de verdade
- Implemented 2026-08-03: plan por `*_waypoint_id`; painel lista todos os nós; rótulo FR-008; README atualizado. Smoke API: plan 200; params Local → 422.
