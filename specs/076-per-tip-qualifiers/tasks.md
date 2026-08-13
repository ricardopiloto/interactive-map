# Tasks: Per-Tip Qualifiers

**Input**: Design documents from `/specs/076-per-tip-qualifiers/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = tip/ficha `Tipo (Qual)`; US2 = GM form two fields; US3 = direction mid arrow only

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Docs: `CHANGELOG.md`, version manifests

---

## Phase 1: Setup

**Purpose**: Align on contracts and 075 baseline to replace

- [x] T001 Skim `specs/076-per-tip-qualifiers/contracts/api-vinculos-per-tip-qualifiers.md`, `contracts/ui-per-tip-qualifiers.md`, `research.md`, and `data-model.md` (migration copy-both for duas vias only)
- [x] T002 [P] Skim pair-level `qualificador` usage in `backend/app/models/vinculo.py`, `frontend/src/components/relacoes/GraphStage.tsx` (`midQualDirFragment`), and `VinculoFormDialog.tsx`

---

## Phase 2: Foundational (Blocking)

**Purpose**: Split `qualificador` → `qualificador_ab` / `qualificador_ba` and expose on API + FE types

**⚠️ CRITICAL**: Blocks all user stories

- [x] T003 Replace `qualificador` with `qualificador_ab` and `qualificador_ba` on `Vinculo` in `backend/app/models/vinculo.py`
- [x] T004 Migrate SQLite in `backend/app/database.py`: ADD `qualificador_ab`/`qualificador_ba`; copy legacy `qualificador` to both tips when duas vias, AB-only when reciprocal; stop reading old column
- [x] T005 Update Create/Update/Read in `backend/app/schemas/vinculo.py` (trim both; force `qualificador_ba=""` when reciprocal)
- [x] T006 Extend `_to_canonical_fields` + create/update in `backend/app/routers/admin/vinculos.py` to swap/clear quals with pair order and reciprocal collapse (FR-009)
- [x] T007 Update admin/public mappers in `backend/app/routers/public/vinculos.py`: expose `qualificador_ab`/`qualificador_ba`; redact qual when matching tip redacted under 073
- [x] T008 [P] Replace `qualificador` with `qualificador_ab`/`qualificador_ba` on `Vinculo` and `VinculoPayload` in `frontend/src/types/index.ts` and `frontend/src/api/admin.ts`

**Checkpoint**: CRUD round-trips per-sense quals; legacy rows migrated

---

## Phase 3: User Story 1 - Qualificador por sentido em duas vias (Priority: P1) 🎯 MVP

**Goal**: Tip labels and ficha show `Tipo (Qual)` per sense; no orphan qual in mid

**Independent Test**: Quickstart scenarios 1, 3, 6

### Implementation for User Story 1

- [x] T009 [P] [US1] Add `qualFromPerspective` (mirror `tipoFromPerspective`) in `frontend/src/components/relacoes/vinculoDirection.ts`
- [x] T010 [US1] Update duas vias tip labels in `frontend/src/components/relacoes/GraphStage.tsx` to `formatVinculoTipoLabel(tipo, qual_ab|qual_ba)` at nearA/nearB (same visibility as tip tipos)
- [x] T011 [US1] Update primary + “Vê-te como…” rows in `frontend/src/components/relacoes/RelacoesDetailPanel.tsx` to use per-perspective qual via `qualFromPerspective`

**Checkpoint**: `Inimizade (Medo)` / `Romance (Admiração)` readable on tips and ficha

---

## Phase 4: User Story 2 - Formulário GM por sentido (Priority: P1)

**Goal**: Two qualifier fields in duas vias with per-tip autocomplete

**Independent Test**: Quickstart scenario 2, 5

### Implementation for User Story 2

- [x] T012 [US2] Extend `VinculoDraft` + `VinculoFormDialog.tsx`: `qualificador_ab`/`qualificador_ba`; one field reciprocal, two in duas vias with per-tipo datalists (not union); mode-switch copy rules
- [x] T013 [US2] Map draft quals on create/edit/save and edit load in `frontend/src/pages/RelacoesPage.tsx`

**Checkpoint**: Distinct quals persist and reload in form

---

## Phase 5: User Story 3 - Direção sem qualificador no meio (Priority: P2)

**Goal**: Duas vias mid shows arrow only; reciprocal mid unchanged

**Independent Test**: Quickstart scenario 4

### Implementation for User Story 3

- [x] T014 [US3] Remove mid `(Qual)` from duas vias in `frontend/src/components/relacoes/GraphStage.tsx`; keep mid `→` only when `direcao` set; leave reciprocal mid/focus label as `Tipo (Qual_ab)` + arrow

**Checkpoint**: Direction visible without hiding tip quals

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Seed, docs, version

- [x] T015 [P] Update seed demos to `qualificador_ab`/`qualificador_ba` in `backend/app/seed.py` (e.g. Mentor on Marcus↔Tomas; Medo on Helga↔Ranulf AB only)
- [x] T016 [P] Add `[0.11.1]` changelog entry in `CHANGELOG.md`
- [x] T017 [P] Bump version to **0.11.1** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T018 Run full `specs/076-per-tip-qualifiers/quickstart.md`
- [x] T019 Set feature status to Implemented in `specs/076-per-tip-qualifiers/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational (**blocks** stories) → US1 → US2 → US3 → Polish
- US2 can start after T008; US1 display needs T008 + T009
- US3 GraphStage change builds on T010 (same file — run T014 after T010)

### User Story Dependencies

- **US1**: Needs foundational API/types + T009 helper
- **US2**: Needs foundational API/types (can parallel US1 after T008 if different dev)
- **US3**: Needs US1 GraphStage tip work (T010) before mid cleanup (T014)

### Parallel Opportunities

- T001 ∥ T002
- T008 ∥ T006/T007
- T009 ∥ T012 after T008
- T015 ∥ T016 ∥ T017

---

## Parallel Example: User Story 1

```bash
Task: "qualFromPerspective helper (T009)"
Task: "Detail panel per-perspective qual (T011)"
# Then:
Task: "Graph tip Tipo (Qual) labels (T010)"
```

---

## Implementation Strategy

### MVP

1. Foundational split + migration (T003–T008)
2. US1 graph/detail `Tipo (Qual)` per tip
3. US2 form two fields
4. US3 mid arrow-only cleanup
5. Polish 0.11.1

### Notes

- Breaking API: remove `qualificador`; clients use `qualificador_ab`/`qualificador_ba`
- Do not change pair-level `direcao` model
- 073: redact qual with secret tip
- No automated tests requested
