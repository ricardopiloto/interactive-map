# Tasks: Prefer River or Road in Route Planner

**Input**: Design documents from `/specs/054-prefer-river-road/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual QA via quickstart — no automated TDD suite requested.

**Organization**: US1 = soft preferência + UI choice; US2 = coexist with ordenação/transporte; US3 = default Sem preferência + reset on open.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contracts and touch points

- [x] T001 Skim `specs/054-prefer-river-road/contracts/api-preferencia-via.md`, `contracts/ui-preferencia-via.md`, and `research.md` (0.75/1.25 mult + miles-share tie-break)
- [x] T002 [P] Confirm current plan entrypoints in `backend/app/routers/public/routes.py`, `backend/app/services/route_planner.py`, and `frontend/src/components/routes/RoutePlannerPanel.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and API param wiring before story UX polish

**⚠️ CRITICAL**: Complete before user-story polish that depends on the param end-to-end

- [x] T003 Add `PreferenciaVia` literal (`nenhuma` | `rio` | `estrada`) in `backend/app/schemas/routes.py`
- [x] T004 [P] Add `PreferenciaVia` type in `frontend/src/types/index.ts`
- [x] T005 Add `preferencia_via` query param (default `nenhuma`) to `GET /api/routes/plan` in `backend/app/routers/public/routes.py` and pass into `plan_routes`
- [x] T006 Extend `campaignApi.planRoute` in `frontend/src/api/campaign.ts` to send `preferencia_via`

**Checkpoint**: Types + API param plumbed; planner behavior still unchanged until soft bias lands

---

## Phase 3: User Story 1 — Preferir viagem por rio ou estrada (Priority: P1) 🎯 MVP

**Goal**: Soft bias + UI radios; rio vs estrada perceptibly different on mixed De/Para

**Independent Test**: Quickstart C (+ optional API curls); SC-002

### Implementation for User Story 1

- [x] T007 [US1] Add preference weight helpers / constants (`PREF_MATCH_MULT`, `PREF_OPPOSITE_MULT`) and apply soft multipliers when building pathfinding weights in `backend/app/services/route_planner.py` (research §1)
- [x] T008 [US1] Compute preferred-miles share and use as **tie-break after** `ordenacao` primary keys in candidate sort inside `backend/app/services/route_planner.py` (research §1–2); `nenhuma`/omitted = no bias
- [x] T009 [US1] Wire `preferencia_via` through `plan_routes(...)` signature and validation (invalid → ValueError/422) in `backend/app/services/route_planner.py` + router
- [x] T010 [US1] Add radio fieldset Sem preferência / Por rio / Por estrada in `frontend/src/components/routes/RoutePlannerPanel.tsx` per `contracts/ui-preferencia-via.md`
- [x] T011 [P] [US1] Style the new fieldset in `frontend/src/components/routes/RoutePlanner.css` (match existing ordenação/modo patterns)
- [x] T012 [US1] Pass selected preferência into `calcular` / `planRoute` from `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T013 [US1] Auto-recalc on preferência change when De/Para válidos (`useEffect` + skip ref) in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-006)
- [x] T014 [US1] Smoke quickstart A (controls visible) + C (rio vs estrada) from `specs/054-prefer-river-road/quickstart.md`

**Checkpoint**: MVP — soft preferência works end-to-end

---

## Phase 4: User Story 2 — Conviver com ordenação e transporte (Priority: P1)

**Goal**: Preferência combines with mais rápida/barata and pago/próprio without breaking them

**Independent Test**: Quickstart E; SC-003

### Implementation for User Story 2

- [x] T015 [US2] Ensure `ordenacao` remains **primary** sort key when preferência is set (share only after) in `backend/app/services/route_planner.py` (FR-004)
- [x] T016 [US2] Verify `modo_transporte` / ritmo / mph validation unchanged while preferência is applied in `backend/app/services/route_planner.py` and `backend/app/routers/public/routes.py` (FR-005)
- [x] T017 [US2] Include current preferência in existing ordenação/modo auto-recalc paths in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T018 [US2] Run quickstart E (preferência × ordenação × transporte smoke) from `specs/054-prefer-river-road/quickstart.md`

**Checkpoint**: Combined dimensions usable

---

## Phase 5: User Story 3 — Default Sem preferência + reset (Priority: P2)

**Goal**: Open/reopen panel → Sem preferência; no bias until user chooses

**Independent Test**: Quickstart A + B; SC-005

### Implementation for User Story 3

- [x] T019 [US3] Initialize preferência state to `nenhuma` and reset to `nenhuma` on panel open in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-007; same open effect as modo → pago)
- [x] T020 [US3] Confirm omitted/`nenhuma` path leaves discovery+sort identical to pré-054 in `backend/app/services/route_planner.py` (quickstart B)
- [x] T021 [US3] Run quickstart A (reopen reset) + B + D (auto-recalc including nenhuma) from `specs/054-prefer-river-road/quickstart.md`

**Checkpoint**: Default safe; reset works

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, changelog, final QA

- [x] T022 Verify soft-only edge: single opposite-type path still returned (quickstart F) via `backend/app/services/route_planner.py` behavior
- [x] T023 [P] Optional API curls from `specs/054-prefer-river-road/quickstart.md`; invalid `preferencia_via` → 422
- [x] T024 [P] Add CHANGELOG entry under **[0.6.9]** in `CHANGELOG.md` for preferência de via no Calcular rota
- [x] T025 Run full `specs/054-prefer-river-road/quickstart.md`; confirm digitizer/`CampaignMap` untouched

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T006) → **US1** (T007–T014) → **US2** (T015–T018) → **US3** (T019–T021) → **Polish** (T022–T025)
- US3 reset can be implemented during US1 UI work; keep T019 explicit for FR-007 verification

### User Story Dependencies

- **US1 (P1)**: Backend bias + UI radios — MVP
- **US2 (P1)**: Depends on US1 param flowing through ordenação/modo recalcs
- **US3 (P2)**: Depends on UI state; validates default/reset

### Parallel Opportunities

- T003 ∥ T004
- T011 ∥ T012 (after T010 structure)
- T023 ∥ T024

---

## Parallel Example: After Foundational

```bash
Task: "Soft bias + sort in route_planner.py"
Task: "PreferenciaVia type + planRoute param in frontend"
# Then UI radios + auto-recalc in RoutePlannerPanel
```

---

## Implementation Strategy

### MVP First (US1)

1. Setup + Foundational types/API
2. Soft bias + radios + auto-recalc
3. **STOP**: Quickstart C — rio vs estrada distinct
4. Then US2/US3 polish + CHANGELOG

### Incremental Delivery

1. Param plumbed (`nenhuma` no-op)
2. Soft bias live → SC-002
3. Coexistence smoke → SC-003
4. Reset default → SC-005

---

## Notes

- Do not hard-filter routes; do not add “por trilha”
- Multipliers are constants — tune only if SC-002 fails
- [P] = different files / no incomplete dependency
- All tasks use checklist format with IDs and paths
