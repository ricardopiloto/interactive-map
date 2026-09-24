# Tasks: Relações e Rota (reconstrução estrutural)

**Input**: Design documents from `/specs/116-relacoes-rota-reconstrucao/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/shared-floating-panel.md](./contracts/shared-floating-panel.md), [contracts/relacoes-panel.md](./contracts/relacoes-panel.md), [contracts/rota-panel.md](./contracts/rota-panel.md), [quickstart.md](./quickstart.md)

**Depends on**: Spec **115** `MapSidePanel` already in `frontend/src/components/map/MapSidePanel.tsx` — **reuse, do not fork**.

**Tests**: OPTIONAL (UI polish — Constitution II MAY). Validation via [quickstart.md](./quickstart.md) + `tsc`. No pytest/API.

**Organization**: Por user story (US1–US3). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]…[US3]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: i18n keys for Relacoes/Rota panel chrome

- [X] T001 [P] Add/confirm panel keys in `frontend/src/locales/pt-BR/relacoes.json`: `backToList`, list empty state, sheet expand/collapse aria (if not already covered), FAB/menu labels for add personagem/vínculo if missing
- [X] T002 [P] Mirror the same keys in `frontend/src/locales/en/relacoes.json`
- [X] T003 [P] Confirm Rota empty/hint/calculate strings exist in `frontend/src/locales/pt-BR/` + `en/` (mapa or comum / routePlanner namespaces already used by `RoutePlannerPanel`) — add only missing card/empty copy

---

## Phase 2: Foundational — BLOCKS stories

**Purpose**: Prove shared shell; page skeletons ready for content swap

**⚠️ CRITICAL**: Complete before US detail work

- [X] T004 Verify `frontend/src/components/map/MapSidePanel.tsx` (+ `.css`) matches [contracts/shared-floating-panel.md](./contracts/shared-floating-panel.md) (same breakpoints/geometry as Map); export stays shared — **no** `RelacoesSidePanel` / `RotaSidePanel` fork
- [X] T005 Refactor `frontend/src/pages/RelacoesPage.tsx` + `RelacoesPage.css` to full-bleed graph stage under header with absolute `MapSidePanel` overlay; stop mounting `RelacoesSideColumn` as layout column (may leave empty panel slots for US1)
- [X] T006 Refactor `frontend/src/pages/RotaPage.tsx` + `RotaPage.css` to full-bleed `CampaignMap` (or map stage) under header with absolute `MapSidePanel` overlay — replace minimal title+embedded planner shell

**Checkpoint**: Both pages mount MapSidePanel; no flush columns; GraphStage / map visible behind panel

---

## Phase 3: User Story 1 — Relações no painel flutuante (P1) 🎯 MVP

**Goal**: Search + filter chips + lista ↔ detalhe no mesmo painel; GraphStage sync; no side column / detail panel

**Independent Test**: [quickstart.md](./quickstart.md) Relações desktop §§1–7 + mobile

### Implementation

- [X] T007 [US1] Implement list-mode head in `RelacoesPage.tsx`: pill search + family/type filter chips wired to existing `query` / `activeTipos` (or equivalent) state per [data-model.md](./data-model.md) and [contracts/relacoes-panel.md](./contracts/relacoes-panel.md)
- [X] T008 [US1] Implement compact personagem list rows inside `MapSidePanel` body on `RelacoesPage.tsx` (avatar/initials, nome, papel/meta, status icon); empty i18n
- [X] T009 [US1] Wire selection: list click and `GraphStage` `onSelect` set `selectedId`, expand mobile sheet, switch panel to detail head («Voltar»)
- [X] T010 [US1] Port `RelacoesDetailPanel` content into panel detail mode on `RelacoesPage.tsx` (markdown, vínculos, status); remove `<RelacoesDetailPanel>` usage
- [X] T011 [US1] Confirm `GraphStage` focus layout remains (centre / inner / dimmed outer) after page chrome change — **no** rewrite of `graphLayout.ts` / layout engine; only page CSS if needed
- [X] T012 [US1] Ensure mobile expand/collapse parity with Map: grabber toggles `expanded`; search focus / selection forces expand
- [X] T013 [US1] Preserve `?personagem=` deep-link so it opens detail **in MapSidePanel** (not old detail panel) in `RelacoesPage.tsx`

**Checkpoint**: Same floating card for list/detail; GraphStage intact; no RelacoesSideColumn / RelacoesDetailPanel chrome

---

## Phase 4: User Story 2 — Rota no mesmo painel (P1)

**Goal**: Planner form + result cards in MapSidePanel; map highlight with campaign accent; keep 106 calculation

**Independent Test**: [quickstart.md](./quickstart.md) Rota desktop + mobile

### Implementation

- [X] T014 [US2] Refactor `frontend/src/components/routes/RoutePlannerPanel.tsx` to support panel slots (form → `head`, results → body) or extract presentational pieces consumable by `RotaPage.tsx` without duplicating plan API logic
- [X] T015 [US2] Mount planner form in `MapSidePanel` head on `RotaPage.tsx` (origin/destination, options, calculate, from===to hint) per [contracts/rota-panel.md](./contracts/rota-panel.md)
- [X] T016 [US2] Render plan results as clickable cards in panel body (time days+h, distance mi/km, overnight timeline) using existing formatters from `frontend/src/utils/routeFormat.ts`; empty/loading i18n
- [X] T017 [US2] Wire `plan` + `selectedIndex` from `RotaPage.tsx` into `CampaignMap` / `RouteOverlay` so selecting a card highlights that path
- [X] T018 [US2] Update selected-route stroke to use campaign accent (`--color-accent` or active genre accent token) in `frontend/src/components/map/CampaignMap.css` (and/or `RouteOverlay.tsx`); keep alt routes dimmed; do not remove fatigue day visuals if present
- [X] T019 [US2] MUST NOT change route calculation algorithm — keep existing `campaignApi` / planner call path used by `RoutePlannerPanel`

**Checkpoint**: Rota page = map + shared panel; cards drive accent highlight; 106 metrics intact

---

## Phase 5: User Story 3 — Edição e filtros sem cascas antigas (P2)

**Goal**: Edit Mode FAB/menu + drawers; filters sync edges; back to list

**Independent Test**: [quickstart.md](./quickstart.md) Relações edição + filter toggles

### Implementation

- [X] T020 [US3] Add Edit Mode FAB/menu on `RelacoesPage.tsx` (add personagem / add vínculo) opening existing `PersonagemFormDialog` / `VinculoFormDialog`; hide when Edit Mode off
- [X] T021 [US3] Show edit/delete on personagem detail only when Edit Mode enabled; wire to existing drawers + `ConfirmDialog` + admin API in `RelacoesPage.tsx`
- [X] T022 [US3] Keep family/type filter toggles in sync with `GraphStage` edge visibility (existing `activeTipos` behaviour); legend on stage optional but consistent with panel chips
- [X] T023 [US3] Confirm «Voltar» clears selection and returns to list mode in the same panel

**Checkpoint**: GM flows work without side column; filters still drive graph

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Cleanup canonical surface, docs, typecheck, visual accept

- [X] T024 Remove dead imports/usages of `RelacoesSideColumn` / `RelacoesDetailPanel` from `RelacoesPage.tsx`; delete components only if no other imports remain
- [X] T025 Remove or redirect residual Map-page route-tab / embedded `RoutePlannerPanel` in `frontend/src/pages/MapPage.tsx` so `/c/:slug/rota` is the canonical planner UX (per research §8)
- [X] T026 [P] Note feature in `CHANGELOG.md` (Unreleased) — Relacoes/Rota shared floating panel; route accent highlight
- [X] T027 Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean
- [X] T028 Execute [quickstart.md](./quickstart.md) (Relacoes + Rota, claro/escuro + móvel + i18n + accent highlight)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** and **US2 (4)** can proceed in parallel after T004–T006 → **US3 (5)** needs US1 selection/detail → **Polish (6)**
- US2 needs T006 (Rota skeleton); does not need US1 complete
- US3 depends on T009–T010 (detail mode)

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 (T005) | MVP Relacoes panel |
| **US2** | Phase 2 (T006) | Rota panel + map |
| **US3** | US1 detail | Edit FAB + filters polish |

### Parallel Opportunities

```text
T001 || T002 || T003
T005 || T006 (after T004)
US1 (T007–T013) || US2 (T014–T019) after foundational
T026 || T027
```

### Parallel Example: After foundational

```bash
# Agent A — Relacoes MVP
Task: "List + chips + selection + detail in MapSidePanel"

# Agent B — Rota MVP
Task: "Rehost planner in MapSidePanel + accent highlight"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phases 1–2 (i18n + verify MapSidePanel + Relacoes skeleton)
2. Phase 3 US1 (lista/detalhe; drop column + detail panel)
3. **STOP** — visual check vs protótipo RelacoesPage + Map panel
4. Then US2 → US3 → Polish

### Incremental Delivery

1. Relacoes floating panel (US1)
2. Rota floating panel + accent path (US2)
3. Edit Mode FAB/filters (US3)
4. MapPage route cleanup + CHANGELOG + quickstart

### Suggested MVP scope

**US1 only**: Relacoes uses shared MapSidePanel; GraphStage kept; no old column/detail chrome.

---

## Format Validation

- All tasks use `- [ ]`, sequential `T00N`, file paths, and `[USn]` on story phases only.
- No automated test tasks (UI polish MAY).
