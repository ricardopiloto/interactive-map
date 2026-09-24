# Tasks: Gênero como identidade da campanha

**Input**: Design documents from `/specs/111-genero-identidade-campanha/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/genero-api.md](./contracts/genero-api.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED (Constitution II) — migration/backfill, create+genero, capa isolation, export/import. Write failing tests before implementation. Contrast gate for 4 genres (FE).

**Organization**: Por user story (US1–US4).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable
- **[Story]**: [US1]…[US4]
- Paths are repo-relative

---

## Phase 1: Setup

**Purpose**: Shared genre constants + remove accent surface area placeholders

- [X] T001 Create `backend/app/services/genre_palette.py` with `GENRE_IDS`, `normalize_genero`, `genero_from_legacy(sistema, acento_id)` per [data-model.md](./data-model.md) / [research.md](./research.md)
- [X] T002 [P] Add `frontend/src/theme/genres.ts` (GenreId, GENRES metadata: swatch, supportsLight, suggestedSystems keys) aligned to `frontend-next/src/theme/genres.ts`

---

## Phase 2: Foundational (schema + retire accent API)

**Purpose**: DB + API shape for `genero`; capa PATCH; drop accent — blocks all stories

**⚠️ CRITICAL**: Complete before US work

### Tests (fail first)

- [X] T003 [P] Write failing Alembic/backfill tests for wfrp4e+latao→fantasia, wod+vinho→gotico, vinho→gotico, else→fantasia in `backend/tests/` (control migration)
- [X] T004 [P] Write failing API tests: create requires `genero`; invalid genre → `GENERO_INVALIDO`; response includes `genero` in `backend/tests/`
- [X] T005 [P] Write failing tests: `PATCH /api/campanhas/{slug}/capa` owner OK; anonymous/other master denied; `PATCH …/identidade` gone in `backend/tests/`
- [X] T006 [P] Write failing export/import tests: new manifest has `genero`; round-trip preserves; old zip with only `acento_id` maps via `genero_from_legacy` in `backend/tests/`

### Implementation

- [X] T007 Add `genero` field; remove `acento_id` from `backend/app/models/campanha.py`
- [X] T008 Add Alembic control revision `backend/alembic_control/versions/005_genero.py` (`render_as_batch`: add column → backfill via `genero_from_legacy` → NOT NULL → drop `acento_id`)
- [X] T009 Update schemas in `backend/app/schemas/campanhas.py` and `backend/app/schemas/config.py` per [contracts/genero-api.md](./contracts/genero-api.md) (`CriarCampanhaRequest.genero`, catalog/painel/config expose `genero`; `CapaRequest`/`CapaResponse`; remove accent fields)
- [X] T010 Replace `set_identidade` with `set_capa` in `backend/app/services/campanha_admin.py`; wire `genero` on create; remove accent/sugestao usage
- [X] T011 Update `backend/app/routers/campanhas.py`: create accepts `genero`; add `PATCH /{slug}/capa`; remove `PATCH /{slug}/identidade`
- [X] T012 Update `backend/app/services/campaign_export.py` to write `genero` (stop writing `acento_id`)
- [X] T013 Update `backend/app/services/campaign_import.py` (+ `package_schema.py` if needed) to require/resolve `genero` with legacy `acento_id` fallback
- [X] T014 Delete or gut `backend/app/services/accent_palette.py` and fix all imports to `genre_palette`
- [X] T015 Run `uv run pytest` for T003–T006 until green

**Checkpoint**: Schema + API without accent; migration backfill works

---

## Phase 3: User Story 1 — Migração: mesas existentes ganham género (P1) 🎯 MVP

**Goal**: Existing campaigns have NOT NULL `genero`; WFRP→fantasia, WoD→gotico without manual steps

**Independent Test**: [quickstart.md](./quickstart.md) §1; fixtures matching production pairs

- [X] T016 [US1] Add/adjust control DB fixtures or pytest factories with wfrp4e+latao and wod+vinho in `backend/tests/` if missing
- [X] T017 [US1] Document operator note for upgrade path in `specs/111-genero-identidade-campanha/quickstart.md` §1 (alembic command already) — verify against a real `DATA_DIR` control DB when available
- [X] T018 [US1] Confirm post-migration catalog/painel payloads include `genero` for all rows (API assertion in existing list tests or new case in `backend/tests/`)

**Checkpoint**: SC-001 path verified for migration

---

## Phase 4: User Story 2 — Criar campanha com género + preview (P1)

**Goal**: Painel create form: 4 genre cards, live reskin, sistema free/suggested; genre immutable after create

**Independent Test**: Create four genres; no genre → fail; cannot change genre after; form preview

### Tests

- [X] T019 [P] [US2] Extend API tests: create with each genre id; assert no update path for `genero` in `backend/tests/`

### Implementation

- [X] T020 [US2] Add i18n keys (labels, taglines, errors `GENERO_*`) in `frontend/src/locales/pt-BR.json` and `frontend/src/locales/en.json`
- [X] T021 [US2] Update create API client to send `genero` in `frontend/src/api/` (campanhas client)
- [X] T022 [US2] Implement genre card grid + live preview (scoped `data-genre` / restore on unmount) on create form in `frontend/src/pages/PainelPage.tsx` and `frontend/src/pages/PainelPage.css` (mirror `frontend-next/src/pages/NovoCodexWizard.tsx`)
- [X] T023 [US2] Wire suggested-systems chips as non-binding hints from `frontend/src/theme/genres.ts` into the sistema field on `PainelPage.tsx`
- [X] T024 [US2] Ensure create UI blocks submit without genre selection

**Checkpoint**: FR-006/007; SC-002/SC-005

---

## Phase 5: User Story 3 — Mesa e cartões usam género (P1)

**Goal**: Mesa skins via `data-genre`; cards show genre; accent selector gone; non-fantasia mesa forces dark

**Independent Test**: Open fantasia vs gotico mesa; home/painel badges; no 5-accent UI

- [X] T025 [US3] Port four genre palettes into `frontend/src/styles/tokens.css` (`html[data-genre=…]`); remove `data-campaign-accent` overrides; keep app token names + fantasia light under `data-theme`
- [X] T026 [US3] Replace `frontend/src/theme/campaignAccent.ts` with `frontend/src/theme/campaignGenre.ts` (`applyCampaignGenre`; force dark when `!supportsLight` on `/c/:slug` routes)
- [X] T027 [US3] Apply genre from public config on campaign routes (call site(s) that today call `applyCampaignAccent`) under `frontend/src/`
- [X] T028 [US3] Update `frontend/src/pages/HomePage.tsx` (+ CSS if needed) to show genre swatch + label instead of accent
- [X] T029 [US3] Update `frontend/src/pages/PainelPage.tsx`: remove accent selector; keep capa via `patchCapa`; show genre on cards
- [X] T030 [US3] Update FE API types / `patchIdentidade` → `patchCapa` in `frontend/src/api/`
- [X] T031 [US3] Extend `frontend/scripts/check-contrast.mjs` for 4 genres (fantasia light+dark; others dark); run `npm run test:contrast`

**Checkpoint**: FR-004/005/008/014; SC-004

---

## Phase 6: User Story 4 — Export / import preserva género (P1)

**Goal**: Round-trip `genero`; legacy packages map

**Independent Test**: [quickstart.md](./quickstart.md) §4

- [X] T032 [US4] Ensure CLI export/import paths (if separate from HTTP) pick up `genero` in `backend/app/` CLI modules touching packages
- [X] T033 [US4] Add assertion fixtures for old-manifest shape in `backend/tests/` (acento_id only → mapped genre)
- [X] T034 [US4] Run full export→import round-trip for each genre id (pytest parametrize) in `backend/tests/`

**Checkpoint**: SC-003

---

## Phase 7: Polish

- [X] T035 [P] Grep-remove leftover `acento_id` / `sugestao_acento` / `campaignAccent` / `data-campaign-accent` from `frontend/` and `backend/` (except migration/legacy import mapping)
- [X] T036 [P] Run `cd frontend && npm run lint:tokens && npx tsc --noEmit`
- [X] T037 Update Unreleased in `CHANGELOG.md`; set spec **Status: Implemented** in `specs/111-genero-identidade-campanha/spec.md`
- [X] T038 Optional: `cd frontend && npx playwright test --update-snapshots` if quality baselines fail after genre skins
- [X] T039 Walk [quickstart.md](./quickstart.md) end-to-end and tick outcomes

---

## Dependencies

```text
Phase 1 → Phase 2 (tests→impl) → US1 (migration verify)
                              → US2 (create UI; needs API create)
                              → US3 (tokens+FE; needs config.genero)
                              → US4 (export/import; needs T012–T013)
         → Phase 7
```

- US2/US3/US4 can proceed in parallel after Phase 2
- US1 is mostly verification once T008/T015 green

## Parallel examples

```bash
# Phase 2 tests:
# T003 + T004 + T005 + T006

# After Phase 2:
# US2 FE (T020–T024) || US3 tokens (T025–T031) || US4 pytest (T032–T034)
```

## Implementation strategy

1. **MVP**: Phase 1–2 + US1 (DB+API+migration) — mesas existentes correctas
2. **Increment**: US2 create UX → US3 visual/cards → US4 package polish
3. **Ship**: Phase 7 gates + CHANGELOG

## Summary

| Story | Tasks | Count |
|-------|-------|-------|
| Setup | T001–T002 | 2 |
| Foundational | T003–T015 | 13 |
| US1 | T016–T018 | 3 |
| US2 | T019–T024 | 6 |
| US3 | T025–T031 | 7 |
| US4 | T032–T034 | 3 |
| Polish | T035–T039 | 5 |
| **Total** | | **39** |
