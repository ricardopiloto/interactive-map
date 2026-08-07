# Tasks: Route Default Red

**Input**: Design documents from `/specs/065-route-default-red/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual QA via `quickstart.md` — no automated TDD suite requested.

**Organization**: US1 = selected base red; US2 = keep fatigue darkening; US3 = alts remain distinct.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contract and confirm current green selected / red fadiga / red alt tokens

- [x] T001 Skim `specs/065-route-default-red/contracts/ui-route-default-red.md` and `research.md` (selected → `#e5484d`; keep fadiga-1…6; alts discrete)
- [x] T002 [P] Confirm `.campaign-map__travel-route--selected` is green and fadiga/alt rules live in `frontend/src/components/map/CampaignMap.css`; class wiring in `frontend/src/components/routes/RouteOverlay.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No shared infra beyond CSS token awareness — mark ready after setup skim

**⚠️ CRITICAL**: US work is CSS/verify-only; no API changes

- [x] T003 Note that overnight/`dias_visuais` logic MUST NOT change (063/064); only presentation in `frontend/src/components/map/CampaignMap.css` / overlay classes

**Checkpoint**: Ready for colour changes

---

## Phase 3: User Story 1 — Rota seleccionada volta ao vermelho (Priority: P1) 🎯 MVP

**Goal**: Selected non-residual stroke is red (`#e5484d`), not green

**Independent Test**: Quickstart scenario 1

### Implementation for User Story 1

- [x] T004 [US1] Change `.campaign-map__travel-route--selected` stroke from `#2f9e44` to `#e5484d` in `frontend/src/components/map/CampaignMap.css`
- [x] T005 [US1] Smoke quickstart scenario 1 from `specs/065-route-default-red/quickstart.md` (normal pace → selected red)

**Checkpoint**: MVP — selected default is red

---

## Phase 4: User Story 2 — Fadiga continua a escurecer (Priority: P1)

**Goal**: Residual days still use `--fadiga-N` intensity scale; no green reintroduction

**Independent Test**: Quickstart scenario 2

### Implementation for User Story 2

- [x] T006 [US2] Verify `RouteOverlay` still applies `--fadiga-${level}` only when `residual && fadiga_apos >= 1` in `frontend/src/components/routes/RouteOverlay.tsx` (no logic change unless broken)
- [x] T007 [US2] Confirm `.campaign-map__travel-route--fadiga-1` … `--fadiga-6` remain a darkening red scale in `frontend/src/components/map/CampaignMap.css`; tweak only if base red makes fadiga-1 indistinguishable from selected
- [x] T008 [US2] Smoke quickstart scenario 2 from `specs/065-route-default-red/quickstart.md`

**Checkpoint**: Fatigue darkening preserved

---

## Phase 5: User Story 3 — Alternativas legíveis (Priority: P2)

**Goal**: Non-selected stay dashed/lighter red; distinct from selected base and max fadiga

**Independent Test**: Quickstart scenario 3

### Implementation for User Story 3

- [x] T009 [US3] Confirm `.campaign-map__travel-route--alt` remains lighter dashed red (not solid selected) in `frontend/src/components/map/CampaignMap.css`; adjust mix/opacity only if contrast fails after T004
- [x] T010 [US3] Confirm alts never get fadiga classes in `frontend/src/components/routes/RouteOverlay.tsx`
- [x] T011 [US3] Smoke quickstart scenario 3 from `specs/065-route-default-red/quickstart.md`

**Checkpoint**: Selected / alt / fadiga visually distinct

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version, full quickstart

- [x] T012 [P] Add CHANGELOG entry under **[0.6.14]** in `CHANGELOG.md` (selected travel default red again; fatigue darkening kept)
- [x] T013 [P] Bump version to **0.6.14** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T014 Run full `specs/065-route-default-red/quickstart.md` scenarios 1–3
- [x] T015 Mark feature status Implemented in `specs/065-route-default-red/spec.md` if acceptance matches

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003) → **US1** (T004–T005) → **US2** (T006–T008) → **US3** (T009–T011) → **Polish** (T012–T015)

### User Story Dependencies

- **US1 (P1)**: Selected base red — MVP
- **US2 (P1)**: Verify/tweak fadiga scale after base change
- **US3 (P2)**: Confirm alt contrast after US1

### Parallel Opportunities

- T001 ∥ T002
- T012 ∥ T013
- Prefer sequential CSS edits on `CampaignMap.css`

### Parallel Example

```bash
# After T004 selected red:
Task: "Verify fadiga scale in CampaignMap.css / RouteOverlay.tsx"
Task: "Confirm alt stroke still discrete in CampaignMap.css"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup skim
2. T004 selected → red
3. Validate quickstart 1
4. US2 + US3 contrast checks → Polish **0.6.14**

### Notes

- No backend / overnight / `dias_visuais` changes
- [P] = different files / no incomplete dependency
