# Tasks: Banco de controle e SQLite por campanha

**Input**: Design documents from `/specs/093-controle-alembic-sqlite/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (Constituição II) — isolamento A/B, Alembic/ponte+stamp e CLI: escrever testes **a falhar** antes da implementação correspondente. Regressão 092 MUST continuar a passar após o harness novo.

**Organization**: US1 = CLI criar (P1 MVP); US2 = CLI listar; US3 = isolamento A/B no resolvedor; US4 = legado ponte+carimbo

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/`
- Specs: `specs/093-controle-alembic-sqlite/`
- Docs: `backend/README.md`, `CHANGELOG.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependência Alembic e alinhamento com contratos

- [X] T001 Add `alembic` to `[project].dependencies` in `backend/pyproject.toml` and refresh `backend/uv.lock` (`cd backend && uv lock`)
- [X] T002 [P] Skim `specs/093-controle-alembic-sqlite/contracts/cli-campanha.md`, `session-resolve.md`, `legacy-bridge-stamp.md`, `research.md`, and `data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Controle + dual Alembic + resolvedor por slug + settings; base partilhada por todas as US

**⚠️ CRITICAL**: Nenhuma história até existir `Campanha`, `control.db` migrado, cache de engines e `resolve` fail-closed. Sem rotas `/c/{slug}`. Sem contas.

- [X] T003 Add `data_dir` (`DATA_DIR`, default `./data`) and `campaign_slug` (`CAMPAIGN_SLUG`, optional) to `backend/app/config.py`; stop treating a single global `database_url`/`uploads_dir` as the campaign content destination
- [X] T004 Create control model `Campanha` in `backend/app/models/campanha.py` (slug, nome, sistema, modulos_ativos, visibilidade, caminho, mapa_arquivo, cota_bytes, bytes_usados, activa) per `data-model.md`
- [X] T005 Create Alembic tree `backend/alembic_control/` with `render_as_batch=True` and initial revision that creates table `campanha`
- [X] T006 Create Alembic tree `backend/alembic_campaign/` with `render_as_batch=True` and initial revision matching current content schema (post-historical `_migrate_sqlite` state)
- [X] T007 Refactor `_migrate_sqlite` in `backend/app/database.py` (or extract to `backend/app/legacy_migrate.py`) to accept an explicit `Engine`/connection — no longer bound only to a global singleton
- [X] T008 Implement control engine + campaign engine cache + `resolve_campaign_session(slug)` in `backend/app/campaign_db.py` (lookup activa, ensure schema: legacy bridge+stamp vs upgrade head, Session yield); wire FastAPI `get_session` in `backend/app/database.py` to resolve via `settings.campaign_slug` with codes `CAMPAIGN_SLUG_AUSENTE` / `CAMPANHA_NAO_ENCONTRADA` / `CAMPANHA_INACTIVA`
- [X] T009 Update `backend/app/main.py` lifespan to migrate `control.db` to head and create `DATA_DIR` layout; mount/serve uploads from the **resolved** campaign site (still public StaticFiles)
- [X] T010 Update `backend/app/services/instance_config.py` so `GET /api/config` reads `sistema` / `modulos_ativos` / map presence from the resolved `Campanha` + that site’s `uploads/map/`

**Checkpoint**: Resolve by slug works in a scratch script/test helper; empty `CAMPAIGN_SLUG` fails closed

---

## Phase 3: User Story 1 - Super-admin cria uma campanha isolada (Priority: P1) 🎯 MVP

**Goal**: CLI `campanha criar` — registo + sítio UUID + `campanha.db` na head + `uploads/`; rejeitar slug inválido/reservado/duplicado sem órfãos

**Independent Test**: `uv run python -m app.cli campanha criar ...` then inspect `control.db` and `data/campanhas/<uuid>/`

### Tests for User Story 1 ⚠️

- [X] T011 [P] [US1] Write failing tests in `backend/tests/test_cli_campanha.py` for create success (row + path + head revision), reserved slug, duplicate slug, malformed slug — no orphan dirs ([contracts/cli-campanha.md](./contracts/cli-campanha.md))

### Implementation for User Story 1

- [X] T012 [US1] Implement `campanha criar` with `argparse` in `backend/app/cli.py` (and `__main__` entry): validate slug, defaults for módulos/visibilidade/cota, create UUID site, upgrade campaign DB to head, insert `Campanha`, rollback filesystem on failure
- [X] T013 [US1] Add service helpers in `backend/app/services/campanha_admin.py` (or equivalent) for slug validation (regex, `--`, reserved list from RFC §2.3) and immutable-field guards used by create

**Checkpoint**: T011 passes; US1 acceptance scenarios green

---

## Phase 4: User Story 2 - Super-admin lista as campanhas (Priority: P1)

**Goal**: CLI `campanha listar` — inventário slug/nome/sistema/visibilidade; lista vazia = sucesso

**Independent Test**: Create two campaigns; list shows both; empty control → empty list

### Tests for User Story 2 ⚠️

- [X] T014 [P] [US2] Extend `backend/tests/test_cli_campanha.py` with failing tests for empty list and two-campaign list fields

### Implementation for User Story 2

- [X] T015 [US2] Implement `campanha listar` in `backend/app/cli.py` reading only `control.db` (no opening campaign content DBs)

**Checkpoint**: T014 passes; US2 done

---

## Phase 5: User Story 3 - Conteúdo de A nunca aparece em B (Priority: P1)

**Goal**: Resolvedor + cache: dados de A invisíveis em B; grupo id=1 por ficheiro; A→B→A sem mistura

**Independent Test**: Automated test per [contracts/session-resolve.md](./contracts/session-resolve.md)

### Tests for User Story 3 ⚠️

- [X] T016 [US3] Write failing tests in `backend/tests/test_isolation_campaigns.py`: local only in A absent from B; distinct grupo id=1; resolve A→B→A same process without cross-read; inactive slug → `CAMPANHA_INACTIVA` (mark `activa=false` in control, no CLI)

### Implementation for User Story 3

- [X] T017 [US3] Harden `backend/app/campaign_db.py` cache keying by UUID only; clear/document no cross-slug Session reuse; ensure inactive/missing paths match contract codes
- [X] T018 [P] [US3] Add test helpers in `backend/tests/helpers_campaign.py` to create two campaigns and open sessions by slug (reuse CLI/service APIs)

**Checkpoint**: T016 passes (SC-002)

---

## Phase 6: User Story 4 - Ficheiro legado abre, migra e é carimbado sem perda (Priority: P1)

**Goal**: create + copy legacy fixture → open → bridge + stamp; counts/ids preserved; second open no re-bridge; new campaign skips bridge

**Independent Test**: [contracts/legacy-bridge-stamp.md](./contracts/legacy-bridge-stamp.md)

### Tests for User Story 4 ⚠️

- [X] T019 [US4] Write failing tests in `backend/tests/test_legacy_bridge_stamp.py` with a minimal legacy SQLite fixture (no `alembic_version`): create campaign, overwrite `campanha.db`, resolve once (N/M/ids stable, version=head), resolve twice (no destructive re-bridge); new empty campaign opens at head without bridge

### Implementation for User Story 4

- [X] T020 [US4] In `backend/app/campaign_db.py` (ensure-on-open): detect missing/invalid revision → call `_migrate_sqlite(engine)` then Alembic stamp head of `alembic_campaign`; new DBs only `upgrade`
- [X] T021 [P] [US4] Add legacy fixture file under `backend/tests/fixtures/legacy_campanha.db` (or build in-test with pre-Alembic schema + sample rows)

**Checkpoint**: T019 passes (SC-003)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Harness 092, docs, regressão completa — sem bump SemVer

- [X] T022 Rewrite `backend/tests/conftest.py` to use `DATA_DIR` under `tmp_path`, migrate control, create one test campaign, set `CAMPAIGN_SLUG`, point uploads at that site (no lone `mapa.db`)
- [X] T023 [P] Document `DATA_DIR`, `CAMPAIGN_SLUG`, and `uv run python -m app.cli campanha criar|listar` in `backend/README.md`
- [X] T024 [P] Add `[Unreleased]` **Added** in `CHANGELOG.md` (control.db + SQLite por campanha + Alembic + CLI; spec 093); do not bump `0.19.1`
- [X] T025 Run `cd backend && uv run pytest` twice (0 failures: 092 characterization + 093 new tests); walk `specs/093-controle-alembic-sqlite/quickstart.md` scenarios 1–5
- [X] T026 Set **Status: Implemented** in `specs/093-controle-alembic-sqlite/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: After Setup — **BLOCKS** US1–US4
- **US1 (Phase 3)**: After Foundational — MVP
- **US2 (Phase 4)**: After US1 create API exists (list needs rows)
- **US3 (Phase 5)**: After US1 (needs two campaigns); uses resolve from Phase 2
- **US4 (Phase 6)**: After US1 (create + copy pattern)
- **Polish (Phase 7)**: After US1–US4 (T022 may start after Phase 2 but finalize after stories)

### User Story Dependencies

- **US1**: No other stories
- **US2**: Depends on US1 create path
- **US3**: Depends on US1; independent of US2/US4
- **US4**: Depends on US1; independent of US2/US3

### Within Each User Story

- Tests MUST be written and FAIL before implementation (II)
- No production router rewrites beyond `get_session` / config / uploads path
- Do not add `/c/{slug}` or user tables

### Parallel Opportunities

- T002 ∥ T001
- T005 ∥ T006 after T004 (two Alembic trees)
- T011 before T012–T013
- T014 ∥ work on US3/US4 after US1
- T016 ∥ T019 after US1
- T018 ∥ T017
- T021 ∥ T020
- T023 ∥ T024 after implementation stable; T025 last

---

## Parallel Example: User Story 1

```bash
# After Foundational:
Task: "Write failing tests in backend/tests/test_cli_campanha.py for create..."
# Then implement:
Task: "Implement campanha criar in backend/app/cli.py"
Task: "Add slug validation helpers in backend/app/services/campanha_admin.py"
```

---

## Parallel Example: User Stories 3–4 (after US1)

```bash
Task: "backend/tests/test_isolation_campaigns.py (failing first)"
Task: "backend/tests/test_legacy_bridge_stamp.py (failing first)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1–2: Alembic dual + resolve + Campanha
2. Phase 3: CLI criar + tests
3. **STOP**: Create a campaign on disk; open via `CAMPAIGN_SLUG`

### Incremental Delivery

1. Setup + Foundational + US1 → criar campanha (MVP)
2. US2 → listar
3. US3 → isolamento A/B
4. US4 → legado+carimbo
5. Polish → harness 092 + docs + suite verde

### Parallel Team Strategy

Solo esperado. Se paralelo após US1: A = US2, B = US3, C = US4.

---

## Notes

- [P] = ficheiros diferentes, sem depender de tarefa incompleta no mesmo ficheiro
- Suggested next: `/speckit-implement`
- Sem versão 0.19.2; sem frontend
