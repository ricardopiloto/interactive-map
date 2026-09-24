# Tasks: Linha do Tempo vertical da campanha

**Input**: Design documents from `/specs/141-linha-tempo-eventos/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/eventos-api.md](./contracts/eventos-api.md), [quickstart.md](./quickstart.md)

**Depends on**: Padrão Sessão (`sessao_service`, `SessoesPage`, `campaignNav`, `is_visivel_para_jogador`). Export/import ZIP **não** alterados.

**Tests**: **REQUIRED** (Constitution I–II) — isolamento, CRUD, visibilidade/chips; escrever a falhar antes da implementação correspondente. UI polish MAY só quickstart.

**Organization**: US1 (P1 consulta) → US2 (P1 CRUD mestre) → US3 (P2 visibilidade + navegação). Paths repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1], [US2], [US3]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Alinhar com o padrão Sessão e o contrato Evento

- [X] T001 Skim `backend/app/models/sessao.py`, `backend/app/models/links.py` (`SessaoLocalLink`/`SessaoNpcLink`), `backend/app/services/sessao_service.py`, and `backend/alembic_campaign/versions/002_sessao.py` / `003_visibilidade_local_arco.py` (next revision id)
- [X] T002 [P] Skim `frontend/src/pages/SessoesPage.tsx`, `frontend/src/components/layout/campaignNav.ts`, `frontend/src/App.tsx` (route `/c/:slug/sessoes`), and [contracts/eventos-api.md](./contracts/eventos-api.md)

---

## Phase 2: Foundational — schema + models — BLOCKS all stories

**Purpose**: Tabelas e tipos partilhados antes de rotas/UI

**⚠️ CRITICAL**: Nenhuma user story até migração + modelos + schemas base existirem

- [X] T003 Create Alembic campaign revision `backend/alembic_campaign/versions/004_evento.py` (`down_revision = "003_visibilidade_local_arco"`) creating `evento`, `evento_local`, `evento_npc` with reversible `downgrade` (idempotent create per existing campaign migration style)
- [X] T004 [P] Add `Evento` model in `backend/app/models/evento.py` per [data-model.md](./data-model.md) (`titulo`, `ano`, `rotulo_era`, `descricao`, `sessao_id` optional FK, `visivel_para_todos`)
- [X] T005 [P] Add `EventoLocalLink` and `EventoNpcLink` in `backend/app/models/links.py` (FKs to `evento.id` / `local.id` / `npc.id`)
- [X] T006 Ensure models are imported/registered where campaign metadata expects them (mirror Sessao registration pattern in `backend/app/models/` package / schema ensure path used by the project)
- [X] T007 [P] Add Pydantic schemas in `backend/app/schemas/evento.py` (public item, admin item with `visivel_para_todos`, create/update with `local_ids` / `personagem_ids` / `sessao_id`) per contract

**Checkpoint**: Migração aplicável; modelos/schemas importáveis; sem rotas ainda

---

## Phase 3: User Story 1 — Consultar a linha do tempo (P1) 🎯 MVP

**Goal**: Menu + página + `GET` público/admin listando eventos ordenados `ano ASC, id ASC`

**Independent Test**: [quickstart.md](./quickstart.md) §2 com eventos seedados via API/admin mínimo ou fixture; ordem e empty state

### Tests for User Story 1 (REQUIRED — write first, must FAIL)

- [X] T008 [P] [US1] Add isolation tests for `GET /api/c/{slug}/eventos` (and by-id) between campanhas A/B in `backend/tests/test_eventos_isolation.py` (clone pattern from `backend/tests/test_sessoes_isolation.py`)
- [X] T009 [P] [US1] Add list-order / empty-list assertions (oldest year first; empty → `[]`) in `backend/tests/test_eventos_crud.py` (or dedicated list test module)

### Implementation for User Story 1

- [X] T010 [US1] Implement list/get (read) in `backend/app/services/evento_service.py` — public filters `visivel_para_todos`; order `ano ASC, id ASC`; admin lists all (chip filter can be stubbed complete until US3)
- [X] T011 [US1] Wire public router `backend/app/routers/public/eventos.py` (`GET /eventos`, `GET /eventos/{id}`) and register in `backend/app/routers/public/__init__.py`
- [X] T012 [US1] Wire admin read routes in `backend/app/routers/admin/eventos.py` (`GET` list/by-id) and register in `backend/app/routers/admin/__init__.py` (`require_membro` same as sessoes)
- [X] T013 [P] [US1] Add `listEventos` (and get if needed) to `frontend/src/api/campaign.ts` and admin list to `frontend/src/api/admin.ts`
- [X] T014 [P] [US1] Add i18n nav + page strings in `frontend/src/locales/pt-BR/comum.json`, `frontend/src/locales/en/comum.json`, and `frontend/src/locales/{pt-BR,en}/linhaTempo.json` (or equivalent namespace registered in i18n)
- [X] T015 [US1] Extend `frontend/src/components/layout/campaignNav.ts` with tab **after** `sessoes` (id e.g. `linha-tempo`); ensure `CodexHeader` / `CampaignBottomNav` pick it up
- [X] T016 [US1] Add route `/c/:slug/linha-do-tempo` in `frontend/src/App.tsx` → new `frontend/src/pages/LinhaTempoPage.tsx` (+ CSS) — vertical scrollable list, expand/collapse cards, empty state; read-only for now (no create button yet OK if gated by `useEditMode` stub)
- [X] T017 [US1] Run `uv run pytest tests/test_eventos_isolation.py tests/test_eventos_crud.py -q` until green for list/isolation cases

**Checkpoint**: Utilizador abre Linha do Tempo e vê eventos ordenados (MVP de consulta)

---

## Phase 4: User Story 2 — Documentar eventos como mestre (P1)

**Goal**: CRUD completo no admin API + UI mestre (+ Novo Evento / editar / apagar)

**Independent Test**: [quickstart.md](./quickstart.md) §3

### Tests for User Story 2 (REQUIRED — write first)

- [X] T018 [P] [US2] Extend `backend/tests/test_eventos_crud.py` for POST/PATCH/DELETE, validation (empty `titulo`, missing `ano`), and link replace (`local_ids` / `personagem_ids` / `sessao_id`) — MUST fail until service write exists
- [X] T019 [P] [US2] Add admin auth expectations for write routes (mestre OK / jogador ou anónimo denied) in `backend/tests/test_eventos_crud.py` or `backend/tests/test_admin_auth_matrix.py` if that matrix is the project convention

### Implementation for User Story 2

- [X] T020 [US2] Implement create/update/delete + `_replace_links` in `backend/app/services/evento_service.py` (mirror `sessao_service`); error codes per contract (`EVENTO_NAO_ENCONTRADO`, `LOCAL_NAO_ENCONTRADO`, `NPCS_NAO_ENCONTRADOS`, `SESSAO_NAO_ENCONTRADA`)
- [X] T021 [US2] Add `POST` / `PATCH` / `DELETE` in `backend/app/routers/admin/eventos.py`
- [X] T022 [P] [US2] Add admin API client methods create/update/delete evento in `frontend/src/api/admin.ts`
- [X] T023 [US2] In `frontend/src/pages/LinhaTempoPage.tsx`, when `useEditMode()` allows edit: «+ Novo Evento», edit/delete with `FormDrawer`/`ConfirmDialog` pattern from `SessoesPage.tsx`; players never see write controls
- [X] T024 [US2] Run pytest CRUD/auth suite until green

**Checkpoint**: Mestre documenta a timeline; jogador só lê

---

## Phase 5: User Story 3 — Visibilidade e navegação cruzada (P2)

**Goal**: Eventos ocultos omitidos ao jogador; chips de local/NPC ocultos omitidos; clique navega como Sessões

**Independent Test**: [quickstart.md](./quickstart.md) §4

### Tests for User Story 3 (REQUIRED — write first)

- [X] T025 [P] [US3] Add `backend/tests/test_eventos_visibility.py` — hidden event absent from public list/get; visible event with hidden local/NPC omits those chips but keeps event; admin sees full chips

### Implementation for User Story 3

- [X] T026 [US3] In `backend/app/services/evento_service.py` `to_public`, filter locais/NPCs with `is_visivel_para_jogador` (same as `sessao_service` `filter_hidden_npcs`); public get hidden id → 404
- [X] T027 [US3] In `frontend/src/pages/LinhaTempoPage.tsx`, wire chip clicks to existing mapa/relações navigation (copy deep-link pattern from `SessoesPage.tsx`)
- [X] T028 [US3] Confirm `visivel_para_todos` toggle exists on create/edit form for mestre; run visibility pytest green

**Checkpoint**: SC-003 cumprido; timeline como hub de navegação

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Gates e docs

- [X] T029 Run [quickstart.md](./quickstart.md) §1–5 (pytest + UI smoke + i18n)
- [X] T030 [P] Confirm `campaign_export.py` / `campaign_import.py` unchanged (no `eventos` keys) — grep sanity from quickstart §6
- [X] T031 [P] Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean
- [X] T032 [P] Note feature in `CHANGELOG.md` (Unreleased) — Linha do Tempo / entidade Evento (consulta + CRUD mestre; export ZIP fora de escopo)
- [X] T033 Optional: seed helper `seed_evento` in `backend/tests/helpers.py` if tests duplicated setup heavily

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **US2 (4)** → **US3 (5)** → **Polish (6)**
- T003 before T004–T007 consumers; T010 before T011–T012; T020 before T021
- US2 builds on US1 page/API; US3 tightens visibility already stubbed in US1

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | MVP — read timeline |
| **US2** | US1 | Write path + mestre UI |
| **US3** | US1 (+ preferably US2 for visibility toggle UX) | Filter chips + nav |

### Parallel Opportunities

```text
T001 || T002
T004 || T005 || T007          # after T003
T008 || T009                  # US1 tests
T013 || T014                  # frontend API/i18n while routers land
T018 || T019                  # US2 tests
T030 || T031 || T032
```

---

## Implementation Strategy

### MVP (User Story 1)

1. Foundational migration + models (T003–T007)
2. Read API + nav + `LinhaTempoPage` list (T008–T017)
3. Validate order + empty state

### Incremental Delivery

1. Consulta (US1)  
2. CRUD mestre (US2)  
3. Visibilidade + deep-links (US3)  
4. CHANGELOG / tsc / export grep  

---

## Format Validation

- All tasks use `- [ ]`, sequential `T00N`, file paths, and `[USn]` on story phases only.
- Test tasks included because Constitution I–II + new campaign routes require them.
- No task to modify export/import maps (explicit non-goal).
