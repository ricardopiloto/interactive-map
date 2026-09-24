# Tasks: Home, Explorar e Painel (três telas)

**Input**: Design documents from `/specs/119-home-explorar-painel/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/campaign-card.md](./contracts/campaign-card.md), [contracts/routes-surfaces.md](./contracts/routes-surfaces.md), [quickstart.md](./quickstart.md)

**Depends on**: Specs **110** (tokens), **111** (género / `data-genre`), **114** (`SiteChrome`).

**Tests**: OPTIONAL (UI polish — Constitution II MAY). Validation via [quickstart.md](./quickstart.md) + `tsc`. No pytest/API.

**Organization**: Por user story (US1–US3). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]…[US3]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Align with prototype surfaces and current PRD pages

- [X] T001 Skim visual SoT `frontend-next/src/pages/LandingPage.tsx` (+ `.css`), `ExplorePage.tsx` (+ `.css`), `MestrePainel.tsx` (+ `.css`), and `frontend-next/src/components/common/CampaignCard.tsx` (+ `.css`)
- [X] T002 [P] Inventory current `frontend/src/pages/HomePage.tsx`, `PainelPage.tsx`, `App.tsx` routes, and `campanhasApi` DTOs in `frontend/src/api/campanhas.ts` (no API changes)

---

## Phase 2: Foundational — BLOCKS page rewrites

**Purpose**: Shared card + i18n keys before Landing / Explorar / Painel consume them

**⚠️ CRITICAL**: Complete CampaignCard before US1–US3 page bodies depend on it

- [X] T003 Create `frontend/src/components/campaign/CampaignCard.tsx` per [contracts/campaign-card.md](./contracts/campaign-card.md) (props: slug/nome/sistema/genero/capa_url, `linkTo?`, `compact?`, `footer?`; cover img or genre placeholder; no prototype-only fields)
- [X] T004 [P] Add styles in `frontend/src/components/campaign/CampaignCard.css` aligned to prototype card (tokens `--radius-*` / `--shadow-*` / genre swatch)
- [X] T005 [P] Add `landing.*` and `explorar.*` (and any needed `painel.*` shell) keys to `frontend/src/locales/pt-BR/comum.json` and `frontend/src/locales/en/comum.json`

**Checkpoint**: CampaignCard usable; i18n ready

---

## Phase 3: User Story 1 — Home marketing em `/` (P1) 🎯 MVP

**Goal**: `/` is Landing (hero, how-it-works, live genre preview, optional featured); catalog moves off `/`

**Independent Test**: [quickstart.md](./quickstart.md) §1; [contracts/routes-surfaces.md](./contracts/routes-surfaces.md) Landing

### Implementation

- [X] T006 [US1] Rewrite `frontend/src/pages/HomePage.tsx` as marketing Landing (hero CTAs → `/explorar` + login/painel; how-it-works; genre showcase; optional featured via `catalogo()` slice) using `SiteChrome` + `CampaignCard` compact
- [X] T007 [US1] Restyle Landing sections in `frontend/src/pages/HomePage.css` to match prototype structure (not full-catalog grid as main content)
- [X] T008 [US1] Wire genre showcase to live `data-genre` preview via `frontend/src/theme/campaignGenre.ts` (or equivalent); restore previous genre on unmount in `HomePage.tsx`
- [X] T009 [US1] Remove legacy `home-page__card` catalog-as-main markup from `HomePage.tsx` / `HomePage.css`

**Checkpoint**: `/` is marketing; genre preview works; CTA to `/explorar` (route may 404 until US2)

---

## Phase 4: User Story 2 — Catálogo em `/explorar` (P1)

**Goal**: Public catalog with search + genre filter on same `catalogo()` API

**Independent Test**: [quickstart.md](./quickstart.md) §2

### Implementation

- [X] T010 [US2] Create `frontend/src/pages/ExplorarPage.tsx` (load `campanhasApi.catalogo()`, client filter query + genre chips via `Chip`, grid of `CampaignCard` with `linkTo`, `EmptyState` when empty)
- [X] T011 [P] [US2] Add `frontend/src/pages/ExplorarPage.css` (toolbar + grid) aligned to ExplorePage prototype
- [X] T012 [US2] Register `<Route path="/explorar" element={<ExplorarPage />} />` in `frontend/src/App.tsx`

**Checkpoint**: `/explorar` lists/filters/opens campaigns; Home CTA works end-to-end

---

## Phase 5: User Story 3 — Painel com o mesmo cartão (P1)

**Goal**: Painel shell matches MestrePainel; same CampaignCard with management footer; create/import preserved

**Independent Test**: [quickstart.md](./quickstart.md) §3

### Implementation

- [X] T013 [US3] Restyle shell in `frontend/src/pages/PainelPage.tsx` + `PainelPage.css` (title, lead, grid, «criar novo» CTA/tile) per MestrePainel — keep auth redirect and all mutations
- [X] T014 [US3] Replace legacy `painel-page__card` list items with `CampaignCard` (no `linkTo`; `footer` with visibility, quota, Abrir, export, unit toggle, capa) in `frontend/src/pages/PainelPage.tsx`
- [X] T015 [US3] Ensure «Criar novo codex» CTA focuses/scrolls to existing create form (or `#criar` anchor) in `PainelPage.tsx` — do not drop create/import capability

**Checkpoint**: Three surfaces share one card component; painel actions still work

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Gates and docs

- [X] T016 Run [quickstart.md](./quickstart.md) §1–4 (Landing, Explorar, Painel, visual)
- [X] T017 [P] Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean
- [X] T018 [P] Grep sanity from quickstart §6 (`CampaignCard` on three pages; `/explorar` route; legacy card classes not default)
- [X] T019 [P] Note feature in `CHANGELOG.md` (Unreleased) — `/` Landing, `/explorar` catalog, shared CampaignCard on Painel

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **US2 (4)** (US2 unblocks Home CTA) → **US3 (5)** → **Polish (6)**
- US2 can start after T003–T005 even before US1 finishes if Landing CTA is wired last
- US3 only needs CampaignCard (Phase 2); can parallel US1/US2 if staffing allows

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | Landing MVP; `/explorar` link soft until US2 |
| **US2** | Phase 2 | Catalog route |
| **US3** | Phase 2 | Same card; management preserved |

### Parallel Opportunities

```text
T001 || T002
T003 || T004 || T005   # card TS then CSS; i18n parallel to CSS
T010 || T011            # after T003
T017 || T018 || T019
```

### Parallel Example: Foundational

```bash
# After T003 stub exists:
Task: "CampaignCard.css tokens"
Task: "landing/explorar i18n keys in pt-BR + en comum.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 + Foundational)

1. CampaignCard + i18n (T003–T005)
2. Landing rewrite (T006–T009)
3. **STOP** — validate quickstart §1 (CTA may await US2)
4. Explorar route (T010–T012) → Painel card (T013–T015) → Polish

### Incremental Delivery

1. Shared card  
2. Marketing `/`  
3. `/explorar` catalog  
4. Painel same card + shell  
5. CHANGELOG + tsc  

---

## Format Validation

- All tasks use `- [ ]`, sequential `T00N`, file paths, and `[USn]` on story phases only.
- No automated test tasks (UI polish MAY).
