# Tasks: Calculador de Rotas — Velocidade, Ritmo e Alternativas

**Input**: Design documents from `/specs/024-route-planner-speed/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação via `quickstart.md` na fase Polish.

**Organization**: Quatro user stories (US1 ritmo+velocidade; US2 alternativas; US3 resultado rico; US4 modificadores). Backend planner/API primeiro; depois FE panel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1–US4 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline 021 e contratos 024

- [x] T001 Skim `specs/024-route-planner-speed/contracts/api-routes-plan.md`, `specs/024-route-planner-speed/contracts/ui-route-planner.md`, and `specs/024-route-planner-speed/research.md` (ritmo h/dia, MPH editável, mods 1.4/0.8, MultiGraph, tempo_texto)
- [x] T002 [P] Confirm current planner uses `PACE_MPH` + `TIPO_MOD` 1.5/0.5 and simple `nx.Graph` in `backend/app/services/route_planner.py`; FE ritmo triad in `frontend/src/components/routes/RoutePlannerPanel.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contratos de ritmo/velocidade e DTO de tempo — bloqueiam todas as stories

**⚠️ CRITICAL**: Completar antes das user stories de UI/cálculo final

- [x] T003 Change `Ritmo` to `Literal["normal", "intenso"]` (remove cauteloso/arriscado) in `backend/app/schemas/routes.py`
- [x] T004 Extend `RoutePlanItem` with `tempo_dias`, `tempo_horas_resto`, `tempo_texto` in `backend/app/schemas/routes.py` per `specs/024-route-planner-speed/data-model.md`
- [x] T005 Add `HORAS_POR_DIA` map (`normal`→6, `intenso`→8) and `format_tempo_texto(tempo_horas, horas_por_dia)` helper in `backend/app/services/route_planner.py`
- [x] T006 Set `TIPO_MOD` to estrada `1.0`, rio `1.4`, trilha `0.8` in `backend/app/services/route_planner.py`
- [x] T007 Update `GET /api/routes/plan` to accept `ritmo` + optional `velocidade_media_mph: float = 4` (`gt=0`) and pass into planner in `backend/app/routers/public/routes.py`
- [x] T008 [P] Update `Ritmo` type and `RoutePlanItem` fields in `frontend/src/types/index.ts`
- [x] T009 [P] Update `campaignApi.planRoute` signature to pass `ritmo` + `velocidade_media_mph` query params in `frontend/src/api/campaign.ts`

**Checkpoint**: Schema/API/types alinhados; mods e horas/dia definidos

---

## Phase 3: User Story 1 — Ritmo e velocidade média (Priority: P1) 🎯 MVP

**Goal**: Calcular tempos com velocidade editável (default 4) e ritmo Normal/Intenso (6/8 h/dia); `tempo_texto` dias+horas

**Independent Test**: De/Para → Normal + 4 mi/h → “1 dia” em ~24 mi estrada; Intenso reduz calendário; mudar MPH altera tempo

### Implementation for User Story 1

- [x] T010 [US1] Refactor `build_graph` / `plan_routes` to take `velocidade_media_mph` + `ritmo` (hours/day), remove `PACE_MPH` edge weights, set edge `tempo = dist / (mph * mod)` in `backend/app/services/route_planner.py`
- [x] T011 [US1] Populate `tempo_dias`, `tempo_horas_resto`, `tempo_texto` on each `RoutePlanItem` using `format_tempo_texto` in `backend/app/services/route_planner.py`
- [x] T012 [US1] Replace ritmo options with Normal/Intenso and add velocidade média input (default 4, validate > 0) in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T013 [US1] Wire `calcular()` to send `velocidade_media_mph` and display `tempo_texto` (fallback if needed) in `frontend/src/components/routes/RoutePlannerPanel.tsx`

**Checkpoint**: US1 testável — SC-001/002; formulário completo

---

## Phase 4: User Story 4 — Modificadores por tipo (Priority: P1)

**Goal**: Rio ×1.4 e trilha ×0.8 aplicados por trecho; rotas mistas somam tempos

**Independent Test**: Mesma distância rio vs estrada → tempo rio ≈ estrada/1.4; trilha ≈ estrada/0.8

### Implementation for User Story 4

- [x] T014 [US4] Ensure `edge_mod` uses updated `TIPO_MOD` and optional `modificador_velocidade` override when building MultiGraph/Graph edges in `backend/app/services/route_planner.py`
- [x] T015 [US4] Verify path aggregation sums per-edge `tempo`/`distancia` and collects distinct `tipos` in order in `backend/app/services/route_planner.py`

**Checkpoint**: US4 testável — SC-004/005 (mods)

---

## Phase 5: User Story 2 — Alternativas e seleção (Priority: P1)

**Goal**: k-caminhos por tempo; MultiGraph para segmentos paralelos; auto-select #1; utilizador escolhe outras

**Independent Test**: ≥2 rotas → lista por tempo; #1 selecionada; mudar seleção atualiza mapa

### Implementation for User Story 2

- [x] T016 [US2] Switch `build_graph` to `nx.MultiGraph` keyed by segment id so parallel estrada/rio edges between the same waypoints are retained in `backend/app/services/route_planner.py`
- [x] T017 [US2] Run `nx.shortest_simple_paths(..., weight="tempo")` with `K_MAX=5` and return routes already ordered by march time in `backend/app/services/route_planner.py`
- [x] T018 [US2] Confirm `onPlanChange(res.rotas, 0)` auto-selects fastest and `onSelectIndex` still drives map overlay in `frontend/src/components/routes/RoutePlannerPanel.tsx` and `frontend/src/pages/MapPage.tsx`

**Checkpoint**: US2 testável — SC-006; alternativas paralelas visíveis quando existirem

---

## Phase 6: User Story 3 — Resultado rico (Priority: P2)

**Goal**: Cada linha: número, distância, tempo, tipo(s)

**Independent Test**: Após calcular, cada item mostra os quatro campos; tipos mistos listados

### Implementation for User Story 3

- [x] T019 [US3] Render route list as numbered items with distancia, `tempo_texto`, and tipos labels in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T020 [US3] Adjust styles for the richer result rows if needed in `frontend/src/components/routes/RoutePlanner.css`

**Checkpoint**: US3 testável — SC-007

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart + limpeza legado

- [x] T021 Grep and remove leftover `cauteloso`/`arriscado`/`PACE_MPH` references from backend/frontend (keep only if unused dead code fully deleted) across `backend/app/` and `frontend/src/`
- [x] T022 Run scenarios A–E from `specs/024-route-planner-speed/quickstart.md` and fix planner/panel only as needed
- [x] T023 [P] Spot-check invalid velocidade (≤0) and empty routes messaging in `frontend/src/components/routes/RoutePlannerPanel.tsx` / API 422

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US1** → **US4** → **US2** → **US3** → **Polish**
- MVP = Foundational + US1 (cálculo útil com Normal/Intenso + MPH); US4 mods já no foundational T006 mas verificação na Phase 4
- US2 depende do peso tempo estável (US1/US4)
- US3 é principalmente apresentação FE sobre dados já retornados

### User Story Dependencies

- **US1**: Após Foundational
- **US4**: Após T006/T010 (mods no grafo)
- **US2**: Após US1 pathfinding por tempo
- **US3**: Após campos de resposta + lista FE

### Parallel Opportunities

- T001 ∥ T002 (Setup)
- T008 ∥ T009 (FE types/API) enquanto T003–T007 no backend
- T019 ∥ T020 (UI)
- T021 e T023 com cuidado (mesmos dirs — preferir sequencial se conflito)

---

## Parallel Example: Foundational FE

```bash
Task: "Update Ritmo + RoutePlanItem in frontend/src/types/index.ts"
Task: "Update campaignApi.planRoute query params in frontend/src/api/campaign.ts"
```

---

## Implementation Strategy

### MVP First (US1)

1. Foundational schemas/API/types
2. T010–T013 planner + panel ritmo/velocidade/`tempo_texto`
3. Smoke 24 mi → 1 dia
4. Then US4 verify → US2 MultiGraph → US3 list polish → quickstart

### Incremental Delivery

1. US1: formulário + tempo dias/horas
2. US4: mods corretos
3. US2: alternativas por tempo + seleção
4. US3: lista rica
5. Polish: legado + quickstart

---

## Notes

- Breaking API: ritmo só `normal`|`intenso`; clientes antigos com cauteloso/arriscado quebram (aceitável nesta campanha)
- MultiGraph: ao ler edges no path, usar o edge data do caminho escolhido (seg_id)
- Não alterar digitalização nem MapScale nesta feature
- Implemented 2026-08-03: HORAS_POR_DIA 6/8; MPH query; TIPO_MOD 1.4/0.8; Graph k-shortest + parallel-edge variants (nx MultiGraph unsupported by shortest_simple_paths); tempo_texto; FE Normal/Intenso + velocidade
