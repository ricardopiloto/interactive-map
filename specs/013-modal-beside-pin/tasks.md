# Tasks: Modal ao lado do pin

**Input**: Design documents from `/specs/013-modal-beside-pin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) painel ao lado do pin ao abrir o detalhe; US2 (P2) fechar/bloqueio/mapa-pin/mobile/GM intactos.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e âncora DOM existente (012)

- [x] T001 Skim `specs/013-modal-beside-pin/contracts/ui-pin-modal-beside.md` and `research.md` (âncora `#map-pin-{id}`, preferência direita, flip, recalc ~400ms, dim + mapa bloqueado, fallback centrado)
- [x] T002 [P] Locate `PinModal` / backdrop styles in `frontend/src/components/common/PinModal.tsx`, `frontend/src/components/common/PinModal.css`, and `.dialog-backdrop` in `frontend/src/styles/nocturne.css`; confirm pin ids in `frontend/src/components/map/CampaignMap.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Layout do backdrop do pin-modal para permitir posicionamento fixed — bloqueia US1

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 Override `.pin-modal-backdrop` layout in `frontend/src/components/common/PinModal.css` so the dialog is not forced to viewport center via grid `place-items` (backdrop still full-screen dim; panel positionable)
- [x] T004 [P] Add layout constants (gap ~12–16px, narrow breakpoint ~640px, recalc delay aligned to `FOCUS_ANIM_MS` ~400) in `frontend/src/components/common/PinModal.tsx` (or small colocated helper under `frontend/src/components/common/`)

**Checkpoint**: Backdrop still dims/blocks; panel can take explicit `top`/`left`

---

## Phase 3: User Story 1 — Ver o pin enquanto lê o detalhe (Priority: P1) 🎯 MVP

**Goal**: Painel de detalhe do jogador ancora ao lado do pin (preferência oposta ao menu / direita), sem cobrir o marcador

**Independent Test**: Desktop jogador; clicar local no menu; pin focado e visível; painel à direita do pin

### Implementation for User Story 1

- [x] T005 [US1] In `frontend/src/components/common/PinModal.tsx`, resolve `#map-pin-${local.id}` and compute preferred position to the **right** of the pin with gap (opposite left side menu)
- [x] T006 [US1] Apply `position: fixed` offsets to `.pin-modal` in `frontend/src/components/common/PinModal.tsx` / `PinModal.css` so the pin’s visual center stays outside the panel rect
- [x] T007 [US1] Implement flip-to-left (and vertical clamp) when the preferred side overflows the viewport in `frontend/src/components/common/PinModal.tsx` (FR-004)
- [x] T008 [US1] Recalculate position on mount (`useLayoutEffect`) and after ~400ms (post menu focus animation) in `frontend/src/components/common/PinModal.tsx`; also on `window` resize
- [x] T009 [US1] If pin element is missing, fall back to centered panel without throwing in `frontend/src/components/common/PinModal.tsx`

**Checkpoint**: SC-001 / SC-002 / SC-003 / FR-001 / FR-002 / FR-004

---

## Phase 4: User Story 2 — Fechar e interagir sem regressão (Priority: P2)

**Goal**: Backdrop/bloqueio/fechar preservados; mesmo posicionamento ao abrir pelo pin; fallback estreito; GM inalterado

**Independent Test**: Abrir pelo pin; tentar pan (bloqueado); fechar; estreitar viewport; GM sem PinModal

### Implementation for User Story 2

- [x] T010 [US2] Confirm backdrop dim + click-to-close + `stopPropagation` on panel still work in `frontend/src/components/common/PinModal.tsx` / `PinModal.css` (FR-006 / FR-007) — no map pan under open modal
- [x] T011 [US2] Ensure map-pin click path in `frontend/src/pages/MapPage.tsx` still opens the same `PinModal` so beside-pin layout applies (FR-003)
- [x] T012 [US2] Add narrow-viewport / insufficient-side-space fallback to centered layout in `frontend/src/components/common/PinModal.tsx` (FR-005)
- [x] T013 [US2] Confirm GM path in `frontend/src/pages/MapPage.tsx` still does not mount `PinModal` (`!isGm && selectedLocal`) (FR-008)

**Checkpoint**: SC-004 / FR-003 / FR-005 / FR-006 / FR-007 / FR-008

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressões e quickstart

- [x] T014 [P] Guard against layout thrash / missing rects (silent centered fallback) in `frontend/src/components/common/PinModal.tsx`
- [x] T015 Run scenarios A–G from `specs/013-modal-beside-pin/quickstart.md` and fix gaps in `PinModal.tsx` / `PinModal.css` / `MapPage.tsx` if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003–T004)** → **US1** → **US2** → **Polish**

### User Story Dependencies

- **US1**: Precisa de CSS do backdrop + medição/`fixed` + flip + recalc
- **US2**: Refina fallback/mobile e confirma regressões no mesmo `PinModal` / `MapPage`

### Parallel Opportunities

- T001 ∥ T002
- T003 ∥ T004
- T010 ∥ T011 ∥ T013 após US1 (arquivos distintos onde marcado; T010/T012 tocam PinModal — sequenciar com cuidado)
- T014 ∥ preparação de T015

---

## Parallel Example: User Story 1

```bash
# Sequencial no mesmo arquivo PinModal.tsx (evitar conflito):
Task: "T005 measure pin + prefer right"
Task: "T006 apply fixed offsets"
Task: "T007 flip + clamp"
Task: "T008 recalc timing"
Task: "T009 missing-pin fallback"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational
2. US1 (posicionar ao lado)
3. **STOP**: validar cenários A/B do quickstart
4. Seguir US2 + Polish

### Incremental Delivery

1. Setup + Foundational → painel posicionável
2. US1 → desktop menu: pin visível ao lado do painel (MVP)
3. US2 → pin-click, mobile fallback, regressões backdrop/GM
4. Polish → quickstart A–G

---

## Notes

- [P] = arquivos/trabalho paralelizável
- Sem testes automatizados nesta feature
- Âncora DOM já existe: `map-pin-{id}` (012)
- Não alterar fluxo GM nem API/dados
