# Tasks: Mapa (reconstrução estrutural)

**Input**: Design documents from `/specs/115-mapa-reconstrucao/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/map-panel.md](./contracts/map-panel.md), [contracts/map-controls.md](./contracts/map-controls.md), [quickstart.md](./quickstart.md)

**Tests**: OPTIONAL (UI polish — Constitution II MAY). Validation via [quickstart.md](./quickstart.md) + `tsc`. No pytest/API.

**Organization**: Por user story (US1–US3). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]…[US3]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: i18n keys for panel / FAB / filters

- [X] T001 [P] Add panel keys to `frontend/src/locales/pt-BR/mapa.json`: search placeholder, chips (`filterAll` / `filterLocais` / `filterPersonagens`), `backToList`, empty state, FAB aria, sheet expand/collapse aria
- [X] T002 [P] Mirror the same keys in `frontend/src/locales/en/mapa.json`

---

## Phase 2: Foundational — BLOCKS stories

**Purpose**: Floating panel shell + MapPage layout skeleton without SideMenu column

**⚠️ CRITICAL**: Complete before US detail work

- [X] T003 Create `frontend/src/components/map/MapSidePanel.tsx` + `MapSidePanel.css` per [contracts/map-panel.md](./contracts/map-panel.md) (desktop floating card; mobile sheet `data-expanded` + grabber; `head` / `children` slots)
- [X] T004 Refactor `frontend/src/pages/MapPage.tsx` + `MapPage.css` to full-bleed map stage (CampaignMap fills area under CodexHeader) with absolute-positioned `MapSidePanel` overlay — stop mounting `SideMenu` as the primary layout column
- [X] T005 Relocate GM-only entry points that lived in SideMenu tabs (`RouteDigitizerView` open, arco/grupo admin shortcuts if still needed) to compact Edit Mode controls on `MapPage.tsx` (toolbar/menu) **without** redesigning `RouteDigitizerView`

**Checkpoint**: Map is full-bleed; floating shell mounts; no flush 340px column

---

## Phase 3: User Story 1 — Painel flutuante unificado (P1) 🎯 MVP

**Goal**: Search + chips + list ↔ detail in the same panel; pin/list selection; no PinModal

**Independent Test**: [quickstart.md](./quickstart.md) desktop panel §§1–6; mobile sheet

### Implementation

- [X] T006 [US1] Implement list-mode head in `MapPage.tsx` / panel content: pill search field + chips Tudo/Locais/Personagens wired to `query` / `filter` state per [data-model.md](./data-model.md)
- [X] T007 [US1] Implement compact list rows (locais + personagens filtered client-side from `useCampaignData`) inside the panel scroll body on `MapPage.tsx` (or `MapPanelContent.tsx` if split)
- [X] T008 [US1] Add selection state `{ kind: 'local'|'npc', id } | null`; clicking a list row or map pin sets selection, expands mobile sheet, and switches panel to detail with «Voltar»
- [X] T009 [US1] Port PinModal detail content (nome, arco/meta, MarkdownSafe, linked NPCs) into panel detail mode on `MapPage.tsx`; remove `<PinModal>` usage from `MapPage.tsx`
- [X] T010 [US1] Wire `CampaignMap` `onSelectLocal` / hover / `focusRequest` so list→map focus still works without SideMenu
- [X] T011 [US1] Ensure mobile expand/collapse: grabber toggles `expanded`; search focus / selection forces expand per contract

**Checkpoint**: Same card for list and detail; no pin popover; floating geometry matches contract

---

## Phase 4: User Story 2 — Controles de mapa e FAB (P1)

**Goal**: Pill/circle zoom stack + stable pin scale + FAB+

**Independent Test**: [quickstart.md](./quickstart.md) zoom & FAB section

### Implementation

- [X] T012 [US2] Restyle `.campaign-map__controls` and control buttons in `frontend/src/components/map/CampaignMap.css` to translucent stack + circular/pill icon buttons (protótipo `map-canvas__controls`); keep bottom-right placement with safe-area / sheet offset
- [X] T013 [US2] Verify `--map-zoom` counter-scale on pins remains intact in `CampaignMap.tsx` / `.css` (no zoom/pan logic rewrite) — smoke after CSS change
- [X] T014 [US2] Add Edit Mode FAB «+» on `MapPage.tsx` + `MapPage.css` (bottom-left) that sets `placementMode` to `add-pin`; hide when Edit Mode off
- [X] T015 [US2] Confirm existing add-pin → `LocalFormDialog` draft flow still works after SideMenu removal in `MapPage.tsx`

**Checkpoint**: Zoom chrome matches prototype; FAB only in Edit Mode; pins stay stable

---

## Phase 5: User Story 3 — Detalhe e edição no painel (P2)

**Goal**: Edit/delete in detail when Edit Mode; filters respect visibility; npc detail + back

**Independent Test**: [quickstart.md](./quickstart.md) edit flows + i18n; anon vs GM

### Implementation

- [X] T016 [US3] Show edit/delete icon actions on local detail only when `useEditMode().enabled`; wire to existing `LocalFormDialog` / `ConfirmDialog` + admin API in `MapPage.tsx`
- [X] T017 [US3] Implement personagem/NPC detail view in panel (from filter list) with «Voltar»; do not require Relacoes navigation for basic read
- [X] T018 [US3] Confirm hidden locais/NPCs remain omitted for non-GM via existing `useCampaignData(asGm)` / public payloads (no new ACL)
- [X] T019 [US3] Preserve reposition / move-group / map upload behaviours previously triggered from SideMenu by reattaching them to detail actions or compact Edit Mode menu in `MapPage.tsx`

**Checkpoint**: Edit Mode actions work from panel; visibility unchanged

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Cleanup, docs, typecheck, visual accept

- [X] T020 Remove dead imports/usages of `SideMenu` / `PinModal` from `MapPage.tsx`; delete or leave orphan components unused (prefer delete only if nothing else imports them — check `RelacoesPage` etc. first)
- [X] T021 [P] Note feature in `CHANGELOG.md` (Unreleased) — floating map panel, pill zoom, FAB
- [X] T022 Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean
- [X] T023 Execute [quickstart.md](./quickstart.md) (desktop claro/escuro + móvel + zoom/FAB + i18n)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **US2 (4)** / **US3 (5)** → **Polish (6)**
- US2 can start after T004 (map full-bleed) in parallel with late US1 if controls CSS is independent
- US3 depends on US1 detail mode (T008–T009)

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | MVP floating panel |
| **US2** | Phase 2 (+ map stage) | Zoom CSS + FAB |
| **US3** | US1 detail | Edit actions on detail |

### Parallel Opportunities

```text
T001 || T002
T012 || T014 (after T004)
T021 || T022
```

### Parallel Example: User Story 1

```bash
Task: "List rows + filter chips"
Task: "Selection + detail shell"
# Then: remove PinModal, wire CampaignMap focus
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phases 1–2 (i18n + MapSidePanel + full-bleed MapPage)
2. Phase 3 US1 (list/detail, no PinModal)
3. **STOP** — visual check vs protótipo
4. Then US2 → US3 → Polish

### Incremental Delivery

1. Floating panel browse (US1)
2. Zoom chrome + FAB (US2)
3. Edit-from-detail (US3)
4. CHANGELOG + quickstart

### Suggested MVP scope

**US1 only**: floating panel list/detail replaces SideMenu+PinModal visually.

---

## Notes

- Do not import from `frontend-next/`; copy structure/CSS ideas only
- Do not rewrite `react-zoom-pan-pinch` wiring or drop `--map-zoom`
- Do not redesign `RouteDigitizerView`
