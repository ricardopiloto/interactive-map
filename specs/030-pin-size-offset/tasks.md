# Tasks: Tamanho e alinhamento dos pins

**Input**: Design documents from `/specs/030-pin-size-offset/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação via `quickstart.md` na fase Polish.

**Organization**: Duas user stories (P1 alinhamento; P2 tamanho móvel). Ambos tocam principalmente `CampaignMap.css`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline CSS e contratos 030

- [x] T001 Confirm current pin/party sizing and margin offsets in `frontend/src/components/map/CampaignMap.css` (`.campaign-map__pin`, `.campaign-map__party--bandeira`, `.campaign-map__party--brasao`)
- [x] T002 [P] Confirm `MOBILE_BP = 800` in `frontend/src/pages/MapPage.tsx` and existing `@media (max-width: 720px)` only covers controls/legend in `CampaignMap.css`
- [x] T003 [P] Skim `specs/030-pin-size-offset/contracts/ui-pin-size-offset.md` and `specs/030-pin-size-offset/research.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Variáveis CSS e breakpoint móvel partilhados para âncora + tamanho

**⚠️ CRITICAL**: Completar antes das user stories (US2 depende das vars; US1 usa a mesma âncora)

- [x] T004 Introduce CSS size variables (e.g. `--pin-size`, party width/height) for desktop baseline on `.campaign-map__pin` / `.campaign-map__party*` in `frontend/src/components/map/CampaignMap.css`
- [x] T005 Add `@media (max-width: 799px)` block scoped for pin/party size overrides (aligned to `MOBILE_BP`) in `frontend/src/components/map/CampaignMap.css` — leave size values at desktop until US2 if preferred, but establish the breakpoint hook

**Checkpoint**: Variáveis e media query existem; aparência desktop ainda aceitável

---

## Phase 3: User Story 1 — Pins alinhados em qualquer viewport (Priority: P1) 🎯 MVP

**Goal**: Ponta/âncora dos pins de local e do grupo coincidem com `(x,y)` sem desvio lateral, em desktop e móvel

**Independent Test**: Viewport ≥800 e &lt;800 — ponta do pin no ponto do mapa; reposicionar Local no GM assenta no clique; grupo sem desvio lateral

### Implementation for User Story 1

- [x] T006 [US1] Re-anchor `.campaign-map__pin` so the tip sits on `left`/`top` (translate + rotate + `transform-origin`, or recalculated margins) in `frontend/src/components/map/CampaignMap.css`
- [x] T007 [US1] Fix `--selected` / `--hovered` scale transforms to keep tip anchored (no lateral drift) in `frontend/src/components/map/CampaignMap.css`
- [x] T008 [US1] Re-anchor `.campaign-map__party--bandeira` and `.campaign-map__party--brasao` to the map point without lateral offset in `frontend/src/components/map/CampaignMap.css`
- [x] T009 [US1] Spot-check that `left`/`top` percent styles in `frontend/src/components/map/CampaignMap.tsx` remain unchanged (coords presentation only)

**Checkpoint**: US1 testável — SC-001, SC-004, FR-001, FR-002, FR-006; quickstart A/B/E

---

## Phase 4: User Story 2 — Pins um pouco menores no telemóvel (Priority: P2)

**Goal**: Em viewport &lt;800px, pins ~15–25% menores; grupo proporcional; toque preservado; alinhamento US1 intacto

**Independent Test**: Comparar desktop vs móvel — redução ~15–25%; toques OK; sem novo desvio lateral

### Implementation for User Story 2

- [x] T010 [US2] Set mobile `--pin-size` (≈19–20px from 24px baseline) inside `@media (max-width: 799px)` in `frontend/src/components/map/CampaignMap.css`
- [x] T011 [US2] Scale party bandeira/brasao dimensions ~same ratio in the same media query in `frontend/src/components/map/CampaignMap.css`
- [x] T012 [US2] Ensure mobile size changes keep tip/anchor math in sync (vars drive margins/transforms) in `frontend/src/components/map/CampaignMap.css`
- [x] T013 [US2] Confirm legend miniatures need no mandatory shrink (FR-008) in `frontend/src/components/map/CampaignMap.css`

**Checkpoint**: US2 testável — SC-002, SC-003, FR-003–FR-005; quickstart C/D

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validação end-to-end

- [x] T014 Run scenarios A–F from `specs/030-pin-size-offset/quickstart.md`; adjust only `CampaignMap.css` if needed
- [x] T015 [P] Confirm digitizer nodes untouched in `frontend/src/components/gm/RouteDigitizer.css` / `RouteDigitizerView.tsx` (out of scope)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T004–T005)** → **US1 (MVP)** → **US2** → **Polish**
- US2 depends on US1 âncora + vars (mesmo ficheiro CSS — sequencial)

### User Story Dependencies

- **US1**: Após foundational — alinhamento em todos os viewports
- **US2**: Após US1 — tamanho móvel sem partir âncora

### Parallel Opportunities

- T001–T003 setup
- T015 polish ∥ revisão visual T014
- Dentro de US1, T006–T008 tocam o mesmo ficheiro → **não** paralelizar (sequencial)

---

## Parallel Example: After setup

```bash
Task: "Skim ui-pin-size-offset.md and research.md"
Task: "Confirm MOBILE_BP vs existing 720px media in CampaignMap.css"
```

---

## Implementation Strategy

### MVP First (US1)

1. T004–T005 vars + breakpoint
2. T006–T009 realinhar pins + grupo
3. Validar quickstart A/B/E
4. T010–T013 tamanho móvel
5. T014–T015 polish

### Incremental Delivery

1. Foundational: CSS vars + media hook
2. US1: alinhamento (MVP)
3. US2: redução móvel
4. Polish: quickstart

---

## Notes

- Sem migration / API
- Breakpoint pins: `max-width: 799px` (não 720px dos controles)
- Redução alvo ~20% (faixa 15–25%)
