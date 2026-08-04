# Tasks: Zoom Suave com a Roda do Mouse

**Input**: Design documents from `/specs/026-smooth-wheel-zoom/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação via `quickstart.md` na fase Polish.

**Organization**: Duas user stories (P1 mapa da campanha; P2 Rede de rotas). Só FE — prop `wheel.step` em dois `TransformWrapper`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline e contrato 026

- [x] T001 Confirm current `wheel={{ step: 0.1 }}` and `maxScale={4}` on `TransformWrapper` in `frontend/src/components/map/CampaignMap.tsx`
- [x] T002 [P] Confirm current `wheel={{ step: 0.2 }}` and `maxScale={12}` on `TransformWrapper` in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T003 [P] Skim `specs/026-smooth-wheel-zoom/contracts/ui-smooth-wheel-zoom.md` and `specs/026-smooth-wheel-zoom/research.md` (target step `0.01`; range 0.008–0.015; do not change +/− or maxScale)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Nenhuma infra partilhada obrigatória (YAGNI — sem constante partilhada)

**⚠️ CRITICAL**: Nada a implementar; seguir direto para as user stories

- [x] T004 Confirm decision: set literal `wheel={{ step: 0.01 }}` in each call site (no new shared util unless preferred) per `specs/026-smooth-wheel-zoom/plan.md`

**Checkpoint**: Pronto para alterar props por vista

---

## Phase 3: User Story 1 — Zoom suave no mapa da campanha (Priority: P1) 🎯 MVP

**Goal**: Roda do mapa com passos finos ≈ botões +/−; um tick não salta quase ao máximo

**Independent Test**: No mapa, um tick de scroll ≈ um clique em +; scroll contínuo 1→4 em ≤ 8 s; pan/pins OK

### Implementation for User Story 1

- [x] T005 [US1] Change `wheel={{ step: 0.1 }}` to `wheel={{ step: 0.01 }}` on `TransformWrapper` in `frontend/src/components/map/CampaignMap.tsx`
- [x] T006 [US1] Verify `minScale` / `maxScale={4}` and `zoomIn()`/`zoomOut()` calls remain unchanged in `frontend/src/components/map/CampaignMap.tsx`

**Checkpoint**: US1 testável — SC-001 / SC-002 / SC-005 no mapa; SC-003 mapa ≤ 8 s

---

## Phase 4: User Story 2 — Zoom suave na Rede de rotas (Priority: P2)

**Goal**: Mesma suavidade na digitalização; reverter step 0.2 da 022; ≤ ~15 s até maxScale 12

**Independent Test**: Rede de rotas: tick ≈ +/−; scroll 1→12 ≤ ~15 s; desenho/pan OK

### Implementation for User Story 2

- [x] T007 [P] [US2] Change `wheel={{ step: 0.2 }}` to `wheel={{ step: 0.01 }}` on `TransformWrapper` in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T008 [US2] Verify `minScale={0.5}` / `maxScale={12}` and `zoomIn()`/`zoomOut()` remain unchanged in `frontend/src/components/gm/RouteDigitizerView.tsx`

**Checkpoint**: US2 testável — SC-003 digitalização ≤ ~15 s; paridade tick≈clique

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validação quickstart + tunagem fina se necessário

- [x] T009 Run map + digitizer steps from `specs/026-smooth-wheel-zoom/quickstart.md`; if tick still too coarse/fine, tune only `wheel.step` within 0.008–0.015 in `CampaignMap.tsx` and/or `RouteDigitizerView.tsx` (keep both aligned unless hardware forces a split)
- [x] T010 [P] Confirm no accidental edits to backend, CSS pins, or `maxScale` values while reviewing the two component diffs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T004)** → **US1** → **US2** → **Polish**
- US1 e US2 tocam ficheiros diferentes → **T005 ∥ T007** após T004
- MVP = Phase 3 (US1)

### User Story Dependencies

- **US1**: Após Setup/T004; independente de US2
- **US2**: Após Setup/T004; independente de US1 (pode paralelizar)

### Parallel Opportunities

- T001 ∥ T002 ∥ T003
- T005 [US1] ∥ T007 [US2]
- T009 / T010 em sequência cuidadosa no mesmo quickstart

---

## Parallel Example: US1 + US2

```bash
Task: "Set wheel.step 0.01 in CampaignMap.tsx"
Task: "Set wheel.step 0.01 in RouteDigitizerView.tsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T004 confirmar baseline
2. T005–T006 mapa → smoke tick vs +
3. T007–T008 digitalização
4. T009–T010 quickstart + tunagem

### Incremental Delivery

1. US1: mapa suave
2. US2: Rede de rotas suave (substitui step 0.2 da 022)
3. Polish: quickstart; ajuste 0.008–0.015 se preciso

---

## Notes

- Sem mudanças de backend/API/CSS
- Fórmulas wheel (aditiva × deltaY) vs botão (exponencial) diferem — aceitar “mesma ordem de magnitude”
- Não reintroduzir `wheel.step: 0.2` na digitalização por causa do SC antigo da 022
- Implemented 2026-08-03: `wheel.step` → `0.01` em `CampaignMap` e `RouteDigitizerView`; maxScale e +/− intactos. Validação visual com roda fica para o utilizador (tunar 0.008–0.015 se necessário).
