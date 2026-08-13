# Tasks: Acesso ao Mapa Sem Imagem (GM)

**Input**: Design documents from `/specs/083-map-absent-gm-access/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = jogador sem mapa (redirect + esconder «Mapa»); US2 = GM sem mapa (abrir Mapa + logout → Relações); US3 = regressão com mapa presente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Docs / version: `CHANGELOG.md`, `README.md`, package manifests

---

## Phase 1: Setup

**Purpose**: Align with contracts and current routing/header behaviour

- [x] T001 Skim `specs/083-map-absent-gm-access/contracts/ui-map-nav-access.md`, `research.md`, and `data-model.md`
- [x] T002 [P] Skim `frontend/src/App.tsx`, `frontend/src/components/layout/CodexHeader.tsx`, `frontend/src/pages/MapPage.tsx` (logoutGm / session restore / mapUrl), `frontend/src/pages/RelacoesPage.tsx` (CodexHeader + isGm), and `frontend/src/api/client.ts` (`hasAdminCredentials`)

---

## Phase 2: Foundational (Blocking)

**Purpose**: Header API for conditional «Mapa» link — required by all stories

**⚠️ CRITICAL**: Do not implement story redirects until `showMapNav` (or equivalent) exists on the header

- [x] T003 Add optional `showMapNav` prop (default `true` for safety only until callers pass explicit value) to `frontend/src/components/layout/CodexHeader.tsx` and render the «Mapa» `<Link to="/">` only when `showMapNav` is true (NAV-01…NAV-05 in `contracts/ui-map-nav-access.md`)
- [x] T004 Wire `showMapNav={Boolean(instanceConfig?.has_map_image) || isGm}` in `frontend/src/pages/RelacoesPage.tsx` (use existing `useInstanceConfig` / config already loaded on the page; while config loading and `!isGm`, keep «Mapa» hidden)

**Checkpoint**: On Relacoes without map and without GM, header shows only «Relações»; with GM unlocked, «Mapa» appears (router may still block `/` until US2)

---

## Phase 3: User Story 1 - Jogador sem mapa → Relações, sem botão «Mapa» (Priority: P1) 🎯 MVP

**Goal**: Non-GM never lands on Map without an image; entry shortcuts go to Relacoes without auto-opening the GM dialog; «Mapa» hidden

**Independent Test**: Quickstart scenario 1 (`/`, `/?gm=1`, `/admin`, unknown path → `/relacoes`; no «Mapa»; no auto gate)

### Implementation for User Story 1

- [x] T005 [US1] Update `RootRoute` in `frontend/src/App.tsx`: when `config && !config.has_map_image && !hasAdminCredentials()`, `<Navigate to="/relacoes" replace />`; when map exists, keep rendering `MapPage` (RT-01/RT-02/RT-04 — do not special-case `gm=1` to open Map)
- [x] T006 [US1] Update `AdminRedirect` in `frontend/src/App.tsx`: if `!config.has_map_image` navigate to `/relacoes` (no query); if map present keep `/?gm=1` (AD-01/AD-02); wait for config loading like other routes
- [x] T007 [US1] Confirm `CatchAllRoute` in `frontend/src/App.tsx` still sends `!has_map_image` → `/relacoes` and `has_map_image` → `/` (CA-01/CA-02); adjust only if broken by T005–T006
- [x] T008 [US1] Wire `showMapNav={Boolean(instanceConfig?.has_map_image) || isGm}` on `CodexHeader` in `frontend/src/pages/MapPage.tsx` (same rule as Relacoes; player should not see «Mapa» if they somehow reach Map without GM)

**Checkpoint**: Quickstart 1 passes; GM path may still fail until US2 if credentials gate is not finished

---

## Phase 4: User Story 2 - GM sem mapa abre o Mapa e sai para Relações (Priority: P1)

**Goal**: With admin credentials, `/` serves MapPage for upload; logout without map returns to Relacoes immediately

**Independent Test**: Quickstart scenarios 2–3 (unlock GM on Relacoes → «Mapa» → MapPage; exit GM → `/relacoes` + link hidden)

### Implementation for User Story 2

- [x] T009 [US2] Complete `RootRoute` in `frontend/src/App.tsx`: when `!has_map_image && hasAdminCredentials()`, render `<MapPage />` instead of redirecting (RT-03)
- [x] T010 [US2] In `frontend/src/pages/MapPage.tsx`, after session restore settles: if `instanceConfig && !instanceConfig.has_map_image && !isGm`, `navigate('/relacoes', { replace: true })` (MP-01; covers invalid/cleared credentials)
- [x] T011 [US2] In `logoutGm` in `frontend/src/pages/MapPage.tsx`, after clearing credentials / `setIsGm(false)`, if `!has_map_image` navigate immediately to `/relacoes` (MP-02 / FR-007; no confirm dialog)
- [x] T012 [US2] Optional but preferred: on successful map upload callback in `frontend/src/pages/MapPage.tsx`, invalidate/update `useInstanceConfig` cache (`frontend/src/hooks/useInstanceConfig.ts` — e.g. `clearInstanceConfigCache` or set `has_map_image: true`) so nav reflects map presence without full reload when practical (research §8)

**Checkpoint**: Quickstart 2–3 pass; GM can upload from Map without map file present

---

## Phase 5: User Story 3 - Com mapa, navegação normal (Priority: P2)

**Goal**: No regression when `has_map_image` is true — both links, `/` is Map, `/admin` → `/?gm=1`

**Independent Test**: Quickstart scenarios 4–5 (after upload / with map: player sees «Mapa»; `/admin` gate on map)

### Implementation for User Story 3

- [x] T013 [US3] Manually verify with map present: `CodexHeader` shows Mapa + Relações for player and GM; `RootRoute` serves MapPage; `AdminRedirect` → `/?gm=1` — fix any regression in `frontend/src/App.tsx` / header wiring if found
- [x] T014 [US3] After upload (or with map restored), confirm player session (no GM) shows «Mapa» and can open `/` per quickstart 4–5; if cache still stale, document reload in changelog note or finish T012

**Checkpoint**: Quickstart 4–5 pass; smoke nav Mapa ↔ Relações

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Version 0.16.2, changelog, build, spec status

- [x] T015 [P] Add `[0.16.2]` entry in `CHANGELOG.md` (map absent: hide Map nav for non-GM; GM can open Map to upload; logout redirects to Relacoes)
- [x] T016 [P] Bump version to **0.16.2** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T017 Run `cd frontend && npm run build` then execute `specs/083-map-absent-gm-access/quickstart.md`
- [x] T018 Set **Status: Implemented** in `specs/083-map-absent-gm-access/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T002) → Foundational (T003–T004) → US1 (T005–T008) → US2 (T009–T012) → US3 (T013–T014) → Polish
- US2 extends `RootRoute` / `MapPage` started in US1 — do not skip T005 before T009
- US3 is verification + cache polish after US1–US2 behaviour exists
- Polish after stories

### User Story Dependencies

- **US1**: Header `showMapNav` + redirects for non-GM (MVP)
- **US2**: Depends on US1 router structure; adds credential exception, MapPage guards, logout redirect
- **US3**: Depends on US1–US2; regression with map + upload/nav refresh

### Parallel Opportunities

- T001 ∥ T002
- T015 ∥ T016
- T005–T007 are same file (`App.tsx`) — prefer sequential same author
- T010 ∥ T011 only if carefully sequenced inside `MapPage.tsx` (same file — sequential safer)

---

## Parallel Example: Setup

```bash
Task: "Skim contracts/research/data-model (T001)"
Task: "Skim App/CodexHeader/MapPage/Relacoes/client (T002)"
```

---

## Parallel Example: Polish

```bash
Task: "CHANGELOG 0.16.2 (T015)"
Task: "Bump manifests to 0.16.2 (T016)"
```

---

## Implementation Strategy

### MVP (US1 only)

1. T001–T004 then T005–T008
2. Validate quickstart 1 (player without map)
3. Stop if only need to hide dead Map entry for players

### Incremental Delivery

1. US1 → players no longer see/open empty Map
2. US2 → GM unblocked to upload
3. US3 → confirm no regression with map
4. Polish → 0.16.2 + build

### Notes

- Do **not** open GM dialog on redirect to Relacoes (FR-008 / clarify Q3)
- Router GM gate = `hasAdminCredentials()`; page `isGm` still from session restore
- No backend API changes required for core fix
