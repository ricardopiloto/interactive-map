# Tasks: Zoom Aumentado na Digitalização de Rotas

**Input**: Design documents from `/specs/022-digitizer-max-zoom/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: Três user stories (P1 precisão ao traçar; P2 mesmo teto em todos os modos; P3 afastamento). Alteração cirúrgica nas props do `TransformWrapper` em `RouteDigitizerView`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 / US2 / US3 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar ponto de mudança e contrato

- [x] T001 Confirm digitizer zoom props live on `TransformWrapper` in `frontend/src/components/gm/RouteDigitizerView.tsx` (`maxScale={4}`, `minScale={0.5}`, `wheel={{ step: 0.1 }}`) and campaign map reference remains `maxScale={4}` in `frontend/src/components/map/CampaignMap.tsx` per `specs/022-digitizer-max-zoom/plan.md`
- [x] T002 [P] Skim `specs/022-digitizer-max-zoom/contracts/ui-digitizer-zoom.md` and `specs/022-digitizer-max-zoom/research.md` (target `maxScale={12}`, wheel/pinch only, optional `wheel.step` ~0.2)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Baseline atual — nenhuma infra nova

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 Note current digitizer and campaign map share `maxScale={4}`; only `RouteDigitizerView.tsx` will change for this feature — do not alter `CampaignMap.tsx` max zoom

**Checkpoint**: Alvo claro — digitalização 12×; mapa jogador 4×; sem botões +/−

---

## Phase 3: User Story 1 — Traçar segmentos com precisão visual (Priority: P1) 🎯 MVP

**Goal**: Mestre aproxima até ~3× o teto do mapa normal na Rede de rotas e traça segmentos com realismo; escala km↔px intacta

**Independent Test**: Rede de rotas → Criar segmento → zoom além do antigo máximo → polilinha em traço fino → confirmar segmento

### Implementation for User Story 1

- [x] T004 [US1] Set `maxScale={12}` on `TransformWrapper` in `frontend/src/components/gm/RouteDigitizerView.tsx` (leave `minScale` unchanged)
- [x] T005 [US1] Set digitizer `wheel.step` to `0.2` (or tune per SC-002) in `frontend/src/components/gm/RouteDigitizerView.tsx` so max zoom is reachable in &lt;5s via wheel only
- [x] T006 [US1] Verify no new zoom +/- UI was added and create-segment flow still places polyline points / pans at high zoom in `frontend/src/components/gm/RouteDigitizerView.tsx`

**Checkpoint**: US1 testável — zoom ~12× via roda; segmento gravável; km não “inflados”

---

## Phase 4: User Story 2 — Zoom em todos os modos da digitalização (Priority: P2)

**Goal**: Mesmo teto em Criar nó, Criar segmento e Escala

**Independent Test**: Alternar modos; confirmar mesmo máximo e cliques usáveis no zoom alto

### Implementation for User Story 2

- [x] T007 [US2] Confirm all tool modes share the same `TransformWrapper` instance (no per-mode maxScale) in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T008 [US2] At max zoom, verify create-node and scale-point clicks still work without pan/click lock in `frontend/src/components/gm/RouteDigitizerView.tsx`

**Checkpoint**: US2 testável — SC-004 (100% dos modos, mesmo teto)

---

## Phase 5: User Story 3 — Voltar à visão geral (Priority: P3)

**Goal**: Afastar até o mínimo após trabalho em detalhe

**Independent Test**: Zoom máximo → afastar até `minScale` → rede/região ainda orientáveis

### Implementation for User Story 3

- [x] T009 [US3] Confirm `minScale={0.5}` (or existing min) remains unchanged on `TransformWrapper` in `frontend/src/components/gm/RouteDigitizerView.tsx` so overview zoom-out still works after raising maxScale

**Checkpoint**: US3 testável — overview após detalhe

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação quickstart + regressão mapa jogador

- [x] T010 Run all steps from `specs/022-digitizer-max-zoom/quickstart.md` and adjust only `frontend/src/components/gm/RouteDigitizerView.tsx` (`maxScale` / `wheel.step`) if SC-002 or tracing feel fails
- [x] T011 [P] Spot-check `frontend/src/components/map/CampaignMap.tsx` still has `maxScale={4}` (jogador inalterado)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US1** → **US2** → **US3** → **Polish**
- MVP = Phase 3 (US1); na prática T004–T005 já cobrem o teto compartilhado (US2/US3 quase verificação)

### User Story Dependencies

- **US1 (P1)**: Após Foundational; entrega o `maxScale` novo
- **US2 (P2)**: Depende de US1 (mesmo wrapper); verificação de modos
- **US3 (P3)**: Independente de US2 logicamente; só confirma `minScale` intacto após US1

### Parallel Opportunities

- T001 e T002 em Setup
- T010 e T011 em Polish (arquivos diferentes)
- T004–T006 sequenciais no mesmo arquivo (não marcar [P] entre si)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational
2. T004–T006 (`maxScale={12}`, `wheel.step`, sem UI nova)
3. Quick visual: zoom alto + criar segmento
4. Optionally US2/US3 checks + quickstart T010–T011

### Incremental Delivery

1. US1: teto 12× + step da roda
2. US2: confirmar modos
3. US3: confirmar minScale
4. Polish: quickstart + regressão CampaignMap

---

## Notes

- Um único arquivo de implementação esperado: `RouteDigitizerView.tsx`
- Não tocar backend, escala, ou `CampaignMap` maxScale
- Se SC-002 falhar, só subir `wheel.step` (ex.: 0.25), não adicionar botões
- Implemented 2026-08-03: `maxScale={12}`, `wheel.step={0.2}`, `minScale={0.5}` intacto; `CampaignMap` permanece `maxScale={4}`; DigControls existentes (+/−/reset) não foram alterados/ampliados
