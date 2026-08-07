# Tasks: Route Overnight Pins & Fatigue Segment Colors

**Input**: Design documents from `/specs/063-route-pin-fatigue-colors/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual QA via `quickstart.md` — no automated TDD suite requested.

**Organization**: US1 = overnight pins/badges; US2 = green/red day segments; US3 = selected-only chrome; US4 = clean list copy.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3 / US4
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contracts and locate current 062 presentation surfaces

- [x] T001 Skim `specs/063-route-pin-fatigue-colors/contracts/api-route-day-segments.md`, `contracts/ui-route-pin-fatigue-colors.md`, and `research.md` (residual red, Local badge, list cleanup, `dias_visuais`)
- [x] T002 [P] Confirm current surfaces: SVG overnight markers in `frontend/src/components/routes/RouteOverlay.tsx`, travel stroke colours in `frontend/src/components/map/CampaignMap.css`, list pernoite/fadiga in `frontend/src/components/routes/RoutePlannerPanel.tsx`, simulation in `backend/app/services/overnight.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Additive `dias_visuais` on plan items — required before US2 colouring; types shared by map UI

**⚠️ CRITICAL**: Complete before User Story 2 (and before wiring day-slice polylines)

- [x] T003 Add `DiaVisual` / `dias_visuais` fields to route plan schemas in `backend/app/schemas/routes.py` per `specs/063-route-pin-fatigue-colors/data-model.md` and `contracts/api-route-day-segments.md`
- [x] T004 Extend overnight simulation in `backend/app/services/overnight.py` to emit ordered `dias_visuais` (geom slice, `residual`, `fadiga_apos`) with `len(dias_visuais) == len(pernoites) + 1` when march length > 0; residual = relento overnight day or arrival without recovering overnight
- [x] T005 Wire `dias_visuais` onto each planned item in `backend/app/services/route_planner.py` (or wherever 062 attaches `pernoites` / fadiga)
- [x] T006 [P] Mirror `DiaVisual` / `dias_visuais` on `RoutePlanItem` in `frontend/src/types/index.ts`

**Checkpoint**: Plan API returns day slices; FE types compile; fatigue math unchanged

---

## Phase 3: User Story 1 — Pernoites como pins discretos (Priority: P1) 🎯 MVP

**Goal**: Relento = small blue HTML pin + “Pernoite”; Local overnight = badge on existing Local pin (no second pin); remove fat SVG overnight discs

**Independent Test**: Quickstart scenarios 2–3 (`specs/063-route-pin-fatigue-colors/quickstart.md`)

### Implementation for User Story 1

- [x] T007 [US1] Remove SVG overnight marker rendering from `frontend/src/components/routes/RouteOverlay.tsx` (and unused `.campaign-map__pernoite*` SVG styles in `frontend/src/components/map/CampaignMap.css` if only used there)
- [x] T008 [US1] Pass selected-route `pernoites` (or derived relento points + local overnight ids) from `frontend/src/pages/MapPage.tsx` into `frontend/src/components/map/CampaignMap.tsx`
- [x] T009 [US1] Render small blue HTML/CSS relento pins (hover/title “Pernoite”) in `frontend/src/components/map/CampaignMap.tsx` + styles in `frontend/src/components/map/CampaignMap.css` — selected route only
- [x] T010 [US1] Add Local overnight badge/halo (`campaign-map__pin--pernoite` or equivalent) when `local_id` is in selected route’s local pernoites; hover “Pernoite”; preserve `onSelectLocal` click in `frontend/src/components/map/CampaignMap.tsx` / `CampaignMap.css`
- [x] T011 [US1] Smoke quickstart scenarios 2–3 from `specs/063-route-pin-fatigue-colors/quickstart.md`

**Checkpoint**: MVP pins/badges; no duplicate Local pins; no 062 fat SVG overnight discs

---

## Phase 4: User Story 2 — Rotas verdes; fadiga na cor do segmento (Priority: P1)

**Goal**: Base travel stroke green; residual day slices red with intensity by `fadiga_apos`; segment hover shows fatigue; no dedicated fatigue marker

**Independent Test**: Quickstart scenarios 1, 4, 6

### Implementation for User Story 2

- [x] T012 [US2] Change base/selected/alt travel route stroke colours to **green** (replace old red-as-default) in `frontend/src/components/map/CampaignMap.css`
- [x] T013 [US2] For selected route, render per-`dias_visuais` polylines in `frontend/src/components/routes/RouteOverlay.tsx`: non-residual / `fadiga_apos==0` → green; residual with `fadiga_apos≥1` → red level `min(6, fadiga_apos)`
- [x] T014 [US2] Add CSS classes or custom properties for red intensity levels 1–6 in `frontend/src/components/map/CampaignMap.css`
- [x] T015 [US2] Add usable hover hit area (wider transparent stroke) + title/tooltip for residual segments (“Ganho de fadiga — saldo N”) in `frontend/src/components/routes/RouteOverlay.tsx`
- [x] T016 [US2] Smoke quickstart scenarios 1 and 4 (and optional API check 6) from `specs/063-route-pin-fatigue-colors/quickstart.md`

**Checkpoint**: Green base; residual red by day; intensity readable; normal ritmo → no red fatigue

---

## Phase 5: User Story 4 — Lista limpa (Priority: P1)

**Goal**: Remove overnight summary and fatigue/death text from Calcular rota list rows; keep mi/tempo/custos

**Independent Test**: Quickstart scenario 1 list expectations + SC-008

### Implementation for User Story 4

- [x] T017 [US4] Remove `formatPernoitesSummary` usage and all fadiga/aviso/morte spans and related list CSS classes from `frontend/src/components/routes/RoutePlannerPanel.tsx` (and `RoutePlanner.css` if only used for those)
- [x] T018 [P] [US4] Delete or stop exporting unused `frontend/src/components/routes/pernoiteSummary.ts` if nothing else imports it
- [x] T019 [US4] Confirm list rows still show distance/time/costs only; smoke list part of quickstart scenario 1 from `specs/063-route-pin-fatigue-colors/quickstart.md`

**Checkpoint**: List has no pernoite/fadiga copy; map still carries meaning (US1/US2)

---

## Phase 6: User Story 3 — Alternativas e selecção (Priority: P2)

**Goal**: Alternatives = discrete green only; overnight pins and red fatigue only on selected route; switching selection updates chrome

**Independent Test**: Quickstart scenario 5

### Implementation for User Story 3

- [x] T020 [US3] Ensure alt routes use dashed/lighter green and never paint `dias_visuais` red slices in `frontend/src/components/routes/RouteOverlay.tsx` / `CampaignMap.css` (FR-008)
- [x] T021 [US3] Confirm relento pins and Local overnight badges clear/update when `selectedIndex` changes (props from `MapPage` / `CampaignMap`) — no chrome for non-selected routes
- [x] T022 [US3] Smoke quickstart scenario 5 from `specs/063-route-pin-fatigue-colors/quickstart.md`

**Checkpoint**: Selection-scoped chrome; alts stay quiet green

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version bump, full quickstart

- [x] T023 [P] Add CHANGELOG entry under **[0.6.12]** in `CHANGELOG.md` for green routes, residual red segments, blue relento pins, Local overnight badge, list cleanup
- [x] T024 [P] Bump version to **0.6.12** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T025 Run full `specs/063-route-pin-fatigue-colors/quickstart.md` scenarios 1–6
- [x] T026 Mark feature spec status complete in `specs/063-route-pin-fatigue-colors/spec.md` if implementation matches acceptance

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T006) → **US1** (T007–T011) and **US4** (T017–T019) can proceed after Setup (US4 needs no `dias_visuais`; US1 needs only `pernoites`)
- **US2** (T012–T016) requires Foundational (`dias_visuais`)
- **US3** (T020–T022) after US1 + US2 behaviour exists
- **Polish** (T023–T026) after desired stories complete

### User Story Dependencies

- **US1 (P1)**: Pins/badges — MVP map presentation; uses existing `pernoites`
- **US2 (P1)**: Needs `dias_visuais` from Foundational
- **US4 (P1)**: Independent of map colouring; can ship in parallel with US1
- **US3 (P2)**: Hardens selection/alt behaviour after US1+US2

### Parallel Opportunities

- T001 ∥ T002
- T006 ∥ (T003–T005 backend sequence)
- After Setup: US4 (T017–T019) ∥ US1 (T007–T011) on different files
- T023 ∥ T024
- Prefer sequential edits within `RouteOverlay.tsx` / `CampaignMap.tsx` / `CampaignMap.css`

### Parallel Example: After Foundational

```bash
# Developer A — US1 pins
Task: "Remove SVG overnight markers in frontend/src/components/routes/RouteOverlay.tsx"
Task: "Add blue relento pins + Local badge in frontend/src/components/map/CampaignMap.tsx"

# Developer B — US4 list
Task: "Strip pernoite/fadiga list copy in frontend/src/components/routes/RoutePlannerPanel.tsx"

# Then US2 day-slice colours in RouteOverlay + CampaignMap.css
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + skim
2. Foundational can wait if validating pins alone (uses 062 `pernoites`)
3. Complete US1 → validate quickstart 2–3
4. Then Foundational → US2 → US4 → US3 → Polish

### Suggested delivery order

1. Setup + Foundational (`dias_visuais`)
2. US1 pins (MVP visual) + US4 list cleanup in parallel
3. US2 green/red segments
4. US3 selection/alts polish
5. CHANGELOG **0.6.12** + full quickstart

### Notes

- Do **not** change overnight/fatigue calculation rules — only emit visual slices and restyle UI
- No death badge beyond darkest red; no pernoite/fadiga text restored in the list
- [P] = different files / no incomplete dependency
