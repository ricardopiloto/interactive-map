# Tasks: Custo de viagem nas rotas

**Input**: Design documents from `/specs/031-route-travel-cost/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação via `quickstart.md` na fase Polish.

**Organization**: Três user stories (P1 custos Dentro/Fora; P1 velocidade opcional; P2 trilha). Backend planner partilhado antes das UIs.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 / US2 / US3 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline do calculador e contratos 031

- [X] T001 Confirm `plan_routes` / `build_graph` use required `velocidade_media_mph` and `TIPO_MOD` in `backend/app/services/route_planner.py`
- [X] T002 [P] Confirm `GET /api/routes/plan` defaults `velocidade_media_mph=4` in `backend/app/routers/public/routes.py` and FE sends it from `frontend/src/api/campaign.ts` / `RoutePlannerPanel.tsx`
- [X] T003 [P] Skim `specs/031-route-travel-cost/contracts/api-routes-plan-cost.md` and `specs/031-route-travel-cost/contracts/ui-route-planner-cost.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema + constantes de tarifa/velocidade + planner capaz de custos e modo tabela

**⚠️ CRITICAL**: Completar antes das user stories de UI

- [X] T004 Add `custo_dentro_bp` and `custo_fora_bp` to `RoutePlanItem` in `backend/app/schemas/routes.py`
- [X] T005 [P] Add `custo_dentro_bp` / `custo_fora_bp` to `RoutePlanItem` in `frontend/src/types/index.ts`
- [X] T006 Add cost tariff constants (estrada 2/1, rio 5/2, trilha 0/0) and absolute speed table (6 / 8 / 4.8) in `backend/app/services/route_planner.py`
- [X] T007 Refactor `build_graph` / `segment_speed` to support `velocidade_media_mph: float | None` (None → ABS speeds; V → V×edge_mod) in `backend/app/services/route_planner.py`
- [X] T008 Aggregate `custo_dentro_bp` / `custo_fora_bp` in `item_from_edges` (or equivalent) from edge distances × tariffs in `backend/app/services/route_planner.py`
- [X] T009 Make `velocidade_media_mph` optional on `GET /api/routes/plan` (omit = table mode; if present must be `gt=0`) in `backend/app/routers/public/routes.py`
- [X] T010 Update `plan_routes` signature to accept optional mph and pass through in `backend/app/services/route_planner.py`

**Checkpoint**: curl sem `velocidade_media_mph` devolve rotas com ambos os custos; com `mph=4` tempos mudam e custos iguais

---

## Phase 3: User Story 1 — Ambos os custos na lista (Priority: P1) 🎯 MVP

**Goal**: Cada rota na UI mostra Dentro e Fora em bp; lista continua mais rápida primeiro

**Independent Test**: Calcular rota → cada item com dois totais bp coerentes com milhas × tarifas

### Implementation for User Story 1

- [X] T011 [US1] Display `custo_dentro_bp` and `custo_fora_bp` on each result item in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [X] T012 [US1] Style cost lines if needed in `frontend/src/components/routes/RoutePlanner.css`
- [X] T013 [US1] Confirm list order / “mais rápida” on index 0 unchanged in `frontend/src/components/routes/RoutePlannerPanel.tsx`

**Checkpoint**: US1 — SC-001–SC-003, SC-006; FR-001–FR-007

---

## Phase 4: User Story 2 — Velocidade opcional (Priority: P1)

**Goal**: Campo velocidade vazio por omissão; omit param na API; override V com mods; validação ≤0

**Independent Test**: Vazio → tempos 6/8; preencher V → tempos mudam, bp iguais; ≤0 → erro sem calcular

### Implementation for User Story 2

- [X] T014 [US2] Make speed input optional (initial empty, placeholder) in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [X] T015 [US2] Update `campaignApi.planRoute` to omit `velocidade_media_mph` when unset in `frontend/src/api/campaign.ts`
- [X] T016 [US2] Wire `calcular()`: empty → omit; filled → require > 0 else show validation error in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [X] T017 [US2] Confirm ritmo Normal/Intenso still passed and `tempo_texto` works with both speed modes in `frontend/src/components/routes/RoutePlannerPanel.tsx`

**Checkpoint**: US2 — SC-004–SC-005; FR-008–FR-013

---

## Phase 5: User Story 3 — Trilha custo zero (Priority: P2)

**Goal**: Trilha não entra nos bp; tempo 6×0.8 ou V×0.8

**Independent Test**: Rota com trilha → bp só de estrada/rio; trilha 0 bp

### Implementation for User Story 3

- [X] T018 [US3] Verify trilha tariffs are 0 in cost aggregation in `backend/app/services/route_planner.py`
- [X] T019 [US3] Verify table-mode trilha speed 4.8 and override `V×0.8` in `backend/app/services/route_planner.py`
- [X] T020 [US3] Spot-check mixed trilha+estrada costs/times via quickstart or curl (no FE-only change unless labels needed)

**Checkpoint**: US3 — SC-007; FR-006; cenários US3

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart end-to-end

- [X] T021 Run scenarios A–D from `specs/031-route-travel-cost/quickstart.md`; fix only feature-scoped files if needed
- [X] T022 [P] Confirm invalid `velocidade_media_mph=0` returns 422 from `backend/app/routers/public/routes.py`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T004–T010)** → **US1** (custos na UI) → **US2** (velocidade opcional FE) → **US3** → **Polish**
- US1 pode usar API já com custos mesmo antes da UI de velocidade opcional (FE ainda pode enviar mph=4 até US2)
- US2 depende de T009–T010 (API opcional)
- US3 é sobretudo verificação do planner (T006–T008)

### User Story Dependencies

- **US1**: Após foundational (campos custo na resposta)
- **US2**: Após foundational (mph opcional); FE após ou com US1
- **US3**: Após foundational (tarifas/speeds trilha)

### Parallel Opportunities

- T001–T003 setup
- T004 ∥ T005 schemas FE/BE
- T011–T013 vs início T014 se API já estável
- T021 ∥ T022 polish

---

## Parallel Example: After foundational

```bash
Task: "Show custo_dentro_bp / custo_fora_bp in RoutePlannerPanel.tsx"
Task: "Add optional speed omit in campaign.ts"
```

---

## Implementation Strategy

### MVP First (US1 + foundational costs)

1. T004–T010 schema + planner custos + API
2. T011–T013 mostrar bp na lista
3. T014–T017 velocidade opcional
4. T018–T020 trilha
5. T021–T022 quickstart

### Incremental Delivery

1. Foundational: API devolve custos + modo tabela
2. US1: UI custos
3. US2: velocidade opcional
4. US3: confirmar trilha
5. Polish

---

## Notes

- Sem migration
- Remover default Query `4.0` — omitido = tabela 6/8
- Custos independentes da velocidade
