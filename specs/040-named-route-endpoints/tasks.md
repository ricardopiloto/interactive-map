# Tasks: Named Route Endpoints Only

**Input**: Design documents from `/specs/040-named-route-endpoints/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) filtrar De/Para só nomeados; US2 (P2) garantir pathfinding/digitizer intactos + limpar selecção stale.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e ponto de filtro

- [X] T001 Skim `specs/040-named-route-endpoints/contracts/ui-named-route-endpoints.md`, `data-model.md`, and `research.md` (named = nome nó ou Local; UI-only; sem `Nó {id}` no De/Para)
- [X] T002 [P] Confirm `waypointOptionLabel` and `options` useMemo in `frontend/src/components/routes/RoutePlannerPanel.tsx`; confirm digitizer is separate from planner

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Predicado “named” reutilizável no painel

**⚠️ CRITICAL**: Completar antes de filtrar opções

- [X] T003 Add `isNamedWaypoint(wp, locaisById)` (or equivalent) matching FR-002 in `frontend/src/components/routes/RoutePlannerPanel.tsx` (trim `wp.nome` OR linked Local non-empty name)

**Checkpoint**: Predicado cobre nome próprio, Local ligado, e rejeita whitespace / sem Local / Local vazio

---

## Phase 3: User Story 1 — Pick only named places for De/Para (Priority: P1) 🎯 MVP

**Goal**: Comboboxes De/Para listam só waypoints nomeados; busca não devolve `Nó {id}`

**Independent Test**: Rede com nomeados + sem nome → abrir Calcular rota → listas/busca sem `Nó {n}`; nomeado→nomeado ainda calcula

### Implementation for User Story 1

- [X] T004 [US1] Filter `options` to named waypoints only before sort in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-001, FR-003, SC-001)
- [X] T005 [US1] Ensure `waypointOptionLabel` is only applied to named options (fallback `Nó {id}` must not appear in De/Para) in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-002, FR-006, SC-002)
- [X] T006 [US1] Verify both De and Para `WaypointCombobox` instances receive the same filtered `options` in `frontend/src/components/routes/RoutePlannerPanel.tsx`

**Checkpoint**: SC-001–002; quickstart A–B

---

## Phase 4: User Story 2 — Unnamed nodes remain in the network (Priority: P2)

**Goal**: Pathfinding atravessa nós sem nome; digitizer inalterado; selecção stale limpa

**Independent Test**: Rota nomeado→nomeado via intermédio sem nome OK; Rede GM ainda mostra todos os nós

### Implementation for User Story 2

- [X] T007 [US2] Clear `origemId`/`destinoId` (and related query text if needed) when selected id is not in named `options` in `frontend/src/components/routes/RoutePlannerPanel.tsx` (edge case stale selection)
- [X] T008 [US2] Spot-check: no changes to digitizer waypoint listing in `frontend/src/components/gm/RouteDigitizerView.tsx` (or related GM route files); no backend plan API changes (FR-004, FR-005, FR-007, SC-003, SC-004)

**Checkpoint**: SC-003–004; quickstart C–D

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart e changelog

- [X] T009 Run scenarios A–E from `specs/040-named-route-endpoints/quickstart.md`; fix only planner files if needed
- [X] T010 [P] Note change in `CHANGELOG.md` (Changed: Calcular rota De/Para só mostra nós com nome)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003) → **US1** (T004–T006) → **US2** (T007–T008) → **Polish** (T009–T010)

### User Story Dependencies

- **US1 (P1)**: MVP — filtro De/Para
- **US2 (P2)**: Stale clear + regression check (pathfinding/digitizer); can follow immediately after US1 in same PR

### Parallel Opportunities

- T001 ∥ T002
- T009 ∥ T010 after implementation

---

## Parallel Example: After T003

```bash
Task: "Filter options to named waypoints in RoutePlannerPanel.tsx"
Task: "Wire stale selection clear when id ∉ options"  # can start after T004 exists
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T003 setup + `isNamedWaypoint`
2. T004–T006 filter options for De/Para
3. Validate quickstart A/B
4. T007–T008 stale + regression
5. T009–T010 polish

### Incremental Delivery

1. Foundational: named predicate
2. US1: filtered combobox options
3. US2: stale selection + digitizer/API untouched
4. Polish

---

## Notes

- Do not change `GET /routes/plan` or `GET /waypoints`
- Do not hide unnamed nodes in the digitizer
- Unnamed intermediates in returned `waypoint_ids` are OK
