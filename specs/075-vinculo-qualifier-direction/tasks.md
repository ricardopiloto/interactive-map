# Tasks: Vínculo Qualifier & Direction

**Input**: Design documents from `/specs/075-vinculo-qualifier-direction/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = qualifier + autocomplete; US2 = direction field + arrows; US3 = graph/detail/form consistency

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

**Purpose**: Align on contracts and current vínculo stack

- [x] T001 Skim `specs/075-vinculo-qualifier-direction/contracts/api-vinculos-qualifier-direction.md`, `contracts/ui-qualifier-direction.md`, and `research.md` (canonical `direcao`, label rules B, suggestion union)
- [x] T002 [P] Skim `_to_canonical_fields` in `backend/app/routers/admin/vinculos.py` and current `VinculoFormDialog.tsx` / `GraphStage.tsx` label drawing

---

## Phase 2: Foundational (Blocking)

**Purpose**: Persist `qualificador` / `direcao` and expose on API + FE types

**⚠️ CRITICAL**: Blocks all user stories

- [x] T003 Add `VinculoDirecao` enum (or str literals) and fields `qualificador` (str ≤80, default `""`), `direcao` (optional) to `Vinculo` in `backend/app/models/vinculo.py`
- [x] T004 Migrate SQLite in `backend/app/database.py`: `ALTER TABLE vinculo ADD COLUMN qualificador` / `direcao` per `data-model.md`
- [x] T005 Extend Create/Update/Read in `backend/app/schemas/vinculo.py` (trim qualifier; validate `direcao` ∈ null/`a_para_b`/`b_para_a`)
- [x] T006 Extend `_to_canonical_fields` + create/update in `backend/app/routers/admin/vinculos.py` to map/flip `direcao` with pair order; persist `qualificador`
- [x] T007 Include `qualificador` / `direcao` in admin and public mappers in `backend/app/routers/public/vinculos.py` (no tip-redaction of these fields)
- [x] T008 [P] Add fields to `Vinculo` in `frontend/src/types/index.ts` and `VinculoPayload` in `frontend/src/api/admin.ts`

**Checkpoint**: CRUD round-trips qualifier/direcao; FE types compile

---

## Phase 3: User Story 1 - Qualificador + autocomplete (Priority: P1) 🎯 MVP (with US2 form bits)

**Goal**: GM can set free-text qualifier with tipo-based suggestions; Medo on all tipos; union in duas vias

**Independent Test**: Quickstart scenarios 1–2

### Implementation for User Story 1

- [x] T009 [P] [US1] Create suggestion table + helpers (`suggestionsForTipos`, always include Medo, dedupe) in `frontend/src/components/relacoes/qualificadorSuggestions.ts`
- [x] T010 [US1] Extend `VinculoDraft` + UI in `frontend/src/components/relacoes/VinculoFormDialog.tsx`: qualificador input with datalist/suggestions from current modo/tipos; keep text on tipo change
- [x] T011 [US1] Map `qualificador` on create/edit/save in `frontend/src/pages/RelacoesPage.tsx`

**Checkpoint**: GM can save Aliado (Mentor) and free-text qualifiers

---

## Phase 4: User Story 2 - Direção opcional (Priority: P1)

**Goal**: Mútuo / A→B / B→A on any pair; arrows on labels when set

**Independent Test**: Quickstart scenario 3

### Implementation for User Story 2

- [x] T012 [US2] Add direção control in `frontend/src/components/relacoes/VinculoFormDialog.tsx` (Mútuo · `{nameA} → {nameB}` · `{nameB} → {nameA}`) bound to draft
- [x] T013 [US2] Map draft direção ↔ API `direcao` with form-order awareness in `frontend/src/pages/RelacoesPage.tsx` (server also flips on canonicalization)
- [x] T014 [P] [US2] Add `formatVinculoTipoLabel` / mid-fragment helpers in `frontend/src/components/relacoes/vinculoLabel.ts` (`Tipo (Qual)`, arrow glyph)

**Checkpoint**: Direction persists; helpers ready for US3 display

---

## Phase 5: User Story 3 - Etiquetas, ficha, diálogo (Priority: P2)

**Goal**: Graph + detail reflect qualifier/direction per clarification B; edit loads fields

**Independent Test**: Quickstart scenarios 4–5

### Implementation for User Story 3

- [x] T015 [US3] Update reciprocal mid/focus labels in `frontend/src/components/relacoes/GraphStage.tsx` to include `(qual)` and `→` when set
- [x] T016 [US3] For duas vias in `GraphStage.tsx`, keep tip tipo labels; add mid label for qual and/or arrow only
- [x] T017 [US3] Update vínculo rows in `frontend/src/components/relacoes/RelacoesDetailPanel.tsx`: primary `Tipo (Qual)` + arrow; leave “vê-te como…” without duplicating qualifier
- [x] T018 [US3] Smoke edit-from-edge/list restores qualificador + direção in form (quickstart 4)

**Checkpoint**: Palco, ficha, and form stay consistent

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Seed, docs, version

- [x] T019 [P] Optionally set one seed pair with qualifier/direcao demo in `backend/app/seed.py` (e.g. Mentor or Medo A→B) without breaking 073 Tomas/Lila
- [x] T020 [P] Add `[0.11.0]` changelog entry in `CHANGELOG.md`
- [x] T021 [P] Bump version to **0.11.0** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T022 [P] Mention qualifier/direction briefly in `README.md` Relações bullet if present
- [x] T023 Run full `specs/075-vinculo-qualifier-direction/quickstart.md`
- [x] T024 Set feature status to Implemented in `specs/075-vinculo-qualifier-direction/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational (**blocks** stories) → US1 → US2 → US3 → Polish
- US2 form can start after T010; display helpers T014 before T015–T017

### User Story Dependencies

- **US1**: Needs foundational API/types
- **US2**: Needs US1 draft/form shell (or parallel after T008 if form fields added together — prefer after T010)
- **US3**: Needs US1+US2 data + T014 helpers

### Parallel Opportunities

- T001 ∥ T002
- T008 ∥ T006/T007
- T009 ∥ foundational FE after T008
- T014 ∥ T012
- T019 ∥ T020 ∥ T021 ∥ T022

---

## Parallel Example: User Story 3

```bash
Task: "Graph reciprocal labels (T015)"
Task: "Graph duas vias mid qual/arrow (T016)"
# Then:
Task: "Detail panel Tipo (Qual) (T017)"
```

---

## Implementation Strategy

### MVP

1. Foundational persist + API
2. US1 form qualifier + suggestions
3. US2 direction control
4. US3 labels/detail
5. Polish 0.11.0

### Notes

- Do not replace 071 duas vias or 073 conhecido flags
- Never show empty `()`
- `direcao` always canonical a/b after save
- No automated tests requested
