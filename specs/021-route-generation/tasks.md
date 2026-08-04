# Tasks: Geração de rotas de viagem

**Input**: Design documents from `/specs/021-route-generation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) planejar no mapa jogador; US2 (P2) digitalização GM; US3 (P3) escala/ritmo. Foundational = modelos + CRUD admin + plan API (bloqueia as stories).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 / US2 / US3 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependência e contratos

- [x] T001 Add `networkx` dependency in `backend/pyproject.toml` and sync lockfile (`uv lock` / `uv sync`)
- [x] T002 [P] Skim `specs/021-route-generation/contracts/api-routes.md`, `contracts/ui-route-overlays.md`, and `research.md` (bidirectional edges, k≤5, ritmos, overlays separados de 017)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persistir rede, escala, serviço de plan e APIs — bloqueia UI jogador e digitizer

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 Create `Waypoint` model in `backend/app/models/waypoint.py` and export from `backend/app/models/__init__.py`
- [x] T004 [P] Create `RouteSegment` model (a/b FKs, tipo, pontos JSON, distancia_milhas, modificador) in `backend/app/models/route_segment.py` and export from `backend/app/models/__init__.py`
- [x] T005 [P] Create `MapScale` singleton model in `backend/app/models/map_scale.py` and export from `backend/app/models/__init__.py`
- [x] T006 Add Pydantic schemas for waypoints, segments, map-scale, and plan request/response in `backend/app/schemas/routes.py`
- [x] T007 Implement distance helper (polyline map-units × `miles_per_map_unit`) and pace/type modifiers in `backend/app/services/route_planner.py`
- [x] T008 Implement k-shortest simple paths (networkx, bidirectional edges, k≤5) returning ordered routes + geometry in `backend/app/services/route_planner.py`
- [x] T009 Add admin CRUD routers for waypoints and route-segments (compute distancia on write) in `backend/app/routers/admin/waypoints.py` and `backend/app/routers/admin/route_segments.py`; register in `backend/app/routers/admin/__init__.py`
- [x] T010 [P] Add admin GET/PUT map-scale in `backend/app/routers/admin/map_scale.py` (or same module) and register in `backend/app/routers/admin/__init__.py`
- [x] T011 Add public `GET /api/routes/plan` in `backend/app/routers/public/routes.py` and `GET /api/waypoints?linked_only=` in `backend/app/routers/public/waypoints.py`; register in `backend/app/routers/public/__init__.py`
- [x] T012 Ensure Local delete nulls `waypoint.local_id` (or safe cascade) in `backend/app/routers/admin/locais.py`
- [x] T013 [P] Add TypeScript types + `campaignApi`/`adminApi` helpers for plan, waypoints, segments, scale in `frontend/src/types/index.ts`, `frontend/src/api/campaign.ts`, and `frontend/src/api/admin.ts`
- [x] T014 Seed `MapScale` default + minimal sample graph (two paths between two linked Locals) in `backend/app/seed.py` for US1 testing without digitizer UI

**Checkpoint**: `GET /api/routes/plan` returns ordered rotas for seeded pair; admin CRUD works with Basic Auth; `create_all` cria tabelas

---

## Phase 3: User Story 1 — Planejar viagem (Priority: P1) 🎯 MVP

**Goal**: Painel De/Para/ritmo; lista ordenada; auto-seleção da mais rápida; overlay destacado + alternativas tracejadas; pins visíveis

**Independent Test**: Com seed A↔B (≥2 caminhos), abrir Calcular rota → calcular → lista + overlay; trocar seleção; local sem waypoint ausente do seletor

### Implementation for User Story 1

- [x] T015 [US1] Build `RoutePlannerPanel` (De/Para from linked locais, ritmo, calcular, lista, selected index default 0) in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T016 [US1] Build `RouteOverlay` (selected solid/emphasized; others dashed/discrete; `pointer-events: none`) in `frontend/src/components/routes/RouteOverlay.tsx` (+ CSS module or `CampaignMap.css`)
- [x] T017 [US1] Mount planner entry + overlay inside map stage (separate from `saida_ids` SVG) via `frontend/src/components/map/CampaignMap.tsx` and wire state in `frontend/src/pages/MapPage.tsx`
- [x] T018 [US1] Handle empty/error plan results with clear message and no broken map in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T019 [US1] Clear travel overlay when closing/clearing the planner in `frontend/src/pages/MapPage.tsx`

**Checkpoint**: SC-001 / SC-003 / FR-006–008; overlay ≠ 017

---

## Phase 4: User Story 2 — Digitalizar rede (Priority: P2)

**Goal**: Vista GM dedicada sem pins lore; criar nós/segmentos persistidos

**Independent Test**: Modo GM → Rede de rotas → criar nós + segmento → plan do jogador usa o novo segmento

### Implementation for User Story 2

- [x] T020 [US2] Implement `RouteDigitizerView` (map without lore pins; show waypoints/segments; click-to-create waypoint with optional nome/`local_id`) in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T021 [US2] Implement segment draw flow (endpoint → intermediate clicks → endpoint → tipo → save via admin API) in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T022 [US2] Add edit/delete for waypoints and segments with integrity warnings in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T023 [US2] Add GM entry/exit for digitizer mode (hide lore pins; restore on exit) in `frontend/src/pages/MapPage.tsx` and support mode flag in `frontend/src/components/map/CampaignMap.tsx` if needed
- [x] T024 [US2] Ensure unauthenticated users cannot reach digitizer writes (rely on admin API 401 + GM gate) in `frontend/src/pages/MapPage.tsx`

**Checkpoint**: SC-002 / SC-005 / FR-004–005

---

## Phase 5: User Story 3 — Escala e ritmo (Priority: P3)

**Goal**: Distâncias da escala; tempos mudam com ritmo/tipo na direção esperada

**Independent Test**: cauteloso vs arriscado no mesmo par; distância coerente com comprimento do traçado

### Implementation for User Story 3

- [x] T025 [US3] Verify/adjust pace constants and tipo modifiers so cauteloso tempo ≥ arriscado for same geometry in `backend/app/services/route_planner.py`
- [x] T026 [US3] Recalculate `distancia_milhas` on segment update and when map-scale changes (admin PUT scale refreshes or documents recompute) in `backend/app/routers/admin/route_segments.py` / `map_scale.py`
- [x] T027 [US3] Expose simple GM control or document seed for `miles_per_map_unit` (admin API already) — optional small UI in digitizer or GM panel in `frontend/src/components/gm/RouteDigitizerView.tsx` or MapPage

**Checkpoint**: SC-004 / FR-009–010

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Docs + quickstart A–E

- [x] T028 [P] Mention travel routes / digitizer / Calcular rota in `README.md` and `frontend/README.md`
- [x] T029 [P] Add `021-route-generation` to specs table in `README.md` (and set as active if desired)
- [x] T030 Run scenarios A–E from `specs/021-route-generation/quickstart.md` and fix gaps in backend/frontend files above
- [x] T031 Confirm narrative `saida_ids` overlay still works alongside travel overlay in `frontend/src/components/map/CampaignMap.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US1** → **US2** → **US3** → **Polish**
- MVP jogador = Foundational + **US1** (seed cobre dados)
- US2 desbloqueia digitalização real sem depender do seed

### User Story Dependencies

- **US1**: Precisa Foundational (plan API + seed)
- **US2**: Precisa Foundational (CRUD); independente de US1 UI
- **US3**: Após planner existir (Foundational); valida/ajusta constantes e escala

### Parallel Opportunities

- T003 ∥ T004 ∥ T005 (modelos)
- T009 ∥ T010 (routers admin)
- T015 ∥ T016 (painel vs overlay)
- T028 ∥ T029 (docs)

---

## Parallel Example: Foundational models

```bash
Task: "Create Waypoint model"
Task: "Create RouteSegment model"
Task: "Create MapScale model"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup + Foundational (incl. seed)
2. T015–T019 (painel + overlay)
3. Validar plan A→B no browser
4. Depois US2 digitizer + US3 + polish

### Incremental Delivery

1. API + seed → plan funciona via curl
2. US1 → jogador usa o mapa
3. US2 → GM digitaliza sem seed
4. US3 + docs

---

## Notes

- Overlay viagem ≠ SVG `saida_ids` (classes/estado separados)
- Segmentos bidirecionais no grafo em memória
- Auto-selecionar índice 0 após calcular
- Protótipo HTML de digitalização citado no PRD pode estar fora do repo — seguir contrato UI
