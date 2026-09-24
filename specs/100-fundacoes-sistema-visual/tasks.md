# Tasks: Fundações do sistema visual

**Input**: Design documents from `/specs/100-fundacoes-sistema-visual/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED for gates (II) — `test:contrast` e `lint:tokens` a falhar antes da migração completa; styleguide só em DEV. Sem rotas de conteúdo novas. Sem `/opt`. Sem bump SemVer salvo pedido.

**Organization**: US1 = tema sistema + tokens legíveis; US2 = anti-hex + limpeza slides + Inter local; US3 = styleguide + contraste nos testes

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/`
- Specs: `specs/100-fundacoes-sistema-visual/`
- Docs: `CHANGELOG.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhamento com contratos; zero design-system lib

- [x] T001 [P] Skim `specs/100-fundacoes-sistema-visual/contracts/*.md`, `research.md`, `data-model.md`, `quickstart.md`
- [x] T002 Confirm approach: Node scripts for gates (no new Vitest unless already present); Inter via local woff2 (Constitution IV)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens RFC + theme applicator + font faces — base de todas as US

**⚠️ CRITICAL**: Nenhuma US completa sem `tokens.css` e `applySystemTheme` no boot

- [x] T003 Create `frontend/src/styles/tokens.css` with RFC §4 color/type/space/radius/motion tokens for `data-theme=dark|light` (incl. optional `--color-visited` if needed for UI migration)
- [x] T004 [P] Add Inter 400/500 woff2 under `frontend/public/fonts/` and `frontend/src/styles/fonts.css` (`@font-face`, `font-display: swap`)
- [x] T005 Create `frontend/src/theme/applySystemTheme.ts` — set `html[data-theme]` from `prefers-color-scheme` + live `change` listener
- [x] T006 Wire fonts + tokens + `applySystemTheme()` in `frontend/src/main.tsx` (before/at render); stop importing Google Fonts path

**Checkpoint**: App boots with `data-theme` on `<html>`; Inter local requestable; tokens defined

---

## Phase 3: User Story 1 - Tema do sistema legível (Priority: P1) 🎯 MVP

**Goal**: Preferência do SO → tema; live update; UI usa tokens (ainda pode haver hex até US2)

**Independent Test**: Dark/light OS preference; change OS theme with app open → updates; main screens readable (SC-001/003 partial)

### Implementation for User Story 1

- [x] T007 [US1] Refactor `frontend/src/styles/nocturne.css` to consume `tokens.css`; remove blurple-as-source-of-truth; map legacy `--color-*` aliases to RFC tokens where components still use old names (temporary bridge OK)
- [x] T008 [US1] Apply reduced-motion overrides for motion tokens in `frontend/src/styles/tokens.css`
- [x] T009 [US1] Spot-fix obvious broken contrast in `frontend/src/styles/global.css` and chrome/pages using token fallbacks (`#0f1115` → token)

**Checkpoint**: Theme switches with OS; no Google Fonts import in nocturne

---

## Phase 4: User Story 2 - Tokens only + anti-hex + limpeza (Priority: P1)

**Goal**: Zero `#` UI hex outside tokens (except pin); remove slide dead code; Inter local only

**Independent Test**: `npm run lint:tokens` passes; no fonts.googleapis; no `--color-section*` / `.table` / `.hr` (SC-002/005)

### Tests for User Story 2 ⚠️

- [x] T010 [P] [US2] Add failing `frontend/scripts/check-no-hex.mjs` + `npm run lint:tokens` in `frontend/package.json` (allowlist `tokens.css` + pin patterns per `contracts/lint-no-hex.md`)

### Implementation for User Story 2

- [x] T011 [US2] Remove Google Fonts `@import`, `--color-section*`, `.table`, `.hr`, «review round» comments from `frontend/src/styles/nocturne.css`
- [x] T012 [US2] Migrate `#…` UI colors in CSS/TSX (RouteDigitizer, CampaignMap, RoutePlanner, LocalFormDialog UI chrome, MapPage, GraphStage, global, Home/Painel/SiteChrome fallbacks) to tokens; keep pin content hex (`PIN_COLOR_*`, `--pin-color`)
- [x] T013 [US2] Make `lint:tokens` pass (T010 green)

**Checkpoint**: SC-002/005; Network sem Google Fonts

---

## Phase 5: User Story 3 - Styleguide + contraste (Priority: P1)

**Goal**: `/__styleguide` DEV-only with scoped theme toggle; contrast script passes both themes

**Independent Test**: Dev styleguide toggle scoped; prod 404; `npm run test:contrast` green (SC-001/004)

### Tests for User Story 3 ⚠️

- [x] T014 [P] [US3] Add `frontend/scripts/check-contrast.mjs` + `npm run test:contrast` with RFC pairs (must fail if tokens wrong; adjust tokens until pass)

### Implementation for User Story 3

- [x] T015 [US3] Create `frontend/src/pages/StyleGuidePage.tsx` (+ css): token samples + local preview `data-theme` toggle (MUST NOT set `documentElement`)
- [x] T016 [US3] Register `/__styleguide` in `frontend/src/App.tsx` only when `import.meta.env.DEV`
- [x] T017 [US3] Ensure `test:contrast` passes; tweak tokens if hover/elevado fail

**Checkpoint**: SC-001/004; quickstart steps 3–5 OK

---

## Phase 6: Polish

**Purpose**: Docs e fecho

- [x] T018 [P] Update `CHANGELOG.md` `[Unreleased]` with UX-1 foundations note
- [x] T019 [P] Brief note in `frontend/README.md` or root README: tokens, styleguide, `lint:tokens` / `test:contrast`
- [x] T020 Run quickstart checklist; mark spec Status Implemented if done

---

## Dependencies

- Phase 1 → 2 → US1 (3) → US2 (4) → US3 (5) → Polish
- T010 before T013; T014 before/with T017

## Parallel examples

- T001 ∥ T002; T003 ∥ T004; T010 ∥ T011 start; T014 ∥ T015

## Implementation strategy

1. Foundation tokens + theme + fonts  
2. Wire nocturne to tokens (US1)  
3. Hex gate + migrate (US2)  
4. Styleguide + contrast (US3)  
5. Changelog / quickstart  
