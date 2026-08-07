# Tasks: Route Overnight Stops (Pernoites)

**Input**: Design documents from `/specs/062-route-pernoites/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual QA via `quickstart.md` — no automated TDD suite requested in spec (optional unit tests for simulation helper allowed during US1 if convenient; not blocking).

**Organization**: US1/US2/US5 = P1 (overnights + empty short routes + fatigue); US3/US4 = P2 (list copy + map markers).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 … US5
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align on contracts and touch points

- [x] T001 Skim `specs/062-route-pernoites/plan.md`, `research.md`, `data-model.md`, `contracts/api-routes-plan-pernoites.md`, `contracts/ui-route-pernoites.md`
- [x] T002 [P] Confirm current `RoutePlanItem` / `plan_routes` / `item_from_edges` in `backend/app/schemas/routes.py` and `backend/app/services/route_planner.py`; confirm list + overlay in `frontend/src/components/routes/RoutePlannerPanel.tsx`, `RouteOverlay.tsx`, `CampaignMap.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Settings, DTOs, and overnight/fatigue simulation wired into plan response

**⚠️ CRITICAL**: No user-story UI until API returns `pernoites` + fatigue fields

- [x] T003 Add `tolerancia_pernoite_pct: float = 0.20` to `backend/app/config.py` (Settings; env-overridable)
- [x] T004 [P] Add `Pernoite` model and extend `RoutePlanItem` with `pernoites`, `fadiga_saldo`, `fadiga_pico`, `fadiga_aviso`, `fadiga_morte` in `backend/app/schemas/routes.py` per `contracts/api-routes-plan-pernoites.md`
- [x] T005 [P] Mirror new fields on `RoutePlanItem` (and `Pernoite` type) in `frontend/src/types/index.ts`
- [x] T006 Implement overnight + fatigue simulator (distance budget `horas_por_dia * effective_mph`, ±tolerance Local pick, relento interpolate, intenso fatigue state machine) in `backend/app/services/overnight.py` (or equivalent module) per `research.md` / `data-model.md`
- [x] T007 Call simulator from `item_from_edges` / `plan_routes` in `backend/app/services/route_planner.py` so every returned route includes filled fields (ritmo normal → fatigue zeros/false; arrival never overnight)

**Checkpoint**: `GET /api/routes/plan` returns additive overnight/fatigue fields without changing distance/tempo/costs

---

## Phase 3: User Story 1 — Ver onde o grupo dorme (Priority: P1) 🎯 MVP

**Goal**: Multi-day routes include correct `pernoites` (local within ±tol or relento); arrival not overnight

**Independent Test**: Quickstart A (API multi-day / empty short)

### Implementation for User Story 1

- [x] T008 [US1] Ensure Local-linked waypoints on path resolve `nome` / `local_id` for `tipo=local` in `backend/app/services/overnight.py` (session/Local lookup as needed)
- [x] T009 [US1] Ensure relento points interpolate on route polyline (`x`,`y` 0–1) in `backend/app/services/overnight.py`
- [x] T010 [US1] Smoke API: long route → `len(pernoites) == dias_marcha - 1`; destination not in overnight list — use `specs/062-route-pernoites/quickstart.md` section A

**Checkpoint**: MVP — overnight data correct on API

---

## Phase 4: User Story 2 — Rota de um só dia (Priority: P1)

**Goal**: Single-day march → `pernoites: []`; no false overnight UI later

**Independent Test**: Quickstart A short route + D (normal still empty fatigue)

### Implementation for User Story 2

- [x] T011 [US2] Verify single-day paths emit empty `pernoites` in `backend/app/services/overnight.py` / `route_planner.py` (FR-006)
- [x] T012 [US2] Confirm mixed result set can contain both empty and non-empty overnight lists for different alternatives in plan response (FR-006 / US2)

**Checkpoint**: No phantom overnights on short trips

---

## Phase 5: User Story 5 — Fadiga ritmo intenso (Priority: P1)

**Goal**: Intenso: +1/day then −1 on local overnight; show saldo; soft warn if saldo > 1; death alert if pico ≥ 6; warn-only selectable; normal → no fatigue UI

**Independent Test**: Quickstart C + D

### Implementation for User Story 5

- [x] T013 [US5] Confirm fatigue state machine (peak after +1 before −1; arrival day +1 no recovery; ritmo normal zeros) in `backend/app/services/overnight.py` (FR-012–014, FR-018)
- [x] T014 [US5] Render fadiga saldo + soft-warn row class when `fadiga_aviso` in `frontend/src/components/routes/RoutePlannerPanel.tsx` + `RoutePlanner.css` (FR-015–016)
- [x] T015 [US5] Render death alert copy (mention morte + pico ≥ 6) when `fadiga_morte`; row remains clickable; no sort demotion in `frontend/src/components/routes/RoutePlannerPanel.tsx` + `RoutePlanner.css` (FR-018–020, SC-012)
- [x] T016 [US5] Smoke quickstart C + D — normal hides fatigue; intenso soft warn vs death behaviour

**Checkpoint**: Fatigue informational + death alert without changing route metrics

---

## Phase 6: User Story 3 — Texto claro no painel (Priority: P2)

**Goal**: Every multi-day list row shows readable overnight summary (names / relento counts)

**Independent Test**: Quickstart B list portion

### Implementation for User Story 3

- [x] T017 [US3] Add overnight summary formatter (Local names, relento count, multi-night) in `frontend/src/components/routes/RoutePlannerPanel.tsx` (or small helper under `frontend/src/components/routes/`)
- [x] T018 [US3] Show summary on **each** multi-day row (not only selected); omit on single-day in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-007)

**Checkpoint**: Players compare overnights across alternatives in the list

---

## Phase 7: User Story 4 — Marcadores no mapa (Priority: P2)

**Goal**: Selected route shows markers for every pernoite (local + relento), distinct from normal pins

**Independent Test**: Quickstart B map portion + SC-006

### Implementation for User Story 4

- [x] T019 [US4] Render overnight markers for selected route’s `pernoites` in `frontend/src/components/routes/RouteOverlay.tsx` and/or `frontend/src/components/map/CampaignMap.tsx` (pass props from `MapPage.tsx` if needed)
- [x] T020 [US4] Style local vs relento markers distinct from Local pins in `frontend/src/components/map/CampaignMap.css` and/or `frontend/src/components/routes/RoutePlanner.css` (FR-007b)
- [x] T021 [US4] Clear/update markers on selection change or plan clear in `frontend/src/pages/MapPage.tsx` / overlay; smoke quickstart B

**Checkpoint**: Map markers count matches selected route `pernoites.length`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Docs, version, full quickstart

- [x] T022 [P] Add CHANGELOG entry for pernoites + fadiga (choose next patch/minor per repo versioning) in `CHANGELOG.md`
- [x] T023 [P] Bump version in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock` to match CHANGELOG
- [x] T024 Confirm distance/`tempo_texto`/costs unchanged vs baseline for same inputs (regression note in CHANGELOG or quickstart E)
- [x] T025 Run full `specs/062-route-pernoites/quickstart.md` A–E

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → blocks all stories
- **US1 (Phase 3)** → MVP API overnights
- **US2 (Phase 4)** → validates empty overnight edge; depends on simulator from Phase 2/US1
- **US5 (Phase 5)** → fatigue UI; needs API fatigue fields (Phase 2) + list surface
- **US3 (Phase 6)** → list copy; needs `pernoites` from API
- **US4 (Phase 7)** → markers; needs `pernoites` + selection wiring
- **Polish (Phase 8)** → after desired stories

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| US1 | Phase 2 | MVP |
| US2 | Phase 2 (+ US1 logic) | Same simulator |
| US5 | Phase 2 + list panel | Can start after T007; UI after types |
| US3 | Phase 2 | Parallel with US5 UI once types exist |
| US4 | Phase 2 + MapPage selection | Parallel with US3 after API |

### Parallel Opportunities

- T001/T002 setup skim parallel
- T004/T005 schema + TS types parallel after T003
- After T007: US3 list copy (T017–018) and US4 markers (T019–021) can proceed in parallel with US5 UI (T014–015)
- T022/T023 polish docs parallel

### Parallel Example: After Foundational

```bash
# Parallel UI tracks:
Task: "T014–T015 fatigue warn/death in RoutePlannerPanel"
Task: "T017–T018 overnight summary on all multi-day rows"
Task: "T019–T021 overnight markers on selected route"
```

---

## Implementation Strategy

### MVP First (US1 + US2 API)

1. Phase 1–2 → plan response includes `pernoites`
2. Phase 3–4 → validate multi-day + single-day via API quickstart A
3. **STOP and VALIDATE** before heavy UI

### Incremental Delivery

1. MVP API overnights (US1/US2)
2. Fatigue UI (US5)
3. List summaries (US3)
4. Map markers (US4)
5. Polish / version bump

### Suggested MVP scope

**US1 + US2** (API correctness). Next valuable slice: **US5** (intenso trade-off visible). Then US3/US4 for full player UX.

---

## Notes

- Do not change k-shortest, costs, or digitizer screens
- Fatigue must never alter `distancia_milhas` / `tempo_*`
- Death alert is warn-only (row selectable)
- No near-death tier at pico 5
