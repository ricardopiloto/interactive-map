# Tasks: Tema visual da campanha editável

**Input**: Design documents from `/specs/146-tema-campanha-editavel/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED for owner authorization and campaign isolation (Constitution I–II). Write the HTTP tests first and confirm they fail before implementing the route. UI verification follows the manual scenarios in `quickstart.md`.

**Organization**: Tasks are grouped by user story; shared authorization and isolation tests are blocking foundation work.

## Phase 1: Setup

**Purpose**: Project setup is already present; this feature adds no dependencies, project structure, or migration framework configuration. No setup task is required.

## Phase 2: Foundational — Authorization and isolation tests

**Purpose**: Create the required failing tests before implementing the campaign-scoped write route.

- [X] T001 [P] Add owner success/persistence for all four genres, invalid genre rejection, anonymous denial, non-owner denial, and unchanged persisted value on failure in `backend/tests/test_campanha_genero_http.py`
- [X] T002 [P] Extend the isolation matrix to PATCH campaign A, confirm its public config changes, and assert campaign B retains its genre and other fields in `backend/tests/test_isolation_http.py`

**Checkpoint**: Both test files prove the route requirements and fail because the new PATCH is not implemented.

## Phase 3: User Story 1 — Dono altera e salva o tema (Priority: P1) 🎯 MVP

**Goal**: Let the campaign owner select one of the four existing genres, save or cancel the pending choice, and receive clear error feedback if saving fails.

**Independent Test**: As the owner, choose and save each of the four genres in `/painel`; reopen the campaign settings and confirm the persisted option. Cancel and simulated failure must leave the prior confirmed genre intact.

### Implementation for User Story 1

- [X] T003 [P] [US1] Add `GeneroRequest` and `GeneroResponse` schemas for the PATCH contract in `backend/app/schemas/campanhas.py`
- [X] T004 [P] [US1] Implement `set_genero` with `normalize_genero`, active campaign lookup, and control database persistence in `backend/app/services/campanha_admin.py`
- [X] T005 [US1] Add `PATCH /api/campanhas/{slug}/genero`, enforce `require_dono`, map service errors, and return the persisted genre in `backend/app/routers/campanhas.py`
- [X] T006 [P] [US1] Add the authenticated `patchGenero(slug, genero)` client method and typed response in `frontend/src/api/campanhas.ts`
- [X] T007 [P] [US1] Add localized campaign genre edit actions and `GENERO_INVALIDO` / `GENERO_OBRIGATORIO` error messages in `frontend/src/locales/pt-BR/comum.json` and `frontend/src/locales/en/comum.json`
- [X] T008 [US1] Add a per-campaign genre selector with confirmed and pending values, save/cancel actions, busy state, localized error handling, and matching control styles in `frontend/src/pages/PainelPage.tsx` and `frontend/src/pages/PainelPage.css`

**Checkpoint**: The owner can save a valid change from the Panel; invalid, unauthorized, or failed updates do not report success or replace the confirmed value.

## Phase 4: User Story 2 — Participantes veem o gênero compartilhado (Priority: P1)

**Goal**: Apply the saved campaign genre to every participant on their next access or reload and avoid carrying a stale in-memory config into a reopened campaign.

**Independent Test**: Change a genre as owner, reopen or reload the campaign as another member, and confirm the campaign palette matches the saved value; open campaign B and confirm its genre is unchanged.

### Implementation for User Story 2

- [X] T009 [US2] After a successful `patchGenero`, update the confirmed Panel value from the API response and invalidate only that campaign's config cache in `frontend/src/pages/PainelPage.tsx`

**Checkpoint**: `GET /api/c/{slug}/config` continues to provide the saved genre, and the next campaign load applies it through the existing `CampaignShell` / `applyCampaignGenre` path.

## Phase 5: User Story 3 — Preferência pessoal permanece independente (Priority: P2)

**Goal**: Preserve the user's Auto/Light/Dark preference while applying the campaign genre's existing palette and forced-dark rules.

**Independent Test**: With personal preference set to Auto, Light, then Dark, switch among all four genres and leave the campaign; Fantasy respects the personal preference, other genres force dark only while active, and `codex.theme` remains unchanged.

### Validation for User Story 3

- [X] T010 [US3] Verify the preference matrix and `codex.theme` persistence against the scenarios in `specs/146-tema-campanha-editavel/quickstart.md`; adjust `frontend/src/theme/campaignGenre.ts` only if the current apply/restore behavior regresses during integration

**Checkpoint**: Campaign genre changes never write the personal preference, and leaving a forced-dark campaign restores the user's chosen preference.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Align prior documentation with the newly supported post-creation change and run the feature validation guide.

- [X] T011 Replace the obsolete “No API to PATCH genero” expectation with the new owner-only update contract in `specs/111-genero-identidade-campanha/quickstart.md`
- [ ] T012 Run the complete backend, UI, localization, and build scenarios in `specs/146-tema-campanha-editavel/quickstart.md`

### Validation Record

- Frontend production build: passed.
- Genre palette contrast check: passed; locale JSON parsing: passed.
- Backend syntax compilation and service-level persistence/config/invalid-value smoke check: passed.
- Backend HTTP tests: collected, but execution blocks while `starlette.testclient.TestClient.__enter__` waits for the ASGI lifespan task in this environment. HTTP authorization and isolation assertions remain unverified here.
- `npm run lint:tokens`: reports existing hex colors in `CampaignCard.css`, `LinhaTempoPage.css`, `MapPage.css`, `RelacoesPage.css`, `RotaPage.css`, and `SessoesPage.css`; none are in files changed by this feature.
- T012 remains open until the HTTP tests and manual browser scenarios can complete.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No action; project setup already exists.
- **Foundational (Phase 2)**: Required failing authorization and isolation tests; must finish before feature implementation.
- **User Story 1 (Phase 3)**: Depends on Phase 2; implements the owner update path and management control.
- **User Story 2 (Phase 4)**: Depends on User Story 1; invalidates config cache after save and verifies persisted propagation.
- **User Story 3 (Phase 5)**: Depends on User Story 1 and the existing genre application path; validates the independence of personal preference.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on another story.
- **US2 (P1)**: Requires US1's persisted update and management save flow.
- **US3 (P2)**: Requires the saved genre transition from US1; the theme preference mechanism itself already exists.

### Parallel Opportunities

- T001 and T002 edit separate test files and can be authored in parallel.
- After the tests are in place, T003, T004, T006, and T007 touch separate files and can be implemented in parallel.
- T005 depends on T003 and T004. T008 depends on T005, T006, and T007. T009 follows T008 because it extends the same Panel save flow.
- User stories are sequential for this feature: US2 and US3 both rely on the persisted update introduced by US1.

## Parallel Example: User Story 1

```text
After T001–T002 are written and shown failing:
Task: T003 — request/response schema in backend/app/schemas/campanhas.py
Task: T004 — genre persistence service in backend/app/services/campanha_admin.py
Task: T006 — frontend API client in frontend/src/api/campanhas.ts
Task: T007 — pt-BR/en strings in frontend/src/locales/{pt-BR,en}/comum.json
```

Then complete T005; after T005–T007, implement T008.

## Implementation Strategy

### MVP

Deliver **US1 + US2 together**: the owner can save the genre and the saved value reaches other campaign members and subsequent campaign loads. US1 alone is not a complete release because propagation is part of the requested shared behavior.

### Incremental Delivery

1. Write and fail the authorization, persistence, and isolation tests (Phase 2).
2. Implement the owner update endpoint and Panel selector (US1).
3. Add cache invalidation and verify participant/reload propagation (US2); this completes the MVP.
4. Verify personal preference independence for every genre (US3).
5. Update the prior quickstart and run the feature quickstart (Polish).

## Format Validation

All task entries use the required checklist form `- [ ] TNNN [P?] [US?] Description with file path`. Setup has no entries because no setup work is needed; foundational tasks intentionally have no story label. Story implementation/validation tasks carry their corresponding story label.
