# Tasks: Crônica de sessões

**Input**: Design documents from `/specs/112-cronica-sessoes/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/sessoes-api.md](./contracts/sessoes-api.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED (Constitution II) — campaign migration, public visibility, CRUD/`NUMERO_DUPLICADO`, isolation A/B, export round-trip. Write failing tests before implementation.

**Organization**: Por user story (US1–US3). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]…[US3]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Shared types/paths aligned to plan

- [X] T001 Confirm feature paths from [plan.md](./plan.md) and create empty stubs only if needed: `backend/app/models/sessao.py`, `backend/app/services/sessao_service.py`, `frontend/src/pages/SessoesPage.tsx` (no logic yet)
- [X] T002 [P] Add i18n namespace files `frontend/src/locales/pt-BR/sessoes.json` and `frontend/src/locales/en/sessoes.json` with keys for page title, empty state, form labels, errors (`NUMERO_DUPLICADO`), nav label `nav.sessoes` (or in `comum.json` if that is where other nav keys live)

---

## Phase 2: Foundational (schema + service) — BLOCKS all stories

**Purpose**: `campanha.db` tables + domain helpers; no user-facing routes yet beyond what tests need

**⚠️ CRITICAL**: Complete before US work

### Tests (fail first)

- [X] T003 [P] Write failing migration/schema test: after `ensure_campaign_schema`, tables `sessao`, `sessao_local`, `sessao_npc` exist and unique on `sessao.numero` in `backend/tests/test_sessoes_schema.py`
- [X] T004 [P] Write failing service unit tests for `proximo_numero` (empty→1, max 4→5) in `backend/tests/test_sessoes_service.py`

### Implementation

- [X] T005 Create `Sessao` model in `backend/app/models/sessao.py` per [data-model.md](./data-model.md)
- [X] T006 [P] Add `SessaoLocalLink` and `SessaoNpcLink` to `backend/app/models/links.py`
- [X] T007 Register models in `backend/app/models/__init__.py`
- [X] T008 Add Alembic campaign revision `backend/alembic_campaign/versions/002_sessao.py` (`create_table` for three tables; UNIQUE on `numero`; FKs + cascade as in data-model)
- [X] T009 Add Pydantic/SQLModel schemas in `backend/app/schemas/sessao.py` per [contracts/sessoes-api.md](./contracts/sessoes-api.md)
- [X] T010 Implement `backend/app/services/sessao_service.py`: `proximo_numero`, list/get with visibility filter, replace links, raise `NUMERO_DUPLICADO` / `SESSAO_NAO_ENCONTRADA`
- [X] T011 Run `uv run pytest backend/tests/test_sessoes_schema.py backend/tests/test_sessoes_service.py -q` until green

**Checkpoint**: Schema + service ready; stories can add HTTP/UI

---

## Phase 3: User Story 1 — Lista pública da crônica (P1) 🎯 MVP

**Goal**: Anonymous sees visible sessions newest-first at `/c/:slug/sessoes` with chips + deep-links; chrome nav entry

**Independent Test**: [quickstart.md](./quickstart.md) §§2–3, 5; 3 sessions (1 hidden) → anon sees 2 in order

### Tests (fail first)

- [X] T012 [P] [US1] Write failing public list/detail tests: order `numero` DESC; hidden omitted; public `personagens` omit NPC with `visivel_para_todos=false`; local/NPC list payloads unchanged in `backend/tests/test_sessoes_visibility.py`

### Implementation

- [X] T013 [US1] Implement public router `backend/app/routers/public/sessoes.py` (`GET /sessoes`, `GET /sessoes/{id}`) and register in `backend/app/routers/public/__init__.py`
- [X] T014 [US1] Run visibility tests until green (`test_sessoes_visibility.py`)
- [X] T015 [P] [US1] Add public client helpers in `frontend/src/api/` (list/get sessões under campaign prefix)
- [X] T016 [US1] Implement read-only `frontend/src/pages/SessoesPage.tsx` + `SessoesPage.css` (MarkdownSafe, chips, empty state, tokens 110+)
- [X] T017 [US1] Register route `/c/:slug/sessoes` in `frontend/src/App.tsx`
- [X] T018 [P] [US1] Add Sessões link in `frontend/src/components/layout/CodexHeader.tsx` and `CampaignBottomNav.tsx` (+ CSS active states)
- [X] T019 [US1] Teach `frontend/src/pages/MapPage.tsx` to select local from `?local=` on mount
- [X] T020 [US1] Teach `frontend/src/pages/RelacoesPage.tsx` to select personagem from `?personagem=` on mount
- [X] T021 [US1] Wire chip navigation to `/c/{slug}?local={id}` and `/c/{slug}/relacoes?personagem={id}` in `SessoesPage.tsx`
- [X] T022 [US1] Register `sessoes` i18n namespace (if required by i18n loader) and verify `nav.sessoes` keys in pt-BR/en

**Checkpoint**: MVP — public crônica usable without write UI

---

## Phase 4: User Story 2 — Mestre gere sessões em Modo edição (P1)

**Goal**: Edit Mode CRUD via Drawer; suggested numero; ConfirmDialog delete; visibility toggle

**Independent Test**: [quickstart.md](./quickstart.md) §4; create→edit→hide→delete; no write controls without Edit Mode

### Tests (fail first)

- [X] T023 [P] [US2] Write failing admin CRUD tests: `GET proximo-numero`, POST/PATCH/DELETE, `NUMERO_DUPLICADO`, auth via `require_membro` in `backend/tests/test_sessoes_crud.py`

### Implementation

- [X] T024 [US2] Implement admin router `backend/app/routers/admin/sessoes.py` and register in `backend/app/routers/admin/__init__.py` per contract
- [X] T025 [US2] Run CRUD tests until green (`test_sessoes_crud.py`)
- [X] T026 [P] [US2] Add admin API client methods in `frontend/src/api/admin.ts` (list, proximo-numero, create, update, delete)
- [X] T027 [US2] Extend `SessoesPage.tsx` with Edit Mode create/edit Drawer (numero, titulo, data_rotulo, MarkdownField resumo, local/personagem multi-select, visibility switch) reusing 107 patterns
- [X] T028 [US2] Wire delete via `ConfirmDialog` + Toast errors (map `NUMERO_DUPLICADO`) on `SessoesPage.tsx`
- [X] T029 [US2] Ensure write controls hidden when Edit Mode off on `SessoesPage.tsx`

**Checkpoint**: Full GM loop on crônica

---

## Phase 5: User Story 3 — Isolamento e superfície pública segura (P1)

**Goal**: Session of A never leaks to B; hidden session never public; no bypass via chips

**Independent Test**: [quickstart.md](./quickstart.md) §6; matrix A/B

### Tests (fail first)

- [X] T030 [P] [US3] Write failing isolation tests: session seeded only in mesa-a absent from mesa-b public+admin list/detail (auth + anon) in `backend/tests/test_sessoes_isolation.py`
- [X] T031 [P] [US3] Extend `backend/tests/test_isolation_http.py` (or sibling) to include `/api/c/{slug}/sessoes` and `/api/c/{slug}/admin/sessoes` in the A/B matrix if that file is the canonical matrix

### Implementation

- [X] T032 [US3] Fix any leakage until `test_sessoes_isolation.py` and matrix extension are green (rely on per-campaign DB binding; no cross-slug queries)
- [X] T033 [US3] Assert admin can see hidden session while public cannot (already in US1/US2 — add cross-check case in `test_sessoes_isolation.py` if missing)

**Checkpoint**: Constitution I satisfied for sessões

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Portable package + docs + validation

- [X] T034 [P] Include `sessao`, `sessao_local`, `sessao_npc` in `backend/app/services/campaign_export.py` `build_content_dict`
- [X] T035 [P] Import sessao tables in `backend/app/services/campaign_import.py` (+ `package_schema.py` validation if required)
- [X] T036 Write/adjust export round-trip test covering sessões in `backend/tests/test_export_package.py` or `test_import_roundtrip.py`
- [X] T037 [P] Note feature in `CHANGELOG.md` (Unreleased)
- [X] T038 Run [quickstart.md](./quickstart.md) scenarios manually or via pytest suite: `uv run pytest backend/tests/test_sessoes_*.py -q`
- [X] T039 Confirm `Local.data_sessao` untouched (no migration/backfill linking it to Sessao)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **US2 (4)** → **US3 (5)** → **Polish (6)**
- US2 UI depends on US1 page existing; US3 tests can be written in parallel with US2 but should run green after routers exist
- Polish export can start after models exist (T005–T008) but ideally after CRUD stable

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | MVP; public API + FE list + nav + deep-links |
| **US2** | Phase 2 + US1 page shell | Admin API + Drawer CRUD on same page |
| **US3** | Public + admin routers (US1/US2) | Isolation matrix |

### Within Each Story

1. Failing tests first  
2. Backend before FE  
3. Checkpoint before next story  

### Parallel Opportunities

```text
# After T001:
T002 || (docs only)

# Phase 2 tests:
T003 || T004

# Phase 2 models:
T005 then T006 || (links parallel after sessao exists for FK mental model — T006 can follow T005)
T007 after T005+T006

# US1 after T013:
T015 || T018
T019 || T020

# US2:
T023 early; T026 || after T024
T034 || T035 in polish
```

### Parallel Example: User Story 1

```bash
# After public router green:
Task: "Add public client helpers in frontend/src/api/"
Task: "Add Sessões link in CodexHeader.tsx and CampaignBottomNav.tsx"
Task: "Teach MapPage.tsx ?local= / RelacoesPage.tsx ?personagem="
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1–2 (schema + service)  
2. Phase 3 US1 (public list + nav + chips)  
3. **STOP** — validate quickstart §§2–3, 5  
4. Then US2 → US3 → Polish  

### Incremental Delivery

1. Foundation → public crônica (MVP)  
2. GM CRUD  
3. Isolation proof + export  
4. CHANGELOG  

### Suggested MVP scope

**US1 only** (Phases 1–3): playable public chronicle without write UI (seed via pytest/SQL for demo).

---

## Notes

- Do **not** migrate `Local.data_sessao` into Sessao (FR-002 / T039)
- Do **not** change existing local/NPC list payloads (FR-011)
- Error codes: `NUMERO_DUPLICADO`, `SESSAO_NAO_ENCONTRADA` per contract
- Reuse Drawer / MarkdownField / MarkdownSafe / ConfirmDialog / Toast / EditMode — no new UI libraries
