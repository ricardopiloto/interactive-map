# Tasks: Two-Way Vínculos

**Input**: Design documents from `/specs/071-two-way-vinculos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual QA via `quickstart.md` — no automated TDD suite requested.

**Organization**: US1 = grafo (gradiente + etiquetas + filtros); US2 = ficha com perspectiva; US3 = GM form + seed.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contracts and current single-tipo vínculo surfaces

- [x] T001 Skim `specs/071-two-way-vinculos/contracts/api-vinculos-two-way.md`, `contracts/ui-two-way-vinculos.md`, and `research.md` (`tipo_ab`/`tipo_ba`, fade, público por par)
- [x] T002 [P] Confirm current vínculo shape in `backend/app/models/vinculo.py`, `backend/app/schemas/vinculo.py`, `frontend/src/types/index.ts`, and single-tipo edges in `frontend/src/components/relacoes/GraphStage.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persist both perspectives; expose them on API + FE types before UI stories

**⚠️ CRITICAL**: US1–US3 need `tipo_ab` / `tipo_ba` on every vínculo payload

- [x] T003 Evolve `Vinculo` model in `backend/app/models/vinculo.py`: `tipo_ab` (required), `tipo_ba` (optional/null = reciprocal), `nota_ab`, `nota_ba`; keep `publico` and canonical pair unique
- [x] T004 Migrate SQLite in `backend/app/database.py`: ADD/backfill `tipo_ab` from legacy `tipo`, `nota_ab` from `nota`, ADD nullable `tipo_ba`, ADD `nota_ba` default `''` (existing rows stay reciprocal)
- [x] T005 Update Pydantic schemas in `backend/app/schemas/vinculo.py` (`VinculoCreate`/`Update`/`Read`) per `contracts/api-vinculos-two-way.md`; normalize `tipo_ba == tipo_ab` → reciprocal (`tipo_ba=null`)
- [x] T006 Wire create/update/read mapping in `backend/app/routers/public/vinculos.py` and `backend/app/routers/admin/vinculos.py` (including `vinculo_to_read`)
- [x] T007 [P] Update FE `Vinculo` type in `frontend/src/types/index.ts` and admin create/update payloads in `frontend/src/api/admin.ts`
- [x] T008 [P] Add helpers (e.g. `isDuasVias`, `effectiveTipoBa`, tip tipos from selected id) in `frontend/src/components/relacoes/vinculoStyles.ts` or a small `vinculoDirection.ts` beside it

**Checkpoint**: API returns `tipo_ab`/`tipo_ba`; FE types compile; old DBs backfilled as reciprocal

---

## Phase 3: User Story 1 — Visão geral mostra as duas perspectivas (Priority: P1) 🎯 MVP

**Goal**: Idle (and focused) graph: duas vias = one stroke with colour fade + end labels; reciprocal unchanged (068); chips match either tip

**Independent Test**: Quickstart scenarios 1–2 (`specs/071-two-way-vinculos/quickstart.md`)

### Implementation for User Story 1

- [x] T009 [US1] In `frontend/src/components/relacoes/GraphStage.tsx`, filter visible edges if **either** effective tipo is in `activeTipos`
- [x] T010 [US1] For duas vias edges in `GraphStage.tsx`, draw stroke with SVG `linearGradient` (userSpaceOnUse from disc A to disc B; tip colours; mid fade); dashed if either tip is `conhecido`; keep 068 opacities
- [x] T011 [US1] For duas vias, always render short tipo labels near each end (~20% / ~80% along the segment) in `GraphStage.tsx`; reciprocal keeps mid-label-only when highlight-ready (068)
- [x] T012 [US1] Smoke quickstart scenarios 1–2 from `specs/071-two-way-vinculos/quickstart.md`

**Checkpoint**: MVP — Elara–Marcus (once seeded) readable without selecting

---

## Phase 4: User Story 2 — Ficha do seleccionado é da perspectiva dele (Priority: P1)

**Goal**: Detail list shows S→O as primary and O→S as secondary when asymmetric; line labels stay tip-aligned under focus

**Independent Test**: Quickstart scenario 3

### Implementation for User Story 2

- [x] T013 [US2] Update vínculo rows in `frontend/src/components/relacoes/RelacoesDetailPanel.tsx`: primary tipo/note = selected→other; if duas vias, secondary “vê-te como {tipo}” (+ note)
- [x] T014 [US2] Confirm focus-edge labels in `GraphStage.tsx` still map tip colour/label to each endpoint when `selectedId` is set (no inversion)
- [x] T015 [US2] Smoke quickstart scenario 3 from `specs/071-two-way-vinculos/quickstart.md`

**Checkpoint**: Selecting Elara then Marcus never swaps who-sees-whom

---

## Phase 5: User Story 3 — GM cria ou edita duas vias (Priority: P2)

**Goal**: Form toggle Recíproco / Duas vias; save maps named perspectives through canonical ids; seed Elara↔Marcus example; player visibility still pair-level

**Independent Test**: Quickstart scenario 4

### Implementation for User Story 3

- [x] T016 [US3] Extend `VinculoDraft` + UI in `frontend/src/components/relacoes/VinculoFormDialog.tsx`: mode Recíproco | Duas vias; named “{A} vê {B}” / “{B} vê {A}” tipo+nota; one público checkbox
- [x] T017 [US3] Map draft ↔ canonical `tipo_ab`/`tipo_ba`/`nota_*` on create/edit/save in `frontend/src/pages/RelacoesPage.tsx`
- [x] T018 [US3] Update `backend/app/seed.py` so Elara–Marcus is duas vias (`aliado` / `romance`, notes, `publico=true`); other pairs remain reciprocal
- [x] T019 [US3] Smoke quickstart scenario 4 from `specs/071-two-way-vinculos/quickstart.md` (create, flip to reciprocal, player público)

**Checkpoint**: GM can author asymmetric pairs; seed demos US1 without manual setup

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version, docs, spec status

- [x] T020 [P] Add CHANGELOG entry for two-way vínculos in `CHANGELOG.md`
- [x] T021 [P] Bump version to **0.9.0** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T022 [P] Mention duas vias briefly in `README.md` (Relações feature list) if the file lists vínculo behaviour
- [x] T023 Mark feature status Implemented in `specs/071-two-way-vinculos/spec.md` if acceptance matches

---

## Dependencies & Execution Order

```text
Setup → Foundational (model/API/types) → US1 (graph) → US2 (detail) → US3 (GM+seed) → Polish
```

US2 depends on US1 tip geometry staying correct. US3 seed unlocks easy US1/US2 QA on fresh DBs (re-seed or migrate existing).

### Parallel opportunities

- T001 ∥ T002
- T007 ∥ T008 after T006
- T013 can start once FE types exist, but smoke after T011
- T020 ∥ T021 ∥ T022 after visual pass

### Independent tests (summary)

| Story | Independent test |
|-------|------------------|
| US1 | Idle fade + end labels; chips OR either tip; reciprocal unchanged |
| US2 | Select each end: primary/secondary tipos correct |
| US3 | GM duas vias ↔ reciprocal; seed Elara–Marcus; player público |

### MVP scope

**Foundational + US1** (persist both tipos + gradient graph). Seed (T018) early if the DB has no asymmetric pair yet.

## Implementation Strategy

1. Migrate model/API/FE types
2. Graph gradient + dual labels + chip OR
3. Detail perspective copy
4. GM form + seed example
5. Changelog / 0.9.0 / Implemented

## Format validation

All tasks use `- [ ]`, sequential `T00N` IDs, optional `[P]`, story labels only on US phases, and concrete file paths.
