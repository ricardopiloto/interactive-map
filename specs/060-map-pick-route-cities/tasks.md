# Tasks: Map Pick Route Cities

**Input**: Design documents from `/specs/060-map-pick-route-cities/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual QA via quickstart — no automated TDD suite requested.

**Organization**: US1 = pick eligible pin → De/Para without modal; US2 = complete both ends + Calcular; US3 = hybrid combobox + coherence / no new zones.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contract and current click / named-waypoint paths

- [x] T001 Skim `specs/060-map-pick-route-cities/contracts/ui-map-pick-route.md` and `research.md` (eligibility = named waypoint; field-state FR-007; modal policy FR-008)
- [x] T002 [P] Confirm pin click flows through `selectLocalFromMap` in `frontend/src/pages/MapPage.tsx` and De/Para live in `frontend/src/components/routes/RoutePlannerPanel.tsx`; note `isNamedWaypoint` / `waypointOptionLabel` already in the panel

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared local→named-waypoint resolver + map-pick signal plumbing

**⚠️ CRITICAL**: Complete before user-story wiring

- [x] T003 Extract or add pure helper `resolveNamedWaypointForLocal(localId, waypoints, locais)` (same named rules as panel) in `frontend/src/components/routes/routeMapPick.ts` (or export helpers from `RoutePlannerPanel.tsx` if keeping one file — prefer dedicated `routeMapPick.ts`)
- [x] T004 Add `mapPick` prop (e.g. `{ waypointId: number; nonce: number } | null`) to `RoutePlannerPanel` in `frontend/src/components/routes/RoutePlannerPanel.tsx` and apply FR-007 on change: De empty → set origem + query label; else set destino + query label
- [x] T005 Wire `mapPick` state/nonce in `frontend/src/pages/MapPage.tsx` and pass into `RoutePlannerPanel`; keep `CampaignMap` calling `onSelectLocal` unchanged

**Checkpoint**: Panel can receive a waypoint pick; helper resolves eligibility

---

## Phase 3: User Story 1 — Escolher origem/destino no mapa (Priority: P1) 🎯 MVP

**Goal**: With Calcular rota open, eligible pin click fills De or Para and does not open pin modal

**Independent Test**: Quickstart A (first click) + C + D

### Implementation for User Story 1

- [x] T006 [US1] In `selectLocalFromMap` in `frontend/src/pages/MapPage.tsx`: if `routePlannerOpen` and helper finds named waypoint for `id`, set `mapPick` nonce and **return without** `selectLocal` / focus (FR-001 / FR-008)
- [x] T007 [US1] In same function: if `routePlannerOpen` but **no** named waypoint, fall through to existing `selectLocalFromMap` behaviour (modal for player) (FR-002 / FR-008)
- [x] T008 [US1] Ensure planner **closed** path unchanged in `frontend/src/pages/MapPage.tsx` (FR-004); smoke quickstart D
- [x] T009 [US1] Smoke quickstart A (De then Para) and C (sem nó → modal) from `specs/060-map-pick-route-cities/quickstart.md`

**Checkpoint**: MVP — map pick fills De/Para; no modal on eligible pins

---

## Phase 4: User Story 2 — Completar De e Para sem teclado (Priority: P1)

**Goal**: Two eligible clicks + Calcular works; third click replaces Para; combobox still works

**Independent Test**: Quickstart A (full) + B

### Implementation for User Story 2

- [x] T010 [US2] Verify second eligible pick sets Para and Calcular uses same IDs as combobox in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-006); run quickstart A end-to-end
- [x] T011 [US2] Verify third eligible pick replaces only Para (De stable) via FR-007 logic in `frontend/src/components/routes/RoutePlannerPanel.tsx`; run quickstart B
- [x] T012 [US2] Spot-check combobox De/Para still selectable without map in `frontend/src/components/routes/RoutePlannerPanel.tsx` / `WaypointCombobox.tsx` (FR-005)

**Checkpoint**: Full map-only flow + Calcular OK

---

## Phase 5: User Story 3 — Feedback discreto e coerência (Priority: P2)

**Goal**: Hybrid combobox+map; clear De resets; no new click visuals; labels match city names

**Independent Test**: Quickstart E + F

### Implementation for User Story 3

- [x] T013 [US3] Confirm De filled via combobox then map click fills Para (does not overwrite De) in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-007); run quickstart E
- [x] T014 [US3] Confirm clearing De in combobox then map click fills De again in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T015 [US3] Confirm map-pick updates `origemQuery`/`destinoQuery` via `waypointOptionLabel` so fields show recognizable names in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T016 [US3] Confirm no new CSS/halos for route-pick mode (no changes to `CampaignMap.css` for click zones) (FR-003 / SC-003); run quickstart F
- [x] T017 [US3] Confirm placement / digitizer guards still short-circuit before route pick in `frontend/src/pages/MapPage.tsx`

**Checkpoint**: Hybrid + no visual noise

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version, full quickstart

- [x] T018 [P] Add CHANGELOG **Added** entry under next version (**[0.6.10]**) in `CHANGELOG.md` for seleccionar De/Para no mapa com Calcular rota aberto
- [x] T019 [P] Bump version to **0.6.10** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T020 Run full `specs/060-map-pick-route-cities/quickstart.md` A–F

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T005) → **US1** (T006–T009) → **US2** (T010–T012) → **US3** (T013–T017) → **Polish** (T018–T020)

### User Story Dependencies

- **US1 (P1)**: Eligible pick + modal policy — MVP
- **US2 (P1)**: Relies on US1 wiring; validates full two-click + Calcular
- **US3 (P2)**: Hybrid + polish after FR-007 apply path exists

### Parallel Opportunities

- T001 ∥ T002
- T018 ∥ T019
- Prefer sequential edits on `MapPage.tsx` / `RoutePlannerPanel.tsx`

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational (helper + mapPick prop)  
2. US1 branch in `selectLocalFromMap`  
3. **STOP and VALIDATE** quickstart A (first click) + C + D  
4. Then US2 + US3  

### Suggested MVP scope

**US1** (T001–T009). Ship **US2 in the same PR** (needed for SC-001).

---

## Notes

- Do not add route-pick hit-area visuals
- Reuse named-waypoint rules from the panel — do not invent a second eligibility definition
- `CampaignMap` can stay untouched if MapPage handles the branch
