# Tasks: Sistema & Módulos de Mecânica

**Input**: Design documents from `/specs/077-sistema-modulos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = config instância + visibilidade por módulo; US2 = `extensoes_mecanica` + FadigaWidget; US3 = landing sem mapa

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Docs: `CHANGELOG.md`, version manifests, `.env.example`

---

## Phase 1: Setup

**Purpose**: Align on contracts and current personagem / routing baseline

- [x] T001 Skim `specs/077-sistema-modulos/contracts/api-config.md`, `contracts/api-personagem-extensoes.md`, `contracts/ui-modulos-personagem.md`, `research.md`, and `data-model.md` (defaults MODULOS_ATIVOS, dois passos migração)
- [x] T002 [P] Skim `backend/app/models/npc.py`, `backend/app/schemas/personagem.py`, `frontend/src/components/relacoes/PersonagemFormDialog.tsx`, and `frontend/src/App.tsx` routing

---

## Phase 2: Foundational (Blocking)

**Purpose**: Instance config, `extensoes_mecanica` column, sanitization service, public config API, FE types/hook

**⚠️ CRITICAL**: Blocks all user stories

- [x] T003 Add `SISTEMA` and `MODULOS_ATIVOS` env parsing with defaults-by-sistema vs explicit-empty override in `backend/app/config.py`
- [x] T004 Create `backend/app/services/instance_config.py` with `get_instance_config()` resolving `modulos_ativos` and `has_map_image` (scan `uploads/map/campaign-map.*`)
- [x] T005 Create `backend/app/services/mecanica.py` with `sanitize_extensoes` (write: strip inactive keys silently), `filter_extensoes` (read), and fadiga validation `0–6` for active module
- [x] T006 Create `InstanceConfigRead` schema in `backend/app/schemas/config.py`
- [x] T007 Add `extensoes_mecanica: dict` JSON field (default `{}`) to `NPC` in `backend/app/models/npc.py`
- [x] T008 Deploy-1 migration in `backend/app/database.py`: ADD `extensoes_mecanica TEXT NOT NULL DEFAULT '{}'`; if legacy `npc.fadiga` column exists copy to JSON (keep legacy column)
- [x] T009 Add `extensoes_mecanica` to Create/Update/Read in `backend/app/schemas/personagem.py`
- [x] T010 Create public `GET /api/config` router in `backend/app/routers/public/config.py` (no auth)
- [x] T011 Register config router in `backend/app/routers/public/__init__.py`
- [x] T012 [P] Add `InstanceConfig` and personagem `extensoes_mecanica` types in `frontend/src/types/index.ts`
- [x] T013 [P] Create `fetchInstanceConfig()` in `frontend/src/api/config.ts`
- [x] T014 Create `useInstanceConfig` hook (cache + expose `modulos_ativos`, `has_map_image`, `sistema`) in `frontend/src/hooks/useInstanceConfig.ts`

**Checkpoint**: `curl /api/config` returns resolved modules + `has_map_image`; DB has `extensoes_mecanica` column

---

## Phase 3: User Story 1 - Instância configurada para um sistema (Priority: P1) 🎯 MVP

**Goal**: Deploy fixo expõe config; UI de personagem só mostra mecânicas activas; jogadores não vêem módulos inactivos

**Independent Test**: Quickstart scenarios 1, 2, 3, 7 (WoD sem fadiga; WFRP default fadiga; override vazio; banner GM módulo não implementado)

### Implementation for User Story 1

- [x] T015 [US1] Apply `sanitize_extensoes` on create/update in `backend/app/routers/admin/personagens.py`
- [x] T016 [US1] Apply `filter_extensoes` in `personagem_to_read` and admin reads in `backend/app/routers/public/personagens.py` and `backend/app/routers/admin/personagens.py`
- [x] T017 [US1] Create `frontend/src/modules/registry.ts` with `IMPLEMENTED_MODULES`, `componentesPorModulo`, and helper `unimplementedActiveModules(config)`
- [x] T018 [US1] Integrate `useInstanceConfig` in `frontend/src/pages/RelacoesPage.tsx` and pass module context to personagem form (GM vs player)

**Checkpoint**: WoD instance → no fadiga controls; WFRP omit MODULOS_ATIVOS → fadiga module active in config

---

## Phase 4: User Story 2 - Mecânicas extensíveis por personagem (Priority: P1)

**Goal**: Fadiga persiste em `extensoes_mecanica`; widget condicional na ficha GM

**Independent Test**: Quickstart scenarios 4, 5 (persist fadiga=2; inactive key stripped on write)

### Implementation for User Story 2

- [x] T019 [P] [US2] Create `frontend/src/modules/fadiga/FadigaWidget.tsx` (0–6 input bound to `extensoes_mecanica.fadiga`)
- [x] T020 [US2] Extend `PersonagemDraft` + `PersonagemFormDialog.tsx`: render module widgets from registry; GM banner for active-but-unimplemented modules per `contracts/ui-modulos-personagem.md`
- [x] T021 [US2] Map `extensoes_mecanica` on personagem create/edit/save/load in `frontend/src/pages/RelacoesPage.tsx` and admin API calls
- [x] T022 [P] [US2] Optional demo: set `extensoes_mecanica.fadiga` on seed PJs when WFRP defaults in `backend/app/seed.py`

**Checkpoint**: GM saves fadiga=2 → survives reload; API read omits fadiga when module inactive

---

## Phase 5: User Story 3 - Tela inicial sem mapa (Priority: P2)

**Goal**: `has_map_image: false` → landing `/relacoes`; com mapa mantém `/` → MapPage

**Independent Test**: Quickstart scenario 6

### Implementation for User Story 3

- [x] T023 [US3] Add boot-time landing logic in `frontend/src/App.tsx`: fetch config; if `!has_map_image` redirect `/` → `/relacoes` (avoid empty map flash)
- [x] T024 [P] [US3] Optional: consume `has_map_image` in `frontend/src/pages/MapPage.tsx` placeholder state instead of failed image load only

**Checkpoint**: Fresh instance without map file opens Relações first; upload map → `/` shows map again

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Env docs, deploy-2 migration gate, version 0.12.0, validation

- [x] T025 [P] Document `SISTEMA` and `MODULOS_ATIVOS` semantics in `.env.example` and `README.md`
- [x] T026 [P] Add deploy-2 migration gate in `backend/app/database.py` (drop legacy `npc.fadiga` only when column exists — document manual prod validation before enable)
- [x] T027 [P] Add `[0.12.0]` changelog entry for v2 Frente A in `CHANGELOG.md`
- [x] T028 [P] Bump version to **0.12.0** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T029 Run full `specs/077-sistema-modulos/quickstart.md`
- [x] T030 Run `cd frontend && npx tsc --noEmit`
- [x] T031 Set feature status to Implemented in `specs/077-sistema-modulos/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational (**blocks** all stories) → US1 + US2 (overlap) → US3 → Polish
- US2 widget tasks need T017 registry + T018 config wired (US1)
- US3 needs T014 hook + T010 config API (Foundational)

### User Story Dependencies

- **US1**: Needs Foundational T003–T016, T017–T018
- **US2**: Needs US1 API filter/sanitize (T015–T016) + T019–T021
- **US3**: Needs Foundational config only (can parallel US2 after T014)

### Parallel Opportunities

- T001 ∥ T002
- T012 ∥ T013 ∥ T011 (after T010)
- T019 ∥ T022 (after T017)
- T024 ∥ T021
- T025 ∥ T026 ∥ T027 ∥ T028

---

## Parallel Example: Foundational

```bash
Task: "InstanceConfig types (T012)"
Task: "fetchInstanceConfig API client (T013)"
# After T010 router exists:
Task: "useInstanceConfig hook (T014)"
```

---

## Parallel Example: User Story 2

```bash
Task: "FadigaWidget component (T019)"
Task: "Seed demo fadiga values (T022)"
# Then:
Task: "PersonagemFormDialog module slots (T020)"
Task: "RelacoesPage extensoes_mecanica CRUD (T021)"
```

---

## Implementation Strategy

### MVP (minimum shippable Frente A)

1. Foundational T003–T014
2. US1 config visibility + API filter (T015–T018)
3. US2 FadigaWidget + persist (T019–T021)
4. US3 landing (T023)
5. Polish 0.12.0 + quickstart

### Deploy strategy

1. **Deploy 1**: ship T008 copy migration + all code (legacy column retained)
2. **Manual validation** on production WFRP personagens
3. **Deploy 2**: enable T026 drop legacy column

### Notes

- Route planner fadiga (062–063) **unchanged** — not gated by module
- Breaking: none for existing personagem universal fields; `extensoes_mecanica` additive
- Deploy-2 migration disabled/guarded until prod sign-off
- No automated tests requested
