# Tasks: Hover no menu mostra conexões

**Input**: Design documents from `/specs/020-menu-hover-connections/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação visual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) linhas no hover sem seleção; US2 (P2) seleção manda; US3 (P3) gestos/regressão. Alteração principal em `CampaignMap.tsx`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 / US2 / US3 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar wiring e contrato

- [x] T001 Confirm `hoveredLocalId` and `selectedLocalId` are passed into `frontend/src/components/map/CampaignMap.tsx` from `frontend/src/pages/MapPage.tsx`, and that `SideMenu` / `LocalAdminList` call `onLocalHover` per `specs/020-menu-hover-connections/plan.md`
- [x] T002 [P] Skim `specs/020-menu-hover-connections/contracts/ui-menu-hover-connections.md` and `research.md` (`connectionOriginId = selected ?? hovered` only when selected is null)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Baseline atual — nenhuma infra nova

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 Note current overlay in `frontend/src/components/map/CampaignMap.tsx` draws only when `selectedLocalId != null` (017); target is selected-first, else hovered, for line origin

**Checkpoint**: Regra de origem clara antes de codar

---

## Phase 3: User Story 1 — Pré-visualizar rotas ao percorrer a lista (Priority: P1) 🎯 MVP

**Goal**: Sem seleção, hover na aba Locais (e lista GM via mesmo state) mostra linhas de saída do local hovered

**Independent Test**: Sem pin aberto; hover A com saídas → linhas A; leave → some; sem pan/zoom

### Implementation for User Story 1

- [x] T004 [US1] Change connection overlay origin in `frontend/src/components/map/CampaignMap.tsx` to use `selectedLocalId` when set, otherwise `hoveredLocalId`, reusing existing SVG/`saida_ids` drawing (017/019 styles unchanged)
- [x] T005 [US1] Ensure mouse leave clears lines when nothing is selected (via existing `onLocalHover(null)` → `hoveredLocalId`) in `frontend/src/components/map/CampaignMap.tsx` / `frontend/src/pages/MapPage.tsx`
- [x] T006 [US1] Verify player Locais hover path: `frontend/src/components/sidebar/SideMenu.tsx` still sets hover via `onLocalHover` and MapPage wires it (no new prop unless missing)
- [x] T007 [US1] Verify GM locais list path: `frontend/src/components/admin/LocalAdminList.tsx` still sets the same `hoveredLocalId` via MapPage (paridade; fix wiring only if broken)

**Checkpoint**: US1 testável — hover sem seleção desenha linhas

---

## Phase 4: User Story 2 — Seleção manda (Priority: P2)

**Goal**: Com local selecionado, hover só destaca pin; linhas ficam as da seleção

**Independent Test**: Selecionar A; hover B → linhas A + pin B destacado

### Implementation for User Story 2

- [x] T008 [US2] Confirm `selectedLocalId` takes precedence over `hoveredLocalId` for line drawing in `frontend/src/components/map/CampaignMap.tsx` (hover must not swap lines while selected)
- [x] T009 [US2] Confirm pin hover highlight still applies when selected ≠ hovered in `frontend/src/components/map/CampaignMap.tsx` (class `--hovered` independent of connection origin)

**Checkpoint**: US2 testável — seleção não é sobrescrita por hover

---

## Phase 5: User Story 3 — Clique e gestos intactos (Priority: P3)

**Goal**: Clique/foco 015–016, estilo 019 e cadastro 017 sem regressão

**Independent Test**: Hover vários → clicar um → seleção e linhas corretas; pan/zoom no hover ainda não disparam

### Implementation for User Story 3

- [x] T010 [US3] Spot-check click-to-select / pin focus paths remain unchanged in `frontend/src/pages/MapPage.tsx` (no `focusRequest` on hover)
- [x] T011 [US3] Confirm connection line CSS class still `.campaign-map__connection-line` in `frontend/src/components/map/CampaignMap.css` (no restyle)

**Checkpoint**: Sem regressão de gestos/estilo

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação quickstart

- [x] T012 Run scenarios A–E from `specs/020-menu-hover-connections/quickstart.md` and fix only connection-origin / wiring issues in `CampaignMap.tsx` / `MapPage.tsx` if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US1** → **US2** → **US3** → **Polish**
- MVP = Phase 3 (US1); US2 is mostly verification of the same expression

### User Story Dependencies

- **US1 (P1)**: Após Foundational
- **US2 (P2)**: Após US1 (mesma lógica `selected` first)
- **US3 (P3)**: Após US1; verificação de não-regressão

### Parallel Opportunities

- T001 ∥ T002 em Setup
- T006 ∥ T007 após T004 (arquivos diferentes)
- T010 ∥ T011 em US3

---

## Parallel Example: Setup

```bash
Task: "Confirm hovered/selected wiring MapPage → CampaignMap"
Task: "Skim ui-menu-hover-connections.md and research.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational
2. T004–T005 (origem das linhas)
3. Quick hover check sem seleção
4. Then US2/US3 + T012

### Incremental Delivery

1. US1: hover pré-visualiza
2. US2: seleção prevalece
3. US3 + polish: regressão / quickstart

---

## Notes

- Preferir só mudar a condição de origem em `CampaignMap.tsx`
- Expressão: `connectionOriginId = selectedLocalId ?? hoveredLocalId` com semântica “selected first” (selected null → hover)
- Não reintroduzir pan/zoom no hover (016)
