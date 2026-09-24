# Tasks: Fundação de testes do backend

**Input**: Design documents from `/specs/092-fundacao-testes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED — a entrega **é** a malha. Caracterização do comportamento **actual**: os testes MUST **passar** no código de produção (FR-007). Não aplicar «red then implement» a rotas novas (não há). Constituição I N/A (sem `/c/{slug}`).

**Organization**: US1 = comando + cliente + dados descartáveis (P1 MVP); US2 = GET públicas + plano de rotas; US3 = portão Basic Auth; US4 = `visivel_para_todos`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/`
- Specs: `specs/092-fundacao-testes/`
- Docs: `backend/README.md`, `CHANGELOG.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: pytest no manifesto do backend e pasta de testes

- [x] T001 Add `pytest` under `[dependency-groups] dev` and `[tool.pytest.ini_options]` (`testpaths = ["tests"]`, `pythonpath = ["."]`) in `backend/pyproject.toml`; refresh `backend/uv.lock` with `cd backend && uv lock`
- [x] T002 [P] Skim `specs/092-fundacao-testes/contracts/characterization-public.md`, `characterization-admin-auth.md`, `characterization-routes-plan.md`, `research.md` §3 (singleton `settings`/`engine`), and `data-model.md` seed mínimo

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Harness partilhado — SQLite/uploads temporários, `TestClient` com lifespan, seed SQLModel

**⚠️ CRITICAL**: Nenhuma história de caracterização até o engine de teste **não** apontar a `./data/mapa.db`. Sem app factory. Sem `app.seed`.

- [x] T003 In `backend/tests/conftest.py`, per-test `tmp_path`: mutate `app.config.settings` (`database_url`, `uploads_dir`, `admin_user`, `admin_password`, `sistema=wfrp4e`), recreate `app.database.engine`, run `create_all` + `_migrate_sqlite` (or lifespan), yield `TestClient` as `client` (jogador, sem auth) and `client_gm` (`auth=` do par de teste); `with TestClient(app)` so lifespan runs
- [x] T004 [P] Add seed helpers in `backend/tests/helpers.py` (SQLModel `Session`): arco, local, NPC visível/oculto, vínculo público, dois waypoints, segmento `estrada` com `distancia_milhas > 0`; return generated ids (do not hardcode `1`)

**Checkpoint**: Um teste smoke pode importar `client` sem tocar `data/mapa.db`

---

## Phase 3: User Story 1 - Correr toda a suíte de backend num comando (Priority: P1) 🎯 MVP

**Goal**: Um comando documentado corre pytest; cada teste usa BD/uploads descartáveis; cliente in-process (sem porta 8000)

**Independent Test**: `cd backend && uv run pytest` exit 0; mtime de `backend/data/mapa.db` e `backend/uploads/` inalterado se existirem

### Tests for User Story 1

- [x] T005 [US1] Add smoke in `backend/tests/test_harness.py`: `GET /api/health` → 200 `{"status":"ok"}`; assert `settings.database_url` contains the tmp sqlite path (not `mapa.db`)

### Implementation for User Story 1

- [x] T006 [US1] Document `uv sync --group dev` and `uv run pytest` (SQLite/uploads temporários, sem servidor na 8000) in `backend/README.md`

**Checkpoint**: Quickstart scenarios 1–2; comando único existe e o smoke passa

---

## Phase 4: User Story 2 - Congelar o comportamento público actual (Priority: P1)

**Goal**: Caracterizar GET públicas FR-004 e os dois pins de `GET /api/routes/plan`

**Independent Test**: `uv run pytest backend/tests/test_public_reads.py backend/tests/test_routes_plan.py` (from `backend/`: `uv run pytest tests/test_public_reads.py tests/test_routes_plan.py`) — 0 falhas no código actual

### Tests for User Story 2

- [x] T007 [P] [US2] In `backend/tests/test_public_reads.py`, pin [characterization-public.md](./contracts/characterization-public.md): seed mínimo + GET locais/npcs/personagens/vinculos/arcos (list+detail), `GET /api/grupo` (default se vazio), `GET /api/config` (`sistema`, `modulos_ativos`, `has_map_image` false na pasta temp); empty-db listagens `[]` sem 500
- [x] T008 [P] [US2] In `backend/tests/test_routes_plan.py`, pin [characterization-routes-plan.md](./contracts/characterization-routes-plan.md): (1) dois waypoints + segmento → 200 e `len(rotas) >= 1`; (2) dois waypoints sem segmento → 200 `rotas == []`

**Checkpoint**: SC-002 — todas as superfícies FR-004 cobertas; plano tem os dois pins

---

## Phase 5: User Story 3 - Congelar o portão GM actual (Priority: P1)

**Goal**: 401 sem credencial e não-401 com o par de teste em todas as GET admin + portão de arcos/grupo

**Independent Test**: `uv run pytest tests/test_admin_auth.py` — 0 falhas

### Tests for User Story 3

- [x] T009 [US3] In `backend/tests/test_admin_auth.py`, pin [characterization-admin-auth.md](./contracts/characterization-admin-auth.md): parametrize GET `/api/admin/locais|npcs|personagens|vinculos|waypoints|route-segments|map-scale|session` (401 sem auth; 200 com `client_gm`); `POST /api/admin/arcos` e `PUT /api/admin/grupo` sem corpo → 401 vs não 401; credencial errada → 401 `CREDENCIAIS_INVALIDAS`

**Checkpoint**: SC-003; uploads POST não testado

---

## Phase 6: User Story 4 - Personagens ocultos não saem nas respostas públicas (Priority: P1)

**Goal**: Pin `visivel_para_todos` público vs admin; vínculos públicos com extremo oculto ausentes (comportamento actual)

**Independent Test**: `uv run pytest tests/test_visibility.py` — 0 falhas

### Tests for User Story 4

- [x] T010 [US4] In `backend/tests/test_visibility.py`, seed visível + oculto + vínculo público: listagens `/api/personagens` e `/api/npcs` só o visível; detalhe do oculto 404 `PERSONAGEM_NAO_ENCONTRADO` / `NPC_NAO_ENCONTRADO`; `GET /api/admin/personagens` e `/api/admin/npcs` incluem o oculto; `GET /api/vinculos` **não** inclui a linha do par (pin actual; não «corrigir»)

**Checkpoint**: SC-004

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Descoberta, validação dupla, status da spec — **sem** bump SemVer

- [x] T011 [P] Add `[Unreleased]` **Added** in `CHANGELOG.md` (suíte pytest do backend, spec 092); do not bump `0.19.1` in manifests
- [x] T012 Run `cd backend && uv sync --group dev && uv run pytest` twice; confirm 0 failures and `specs/092-fundacao-testes/quickstart.md` scenarios 1–2
- [x] T013 Set **Status: Implemented** in `specs/092-fundacao-testes/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS US1–US4
- **US1 (Phase 3)**: Depends on Foundational — MVP
- **US2–US4 (Phases 4–6)**: Depend on Foundational (and benefit from US1 smoke); independently testable; T007 ∥ T008 after T004
- **Polish (Phase 7)**: After US1–US4 (T012 needs the full suite)

### User Story Dependencies

- **User Story 1 (P1)**: After Phase 2 — no other stories
- **User Story 2 (P1)**: After Phase 2 — uses `helpers.py` + `client`
- **User Story 3 (P1)**: After Phase 2 — uses `client` / `client_gm` only
- **User Story 4 (P1)**: After Phase 2 — uses helpers + both clients

### Within Each User Story

- Characterization tests **are** the implementation (no production routers to write)
- Seed helpers (T004) before T007/T008/T010
- Do not change `backend/app/` routers, models, or auth

### Parallel Opportunities

- T002 ∥ T001 (read vs pyproject)
- T004 ∥ T003 (helpers vs conftest)
- T007 ∥ T008 after T004
- T009 ∥ T007/T008/T010 after T003 (US3 does not need seed helpers)
- T011 ∥ T013 after tests exist; T012 last

---

## Parallel Example: User Story 2

```bash
# After T003–T004:
Task: "In backend/tests/test_public_reads.py, pin characterization-public.md"
Task: "In backend/tests/test_routes_plan.py, pin characterization-routes-plan.md"
```

---

## Parallel Example: User Stories 2–4 (after Foundational)

```bash
Task: "backend/tests/test_public_reads.py"
Task: "backend/tests/test_routes_plan.py"
Task: "backend/tests/test_admin_auth.py"
Task: "backend/tests/test_visibility.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: pytest no `pyproject.toml`
2. Phase 2: `conftest.py` + `helpers.py`
3. Phase 3: smoke + README
4. **STOP**: `uv run pytest` passa; ficheiros de dev intactos

### Incremental Delivery

1. Setup + Foundational + US1 → comando único (MVP)
2. US2 → rede de segurança das GET públicas e rotas
3. US3 → portão 095
4. US4 → pin 084
5. Polish → CHANGELOG Unreleased + spec Implemented

### Parallel Team Strategy

Solo esperado. Se paralelo: A = US2, B = US3, C = US4 após T003–T004.

---

## Notes

- [P] = ficheiros diferentes, sem depender de tarefa incompleta no mesmo ficheiro
- Zero alterações funcionais em `backend/app/`
- Sem testes de frontend
- Sem versão 0.19.2
- Suggested next: `/speckit-implement`
