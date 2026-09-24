# Tasks: Contas de mestre, convite, sessão e permissões

**Input**: Design documents from `/specs/095-contas-sessao-permissoes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (Constituição I–II) — auth, permissões, Alembic controlo, matriz **todas** as rotas admin, lockout: escrever testes **a falhar** antes da implementação correspondente. Actualizar harness que usava Basic Auth.

**Organization**: US1 = convite CLI+aceitar; US2 = login/logout sessão; US3 = require_membro + matriz + remover Basic Auth (MVP segurança); US4 = reset/desactivar/dono CLI; US5 = lockout+IP; US6 = FE login

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/`
- Frontend: `frontend/`
- Deploy: `deploy/`
- Specs: `specs/095-contas-sessao-permissoes/`
- Docs: `backend/README.md`, `CHANGELOG.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependência pwdlib e alinhamento com contratos

- [X] T001 Add `pwdlib[argon2]` to `[project].dependencies` in `backend/pyproject.toml` and refresh lock (`cd backend && uv lock`)
- [X] T002 [P] Skim `specs/095-contas-sessao-permissoes/contracts/auth-api.md`, `cli-usuario.md`, `require-membro.md`, `admin-auth-matrix.md`, `frontend-auth-routes.md`, `research.md`, and `data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema controlo + serviços de senha/sessão/CSRF/IP; base partilhada

**⚠️ CRITICAL**: Nenhuma história até existirem tabelas, hash Argon2 e helpers de sessão. Sem UI super-admin. Sem cadastro aberto.

- [X] T003 Add settings `public_base_url` (`PUBLIC_BASE_URL`), `trusted_proxy` / cookie secure policy in `backend/app/config.py`
- [X] T004 [P] Create control models `Usuario`, `Membro`, `Convite`, `Sessao`, and login-lockout entity in `backend/app/models/` (per `data-model.md`); register metadata for Alembic controlo
- [X] T005 Create Alembic revision under `backend/alembic_control/versions/` (`render_as_batch=True`) creating those tables
- [X] T006 Implement password hash/verify helpers with pwdlib Argon2 in `backend/app/services/auth_password.py`
- [X] T007 Implement opaque session create/lookup/revoke (store token hash only) in `backend/app/services/auth_session.py`
- [X] T008 Implement invite/reset token issue/consume helpers in `backend/app/services/auth_invite.py`
- [X] T009 Update `backend/app/services/rate_limit.py` key_func for real client IP (`CF-Connecting-IP` / trusted `X-Forwarded-For` when configured)
- [X] T010 Add CSRF Origin/Referer check middleware for mutating methods in `backend/app/main.py` (allowlist from CORS origins)

**Checkpoint**: Models migrate on `init_control`; unit helpers hash/session work in a scratch test

---

## Phase 3: User Story 1 - Super-admin convida um mestre (Priority: P1)

**Goal**: CLI `usuario criar` + API aceitar convite; email único; link 72 h uso único

**Independent Test**: CLI imprime `/convite/{token}`; aceitar define senha e activa; reuso/expirado falha

### Tests for User Story 1 ⚠️

- [X] T011 [P] [US1] Write failing tests in `backend/tests/test_cli_usuario.py` for criar success (user+invite), duplicate email, printed invite path
- [X] T012 [P] [US1] Write failing tests in `backend/tests/test_auth_convite.py` for accept success, reuse fail, expired fail

### Implementation for User Story 1

- [X] T013 [US1] Implement `usuario criar --email` in `backend/app/cli.py` (and helpers under `backend/app/services/`) creating pending Usuario + Convite `activar`
- [X] T014 [US1] Implement `POST /api/auth/convite/aceitar` in `backend/app/routers/auth.py`; mount router in `backend/app/main.py`

**Checkpoint**: T011–T012 green

---

## Phase 4: User Story 2 - Mestre inicia e termina sessão (Priority: P1)

**Goal**: Login/logout cookie HttpOnly SameSite=Lax; idle 12 h / max 30 d; GET `/api/auth/me`

**Independent Test**: Login → cookie → me 200; logout → me 401; públicas sem login intactas

### Tests for User Story 2 ⚠️

- [X] T015 [P] [US2] Write failing tests in `backend/tests/test_auth_session.py` for login/logout/me, inactive user, cookie flags (HttpOnly/SameSite)

### Implementation for User Story 2

- [X] T016 [US2] Implement `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` in `backend/app/routers/auth.py` using `auth_session` + password verify
- [X] T017 [US2] Wire session cookie set/clear helpers (Secure when not DEBUG) in `backend/app/services/auth_session.py` or `backend/app/deps/auth.py`

**Checkpoint**: T015 green; public characterization still passes without cookie

---

## Phase 5: User Story 3 - require_membro e fim do Basic Auth (Priority: P1) 🎯 MVP segurança

**Goal**: Substituir `verify_admin`; matriz 100% rotas admin; upload com cookie; remover basicauth Caddy do repo; actualizar testes 092/094

**Independent Test**: Matriz [admin-auth-matrix.md](./contracts/admin-auth-matrix.md) verde; Basic Auth já não autoriza

### Tests for User Story 3 ⚠️

- [X] T018 [US3] Write failing tests in `backend/tests/test_admin_auth_matrix.py` enumerating all `/api/c/{slug}/admin` routes: anonymous → fail; other-campaign master → 403; member → not 401
- [X] T019 [P] [US3] Adapt `backend/tests/conftest.py` and characterization tests (`test_admin_auth.py`, etc.) to use session cookie of a campaign member instead of `TEST_GM_AUTH` Basic

### Implementation for User Story 3

- [X] T020 [US3] Replace `verify_admin` with `require_membro` in `backend/app/deps/auth.py` and `backend/app/routers/admin/__init__.py`; update `/session` payload to email
- [X] T021 [US3] Remove HTTP Basic gate usage from app config expectations; stop requiring `ADMIN_USER`/`ADMIN_PASSWORD` as GM gate in `backend/app/config.py` (deprecate or ignore for auth)
- [X] T022 [P] [US3] Remove `basicauth` GM blocks from `deploy/Caddyfile`, `deploy/Caddyfile.local`, and `deploy/snippets/caddy.site.tpl`

**Checkpoint**: SC-001; upload admin with cookie works; Basic Auth headers ignored/insufficient

---

## Phase 6: User Story 4 - CLI reset, desactivar, atribuir-dono (Priority: P1)

**Goal**: `usuario reset|desactivar`; `campanha atribuir-dono` (um dono; substitui)

**Independent Test**: Cada subcomando + API reset; dono anterior perde membership

### Tests for User Story 4 ⚠️

- [X] T023 [P] [US4] Extend `backend/tests/test_cli_usuario.py` for reset link, desactivar, atribuir-dono replace previous owner
- [X] T024 [P] [US4] Write failing tests in `backend/tests/test_auth_reset.py` for reset confirm + old session revoked

### Implementation for User Story 4

- [X] T025 [US4] Implement CLI `usuario reset`, `usuario desactivar`, `campanha atribuir-dono` in `backend/app/cli.py`
- [X] T026 [US4] Implement `POST /api/auth/reset/confirmar` in `backend/app/routers/auth.py` (revoke sessions)

**Checkpoint**: T023–T024 green

---

## Phase 7: User Story 5 - Lockout 5/15 min + IP real (Priority: P1)

**Goal**: 5 falhas → bloqueio 15 min por email e por IP; senha correcta também falha no bloqueio

**Independent Test**: 5 bad logins → 6th blocked; IP counter independent

### Tests for User Story 5 ⚠️

- [X] T027 [US5] Write failing tests in `backend/tests/test_auth_lockout.py` for per-account and per-IP lockout (5 failures / 15 min)

### Implementation for User Story 5

- [X] T028 [US5] Implement lockout persistence/counters in `backend/app/services/auth_lockout.py` and integrate into login in `backend/app/routers/auth.py`
- [X] T029 [US5] Ensure login path uses real-IP key from T009; document trusted proxy env in `backend/README.md` (brief note OK if polish expands)

**Checkpoint**: SC-005

---

## Phase 8: User Story 6 - Frontend login (Priority: P1)

**Goal**: `/login`, `/convite/:token`, `/reset/:token`; credentials include; sem Basic gate; `?next=` / página mínima

**Independent Test**: Manual quickstart §1 + i18n pt/en

### Implementation for User Story 6

- [X] T030 [P] [US6] Add i18n keys pt-BR + en for login/convite/reset/pós-login in `frontend/src/locales/`
- [X] T031 [US6] Create `frontend/src/pages/LoginPage.tsx`, `ConvitePage.tsx`, `ResetPage.tsx` (and minimal post-login UI)
- [X] T032 [US6] Wire routes in `frontend/src/App.tsx`; update `frontend/src/api/client.ts` for `credentials: 'include'` and remove Basic Auth helpers/storage
- [X] T033 [US6] Replace GM Basic gate flow in `frontend/src/pages/MapPage.tsx` and `RelacoesPage.tsx` (and `AdminGateDialog` usage) to redirect `/login?next=…` on 401

**Checkpoint**: SC-006 / SC-007 via manual + API tests

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Docs, CHANGELOG, suite verde — sem bump SemVer salvo pedido

- [X] T034 [P] Document auth CLI, `/api/auth`, cookie session, and removal of Basic Auth in `backend/README.md`
- [X] T035 [P] Add `[Unreleased]` **Added/Changed** for accounts/session (spec 095) in `CHANGELOG.md`; update `.env.example` (`PUBLIC_BASE_URL`, deprecate ADMIN_* as GM gate)
- [X] T036 Run `cd backend && uv run pytest` twice (0 failures including matrix); walk `quickstart.md` scenarios 1–5
- [X] T037 Set **Status: Implemented** in `specs/095-contas-sessao-permissoes/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → blocks all US
- **US1** after Foundational (invite)
- **US2** after US1 (needs activatable user) — can start password login tests with factory user
- **US3** after US2 (needs session cookie) — **MVP segurança**
- **US4** after US1/US2 (reset/desactivar/dono)
- **US5** after US2 (login path)
- **US6** after US2–US3 API stable
- **Polish** last

### User Story Dependencies

- **US1**: Foundational only
- **US2**: US1 (or test fixture creating user+password)
- **US3**: US2 + membership (atribuir-dono may be stubbed in tests until US4)
- **US4**: US1 + US2
- **US5**: US2
- **US6**: US2 + US3

### Within Each User Story

- Tests MUST fail before implementation (II)
- No open signup / super-admin UI / co-mestre UI

### Parallel Opportunities

- T001 ∥ T002
- T004 ∥ T003 after skim
- T006 ∥ T007 ∥ T008 after models
- T011 ∥ T012
- T023 ∥ T024
- T030 ∥ early FE scaffolding after API
- T034 ∥ T035

---

## Parallel Example: User Story 1

```bash
Task: "failing tests test_cli_usuario.py criar"
Task: "failing tests test_auth_convite.py aceitar"
# Then CLI + POST /api/auth/convite/aceitar
```

---

## Parallel Example: User Story 3

```bash
Task: "failing admin auth matrix test"
Task: "adapt conftest to session cookie"
# Then require_membro + Caddy basicauth removal
```

---

## Implementation Strategy

### MVP First (through US3)

1. Setup + Foundational
2. US1 convite + US2 sessão
3. US3 require_membro + matriz + sem Basic Auth
4. **STOP**: API multi-campanha com contas verificável só com pytest

### Incremental Delivery

1. … + US4 CLI operação
2. US5 lockout
3. US6 FE
4. Polish

### Parallel Team Strategy

Solo esperado. Após US3: A = US4/US5, B = US6 FE.

---

## Notes

- [P] = ficheiros diferentes
- Suggested next: `/speckit-implement`
- Sem versão 0.19.2 automática; legado `/opt` intocado
- Matriz: `contracts/admin-auth-matrix.md`
