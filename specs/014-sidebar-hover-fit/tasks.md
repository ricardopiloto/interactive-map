# Tasks: Hover no item do menu e ajuste da busca

**Input**: Design documents from `/specs/014-sidebar-hover-fit/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) fundo sutil nos cartões Locais; US2 (P2) largura do campo de busca.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e markup atual do SideMenu

- [x] T001 Skim `specs/014-sidebar-hover-fit/contracts/ui-sidebar-hover-fit.md` and `research.md` (fundo sutil CSS nos cartões Locais; busca contida; pin hover intacto)
- [x] T002 [P] Locate Locais cards (`.side-menu__card-btn.card`) and search input (`.side-menu__search`) in `frontend/src/components/sidebar/SideMenu.tsx` and `frontend/src/components/sidebar/SideMenu.css`; note `.input { width: 100% }` in `frontend/src/styles/nocturne.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Garantir box model estável para o search sem quebrar `.input` global

**⚠️ CRITICAL**: Completar antes / em paralelo seguro com US1 se só CSS do search — preferir concluir box-sizing local antes de US2

- [x] T003 Ensure `.side-menu__search` (or a search wrapper) uses `box-sizing: border-box` and a stable width strategy in `frontend/src/components/sidebar/SideMenu.css` without changing global `.input` in `frontend/src/styles/nocturne.css`

**Checkpoint**: Base CSS pronta para hover e fit sem regressão global de forms

---

## Phase 3: User Story 1 — Feedback visual no item do menu (Priority: P1) 🎯 MVP

**Goal**: Cartões de local (modo jogador) mostram fundo sutil no `:hover`; pin highlight permanece

**Independent Test**: Aba Locais jogador; hover no cartão → tint; pin destaca; sem abrir modal

### Implementation for User Story 1

- [x] T004 [US1] Add subtle background tint on `:hover` for Locais cards (`.side-menu__card-btn.card` or Locais-only selector) in `frontend/src/components/sidebar/SideMenu.css` using Nocturne `color-mix` tokens (FR-001)
- [x] T005 [US1] Ensure hover styles do not change padding/scale in a way that shifts the list layout in `frontend/src/components/sidebar/SideMenu.css`
- [x] T006 [US1] Confirm `onMouseEnter` / `onMouseLeave` pin hover wiring remains unchanged in `frontend/src/components/sidebar/SideMenu.tsx` (FR-003 / FR-004)
- [x] T007 [US1] Scope hover tint to player Locais cards only (do not require NPC/GM admin hover) in `frontend/src/components/sidebar/SideMenu.css`

**Checkpoint**: SC-001 / SC-002 / SC-004 / FR-001–FR-004 / FR-007

---

## Phase 4: User Story 2 — Campo de busca alinhado (Priority: P2)

**Goal**: `.side-menu__search` não extravasa a largura do menu; filtro intacto

**Independent Test**: Desktop jogador; input alinhado às margens; digitar ainda filtra

### Implementation for User Story 2

- [x] T008 [US2] Fix search field width containment in `frontend/src/components/sidebar/SideMenu.css` (prefer padding wrapper or `width: 100%; margin: 0` inside padded parent — avoid fragile `calc` + margin overflow) (FR-005)
- [x] T009 [US2] If needed, wrap the search `<input>` in a padded container in `frontend/src/components/sidebar/SideMenu.tsx` so margins match header/body (`var(--space-4)`)
- [x] T010 [US2] Verify search still filters locais/NPCs via existing `query` / `onQueryChange` in `frontend/src/components/sidebar/SideMenu.tsx` (FR-006)
- [x] T011 [US2] Spot-check mobile overlay (`.side-menu--overlay`) so search remains contained in `frontend/src/components/sidebar/SideMenu.css`

**Checkpoint**: SC-003 / SC-004 / FR-005 / FR-006

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressões e quickstart

- [x] T012 [P] Optional `:focus-visible` tint aligned with hover for keyboard users on Locais cards in `frontend/src/components/sidebar/SideMenu.css` (non-blocking a11y polish)
- [x] T013 Run scenarios A–G from `specs/014-sidebar-hover-fit/quickstart.md` and fix gaps in `SideMenu.tsx` / `SideMenu.css`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003)** → **US1** e **US2** (podem ser paralelos após T003 se arquivos coordenados) → **Polish**

### User Story Dependencies

- **US1**: CSS hover nos cartões Locais; não depende de US2
- **US2**: Layout do search; não depende de US1 (mesmo `SideMenu.css` — sequenciar edições no arquivo)

### Parallel Opportunities

- T001 ∥ T002
- Após T003: T004–T007 (US1) vs T008–T011 (US2) em paralelo **só se** pessoas/arquivos distintos; no mesmo agente, fazer US1 depois US2 no `SideMenu.css`
- T012 ∥ preparação de T013

---

## Parallel Example: User Story 1

```bash
# Mesmo arquivo SideMenu.css — sequencial:
Task: "T004 hover tint"
Task: "T005 no layout shift"
Task: "T007 scope Locais only"
# SideMenu.tsx confirm:
Task: "T006 pin hover wiring unchanged"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational
2. US1 (fundo sutil)
3. **STOP**: validar A–D do quickstart
4. US2 + Polish

### Incremental Delivery

1. Setup + T003 → box model estável
2. US1 → hover nos cartões (MVP)
3. US2 → busca contida
4. Polish → quickstart A–G

---

## Notes

- [P] = paralelizável
- Sem testes automatizados
- Não alterar `CampaignMap` / `onLocalHover` além de confirmar intacto
- Não “corrigir” overflow só com `overflow-x: hidden` no menu
