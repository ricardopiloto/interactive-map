# Tasks: Cabeçalho e navegação (reconstrução)

**Input**: Design documents from `/specs/114-cabecalho-navegacao/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/chrome-layout.md](./contracts/chrome-layout.md), [contracts/routes.md](./contracts/routes.md), [quickstart.md](./quickstart.md)

**Tests**: OPTIONAL (UI polish — Constitution II MAY). Validation via [quickstart.md](./quickstart.md) + `tsc`. No pytest/API.

**Organization**: Por user story (US1–US3). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]…[US3]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: i18n keys for chrome strings

- [X] T001 [P] Add chrome keys to `frontend/src/locales/pt-BR/comum.json`: `nav.rota`, switcher (`campaignSwitcher.myCampaigns`, `campaignSwitcher.discover`, `campaignSwitcher.aria`), theme control aria if needed, edit-mode short labels if rewriting pill copy
- [X] T002 [P] Mirror the same keys in `frontend/src/locales/en/comum.json`

---

## Phase 2: Foundational — BLOCKS stories

**Purpose**: Shared theme control + tab path helpers before header rewrite

**⚠️ CRITICAL**: Complete before US work

- [X] T003 Create `frontend/src/components/layout/ThemeSelector.tsx` using `readThemePreference` / `setThemePreference` (Auto / Claro / Escuro), i18n labels from `comum.theme.*`
- [X] T004 [P] Add shared tab config helper (slug → paths Mapa/Relações/Rota/Sessões + active detection) in `frontend/src/components/layout/campaignNav.ts` (or colocated util) per [contracts/routes.md](./contracts/routes.md)
- [X] T005 Deduplicate theme: remove the three theme items from campaign-header path in `frontend/src/components/layout/UserMenu.tsx` **or** accept ThemeSelector as sole control on campaign chrome and keep theme in UserMenu only for Home/Painel — document choice in code comment; ensure theme remains reachable on Home/Painel

**Checkpoint**: ThemeSelector + nav helper ready; header can consume them

---

## Phase 3: User Story 1 — Cabeçalho alinhado ao protótipo (P1) 🎯 MVP

**Goal**: Three-zone header (left brand+placeholder for name, center tabs, right edit pill + theme + UserMenu); bottom nav visual parity; Edit Mode pill shell

**Independent Test**: [quickstart.md](./quickstart.md) desktop §§1–5 (layout + pill); mobile bottom bar structure

### Implementation

- [X] T006 [US1] Rewrite layout structure of `frontend/src/components/layout/CodexHeader.tsx`: `codex-header__left` (brand), `codex-header__tabs` (center), `codex-header__right` (edit + ThemeSelector + UserMenu + children); use nav helper for Mapa/Relações/Sessões (+ Rota stub link OK if US3 not done yet — prefer including Rota href even if page lands in US3)
- [X] T007 [US1] Restyle `frontend/src/components/layout/CodexHeader.css` to match [contracts/chrome-layout.md](./contracts/chrome-layout.md) / protótipo (~56px bar, centered tabs with underline, left cluster); breakpoint ~860px hide top tabs + brand
- [X] T008 [US1] Replace Edit Mode `.btn.btn-ghost` with pill/chip control (`--radius-full`, accent wash when `enabled`) still driven by `useEditMode()` in `CodexHeader.tsx` + CSS
- [X] T009 [US1] Mount `ThemeSelector` in header right in `CodexHeader.tsx`
- [X] T010 [US1] Align `frontend/src/components/layout/CampaignBottomNav.css` with protótipo tabbar (height, active accent, safe-area); keep Desktop hidden / mobile fixed
- [X] T011 [US1] Add Tabler icons to desktop tabs and bottom items in `CodexHeader.tsx` / `CampaignBottomNav.tsx` (Map, Users, Route, Book) without changing destinations

**Checkpoint**: Header looks like prototype zones; Edit Mode is a pill; theme visible on the right

---

## Phase 4: User Story 2 — Seletor de campanha (P1)

**Goal**: Campaign name is a switcher with Minhas campanhas / Descobrir outras

**Independent Test**: [quickstart.md](./quickstart.md) switcher behaviour; menu closes after navigate

### Implementation

- [X] T012 [US2] Implement campaign switcher UI in `CodexHeader.tsx` (button + dropdown): show `campaignName`, menu items → `/painel` and `/`, i18n keys from T001/T002; ellipsis + `title` for long names
- [X] T013 [US2] Style switcher + menu in `CodexHeader.css` (elevated panel, hover rows) per protótipo `campaign-bar__switcher`
- [X] T014 [US2] Ensure switcher omitted or inert when `campaignName` is missing; brand still links to `/`

**Checkpoint**: Name is no longer a dead `<span>`

---

## Phase 5: User Story 3 — Quatro abas + Rota mínima (P2)

**Goal**: Rota tab works; `showMapNav` / `canEdit` unchanged; bottom nav has same four destinations

**Independent Test**: [quickstart.md](./quickstart.md) `/c/wfrp/rota` no 404; anon without edit toggle; map omit rule

### Implementation

- [X] T015 [US3] Create minimal `frontend/src/pages/RotaPage.tsx`: `CodexHeader` + `RoutePlannerPanel` fed by `useCampaignData` / waypoints+locais (`mapPick=null`); reuse `showMapNav` pattern from Map/Relacoes
- [X] T016 [US3] Register `/c/:slug/rota` inside `CampaignShell` in `frontend/src/App.tsx` per [contracts/routes.md](./contracts/routes.md)
- [X] T017 [US3] Ensure Rota is in desktop tabs + `CampaignBottomNav.tsx` (four items); active detection for `…/rota`
- [X] T018 [US3] Preserve `showMapNav` omission of Mapa tab in `CodexHeader.tsx` and `CampaignBottomNav.tsx`; verify Relacoes/Sessoes/Map call sites still pass the prop
- [X] T019 [US3] Confirm Edit Mode remains gated by `canEdit` only (no ACL change) while smoke-testing anonymous vs member

**Checkpoint**: Four-tab chrome; Rota shell live; permissions unchanged

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Docs, typecheck, visual accept

- [X] T020 [P] Note feature in `CHANGELOG.md` (Unreleased) — header reconstruction / Rota nav shell
- [X] T021 Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean
- [X] T022 Execute [quickstart.md](./quickstart.md) checklist (desktop capture vs protótipo + mobile + i18n + anon/edit)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **US2 (4)** → **US3 (5)** → **Polish (6)**
- US2 builds on US1 left zone; US3 needs header tabs from US1
- ThemeSelector (T003) before T009

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | MVP visual chrome |
| **US2** | US1 left structure | Switcher |
| **US3** | US1 tabs + Phase 2 nav helper | Rota page + 4th tab |

### Parallel Opportunities

```text
T001 || T002
T003 then T005 (UserMenu)
T004 || T003
T007 || T010 (CSS files)
T015 || T016 after helper exists
T020 || T021
```

### Parallel Example: User Story 1

```bash
Task: "Restyle CodexHeader.css"
Task: "Align CampaignBottomNav.css"
# Then sequentially: CodexHeader.tsx structure → pill → ThemeSelector mount
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phases 1–2 (i18n + ThemeSelector)
2. Phase 3 US1 (three-zone header + pill)
3. **STOP** — visual check vs protótipo
4. Then US2 → US3 → Polish

### Incremental Delivery

1. Header shell looks right (US1)
2. Switcher works (US2)
3. Rota tab + minimal page (US3)
4. CHANGELOG + quickstart sign-off

### Suggested MVP scope

**US1 only**: zones + pill + theme; Rota link may 404 until US3 — prefer completing US3 in the same implement pass if shipping to users.

---

## Notes

- Do not import from `frontend-next/`; copy structure/CSS ideas only
- Do not redesign Map/Relacoes floating panels (115–116)
- Copy stays «Modo edição», not «Modo mestre»
