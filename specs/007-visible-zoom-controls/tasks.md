# Tasks: Controles de zoom sempre visíveis

**Input**: Design documents from `/specs/007-visible-zoom-controls/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: Duas user stories (P1 tela cheia/desktop; P2 mobile + barra inferior). Correção de layout CSS; markup mínimo se a cadeia de altura exigir wrapper.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar causa raiz e contrato de visibilidade

- [x] T001 Confirm height/overflow chain: `.map-page` (`100dvh`, `overflow: hidden`), `.map-page__main` (flex column), `.campaign-map` (`height: 100%`, `overflow: hidden`), and `.campaign-map__controls` (`position: absolute; bottom: 3.5rem`) in `frontend/src/pages/MapPage.css` and `frontend/src/components/map/CampaignMap.css`
- [x] T002 [P] Skim `specs/007-visible-zoom-controls/contracts/ui-zoom-controls-visibility.md` and `research.md` (limit map viewport with flex/min-height; keep MapControls outside TransformComponent)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cadeia de altura que limita o mapa à área útil — base para US1 e US2

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 Ensure `CampaignMap` sits in a flex-growing, height-bounded slot under `.map-page__main` (add wrapper class e.g. `map-page__map` in `frontend/src/pages/MapPage.tsx` if needed) with `flex: 1; min-height: 0; min-width: 0` in `frontend/src/pages/MapPage.css`
- [x] T004 Make `.campaign-map` fill that slot (`height: 100%` and/or `flex: 1; min-height: 0`) without growing past the visible main area in `frontend/src/components/map/CampaignMap.css`
- [x] T005 Confirm `MapControls` remains inside `TransformWrapper` but outside `TransformComponent` in `frontend/src/components/map/CampaignMap.tsx` so pan does not move chrome (FR-005); if the library wrapper is the wrong containing block, re-anchor `.campaign-map__controls` as a direct child of `.campaign-map` while keeping `useControls` working

**Checkpoint**: Box do mapa ≈ área útil do main; controles absolutos referem-se a esse box

---

## Phase 3: User Story 1 — Usar zoom em tela cheia (Priority: P1) 🎯 MVP

**Goal**: Em desktop fullscreen/maximizado, +, − e 1:1 (e botão Mapa em GM) ficam totalmente visíveis e clicáveis

**Independent Test**: F11 / tela cheia → botões 100% visíveis; sequência aproximar → afastar → 1:1 funciona sem redimensionar

### Implementation for User Story 1

- [x] T006 [US1] Tune `.campaign-map__controls` insets (`bottom` / `right`) in `frontend/src/components/map/CampaignMap.css` so the full control stack clears the legend and stays inside the visible map box on tall/fullscreen viewports
- [x] T007 [US1] Verify zoom +, −, 1:1 still call `useControls` correctly after layout changes in `frontend/src/components/map/CampaignMap.tsx` (FR-006)
- [x] T008 [US1] Verify GM “Mapa” replace button in the same control group remains fully visible with the map loaded in `frontend/src/components/map/CampaignMap.tsx` / `CampaignMap.css` (FR-004)

**Checkpoint**: SC-001 / SC-003 — fullscreen desktop OK

---

## Phase 4: User Story 2 — Controles acessíveis no layout mobile (Priority: P2)

**Goal**: Com barra inferior mobile, controles não ficam cobertos nem cortados

**Independent Test**: Viewport mobile + barra de abas → +, −, 1:1 totalmente visíveis e tocáveis

### Implementation for User Story 2

- [x] T009 [US2] Confirm `.map-page--mobile` grid (`1fr` + `auto` bottom nav) keeps the map row above `.map-page__bottom` in `frontend/src/pages/MapPage.css` so controls are not drawn under the tab bar (FR-002)
- [x] T010 [US2] Adjust mobile-safe control/legend spacing in `frontend/src/components/map/CampaignMap.css` (media query or shared insets) if short viewports still clip the control stack or fully obscure the legend
- [x] T011 [US2] Smoke-check landscape mobile: controls remain inside the map box in `CampaignMap.css` / layout from T003–T004

**Checkpoint**: SC-002 — mobile + barra OK

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressões e validação quickstart

- [x] T012 [P] Confirm legend Local/Grupo remains readable and is not fully covered by controls in `frontend/src/components/map/CampaignMap.css`
- [x] T013 Run scenarios A–F from `specs/007-visible-zoom-controls/quickstart.md` (fullscreen, resize, mobile, pan fixed chrome, GM Mapa, legend) and fix remaining clip issues in `MapPage.css` / `CampaignMap.css`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US1** → **US2** → **Polish**
- Foundational (altura do mapa) bloqueia ambas as stories; US2 reutiliza a mesma cadeia e só afina insets mobile

### User Story Dependencies

- **US1 (P1)**: Após Foundational — MVP fullscreen
- **US2 (P2)**: Após Foundational (idealmente após US1 insets) — mobile

### Within Each User Story

- US1: insets → smoke zoom → smoke GM Mapa
- US2: grid mobile → insets curtos → landscape

### Parallel Opportunities

- T001 ∥ T002 (Setup)
- T012 ∥ pode rodar junto com parte de T013 (legend vs E2E)
- T003 (MapPage) e inspeção T005 (CampaignMap.tsx) podem avançar em paralelo após Setup; T004 depende do slot existir

---

## Parallel Example: Foundational

```bash
# Após Setup:
Task: "Add flex map slot in MapPage.tsx + MapPage.css"
Task: "Confirm MapControls outside TransformComponent in CampaignMap.tsx"
# Depois:
Task: "Make .campaign-map fill the bounded slot in CampaignMap.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup T001–T002
2. Foundational T003–T005
3. US1 T006–T008
4. **STOP and VALIDATE**: F11 — controles visíveis + zoom OK

### Incremental Delivery

1. Setup + Foundational → viewport do mapa limitada
2. US1 → fullscreen desktop
3. US2 → mobile + barra
4. Polish → quickstart A–F

### Parallel Team Strategy

Feature pequena — um implementador sequencial; se dois: A fecha T003–T004/US1 enquanto B prepara media-query mobile (T010) após T004.

---

## Notes

- Preferir CSS/layout; evitar `position: fixed` nos controles
- Sem mudanças de backend/API
- MVP sugerido = Phase 3 (US1); entrega completa = US1 + US2
