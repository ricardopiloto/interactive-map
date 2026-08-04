# Tasks: Marcadores menores com tamanho fixo no zoom

**Input**: Design documents from `/specs/038-fixed-marker-size/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) reduzir tamanho base pins/nós/grupo; US2 (P1) counter-scale para tamanho de ecrã estável no zoom; US3 (P2) ênfase seleccionado/hover e usabilidade.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 / US3 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e API de zoom do transform

- [X] T001 Skim `specs/038-fixed-marker-size/contracts/ui-fixed-marker-size.md` and `research.md` (counter-scale `--map-zoom`; base ~0.775×; selected scale on new base)
- [X] T002 [P] Confirm pin/party/`__wp` sizes and `TransformWrapper` usage in `frontend/src/components/map/CampaignMap.tsx`, `CampaignMap.css`, `frontend/src/components/gm/RouteDigitizerView.tsx`, `RouteDigitizer.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Expor escala de zoom como CSS variable nos dois mapas

**⚠️ CRITICAL**: Completar antes das stories de tamanho/counter-scale

- [X] T003 Wire zoom → CSS `--map-zoom` on campaign map stage (via `onTransformed` / transform effect) in `frontend/src/components/map/CampaignMap.tsx`
- [X] T004 [P] Wire zoom → CSS `--map-zoom` on digitizer stage in `frontend/src/components/gm/RouteDigitizerView.tsx`

**Checkpoint**: Em DevTools, `--map-zoom` muda ao fazer zoom em ambos os ecrãs

---

## Phase 3: User Story 1 — Pins e nós ocupam menos ecrã (Priority: P1) 🎯 MVP

**Goal**: Dimensões base ~≤60% área (≈0.775 linear); âncoras tip/centro correctas

**Independent Test**: Zoom 1 — pins ~18px, nós ~10–11px; mapa mais visível à volta

### Implementation for User Story 1

- [X] T005 [US1] Shrink local pin base + tip margins (~18×18) in `frontend/src/components/map/CampaignMap.css` (FR-001, SC-001)
- [X] T006 [P] [US1] Shrink party (bandeira/brasao) base + margins proportionally in `frontend/src/components/map/CampaignMap.css` (FR-002)
- [X] T007 [P] [US1] Shrink `.route-digitizer__wp` base + center margins in `frontend/src/components/gm/RouteDigitizer.css` (FR-003, SC-002)
- [X] T008 [P] [US1] Optionally shrink legend pin/party icons for visual harmony in `frontend/src/components/map/CampaignMap.css` (non-blocking)

**Checkpoint**: SC-001–002; quickstart A, D (tamanho), E (tamanho)

---

## Phase 4: User Story 2 — Tamanho estável ao fazer zoom (Priority: P1)

**Goal**: Counter-scale pins/party/`__wp` com `1/--map-zoom` para largura de ecrã estável

**Independent Test**: Medir pin/nó em min vs max zoom — Δ &lt; 10%; alinhamento no mapa OK

### Implementation for User Story 2

- [X] T009 [US2] Apply counter-scale to `.campaign-map__pin` (compose with `rotate(-45deg)`) using `--map-zoom` in `frontend/src/components/map/CampaignMap.css` (FR-004, FR-005)
- [X] T010 [P] [US2] Apply counter-scale to `.campaign-map__party` variants in `frontend/src/components/map/CampaignMap.css` (FR-004)
- [X] T011 [P] [US2] Apply counter-scale to `.route-digitizer__wp` in `frontend/src/components/gm/RouteDigitizer.css` (FR-004, FR-009)
- [X] T012 [US2] Verify pin tip / wp center still track map features after counter-scale in `CampaignMap` + digitizer (FR-005)

**Checkpoint**: SC-003, SC-005; quickstart B, E (zoom)

---

## Phase 5: User Story 3 — Seleccionar e distinguir estado (Priority: P2)

**Goal**: Hover/selected com aumento perceptível no base novo; clique utilizável

**Independent Test**: Hover/select pin; activo no digitizer; 5 cliques bem-sucedidos

### Implementation for User Story 3

- [X] T013 [US3] Rebase selected/hover transforms to `scale(calc(1.2 / var(--map-zoom)))` / `1.3` (screen-relative emphasis) in `frontend/src/components/map/CampaignMap.css` (FR-006, FR-010)
- [X] T014 [US3] Keep digitizer `.is-active` distinguishable (color/ring and/or modest screen-relative scale) in `frontend/src/components/gm/RouteDigitizer.css` (FR-006)
- [X] T015 [US3] Spot-check click/touch targets remain usable after shrink + counter-scale in `CampaignMap` / digitizer (FR-007, SC-004)

**Checkpoint**: SC-004; quickstart C, F

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart e changelog

- [X] T016 Run scenarios A–F from `specs/038-fixed-marker-size/quickstart.md`; fix only map/digitizer marker files if needed
- [X] T017 [P] Note change in `CHANGELOG.md` (Fixed/Changed: pins e nós menores com tamanho fixo no zoom)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003–T004)** → **US1** (pode começar CSS base em paralelo após T002, mas counter-scale precisa de `--map-zoom`)
- **US2** depende de T003–T004 + preferencialmente T005–T007
- **US3** depende de US2 transforms
- **Polish** no fim

### User Story Dependencies

- **US1 (P1)**: MVP visual mais pequeno (mesmo sem zoom fixo ainda incompleto)
- **US2 (P1)**: Completa o pedido “independente do zoom”
- **US3 (P2)**: Ênfase e usabilidade

### Parallel Opportunities

- T001 ∥ T002
- T003 ∥ T004
- T005 ∥ T006 ∥ T007 ∥ T008
- T009 ∥ T010 ∥ T011 (ficheiros CSS distintos mapa vs digitizer; pin vs party no mesmo ficheiro — sequencial se conflitar)
- T016 ∥ T017 após implementação

---

## Parallel Example: After T003–T004

```bash
Task: "Shrink pin + party in CampaignMap.css"
Task: "Shrink __wp in RouteDigitizer.css"
```

---

## Implementation Strategy

### MVP First (US1 + zoom wire)

1. T001–T004 setup + `--map-zoom`
2. T005–T007 shrink base
3. T009–T011 counter-scale
4. Validate B/E
5. T013–T015 selected/hover
6. T016–T017 polish

### Incremental Delivery

1. Foundational: zoom CSS var
2. US1: smaller markers
3. US2: fixed screen size
4. US3: emphasis + usability
5. Polish

---

## Notes

- Compose transforms carefully: rotate + counter-scale + emphasis
- Do not change persisted coordinates
- Route overlay polylines out of marker scope
- Digitizer in scope (FR-009)
