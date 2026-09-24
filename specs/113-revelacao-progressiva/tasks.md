# Tasks: Revelação progressiva (Local e Arco)

**Input**: Design documents from `/specs/113-revelacao-progressiva/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/visibility-local-arco.md](./contracts/visibility-local-arco.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED (Constitution II) — migration default true, public leak matrix (local/saídas/arco/`local_ids`), media `locals/`, admin sees hidden. Write failing tests before implementation.

**Organization**: Por user story (US1–US3). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]…[US3]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Shared visibility helper + types scaffolding

- [X] T001 Create `backend/app/services/visibility.py` with `is_visivel_para_jogador(entity)` via `getattr(..., "visivel_para_todos", True)`
- [X] T002 Make `backend/app/services/personagem_visibility.py` re-export from `visibility.py` (keep existing import paths working)
- [X] T003 [P] Add `visivel_para_todos?: boolean` to `Local` and `Arco` in `frontend/src/types/index.ts`

---

## Phase 2: Foundational (schema + models + schemas) — BLOCKS all stories

**Purpose**: DB columns + ORM/API shapes; no public filter behaviour yet beyond what tests need

**⚠️ CRITICAL**: Complete before US work

### Tests (fail first)

- [X] T004 [P] Write failing migration/default tests: after schema upgrade, `local`/`arco` have `visivel_para_todos`; existing rows are `true` in `backend/tests/test_visibility_local_arco.py` (or `test_visibility_schema.py`)

### Implementation

- [X] T005 Add `visivel_para_todos: bool = True` to `backend/app/models/local.py`
- [X] T006 [P] Add `visivel_para_todos: bool = True` to `backend/app/models/arco.py`
- [X] T007 Add Alembic campaign revision `backend/alembic_campaign/versions/003_visibilidade_local_arco.py` (`down_revision=002_sessao`, `render_as_batch`, `server_default=true` on both tables)
- [X] T008 Extend `backend/app/schemas/local.py` (Create/Update/Read) with `visivel_para_todos`
- [X] T009 [P] Extend `backend/app/schemas/arco.py` (Create/Update/Read) with `visivel_para_todos`
- [X] T010 Ensure admin create/update paths persist the flag in `backend/app/routers/admin/locais.py` and `backend/app/routers/admin/arcos.py` (pass-through if already model_validate)
- [X] T011 Run migration/default tests until green

**Checkpoint**: Columns exist; admin can store flag; public behaviour still mostly open until US1

---

## Phase 3: User Story 1 — Jogador não vê rascunhos / spoilers (P1) 🎯 MVP

**Goal**: Anonymous: hidden local gone from map/list/search/detail/saídas; hidden arco gone from arco nav; visible local with hidden arco → `arco_id` null / «Sem arco»

**Independent Test**: [quickstart.md](./quickstart.md) §§2–3; SC-001/SC-002

### Tests (fail first)

- [X] T012 [P] [US1] Write failing tests: hidden local omitted from `GET /locais`, 404 on detail, absent from neighbour `saida_ids` in `backend/tests/test_visibility_local_arco.py`
- [X] T013 [P] [US1] Write failing tests: hidden arco omitted from `GET /arcos`; visible local with hidden arco returns `arco_id: null` in `backend/tests/test_visibility_local_arco.py`

### Implementation

- [X] T014 [US1] Filter list/get + `saida_ids` + redact `arco_id` in `backend/app/routers/public/locais.py` using shared helper
- [X] T015 [US1] Filter list/get in `backend/app/routers/public/arcos.py`
- [X] T016 [US1] Run US1 backend tests until green
- [X] T017 [P] [US1] Ensure public map/list FE consumes filtered payloads without showing hidden ids (no special case if API is source of truth) in `frontend/src/pages/MapPage.tsx` / `frontend/src/hooks/useCampaignData.ts` as needed
- [X] T018 [US1] Confirm SideMenu «Sem arco» path still works when `arco_id` is null for players in `frontend/src/components/sidebar/SideMenu.tsx` (reuse `list.noArco`)

**Checkpoint**: Public map/list/arco surfaces respect Local/Arco flags

---

## Phase 4: User Story 2 — Cruzamento com personagens (P1)

**Goal**: Public NPC/personagem `local_ids` omit hidden locais; sessão chips omit hidden locais; media `locals/` ACL

**Independent Test**: [quickstart.md](./quickstart.md) §2 (NPC `local_ids`) + §5 media

### Tests (fail first)

- [X] T019 [P] [US2] Write failing tests: visible NPC linked to hidden local → public `local_ids` excludes that local; local still absent from `/locais` in `backend/tests/test_visibility_local_arco.py`
- [X] T020 [P] [US2] Write failing tests: anonymous cannot fetch `media/locals/{file}` only referenced by hidden local; member can in `backend/tests/test_media_acl.py` or `test_visibility_local_arco.py`
- [X] T021 [P] [US2] Write failing test: public sessão chips omit hidden local in `backend/tests/test_sessoes_visibility.py` (or sibling)

### Implementation

- [X] T022 [US2] Filter `local_ids` in `backend/app/routers/public/npcs.py` and `backend/app/routers/public/personagens.py` (and any shared `_to_read`)
- [X] T023 [US2] Omit hidden locais from public sessão payload in `backend/app/services/sessao_service.py`
- [X] T024 [US2] Restrict anonymous `locals/` in `backend/app/services/media_acl.py` (visible Local URL match; members unchanged)
- [X] T025 [US2] Public waypoints that imply a hidden local: unlink/omit per [research.md](./research.md) §6 in the relevant public waypoints router
- [X] T026 [US2] Run US2 tests until green

**Checkpoint**: No bypass via NPC, sessão chips, media, or waypoints

---

## Phase 5: User Story 3 — Mestre gere revelação em Modo edição (P1)

**Goal**: Edit Mode shows all locais/arcos with same oculto badge as NPC; forms toggle `visivel_para_todos`

**Independent Test**: [quickstart.md](./quickstart.md) §4

### Tests

- [X] T027 [P] [US3] Write/extend API tests: admin list includes hidden local/arco with `visivel_para_todos=false`; PATCH/PUT persists flag in `backend/tests/test_visibility_local_arco.py`

### Implementation

- [X] T028 [US3] Wire `visivel_para_todos` into `LocalPayload` / admin client in `frontend/src/api/admin.ts`
- [X] T029 [P] [US3] Add visibility checkbox to `frontend/src/components/admin/LocalFormDialog.tsx` (mirror Personagem form pattern)
- [X] T030 [P] [US3] Add visibility checkbox to `frontend/src/components/admin/ArcoAdminList.tsx` / `ArcoFormDialog`
- [X] T031 [US3] Show oculto badge on local/arco rows in Edit Mode lists (`LocalAdminList.tsx`, `ArcoAdminList.tsx`, and/or `SideMenu.tsx`) reusing Relacoes oculto styling/keys
- [X] T032 [US3] Add i18n keys for toggle/badge if missing in `frontend/src/locales/pt-BR/` and `en/` (`mapa.json` / `admin.json` / reuse `relacoes` keys where sensible)
- [X] T033 [US3] Hide write controls for the flag when Edit Mode is off (forms already gated by Edit Mode — verify MapPage admin panels)

**Checkpoint**: GM can hide/unhide without delete; players see badge only in Edit Mode lists

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Isolation note, export, docs, validation

- [X] T034 [P] Extend `backend/tests/test_isolation_http.py` (or sibling) with hidden local only in mesa-a absent from mesa-b public locais if not already covered by DB binding
- [X] T035 Confirm export/import round-trip preserves flags (extend `backend/tests/test_import_roundtrip.py` seed if needed — model_dump should suffice)
- [X] T036 [P] Note feature in `CHANGELOG.md` (Unreleased)
- [X] T037 Run [quickstart.md](./quickstart.md): `uv run pytest backend/tests/test_visibility_local_arco.py backend/tests/test_sessoes_visibility.py -q` (+ media/isolation as touched)
- [X] T038 Confirm hiding an arco does **not** auto-hide its locais (assertion in tests or quickstart manual)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **US2 (4)** → **US3 (5)** → **Polish (6)**
- US2 depends on Local flag + public local filter from US1
- US3 FE can start after T008–T010 (schemas) but badge verification needs US1 filters

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | MVP — public local/arco surfaces |
| **US2** | US1 filters + models | Cross-links + media |
| **US3** | Phase 2 schemas (+ ideally US1) | Edit Mode UI |

### Within Each Story

1. Failing tests first  
2. Backend before FE  
3. Checkpoint before next story  

### Parallel Opportunities

```text
T001 then T002
T005 || T006
T008 || T009
T012 || T013
T019 || T020 || T021
T029 || T030
T034 || T036
```

### Parallel Example: User Story 1

```bash
Task: "Failing tests: hidden local list/detail/saidas"
Task: "Failing tests: hidden arco + arco_id null"
# Then sequentially: locais.py → arcos.py → green
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phases 1–2 (helper + schema)  
2. Phase 3 US1 (public local/arco filters)  
3. **STOP** — validate quickstart §§2–3  
4. Then US2 → US3 → Polish  

### Incremental Delivery

1. Foundation → public spoilers blocked (MVP)  
2. Cross-link + media tight  
3. GM toggle + badge  
4. CHANGELOG + export check  

### Suggested MVP scope

**US1 only** (Phases 1–3): players cannot see hidden locais/arcos; GM can still hide via API/SQL until US3 UI lands.

---

## Notes

- Do **not** cascade-hide locais when arco is hidden  
- Reuse NPC oculto badge — do not invent a new visual language  
- `personagem_visibility` remains a compatible entry point; prefer `visibility` on touched files  
- Package format version unchanged; missing field on import ⇒ visible  
