# Tasks: Relationship Network

**Input**: Design documents from `/specs/066-relationship-network/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual QA via `quickstart.md` — no automated TDD suite requested.

**Organization**: US1 = explorar grafo (anéis + foco); US2 = filtrar/isolar/detalhe; US3 = nav Mapa ↔ Relações; US4 = GM CRUD personagens/vínculos.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: US1 / US2 / US3 / US4
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock design contracts and map touch points in the existing Codex

- [x] T001 Skim `specs/066-relationship-network/plan.md`, `research.md`, `data-model.md`, and `contracts/` (`api-personagens.md`, `api-vinculos.md`, `ui-relacoes.md`)
- [x] T002 [P] Confirm current NPC/map/GM surfaces: `backend/app/models/npc.py`, `backend/app/routers/public/npcs.py`, `backend/app/routers/admin/npcs.py`, `frontend/src/pages/MapPage.tsx`, `frontend/src/App.tsx`, `frontend/src/types/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Personagem + Vínculo backend, FE types/API clients, seed, and empty Relações shell with shared header

**⚠️ CRITICAL**: Complete before US1–US4 UI work depends on real data

- [x] T003 Add `tipo` (`pj`|`npc`) and `papel` fields to Personagem/NPC model in `backend/app/models/npc.py`; backfill via `_migrate_sqlite` ALTER in `backend/app/database.py` (default `tipo=npc`)
- [x] T004 [P] Create `Vinculo` model in `backend/app/models/vinculo.py` (canonical `personagem_a_id`/`personagem_b_id`, `tipo`, `nota`, `publico` default false); register in `backend/app/models/__init__.py`
- [x] T005 [P] Add schemas in `backend/app/schemas/personagem.py` and `backend/app/schemas/vinculo.py` per `contracts/api-personagens.md` and `contracts/api-vinculos.md`
- [x] T006 Implement public + admin Personagem routers in `backend/app/routers/public/personagens.py` and `backend/app/routers/admin/personagens.py` (CRUD; DELETE cascades vínculos); wire in router `__init__`; keep `/api/npcs` aliases if needed
- [x] T007 [P] Implement public + admin Vínculo routers in `backend/app/routers/public/vinculos.py` (only `publico=true`) and `backend/app/routers/admin/vinculos.py` (full list + CRUD, default `publico=false`)
- [x] T008 Extend `backend/app/seed.py` with ~4 PJs, ~7 NPCs, ~15 vínculos (mixed `publico`) per FR-013 / quickstart
- [x] T009 [P] Add FE types `Personagem`, `Vinculo`, enums in `frontend/src/types/index.ts`; update map NPC consumers to `tipo === 'npc'` where required
- [x] T010 [P] Add campaign/admin API helpers for personagens + vínculos in `frontend/src/api/campaign.ts` and `frontend/src/api/admin.ts`
- [x] T011 Create shared `frontend/src/components/layout/CodexHeader.tsx` (marca, Mapa | Relações, GM toggle; Relações GM actions slot)
- [x] T012 Add route `/relacoes` → stub `frontend/src/pages/RelacoesPage.tsx` in `frontend/src/App.tsx`; integrate `CodexHeader` on MapPage and RelacoesPage

**Checkpoint**: APIs + seed work; `/relacoes` loads empty shell with shared nav

---

## Phase 3: User Story 1 — Explorar quem conhece quem (Priority: P1) 🎯 MVP

**Goal**: Ring layout without lines; select → animate ~0.6s → lines only for role-visible edges; deselect restores clean rings

**Independent Test**: Quickstart scenarios 2 (player graph) — initial no lines; select animation then lines; private edges hidden for player; deselect cleans

### Implementation for User Story 1

- [x] T013 [US1] Build graph layout helpers (inner/outer rings from node box, spacing 180–380) in `frontend/src/components/relacoes/graphLayout.ts` (or equivalent under `relacoes/`)
- [x] T014 [US1] Implement `GraphStage` in `frontend/src/components/relacoes/GraphStage.tsx` (+ CSS): PJ/NPC nodes, morto styling, zoom/pan, session-only node drag
- [x] T015 [US1] Wire RelacoesPage to load personagens + role-appropriate vínculos (`campaign` vs `admin`) in `frontend/src/pages/RelacoesPage.tsx`
- [x] T016 [US1] Implement selection lifecycle in `GraphStage` / `RelacoesPage`: no lines until position animation ends; fade-in focus edges only; deselect via bg / same node (FR-004…FR-006)
- [x] T017 [US1] Draw SVG edges (colors/styles per tipo; conhecido dashed; labels default `foco`) behind discs in `frontend/src/components/relacoes/GraphStage.tsx`
- [x] T018 [US1] Smoke quickstart scenario 2 from `specs/066-relationship-network/quickstart.md`

**Checkpoint**: MVP — explore graph with public-edge filtering

---

## Phase 4: User Story 2 — Filtrar, isolar e inspecionar detalhe (Priority: P1)

**Goal**: Left column (search, chips, isoliar, legend) + detail panel with clickable vínculo list

**Independent Test**: Quickstart scenario 3

### Implementation for User Story 2

- [x] T019 [P] [US2] Implement left column `RelacoesSideColumn.tsx` in `frontend/src/components/relacoes/` (busca, chips de tipo, Isolar selecção, legenda)
- [x] T020 [P] [US2] Implement `RelacoesDetailPanel.tsx` in `frontend/src/components/relacoes/` (kicker, nome, retrato, status, facção, descrição, lista Vínculos; mobile bottom sheet)
- [x] T021 [US2] Connect filters + isolate to GraphStage visibility in `frontend/src/pages/RelacoesPage.tsx`
- [x] T022 [US2] Detail list click focuses other personagem; panel open recalculates stage width in `RelacoesPage` / `GraphStage`
- [x] T023 [US2] Smoke quickstart scenario 3 from `specs/066-relationship-network/quickstart.md`

**Checkpoint**: Search/filter/isolate/detail usable

---

## Phase 5: User Story 3 — Navegar Codex Mapa ↔ Relações (Priority: P1)

**Goal**: Shared header nav feels product-native; active state correct; round-trip &lt;3s perceived

**Independent Test**: Quickstart scenario 1

### Implementation for User Story 3

- [x] T024 [US3] Polish `CodexHeader` active nav (accent outline on Relações vs Mapa) in `frontend/src/components/layout/CodexHeader.tsx`
- [x] T025 [US3] Ensure MapPage uses shared header without duplicating old chrome; Relações has no map background in `frontend/src/pages/MapPage.tsx` / `RelacoesPage.tsx`
- [x] T026 [US3] Smoke quickstart scenario 1 from `specs/066-relationship-network/quickstart.md`

**Checkpoint**: Nav Mapa ↔ Relações solid

---

## Phase 6: User Story 4 — GM cria e edita personagens e vínculos (Priority: P2)

**Goal**: + Personagem / + Conexão; edit/remove from list and line click; cascade delete; shared portrait

**Independent Test**: Quickstart scenario 4 (+ API spot-check 5)

### Implementation for User Story 4

- [x] T027 [P] [US4] Personagem create/edit dialog in `frontend/src/components/relacoes/PersonagemFormDialog.tsx` (nome, tipo, papel, facção, descrição, retrato)
- [x] T028 [P] [US4] Vínculo create/edit dialog in `frontend/src/components/relacoes/VinculoFormDialog.tsx` (A, B, tipo, nota, público; create default público off)
- [x] T029 [US4] Wire header `+ Personagem` / `+ Conexão` and detail list Editar/Remover + line-click edit when `isGm` in `RelacoesPage.tsx` / `CodexHeader.tsx`
- [x] T030 [US4] Confirm DELETE personagem cascades vínculos and removes from map (admin API already); refresh graph + map data paths after delete in `RelacoesPage.tsx`
- [x] T031 [US4] Align map NPC admin/list with Personagem fields (`tipo`/`papel`) in `frontend/src/components/admin/NpcAdminList.tsx` (and related) so portrait/status stay single source
- [x] T032 [US4] Smoke quickstart scenarios 4–5 from `specs/066-relationship-network/quickstart.md`

**Checkpoint**: GM can grow the network; player never sees private edges

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Docs, version, full quickstart, empty/mobile edge cases

- [x] T033 [P] Empty state (zero personagens) and morto styling polish in `frontend/src/components/relacoes/`
- [x] T034 [P] Add CHANGELOG entry for Relationship Network in `CHANGELOG.md`
- [x] T035 [P] Bump version in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T036 Run full `specs/066-relationship-network/quickstart.md` scenarios 1–5
- [x] T037 Mark feature status Implemented in `specs/066-relationship-network/spec.md` if acceptance matches

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1** → **Phase 2** → **US1 (Phase 3)** → **US2 (Phase 4)** (filters need graph)
- **US3 (Phase 5)** can run after Phase 2 shell (parallel with late US1 polish) but easiest after header exists
- **US4 (Phase 6)** needs US1+US2 surfaces (detail list / lines) for edit entry points
- **Polish** last

### User story completion order

```text
Foundation → US1 (MVP graph) → US2 (filters/detail) → US3 (nav polish) → US4 (GM) → Polish
```

### Parallel opportunities

- T004 ‖ T005 after T003 started (vinculo model/schemas vs personagem schemas)
- T009 ‖ T010 (FE types vs API client)
- T019 ‖ T020 (side column vs detail panel)
- T027 ‖ T028 (personagem vs vínculo dialogs)
- T033 ‖ T034 ‖ T035 (polish docs/version)

### Independent tests (summary)

| Story | Independent test |
|-------|------------------|
| US1 | Select/deselect graph; lines after animation; player hides private edges |
| US2 | Search, chips, isoliar, detail list focus switch |
| US3 | Mapa ↔ Relações nav + active state |
| US4 | GM create/edit/delete; público default; cascade; shared portrait |

### MVP scope

**US1 only** (after Foundation): explore seeded graph as player with correct visibility and animation.

---

## Implementation Strategy

1. Ship Foundation (APIs + seed + `/relacoes` shell).
2. Deliver US1 MVP and validate quickstart §2.
3. Add US2 then US3 polish, then US4 GM flows.
4. Changelog/version + full quickstart before marking Implemented.

## Format validation

All tasks use `- [ ]`, sequential `T00N` IDs, optional `[P]`, story labels only on US phases, and concrete file paths.
