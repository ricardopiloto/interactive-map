# Tasks: Fix Map Pick for Calcular Rota

**Input**: Design documents from `/specs/061-fix-map-route-pick/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual QA via quickstart — no automated TDD suite requested (optional tiny pure-function check if easy).

**Organization**: US1 = eligible pin fills De/Para (fix 060 symptom); US2 = ineligible + panel closed; US3 = hybrid + auto-calc.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock root cause and current code paths

- [x] T001 Skim `specs/061-fix-map-route-pick/contracts/ui-map-route-pick-fix.md` and `research.md` (name-match resolve; auto-calc after both ends; symptom = modal + empty De/Para)
- [x] T002 [P] Confirm `resolveNamedWaypointForLocal` in `frontend/src/components/routes/routeMapPick.ts` only uses `local_id` / `waypoint_id`; confirm `selectLocalFromMap` fallthrough in `frontend/src/pages/MapPage.tsx`; note `foldText` in `frontend/src/utils/textMatch.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix pin→named-waypoint resolution (unblocks all stories)

**⚠️ CRITICAL**: Complete before US smoke

- [x] T003 Extend `resolveNamedWaypointForLocal` in `frontend/src/components/routes/routeMapPick.ts`: after link/`waypoint_id`, match Local.nome to named waypoint label/`nome` via `foldText` equality; among ties pick lowest `id` (research §2 / FR-010)
- [x] T004 [P] Export or reuse `waypointOptionLabel` / named filter so name match uses the **same** label the combobox shows in `frontend/src/components/routes/routeMapPick.ts`
- [x] T005 Sanity-check: for a Local whose city string equals a combobox option, resolver returns that waypoint id (manual or quick node assert) using logic in `frontend/src/components/routes/routeMapPick.ts`

**Checkpoint**: Combobox cities resolve from pin id without requiring `local_id`

---

## Phase 3: User Story 1 — De/Para pelo mapa (Priority: P1) 🎯 MVP

**Goal**: Panel open + eligible pin → fill De then Para; no modal (060 symptom gone)

**Independent Test**: Quickstart A (+ first half of B)

### Implementation for User Story 1

- [x] T006 [US1] Verify `selectLocalFromMap` in `frontend/src/pages/MapPage.tsx` still calls resolver when `routePlannerOpen` and skips `selectLocal` on hit (FR-001 / FR-005 / FR-009)
- [x] T007 [US1] Confirm mapPick effect in `frontend/src/components/routes/RoutePlannerPanel.tsx` sets De if empty else Para with `waypointOptionLabel` queries (FR-002)
- [x] T008 [US1] Smoke quickstart A from `specs/061-fix-map-route-pick/quickstart.md` — De fills, modal does not open

**Checkpoint**: MVP — symptom 060 eliminated for combobox cities

---

## Phase 4: User Story 2 — Sem nó + painel fechado (Priority: P1)

**Goal**: Ineligible pin → modal/no De change; closed panel unchanged

**Independent Test**: Quickstart D + E

### Implementation for User Story 2

- [x] T009 [US2] Confirm resolver returns null when no link and no name match in `frontend/src/components/routes/routeMapPick.ts`; MapPage fallthrough opens modal (FR-004)
- [x] T010 [US2] Confirm `routePlannerOpen === false` path unchanged in `frontend/src/pages/MapPage.tsx` (FR-006); run quickstart D + E

**Checkpoint**: No regression on normal pin detail

---

## Phase 5: User Story 3 — Híbrido + auto-cálculo (Priority: P2)

**Goal**: When both De and Para set (map or hybrid), auto-run `calcular`; third click replaces Para + recalc; Calcular button still works

**Independent Test**: Quickstart B + C + F + G

### Implementation for User Story 3

- [x] T011 [US3] Extend mapPick handling in `frontend/src/components/routes/RoutePlannerPanel.tsx` so after applying pick, if both ends set and distinct, call `calcular` with those ids (override args if needed to avoid stale closure) (FR-011)
- [x] T012 [US3] Ensure third eligible pick updates only Para and re-triggers auto-calc in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T013 [US3] Verify hybrid: De via combobox then map Para triggers auto-calc in `frontend/src/components/routes/RoutePlannerPanel.tsx` (US3); run quickstart F
- [x] T014 [US3] Verify origem === destino does not invent routes (existing validation) in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T015 [US3] Confirm manual Calcular button still works; run quickstart B, C, G; confirm no new CSS zones (FR-008)

**Checkpoint**: Directions-like auto plan after second pin

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version, full quickstart

- [x] T016 [P] Add CHANGELOG entry under **[0.6.11]** in `CHANGELOG.md` — fix map pick (name match) + auto-cálculo ao completar De/Para
- [x] T017 [P] Bump to **0.6.11** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T018 Run full `specs/061-fix-map-route-pick/quickstart.md` A–G

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T005) → **US1** (T006–T008) → **US2** (T009–T010) → **US3** (T011–T015) → **Polish** (T016–T018)

### User Story Dependencies

- **US1 (P1)**: Resolver fix + fill — MVP
- **US2 (P1)**: Validates fallthrough after resolver change
- **US3 (P2)**: Auto-calc after fill path works

### Parallel Opportunities

- T001 ∥ T002
- T003 then T004 (same file — sequential preferred)
- T016 ∥ T017

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational (name-match resolve)  
2. Smoke quickstart A  
3. **STOP and VALIDATE** symptom gone  
4. Then US2 + US3 (auto-calc)  

### Suggested MVP scope

**US1** (T001–T008). Ship **US3 auto-calc in the same PR** (clarification locked).

---

## Notes

- Do not require DB `local_id` migration for MVP — name fallback is the fix
- Prefer `foldText` equality, not substring `labelMatchesQuery`, for name match
- Avoid auto-calc effect on every combobox keystroke — trigger from mapPick apply (and hybrid when Para set via map)
