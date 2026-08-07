# Tasks: Route Planner Cohesion

**Input**: Design documents from `/specs/064-route-planner-cohesion/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual QA via `quickstart.md` — no automated TDD suite requested.

**Organization**: US1 = overnight↔tempo alignment; US2 = Rota side tab + pick/overlay gates; US3 = alt routes red.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contracts and locate current overnight / planner / side-menu surfaces

- [x] T001 Skim `specs/064-route-planner-cohesion/contracts/overnight-march-days.md`, `contracts/ui-route-side-tab.md`, and `research.md` (M from D/R, miles÷M, ±20%, tab-scoped pick/overlay, alt red)
- [x] T002 [P] Confirm call sites: overnight budget in `backend/app/services/route_planner.py` + `overnight.py`; floating planner / `routePlannerOpen` in `frontend/src/pages/MapPage.tsx`; tabs in `frontend/src/components/sidebar/SideMenu.tsx`; alt stroke in `frontend/src/components/map/CampaignMap.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared march-day helper and stop using road-mph overnight budget at plan level

**⚠️ CRITICAL**: Complete before US1 overnight behaviour is correct end-to-end

- [x] T003 Add helper `march_days_from_tempo(D, R) -> M` (and/or `milhas_por_dia_from_route(dist, D, R)`) in `backend/app/services/overnight.py` or `route_planner.py` per `contracts/overnight-march-days.md`
- [x] T004 In `backend/app/services/route_planner.py` (`build_route_item` / `plan_routes`): after distance + `format_tempo_texto`, set `milhas_por_dia = distancia / M` (M from D/R); remove reliance on global estrada `budget_mph × horas_por_dia` for overnight

**Checkpoint**: Plan path can pass route-specific daily miles into overnight sim

---

## Phase 3: User Story 1 — Pernoites alinhados aos dias de viagem (Priority: P1) 🎯 MVP

**Goal**: Intermediate overnights ≤ M−1 with daily budget = miles÷M; Local ±20% of that budget; fatigue/dias_visuais stay consistent

**Independent Test**: Quickstart scenarios 1–2 (`specs/064-route-planner-cohesion/quickstart.md`)

### Implementation for User Story 1

- [x] T005 [US1] Update `simulate_overnights_and_fatigue` in `backend/app/services/overnight.py` so day marks / loop use the passed `milhas_por_dia` from miles÷M (still emit ≤ M−1 intermediate pernoites; arrival not a pernoite)
- [x] T006 [US1] Keep Local vs relento via waypoints with `local_id` within `± tolerancia_pernoite_pct * milhas_por_dia` of ideal mark in `backend/app/services/overnight.py` (FR-001d)
- [x] T007 [US1] Ensure intenso fatigue + `dias_visuais` still use the same march-day count M in `backend/app/services/overnight.py` (no extra phantom days)
- [x] T008 [US1] Smoke quickstart scenarios 1–2 from `specs/064-route-planner-cohesion/quickstart.md` (river multi-day + M=1)

**Checkpoint**: MVP — published tempo and overnight count coherent

---

## Phase 4: User Story 2 — Calcular rota no menu lateral (Priority: P1)

**Goal**: Planner lives in SideMenu tab **Rota**; floating panel gone; map-pick + overlay only when tab is Rota; state persists across tab switches

**Independent Test**: Quickstart scenarios 3–5

### Implementation for User Story 2

- [x] T009 [US2] Extend `SideTab` with `'rota'` and label **Rota** in `frontend/src/components/sidebar/SideMenu.tsx` (include in player + GM tab lists in `frontend/src/pages/MapPage.tsx`)
- [x] T010 [US2] Render route planner UI inside the Rota tab content in `frontend/src/pages/MapPage.tsx` (reuse `RoutePlannerPanel`); adjust `frontend/src/components/routes/RoutePlannerPanel.tsx` / CSS if needed for side-panel embedding (remove floating-only chrome)
- [x] T011 [US2] Remove floating planner open state/button and overlay panel wiring (`routePlannerOpen`) from `frontend/src/pages/MapPage.tsx` (FR-006)
- [x] T012 [US2] Gate map-pick De/Para on `tab === 'rota'` in `frontend/src/pages/MapPage.tsx` (FR-007b)
- [x] T013 [US2] Pass `travelPlan` to `CampaignMap` only when `tab === 'rota'`; keep plan state in memory so returning to Rota restores overlay without recalculate (FR-007c) in `frontend/src/pages/MapPage.tsx`
- [x] T014 [US2] Smoke quickstart scenarios 3–5 from `specs/064-route-planner-cohesion/quickstart.md`

**Checkpoint**: Side-tab planner; more map space; pick/overlay tab-scoped

---

## Phase 5: User Story 3 — Alternativas em vermelho (Priority: P2)

**Goal**: Non-selected travel polylines are red (dashed/discrete); selected keeps 063 green/fatigue chrome

**Independent Test**: Quickstart scenario 6

### Implementation for User Story 3

- [x] T015 [US3] Change `.campaign-map__travel-route--alt` stroke to red family in `frontend/src/components/map/CampaignMap.css` (FR-009)
- [x] T016 [US3] Confirm `RouteOverlay` in `frontend/src/components/routes/RouteOverlay.tsx` still applies alt class only to non-selected routes and never paints `dias_visuais` red on alts (FR-010)
- [x] T017 [US3] Smoke quickstart scenario 6 from `specs/064-route-planner-cohesion/quickstart.md`

**Checkpoint**: Alts red; selected unchanged

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version, full quickstart

- [x] T018 [P] Add CHANGELOG entry under **[0.6.13]** in `CHANGELOG.md` (overnight↔tempo, Rota side tab, alt red)
- [x] T019 [P] Bump version to **0.6.13** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T020 Run full `specs/064-route-planner-cohesion/quickstart.md` scenarios 1–6
- [x] T021 Mark feature status Implemented in `specs/064-route-planner-cohesion/spec.md` if acceptance matches

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T004) → **US1** (T005–T008) → **US2** (T009–T014) → **US3** (T015–T017) → **Polish** (T018–T021)
- US3 only needs map CSS/overlay and can start after Setup if desired, but prefer after US2 so overlay is visible in Rota tab during visual check

### User Story Dependencies

- **US1 (P1)**: Overnight formula — MVP backend
- **US2 (P1)**: Side tab shell; independent of overnight math but needs working plan API
- **US3 (P2)**: Visual polish on overlay

### Parallel Opportunities

- T001 ∥ T002
- After Foundational: US3 CSS (T015) can parallel early US2 work on different files
- T018 ∥ T019
- Prefer sequential edits on `MapPage.tsx` / `overnight.py`

### Parallel Example: After Foundational

```bash
# Developer A — US1 overnight
Task: "Wire miles÷M overnight in backend/app/services/overnight.py"

# Developer B — US2 side tab (frontend)
Task: "Add SideTab rota in frontend/src/components/sidebar/SideMenu.tsx"
Task: "Embed planner + gates in frontend/src/pages/MapPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup + Foundational (M + miles÷M)
2. Complete US1 → validate quickstart 1–2
3. Then US2 (side tab) → US3 (alt red) → Polish **0.6.13**

### Suggested delivery order

1. Backend overnight coherence (US1)
2. Side menu Rota + gates (US2)
3. Alt red (US3)
4. CHANGELOG / version / full quickstart

### Notes

- Do not restore floating Calcular rota panel
- Overlay hidden off Rota tab; plan state retained
- [P] = different files / no incomplete dependency
