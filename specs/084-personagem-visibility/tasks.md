# Tasks: Visibilidade de Personagem (GM)

**Input**: Design documents from `/specs/084-personagem-visibility/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = criar/ocultar + filtros públicos + UI GM; US2 = revelar personagem; US3 = defaults/migração + coerência Mapa

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Docs / version: `CHANGELOG.md`, `README.md`, package manifests

---

## Phase 1: Setup

**Purpose**: Align with contracts and existing personagem/vínculo patterns

- [x] T001 Skim `specs/084-personagem-visibility/contracts/api-personagem-visibility.md`, `contracts/ui-personagem-visibility.md`, `research.md`, and `data-model.md`
- [x] T002 [P] Skim `backend/app/models/npc.py`, `backend/app/database.py` (`_migrate_sqlite`), `backend/app/routers/public/{personagens,vinculos,npcs,locais}.py`, `backend/app/routers/admin/personagens.py`, `frontend/src/components/relacoes/PersonagemFormDialog.tsx`, `GraphStage.tsx`, and `RelacoesPage.tsx` draft/save flow

---

## Phase 2: Foundational (Blocking)

**Purpose**: Persist `visivel_para_todos` end-to-end (model → migrate → schemas → admin write → TS type) before story filters/UI

**⚠️ CRITICAL**: No public filtering or form work until the column exists and admin round-trips the field

- [x] T003 Add `visivel_para_todos: bool = Field(default=True)` to `backend/app/models/npc.py`
- [x] T004 In `backend/app/database.py` `_migrate_sqlite`, `ALTER TABLE npc ADD COLUMN visivel_para_todos BOOLEAN NOT NULL DEFAULT 1` when column missing
- [x] T005 [P] Extend `PersonagemCreate` / `PersonagemUpdate` / `PersonagemRead` in `backend/app/schemas/personagem.py` with `visivel_para_todos` (create default `True`; update optional; read required bool)
- [x] T006 [P] Extend `NPCRead` (and Create/Update if still used) in `backend/app/schemas/npc.py` with the same field for legacy `/api/npcs` parity
- [x] T007 Persist field in `backend/app/routers/admin/personagens.py` (`_apply_personagem_payload`) and include it in `personagem_to_read` via `backend/app/routers/public/personagens.py`
- [x] T008 Add `visivel_para_todos: boolean` to `Personagem` / `NPC` types in `frontend/src/types/index.ts`

**Checkpoint**: Admin create/update returns `visivel_para_todos`; existing DB rows migrate to `true`

---

## Phase 3: User Story 1 - Criar personagem oculto; jogador não vê nó nem arestas (Priority: P1) 🎯 MVP

**Goal**: GM can uncheck «Visível para todos»; public APIs hide character + incident edges; GM sees badge on graph + form helper

**Independent Test**: Quickstart scenario 1 (create hidden + public edge → player view hides both; GM sees badge)

### Implementation for User Story 1

- [x] T009 [US1] Filter `GET /api/personagens` and `GET /api/personagens/{id}` in `backend/app/routers/public/personagens.py` (omit / 404 when `not visivel_para_todos`)
- [x] T010 [P] [US1] Filter `GET /api/npcs` and `GET /api/npcs/{id}` in `backend/app/routers/public/npcs.py` the same way
- [x] T011 [US1] Extend player vínculo visibility in `backend/app/routers/public/vinculos.py`: keep `player_visible(v)` **and** require both endpoints `visivel_para_todos` (load NPC rows or join as needed)
- [x] T012 [P] [US1] Add i18n keys `personagemForm.visivelParaTodos`, `personagemForm.ocultoAosJogadores`, `graph.ocultoAria` to `frontend/src/locales/pt-BR/relacoes.json` and `frontend/src/locales/en/relacoes.json`
- [x] T013 [US1] Add checkbox «Visível para todos» (default on) + helper when off in `frontend/src/components/relacoes/PersonagemFormDialog.tsx`; extend `PersonagemDraft`
- [x] T014 [US1] Wire `visivel_para_todos` in create/edit draft and admin payload in `frontend/src/pages/RelacoesPage.tsx`
- [x] T015 [US1] Add GM-only hidden badge on nodes in `frontend/src/components/relacoes/GraphStage.tsx` when `!visivel_para_todos` (accessible name from i18n)

**Checkpoint**: Quickstart 1 passes; public list/vinculos omit hidden character and its edges

---

## Phase 4: User Story 2 - Revelar personagem (Priority: P1)

**Goal**: Turning visibility back on restores the character to players; edges only if vínculo rules still allow

**Independent Test**: Quickstart scenario 2

### Implementation for User Story 2

- [x] T016 [US2] Confirm edit path in `PersonagemFormDialog` / `RelacoesPage` toggles `visivel_para_todos` true and admin PUT persists; after GM logout/refresh player lists include the character again
- [x] T017 [US2] Verify (and fix if needed) that revealing does **not** bypass `player_visible` for secret vínculos — edge still hidden when `publico`/conhecido rules fail (`backend/app/routers/public/vinculos.py` + manual check)

**Checkpoint**: Quickstart 2 passes (character visible; secret edges stay secret)

---

## Phase 5: User Story 3 - Defaults, migração e Mapa (Priority: P2)

**Goal**: Legacy rows stay visible; new defaults on; Map/local `npc_ids` hide GM-only NPCs from players

**Independent Test**: Quickstart scenarios 3–4

### Implementation for User Story 3

- [x] T018 [US3] Filter `npc_ids` in public `LocalRead` mapping in `backend/app/routers/public/locais.py` to visible NPCs only (admin locais unchanged)
- [x] T019 [US3] Smoke: restart backend on existing DB — all pre-migration personagens remain player-visible; new personagem without touching checkbox is visible (SC-003)
- [x] T020 [P] [US3] Optional: show «oculto» tag on selected personagem in `frontend/src/components/relacoes/RelacoesDetailPanel.tsx` when GM and `!visivel_para_todos`
- [x] T021 [P] [US3] Optional: set explicit `visivel_para_todos=True` in `backend/app/seed.py` for clarity

**Checkpoint**: Quickstart 3–4 pass; player pin modal omits hidden NPCs

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Version 0.17.0, changelog, build, spec status

- [x] T022 [P] Add `[0.17.0]` entry in `CHANGELOG.md` (personagem `visivel_para_todos`; public filters; GM checkbox + graph badge)
- [x] T023 [P] Bump version to **0.17.0** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`; note in `specs/v2/README.md` follow-ups table
- [x] T024 Run `cd frontend && npm run build` then execute `specs/084-personagem-visibility/quickstart.md`
- [x] T025 Set **Status: Implemented** in `specs/084-personagem-visibility/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T002) → Foundational (T003–T008) → US1 (T009–T015) → US2 (T016–T017) → US3 (T018–T021) → Polish
- US2 is mostly verification on US1 plumbing — do after T013–T014
- US3 map filter (T018) can start after foundational model exists, but prefer after US1 public filters for consistent helper patterns
- Polish after stories

### User Story Dependencies

- **US1**: Foundational field + public filters + form/graph (MVP)
- **US2**: Depends on US1 create/edit + filters
- **US3**: Depends on migration default + extends filters to locais/Mapa

### Parallel Opportunities

- T001 ∥ T002
- T005 ∥ T006
- T009 sequential with T011 (vinculos may need personagem helper); T010 ∥ T009 after shared helper if extracted
- T012 ∥ backend filter tasks
- T020 ∥ T021
- T022 ∥ T023

---

## Parallel Example: Foundational schemas

```bash
Task: "Personagem schemas (T005)"
Task: "NPC schemas (T006)"
```

---

## Parallel Example: Polish

```bash
Task: "CHANGELOG 0.17.0 (T022)"
Task: "Bump manifests 0.17.0 (T023)"
```

---

## Implementation Strategy

### MVP (US1)

1. T001–T008 then T009–T015
2. Validate quickstart 1
3. Players cannot see hidden characters/edges; GM can create and mark them

### Incremental Delivery

1. US1 → hide + GM UI
2. US2 → reveal path confirmed
3. US3 → locais/Mapa + legacy defaults
4. Polish → 0.17.0

### Notes

- Prefer a small helper e.g. `npc_visivel_para_jogador(npc) -> bool` used by public routers
- Do **not** change `Vinculo.publico` / `conhecido_*` semantics — only AND with personagem visibility
- Admin must still receive full graphs including hidden nodes for linking
