# Tasks: Página inicial e painel do mestre

**Input**: Design documents from `/specs/098-home-painel-mestre/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (Constituição I–II / FR-011) — catálogo omite `so_link`/inactivas; painel A omite B / co-mestre / inactivas; anónimo 401 no painel; criar recusa slug inválido e anónimo; PATCH visibilidade só dono. Export/import UI reutiliza 097 (testar wiring). Sem UI super-admin/co-mestre. Sem `/opt` (099). Sem bump SemVer salvo pedido.

**Organization**: US1 = home + catálogo (MVP descoberta); US2 = painel minhas + pós-login; US3 = criar na UI/API; US4 = visibilidade + cota + export/import UI; US5 = Nocturne/i18n/mobile/vazios

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/`
- Frontend: `frontend/`
- Specs: `specs/098-home-painel-mestre/`
- Docs: `backend/README.md`, `CHANGELOG.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhamento com contratos; zero deps novas

- [X] T001 [P] Skim `specs/098-home-painel-mestre/contracts/api-catalogo.md`, `api-minhas-criar-visibilidade.md`, `frontend-routes.md`, `isolation-home-painel.md`, `research.md`, `data-model.md`, and `quickstart.md`
- [X] T002 Confirm no new Python/npm dependencies (Constitution IV); note if anything unexpected appears

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extrair create de campanha para serviço partilhado CLI↔HTTP; schemas de listagem; base para todas as US

**⚠️ CRITICAL**: Nenhuma história FE completa até existir pelo menos o serviço de create/list helpers. Sem Alembic novo. Sem UI super-admin.

- [X] T003 Extract reusable `create_campanha(...)` (from `backend/app/cli.py` `_create_campanha`) into `backend/app/services/campanha_admin.py` (or `campanha_lifecycle.py`); CLI calls the service
- [X] T004 [P] Add list helpers in `backend/app/services/campanha_admin.py`: `list_catalogo_publico()`, `list_minhas_campanhas(usuario_id)` returning dicts per `data-model.md` (incl. `aviso_cota`)
- [X] T005 [P] Add Pydantic request/response schemas for catalogo/minhas/criar/visibilidade in `backend/app/schemas/campanhas.py`

**Checkpoint**: CLI `campanha criar` ainda funciona via serviço; helpers importáveis

---

## Phase 3: User Story 1 - Jogador chega à mesa listada (Priority: P1) 🎯 MVP

**Goal**: `/` mostra catálogo público (`listada`+activa); clique → `/c/{slug}`; `so_link` omitida; vazio compreensível

**Independent Test**: Duas campanhas (listada + so_link); home/API só listada; abrir so_link por URL ainda funciona (SC-001 / SC-003)

### Tests for User Story 1 ⚠️

- [X] T006 [P] [US1] Write failing tests in `backend/tests/test_catalogo_publico.py`: listada activa included; `so_link` and inactive omitted; no cota/caminho fields; anonymous 200

### Implementation for User Story 1

- [X] T007 [US1] Implement `GET /api/campanhas/catalogo` in `backend/app/routers/campanhas.py` using list helper per `contracts/api-catalogo.md`
- [X] T008 [P] [US1] Add `frontend/src/api/campanhas.ts` client method `fetchCatalogo()`
- [X] T009 [US1] Create `frontend/src/pages/HomePage.tsx` (+ `HomePage.css`): fetch catalogo, list nome+sistema, Link to `/c/{slug}`, empty state; wire `/` in `frontend/src/App.tsx` (replace `CampaignMissingPage` on `/`)
- [X] T010 [US1] Redirect `/relacoes` → `/` in `frontend/src/App.tsx`

**Checkpoint**: T006 green; anónimo abre mesa listada em ≤2 cliques

---

## Phase 4: User Story 2 - Painel «minhas campanhas» isolado (Priority: P1)

**Goal**: `/painel` só dono+activas; A≠B; co-mestre omitido; anónimo → login; pós-login sem `next` → `/painel`

**Independent Test**: A dono só de A; B dono só de B; API/UI de A omite B; co-mestre fixture omite mesa; 401 anónimo (SC-002 / SC-004)

### Tests for User Story 2 ⚠️

- [X] T011 [P] [US2] Write failing tests in `backend/tests/test_painel_minhas.py` per `contracts/isolation-home-painel.md`: A omits B; omits inactive; omits co-mestre membership; anonymous 401; includes cota fields + `aviso_cota`

### Implementation for User Story 2

- [X] T012 [US2] Implement `GET /api/campanhas/minhas` with `Depends(require_session_user)` in `backend/app/routers/campanhas.py`
- [X] T013 [P] [US2] Extend `frontend/src/api/campanhas.ts` with `fetchMinhas()`
- [X] T014 [US2] Create `frontend/src/pages/PainelPage.tsx` (+ CSS): gate session → `/login?next=/painel`; list minhas (nome, sistema, visibilidade); empty placeholder stub OK until US5
- [X] T015 [US2] Register `/painel` in `frontend/src/App.tsx`; change default post-login / convite / reset destination to `/painel` in `frontend/src/pages/AuthPages.tsx`
- [X] T016 [P] [US2] Add header/nav links Home / Painel (se sessão) / Entrar in `frontend/src/components/layout/CodexHeader.tsx` (or shared auth chrome) without replacing `/` catalog for logged-in users

**Checkpoint**: T011 green; login sem `next` → painel

---

## Phase 5: User Story 3 - Mestre cria campanha na UI (Priority: P1)

**Goal**: POST criar + formulário no painel; default `listada`; permanece no painel; slug inválido recusado

**Independent Test**: Criar → dono + listada na home; slug duplicado/reservado falha; anónimo 401 (SC-005 parcial)

### Tests for User Story 3 ⚠️

- [X] T017 [P] [US3] Write failing tests in `backend/tests/test_campanha_criar_http.py`: anonymous 401; success 201 + dono; default visibilidade `listada`; `so_link` when set; slug invalid/reserved/duplicate error codes; sistema inválido

### Implementation for User Story 3

- [X] T018 [US3] Implement `POST /api/campanhas` (JSON body) calling create service + `assign_owner` in `backend/app/routers/campanhas.py` per `contracts/api-minhas-criar-visibilidade.md`
- [X] T019 [P] [US3] Add `criarCampanha()` to `frontend/src/api/campanhas.ts`
- [X] T020 [US3] Add create form on `PainelPage.tsx` (nome, slug, sistema select from known systems, visibilidade default listada); on success stay on `/painel` and refresh minhas (MUST NOT auto-navigate to `/c/{slug}`)

**Checkpoint**: T017 green; nova listada aparece na home após refresh

---

## Phase 6: User Story 4 - Visibilidade, cota, exportar e importar (Priority: P1)

**Goal**: PATCH visibilidade; indicador cota + aviso ≥90%; export dono; import qualquer mestre; UI chama 097

**Independent Test**: listada→so_link some da home; cota visível; export zip dono; import aparece em minhas (SC-005)

### Tests for User Story 4 ⚠️

- [X] T021 [P] [US4] Write failing tests in `backend/tests/test_visibilidade_patch.py`: dono 200 toggles; non-dono/anon 403/401; catalogo reflects change
- [X] T022 [P] [US4] Extend or add UI-facing smoke in `backend/tests/test_painel_minhas.py` (or dedicated) asserting `aviso_cota` true when `bytes_usados >= 0.9 * cota_bytes`

### Implementation for User Story 4

- [X] T023 [US4] Implement `PATCH /api/campanhas/{slug}/visibilidade` with `require_dono` in `backend/app/routers/campanhas.py`
- [X] T024 [P] [US4] Add `patchVisibilidade`, `exportCampanha` (blob download), `importCampanha` (multipart) in `frontend/src/api/campanhas.ts` wrapping 097 endpoints
- [X] T025 [US4] On each painel card: toggle visibilidade, cota bar/text + aviso ≥90%, Export button (dono only), Open `/c/{slug}`; global Import file control; refresh minhas after import/create/patch

**Checkpoint**: T021–T022 green; home reflecte visibilidade

---

## Phase 7: User Story 5 - Nocturne, i18n, telemóvel e vazios (Priority: P2)

**Goal**: Copy pt-BR/en; Nocturne; viewport estreito; vazios home/painel com CTA

**Independent Test**: Trocar idioma; ≤800px acções alcançáveis; painel vazio oferece criar/importar (SC-006)

### Implementation for User Story 5

- [X] T026 [P] [US5] Add i18n keys for home, painel, create form, empty states, cota warning, export/import errors in `frontend/src/locales/pt-BR/comum.json` and `frontend/src/locales/en/comum.json`
- [X] T027 [US5] Polish `HomePage.css` / `PainelPage.css` for Nocturne tokens and narrow viewport stacking; wire empty states with CTAs (criar / importar / entrar)
- [X] T028 [P] [US5] Map API error codes to `useApiErrorMessage` / i18n for create/visibilidade/import failures on PainelPage

**Checkpoint**: SC-006 manual via quickstart scenario 5

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Docs, CHANGELOG, suite verde — sem bump SemVer salvo pedido; sem `/opt`

- [X] T029 [P] Document catalogo/minhas/criar/visibilidade + FE `/` `/painel` in `backend/README.md`
- [X] T030 [P] Add `[Unreleased]` **Added** for home/painel (spec 098) in `CHANGELOG.md`; set **Status: Implemented** in `specs/098-home-painel-mestre/spec.md` and update row in `specs/v2/README.md`; note 094 home + 095 post-login destination updates
- [X] T031 Run `cd backend && uv run pytest` twice (0 failures); walk `specs/098-home-painel-mestre/quickstart.md` scenarios 1–5

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → blocks all US
- **US1** after Foundational (catalogo API + HomePage) → **MVP**
- **US2** after Foundational (minhas); FE can follow US1 for shared `campanhas.ts`
- **US3** after create service (Foundational) + painel shell (US2) for form host
- **US4** after US2/US3 (cards on painel) + 097 APIs already present
- **US5** after US1–US4 UI exists (polish copy/CSS)
- **Polish** last

### User Story Dependencies

- **US1**: Foundational list_catalogo — independently testable
- **US2**: Foundational list_minhas; FE auth redirect
- **US3**: Foundational create + US2 PainelPage
- **US4**: US2/US3 surface + require_dono (097)
- **US5**: polish on existing pages

### Within Each User Story

- API tests MUST fail before implementation (II)
- No super-admin / co-mestre UI
- No `/opt/codex-*`
- No SemVer bump unless requested

### Parallel Opportunities

- T001 ∥ T002
- T004 ∥ T005 after T003 (or carefully parallel schemas)
- T006 then T007; T008 ∥ early HomePage after API
- T011 ∥ T006 style independence
- T017 ∥ T021 after Foundational
- T026 ∥ T028
- T029 ∥ T030

---

## Parallel Example: User Story 1

```bash
Task: "failing tests test_catalogo_publico.py"
# Then GET catalogo + HomePage + App.tsx /
```

---

## Parallel Example: User Story 2

```bash
Task: "failing tests test_painel_minhas.py"
# Then GET minhas + PainelPage + AuthPages default /painel
```

---

## Parallel Example: User Story 4

```bash
Task: "failing tests test_visibilidade_patch.py"
Task: "aviso_cota assertion"
# Then PATCH + FE export/import/cota on cards
```

---

## Implementation Strategy

### MVP First (US1 home)

1. Setup + Foundational (create/list helpers)
2. US1 catalogo + HomePage
3. **STOP and VALIDATE**: SC-001 / SC-003

### Incremental Delivery

1. US1 → descoberta pública
2. US2 → painel isolado + pós-login
3. US3 → criar sem CLI
4. US4 → visibilidade/cota/zip UI
5. US5 → polish i18n/mobile
6. Polish → docs + CHANGELOG

### Parallel Team Strategy

- After Foundational: Dev A = US1; Dev B = US2 API tests
- After US2 shell: Dev A = US3; Dev B = US4 PATCH tests
- US5 after UI surfaces exist

---

## Notes

- [P] = different files, no incomplete-task dependency
- Exact paths from `plan.md`
- Verify API tests fail before implementing
- Stop at checkpoints
- Avoid: super-admin UI, co-mestre UI, `/opt` cuts, inventário privado em `/`
