# Tasks: Known Direction Vínculos

**Input**: Design documents from `/specs/073-known-direction-vinculos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = player graph/detail + public redact; US2 = GM form + seed; US3 = reciprocal unchanged / polish verification

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

**Purpose**: Align on contracts before coding

- [x] T001 Skim `specs/073-known-direction-vinculos/contracts/api-vinculos-known-direction.md`, `contracts/ui-known-direction-vinculos.md`, and `research.md` (público mestre, redacção pública, defaults)
- [x] T002 [P] Confirm seed characters `Brother Tomas` / `Lila Nacht` and existing link in `backend/app/seed.py`

---

## Phase 2: Foundational (Blocking)

**Purpose**: Persist flags + API shapes so US1–US3 can build

**⚠️ CRITICAL**: No user-story UI until model/schemas/public redact exist

- [x] T003 Add `conhecido_ab` and `conhecido_ba` (`bool`, default `True`) to `Vinculo` in `backend/app/models/vinculo.py`
- [x] T004 Migrate SQLite in `backend/app/database.py`: `ALTER TABLE vinculo ADD COLUMN conhecido_ab` / `conhecido_ba` BOOLEAN NOT NULL DEFAULT 1 (per `data-model.md`)
- [x] T005 Extend Pydantic create/update/read in `backend/app/schemas/vinculo.py`: `conhecido_*` on Create/Update/Read; make `tipo_ab` **Optional** on `VinculoRead` for public redaction; keep create requiring `tipo_ab`
- [x] T006 Wire `conhecido_*` on create/update in `backend/app/routers/admin/vinculos.py` (default true if omitted)
- [x] T007 [P] Add `conhecido_ab` / `conhecido_ba` to `Vinculo` in `frontend/src/types/index.ts` and `VinculoPayload` in `frontend/src/api/admin.ts`; allow `tipo_ab: VinculoTipo | null` on read type

**Checkpoint**: Admin CRUD persists flags; FE types compile; DB migrated

---

## Phase 3: User Story 1 - Jogador só vê a via conhecida (Priority: P1) 🎯 MVP

**Goal**: Public API redacts secret tips; player graph shows reciprocal-like single tip; detail shows partial “vê-te como…” without leaking secret; GM admin data still full 071

**Independent Test**: Public pair with one known sense — player vs GM on `/relacoes` per quickstart scenarios 1–3 and 6

### Implementation for User Story 1

- [x] T008 [US1] In `backend/app/routers/public/vinculos.py`, filter `publico` pairs with ≥1 known tip (reciprocal always if público; duas vias if `conhecido_ab` or `conhecido_ba`); redact unknown tip to `tipo_*=null`, `nota_*=""` per `contracts/api-vinculos-known-direction.md`; omit `conhecido_*` from public mapping if present
- [x] T009 [US1] Extend helpers in `frontend/src/components/relacoes/vinculoDirection.ts`: treat null tip as hidden; `isDuasVias` only when both tips non-null and unequal; `edgeMatchesTipos` / tip colours use only present tips; add helper for reciprocal-like vs duas-vias edge mode for players
- [x] T010 [US1] Update `frontend/src/components/relacoes/GraphStage.tsx`: when only one tip present, draw as reciprocal (single colour, 068 labels); when both present, keep 071 fade + end labels; GM admin payloads with both tips unchanged
- [x] T011 [US1] Update `frontend/src/components/relacoes/RelacoesDetailPanel.tsx`: primary tipo/note only if forward tip present; “vê-te como…” only if reverse tip present; keep row if either tip present (clarification Q2 → B)

**Checkpoint**: Player cannot see secret tip on graph/detail/API; GM still sees both via admin

---

## Phase 4: User Story 2 - GM escolhe conhecido por sentido (Priority: P1)

**Goal**: Form checkboxes per sense; save/load flags; seed Tomas/Lila demo

**Independent Test**: Create/edit duas vias, toggle known flags + público; player view updates (quickstart 4)

### Implementation for User Story 2

- [x] T012 [US2] Extend `VinculoDraft` + UI in `frontend/src/components/relacoes/VinculoFormDialog.tsx`: per-sense “Conhecido pelos jogadores” only in duas vias mode; defaults checked; labels by character names
- [x] T013 [US2] Map draft ↔ `conhecido_ab` / `conhecido_ba` on create/edit/save in `frontend/src/pages/RelacoesPage.tsx` (both true when opening new duas vias or converting reciproco → duas vias)
- [x] T014 [US2] Update `backend/app/seed.py`: promote `Lila Nacht`↔`Brother Tomas` to duas vias público with one sense known (amizade) and one secret (romance) for quickstart; keep Elara↔Marcus both known; ensure `conhecido_*` set on all seeded links

**Checkpoint**: GM can author secret half; seed demos US1 without manual setup

---

## Phase 5: User Story 3 - Recíprocos e privacidade de par (Priority: P2)

**Goal**: Reciprocal path unchanged; no per-sense UI; privado still hides

**Independent Test**: Public/private reciprocal behave as today (quickstart 5)

### Implementation for User Story 3

- [x] T015 [US3] Verify reciprocal create/edit in `VinculoFormDialog.tsx` / `RelacoesPage.tsx` never requires or shows `conhecido_*`; saving reciprocal leaves player visibility driven only by `publico`
- [x] T016 [US3] Smoke private duas vias (flags true, `publico=false`) hidden from player via public router behaviour already in T008

**Checkpoint**: SC-005 — reciprocals stay simple

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Docs, version, validation

- [x] T017 [P] Add `[0.10.0]` changelog entry for known-direction vínculos in `CHANGELOG.md`
- [x] T018 [P] Bump version to **0.10.0** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T019 [P] Mention known-direction / secret tip briefly in `README.md` Relações bullets if feature list mentions vínculos
- [x] T020 Run full `specs/073-known-direction-vinculos/quickstart.md` (scenarios 1–6)
- [x] T021 Set feature status to Implemented in `specs/073-known-direction-vinculos/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: After Setup — **blocks** all stories
- **US1 (Phase 3)**: After Foundational — MVP
- **US2 (Phase 4)**: After Foundational; best after US1 helpers exist (T009+) for live verify
- **US3 (Phase 5)**: After US2 form (confirm no reciproco UI leak)
- **Polish (Phase 6)**: After desired stories

### User Story Dependencies

- **US1**: Needs T003–T008; FE T009–T011
- **US2**: Needs foundational + form/seed; uses US1 player path to verify
- **US3**: Verification on top of US1/US2

### Parallel Opportunities

- T001 ∥ T002
- T007 ∥ T006 (after T005)
- T017 ∥ T018 ∥ T019

---

## Parallel Example: User Story 1

```bash
# After T008 public redact:
Task: "vinculoDirection null-tip helpers (T009)"
# Then sequential UI:
Task: "GraphStage reciprocal-like (T010)"
Task: "RelacoesDetailPanel partial row (T011)"
```

---

## Implementation Strategy

### MVP First (US1)

1. Setup + Foundational (flags + public redact)
2. FE helpers + graph + detail
3. **STOP** — validate quickstart 1–3 + 6 (API leak)
4. US2 form + seed → full demo
5. US3 check + polish 0.10.0

### Incremental Delivery

1. Foundation → API safe
2. US1 → players protected
3. US2 → GM authoring
4. US3 → no reciprocal regression
5. Release notes

---

## Notes

- Never trust FE-only hiding — public redact is mandatory (T008)
- Only-BA-known: `tipo_ab: null` on public JSON; detail uses reverse-only UI
- Version **0.10.0** (minor)
- No automated tests requested
