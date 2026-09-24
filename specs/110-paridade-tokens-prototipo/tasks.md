# Tasks: Paridade de tokens e forma visual com o protótipo

**Input**: Design documents from `/specs/110-paridade-tokens-prototipo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [contracts/token-mapping.md](./contracts/token-mapping.md), [quickstart.md](./quickstart.md)

**Tests**: Gate de contraste + reaprovação Playwright (spec/clarify). Sem TDD de API.

**Organization**: Por user story (US1–US4).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable
- **[Story]**: [US1]…[US4]
- Paths are repo-relative under `frontend/` unless noted

---

## Phase 1: Setup

**Purpose**: Baseline de contraste pré-mudança e assets tipográficos

- [X] T001 Capture current `npm run test:contrast` output to `specs/110-paridade-tokens-prototipo/contrast-before.txt` for regression comparison
- [X] T002 [P] Add Cormorant Garamond woff2 (weights 500 and 600) under `frontend/public/fonts/` (local only; no Google Fonts)
- [X] T003 [P] Register `@font-face` for Cormorant in `frontend/src/styles/fonts.css`

---

## Phase 2: Foundational (tokens)

**Purpose**: Paleta fantasia + escalas partilhadas — bloqueia todas as stories

**⚠️ CRITICAL**: Complete before US work

- [X] T004 Apply fantasia dark/light color values to `html[data-theme='dark'|'light']` in `frontend/src/styles/tokens.css` per [contracts/token-mapping.md](./contracts/token-mapping.md); keep `--color-accent-fill` and accent-100/300/800 aliases
- [X] T005 Update shared `:root` radii (`sm`/`md`/`lg` + `--radius-full: 999px`), add `--space-7: 48px` (keep `--space-6: 24px` / `--space-8: 32px`), align `--shadow-*` and map `--elevation-*` (+ `--shadow-float`) in `frontend/src/styles/tokens.css`
- [X] T006 Define `--font-display: 'Cormorant Garamond', Georgia, serif` in `frontend/src/styles/tokens.css` `:root`
- [X] T007 Sync styleguide preview hex blocks in `frontend/src/styles/tokens.css` (`.styleguide-preview[data-theme=…]`) to the new base
- [X] T008 Align vínculo family tokens (`--vinculo-*`) and semantic success/warning/danger/info with prototype `--link-*` / semantic values in `frontend/src/styles/tokens.css`
- [X] T009 Update `frontend/scripts/check-contrast.mjs` expected hex pairs if needed; run `npm run test:contrast` and ensure **no ratio worse** than `contrast-before.txt`

**Checkpoint**: Tokens + contraste OK — stories can proceed

---

## Phase 3: User Story 1 — Paridade visual base (P1) 🎯 MVP

**Goal**: Telas principais parecem fantasia do protótipo (cor/raio/sombra) nos dois temas

**Independent Test**: Checklist lado a lado [quickstart.md](./quickstart.md) §2; contraste verde

- [X] T010 [US1] Verify `--color-column` / elevated / surface mapping against side-by-side (adjust only token values in `frontend/src/styles/tokens.css` if column/chrome diverge)
- [X] T011 [US1] Walk checklist home/painel/mapa/relações/rota × light/dark vs `frontend-next` fantasia; record pass in `specs/110-paridade-tokens-prototipo/side-by-side.md`
- [X] T012 [US1] Re-approve Playwright baselines: seed e2e if needed, then `cd frontend && npx playwright test --update-snapshots` and commit PNGs under `frontend/e2e/quality.spec.ts-snapshots/`

---

## Phase 4: User Story 2 — Pílula (P1)

**Goal**: Botões, chips/tags e busca em forma pílula

**Independent Test**: Primário/secundário/ícone, tag, busca com `border-radius: var(--radius-full)`

- [X] T013 [P] [US2] Set pill radius on `.ui-btn`, `.ui-icon-btn`, `.ui-chip` in `frontend/src/components/ui/ui.css`
- [X] T014 [P] [US2] Set pill radius on `.btn` and `.tag` in `frontend/src/styles/nocturne.css`
- [X] T015 [US2] Apply pill to search field containers (e.g. `.side-menu__search` / search wraps) in `frontend/src/components/sidebar/` CSS and any shared search class — leave box `.ui-input` / `.input` on `--radius-sm`

---

## Phase 5: User Story 3 — Fonte display (P2)

**Goal**: Cormorant local só onde já pede display

**Independent Test**: Home title = Cormorant; nav = Inter; Network sem fonts.googleapis.com

- [X] T016 [US3] Confirm `HomePage.css`, `PainelPage.css`, `SiteChrome.css`, `CampaignMissingPage.css` resolve `--font-display` (no Georgia-only fallback needed once token exists)
- [X] T017 [US3] Smoke: DevTools computed style on `.home-page__title` = Cormorant; sample nav/button = Inter

---

## Phase 6: User Story 4 — Acentos 108 intactos (P2)

**Goal**: Cinco acentos continuam a funcionar sobre a nova base

**Independent Test**: Painel swatches; mesa reflecte; default = latão/base fantasia

- [X] T018 [US4] Recalibrate `--accent-swatch-*` / `data-campaign-accent` overrides in `frontend/src/styles/tokens.css` only if contrast fails; keep five options and `campaignAccent.ts` mechanism
- [X] T019 [US4] Manual: toggle five accents on `/painel` → `/c/{slug}`; unset → base fantasia accent

---

## Phase 7: Polish

- [X] T020 Run full `cd frontend && npx playwright test` (0 critical axe; snapshots match)
- [X] T021 [P] Run `npm run lint:tokens` and `npx tsc --noEmit` in `frontend/`
- [X] T022 Update Unreleased in `CHANGELOG.md`; set spec **Status: Implemented** in `specs/110-paridade-tokens-prototipo/spec.md`

---

## Dependencies

```text
Phase 1 → Phase 2 → US1 (MVP visual) 
                  → US2 (pílula; after radius-full in T005)
                  → US3 (after T006 fonts)
                  → US4 (after T004 base colors)
         → Phase 7
```

- US2/US3/US4 can proceed in parallel after Phase 2
- US1 checklist/baselines ideally after US2 so screenshots include pills

## Parallel examples

```bash
# After Phase 2:
# T013 + T014 in parallel (ui.css vs nocturne.css)
# T002 + T003 already parallel in Setup
```

## Implementation strategy

1. **MVP**: Phase 1–2 + US1 (tokens + contraste + lado a lado + baselines)
2. **Increment**: US2 pílula → US3 display → US4 acentos
3. **Ship**: Phase 7 gates

## Summary

| Story | Tasks | Count |
|-------|-------|-------|
| Setup | T001–T003 | 3 |
| Foundational | T004–T009 | 6 |
| US1 | T010–T012 | 3 |
| US2 | T013–T015 | 3 |
| US3 | T016–T017 | 2 |
| US4 | T018–T019 | 2 |
| Polish | T020–T022 | 3 |
| **Total** | | **22** |
