# Tasks: Roteamento por campanha

**Input**: Design documents from `/specs/094-roteamento-campanha/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (Constituição I–II) — matriz HTTP isolamento A/B (API + uploads), adaptação 092 ao prefixo, 404 opaca, paths antigos: escrever testes **a falhar** antes da implementação correspondente. Sem deps novas.

**Organization**: US1 = FE deep link mapa/relações; US2 = API/admin por slug + isolamento (MVP backend); US3 = so_link; US4 = config Campanha + cache FE por slug

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/`
- Frontend: `frontend/`
- Specs: `specs/094-roteamento-campanha/`
- Docs: `backend/README.md`, `CHANGELOG.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhar contratos e decisões de research

- [X] T001 [P] Skim `specs/094-roteamento-campanha/contracts/api-campaign-prefix.md`, `uploads-slug-path.md`, `frontend-campaign-routes.md`, `isolation-http-matrix.md`, `research.md`, and `plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Resolução HTTP por path slug + erros opacos; base partilhada (ainda sem remount completo se testes US2 forem primeiro — helpers prontos)

**⚠️ CRITICAL**: Nenhuma história de produto até `resolve` HTTP usar slug do path com 404 opaca (inactivo = `CAMPANHA_NAO_ENCONTRADA`). Sem contas. Sem Alembic novo.

- [X] T002 Unify inactive + missing slug HTTP errors to opaque `CAMPANHA_NAO_ENCONTRADA` (404) in `backend/app/campaign_db.py` (stop exposing `CAMPANHA_INACTIVA` / `CAMPAIGN_SLUG_AUSENTE` on path-based resolve)
- [X] T003 Change `get_session` in `backend/app/database.py` and `backend/app/campaign_db.py` to take campaign `slug` from the request path (not `settings.campaign_slug`); keep env slug optional only for CLI/seed/scripts
- [X] T004 Remount public router to prefix `/api/c/{slug}` in `backend/app/routers/public/__init__.py` and admin to `/api/c/{slug}/admin` in `backend/app/routers/admin/__init__.py`; leave `GET /api/health` in `backend/app/main.py`
- [X] T005 Replace global `/uploads` mount with `/uploads/c/{slug}/…` serving that campaign’s uploads dir in `backend/app/main.py` (old `/uploads/…` → 404)
- [X] T006 Update `backend/app/services/uploads.py` (and admin upload handler) so returned `url` values use `/uploads/c/{slug}/…`
- [X] T007 Ensure `backend/app/services/instance_config.py` reads sistema/módulos/mapa from the Campanha resolved by the **path** slug (not `.env` as source)
- [X] T008 Rewrite `backend/tests/conftest.py` so the TestClient uses `/api/c/{slug}/…` for the test campaign and does **not** require `CAMPAIGN_SLUG` for HTTP

**Checkpoint**: Manual `GET /api/c/{slug}/config` works; `/api/locais` is 404; health ok

---

## Phase 3: User Story 2 - Pedidos por slug sem misturar mesas (Priority: P1) 🎯 MVP backend

**Goal**: Caracterização 092 no prefixo; matriz isolamento HTTP A/B (API + ficheiro); Basic Auth admin inalterado sob o novo path

**Independent Test**: `uv run pytest` — pins 092 verdes com prefixo; matriz [isolation-http-matrix.md](./contracts/isolation-http-matrix.md) verde

### Tests for User Story 2 ⚠️

> Escrever **antes** de dar por fechada a Phase 2 se ainda falharem; senão ajustar T004–T008 até passarem. Ideal: red → green na ordem abaixo.

- [X] T009 [P] [US2] Adapt all characterization tests under `backend/tests/` (092 suite) to call `/api/c/{slug}/…` and `/api/c/{slug}/admin/…` (fail until remount works)
- [X] T010 [US2] Write failing tests in `backend/tests/test_isolation_http.py` for matrix cases 1–6, 9 (A/B API + uploads + unprefixed 404) per `contracts/isolation-http-matrix.md`

### Implementation for User Story 2

- [X] T011 [US2] Harden path resolution / StaticFiles slug lookup and admin write isolation so T009–T010 pass (touch `backend/app/campaign_db.py`, `backend/app/main.py`, routers as needed)
- [X] T012 [US2] Assert admin GET without credentials still returns 401 under `/api/c/{slug}/admin/…` in `backend/tests/` (extend existing admin auth pins)

**Checkpoint**: SC-001 / SC-002; unprefixed content paths 404

---

## Phase 4: User Story 3 - Campanha so_link acessível (Priority: P1)

**Goal**: `so_link` + `activa` comporta-se como `listada` no acesso por URL; inactivo opaco

**Independent Test**: Casos 7–8 e 10 da matriz HTTP

### Tests for User Story 3 ⚠️

- [X] T013 [P] [US3] Extend `backend/tests/test_isolation_http.py` (or `test_campaign_access.py`) for so_link → 200 config; inactive + missing → identical opaque `CAMPANHA_NAO_ENCONTRADA`

### Implementation for User Story 3

- [X] T014 [US3] Confirm resolve path does not filter on `visibilidade`; only `activa` / existence (adjust `backend/app/campaign_db.py` if any gate blocks `so_link`)

**Checkpoint**: SC-003 / SC-004

---

## Phase 5: User Story 4 - Config por Campanha e cache FE por slug (Priority: P1)

**Goal**: Cliente indexa config por slug; base API e URLs de mapa derivadas do slug

**Independent Test**: Duas campanhas com sistemas distintos; abrir A depois B não reutiliza config de A

### Tests for User Story 4 ⚠️

- [X] T015 [P] [US4] Backend pin: `GET /api/c/{a}/config` vs `{b}/config` reflect distinct Campanha rows in `backend/tests/test_config_per_campaign.py` (or extend existing config tests)

### Implementation for User Story 4

- [X] T016 [US4] Refactor `frontend/src/hooks/useInstanceConfig.ts` to cache `Map<slug, InstanceConfig>` (inflight per slug); update `clearInstanceConfigCache` / `markHasMapImageInCache` to take slug
- [X] T017 [US4] Update `frontend/src/api/config.ts`, `frontend/src/api/client.ts`, `frontend/src/api/campaign.ts`, and `frontend/src/api/admin.ts` to build paths as `/api/c/${slug}/…` (slug from caller / params)
- [X] T018 [US4] Derive map/image URLs as `/uploads/c/${slug}/…` in `frontend/src/pages/MapPage.tsx` (and upload consumers); stop relying on global `VITE_MAP_URL` as the multi-campaign source of truth

**Checkpoint**: SC-005

---

## Phase 6: User Story 1 - Jogador abre a mesa pelo slug (Priority: P1)

**Goal**: Rotas `/c/:slug` e `/c/:slug/relacoes`; `/` e `/relacoes` → ecrã peça link; slug inválido → indisponível

**Independent Test**: Manual quickstart §4; deep link carrega só essa mesa

### Implementation for User Story 1

- [X] T019 [US1] Add i18n keys (pt-BR + en) for campaign missing / ask-for-slug copy in `frontend/src/locales/pt-BR/` and `frontend/src/locales/en/`
- [X] T020 [US1] Create `frontend/src/pages/CampaignMissingPage.tsx` (or equivalent) for «não encontrado» / peça link
- [X] T021 [US1] Wire `frontend/src/App.tsx`: `/c/:slug` → MapPage, `/c/:slug/relacoes` → RelacoesPage, `/` and `/relacoes` → CampaignMissingPage; pass slug into pages/hooks
- [X] T022 [US1] Update in-app navigation links in `frontend/src/pages/MapPage.tsx` and `frontend/src/pages/RelacoesPage.tsx` to preserve `/c/:slug/…`

**Checkpoint**: SC-006; US1 acceptance scenarios

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Docs, CHANGELOG, regressão completa — sem bump SemVer

- [X] T023 [P] Document `/api/c/{slug}/…`, `/uploads/c/{slug}/…`, and that HTTP ignores `CAMPAIGN_SLUG` in `backend/README.md`
- [X] T024 [P] Add `[Unreleased]` **Added** for campaign routing (spec 094) in `CHANGELOG.md` (keep version `0.19.1`)
- [X] T025 [P] Update root `.env.example` notes: `CAMPAIGN_SLUG` optional for scripts only; document FE deep-link `/c/<slug>`
- [X] T026 Run `cd backend && uv run pytest` twice (0 failures); walk `specs/094-roteamento-campanha/quickstart.md` scenarios 1–5
- [X] T027 Set **Status: Implemented** in `specs/094-roteamento-campanha/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: After Setup — **BLOCKS** US1–US4
- **US2 (Phase 3)**: After Foundational — **MVP backend** (API + isolamento); T009–T010 should go red before/while T004–T008 settle, then green
- **US3 (Phase 4)**: After US2 paths exist
- **US4 (Phase 5)**: After Foundational API config path; FE can parallelize with US3 after US2
- **US1 (Phase 6)**: After US4 API client helpers (T017) — FE routes need slug-aware API
- **Polish (Phase 7)**: After US1–US4

### User Story Dependencies

- **US2**: No other stories (backend MVP)
- **US3**: Depends on US2 resolve/HTTP
- **US4**: Depends on Foundational config-by-slug; FE after T017 needs remount
- **US1**: Depends on US4 client path helpers (or implement T017 first inside US1 if sequencing solo)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (II) where listed
- No accounts, home list, ACL/cota
- Do not bump SemVer

### Parallel Opportunities

- T001 alone in Setup
- T009 ∥ early draft of T010 after remount started
- T013 ∥ T015 after US2 green
- T016–T018 sequential (same FE api/config surface) — avoid parallel edits to same files
- T019 ∥ T020 before T021
- T023 ∥ T024 ∥ T025 after implementation stable

---

## Parallel Example: User Story 2

```bash
# After foundational remount in progress:
Task: "Adapt characterization tests to /api/c/{slug}/… in backend/tests/"
Task: "Write failing isolation HTTP matrix in backend/tests/test_isolation_http.py"
# Then harden until green
```

---

## Parallel Example: Frontend (US4 + US1)

```bash
Task: "i18n keys pt-BR + en for campaign missing"
Task: "CampaignMissingPage.tsx"
# Then App.tsx routes + Map/Relacoes slug links
```

---

## Implementation Strategy

### MVP First (User Story 2 / backend)

1. Phase 1–2: path session + remount + uploads
2. Phase 3: 092 prefix + isolation matrix green
3. **STOP**: API multi-campanha verificável só com pytest/curl

### Incremental Delivery

1. Setup + Foundational + US2 → API isolada (MVP)
2. US3 → so_link + opaco
3. US4 → config/cache FE
4. US1 → deep links jogador
5. Polish → docs + suite verde + Status Implemented

### Parallel Team Strategy

Solo esperado. Se paralelo após US2: A = US3, B = US4/US1 FE.

---

## Notes

- [P] = ficheiros diferentes, sem depender de tarefa incompleta no mesmo ficheiro
- Suggested next: `/speckit-implement`
- Sem versão 0.19.2; sem produção antes de 095
- Matriz: `contracts/isolation-http-matrix.md`
