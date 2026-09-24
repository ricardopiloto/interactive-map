# Tasks: Exportar e importar campanha

**Input**: Design documents from `/specs/097-exportar-importar/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (Constituição I–II) — export só-dono, round-trip contagens/IDs, recusas zip/`.db`/FK/imagem, schema futuro/antigo: escrever testes **a falhar** antes da implementação. Sem UI (098). Sem `/opt` (099). Sem bump SemVer salvo pedido.

**Organization**: US1 = export API+CLI (MVP); US2 = import round-trip + slug + cota; US3 = recusas segurança / zero rasto; US4 = schema futuro recusado / antigo migrado

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/`
- Specs: `specs/097-exportar-importar/`
- Docs: `backend/README.md`, `CHANGELOG.md`
- FE: **N/A** nesta fase

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhamento com contratos; zero deps novas (stdlib `zipfile`)

- [X] T001 [P] Skim `specs/097-exportar-importar/contracts/package-zip.md`, `api-export-import.md`, `cli-export-import.md`, `require-dono.md`, `security-refusals.md`, `research.md`, `data-model.md`, and `quickstart.md`
- [X] T002 Confirm no new Python dependency for zip (Constitution IV / `zipfile` stdlib); note in implement notes if anything unexpected appears

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: `require_dono`, constantes do pacote, códigos de erro, pasta de fixtures — base partilhada por todas as US

**⚠️ CRITICAL**: Nenhuma história até `require_dono` existir e o layout/códigos do pacote estarem definidos. Sem UI. Sem adoptar `.db` de utilizador.

- [X] T003 Add `require_dono` (session + `Membro.papel == "dono"`) in `backend/app/deps/auth.py` per `contracts/require-dono.md`
- [X] T004 [P] Add package constants / allowlisted zip entry rules and error code strings in `backend/app/services/package_schema.py` (or `package_constants.py`) per `contracts/package-zip.md` and `security-refusals.md`
- [X] T005 [P] Create empty fixture dir `backend/tests/fixtures/packages/` (README stub listing planned good/bad zips)
- [X] T006 [P] Add shared helpers for building minimal campaign content + images in tests under `backend/tests/helpers.py` (or `backend/tests/export_import_helpers.py`) reusable by US1–US4

**Checkpoint**: `require_dono` importável; constantes do contrato documentadas no código; fixtures dir existe

---

## Phase 3: User Story 1 - Dono exporta a mesa completa (Priority: P1) 🎯 MVP

**Goal**: Dono obtém zip (`manifest.json` + `content.json` + imagens); co-mestre / outra mesa / anónimo recusados; CLI exporta equivalente; zip A sem dados de B

**Independent Test**: Campanha A com locais/NPCs/vínculos/imagens; B com outros dados; export dono A → só A; co-mestre/dono B/anónimo → 401/403; CLI `--out` escreve zip válido (SC-001 parcial)

### Tests for User Story 1 ⚠️

- [X] T007 [P] [US1] Write failing tests in `backend/tests/test_export_auth.py` for anonymous 401, non-member 403, non-dono member 403, other-campaign dono 403, owner 200 zip (`Content-Type` / disposition) per `contracts/require-dono.md` and `api-export-import.md`
- [X] T008 [P] [US1] Write failing tests in `backend/tests/test_export_package.py` asserting zip layout (only allowlisted entries), `manifest.json` fields (`schema_version`, `sistema`, `app_version`, `slug_origem`, …), `content.json` tables/IDs, images present, and no records/files from campaign B
- [X] T009 [P] [US1] Write failing CLI test in `backend/tests/test_cli_export.py` for `campanha exportar --slug --out` producing equivalent package

### Implementation for User Story 1

- [X] T010 [US1] Implement serialize + zip builder in `backend/app/services/campaign_export.py` (read campaign DB + uploads; never include control users/sessions/`.db`)
- [X] T011 [US1] Add `GET /api/c/{slug}/admin/export` with `Depends(require_dono)` returning `application/zip` in `backend/app/routers/admin/export.py` (or extend admin router); mount in `backend/app/routers/admin/__init__.py` / `main.py`
- [X] T012 [US1] Add CLI `campanha exportar --slug --out` in `backend/app/cli.py` calling the same export service
- [X] T013 [US1] Extend admin auth matrix / OpenAPI expectations in `backend/tests/test_admin_auth_matrix.py` (or document export row) so export appears as dono-only

**Checkpoint**: T007–T009 green; zip A isolado de B

---

## Phase 4: User Story 2 - Importar cria mesa nova e reproduz contagens (Priority: P1)

**Goal**: Import API/CLI cria UUID novo, preserva IDs, sistema do manifesto, importador/`--email` = dono; slug origem se livre senão exige novo; cota excessiva recusada; A intacta

**Independent Test**: Export A → import com slug livre → A′; slug ocupado sem override → `SLUG_OCUPADO`; com `--slug`/`slug` livre → sucesso; contagens/IDs/imagens iguais; origem intacta (SC-001 / SC-003)

### Tests for User Story 2 ⚠️

- [X] T014 [P] [US2] Write failing round-trip tests in `backend/tests/test_import_roundtrip.py`: API import (authenticated) creates new campaign, importer is dono, counts/IDs/sistema match, media URLs rewritten to new slug, `bytes_usados` reconciled, origin unchanged
- [X] T015 [P] [US2] Write failing tests for slug resolution: free `slug_origem` used; occupied without override → 409 `SLUG_OCUPADO` zero side effects; invalid slug → 400; override free slug succeeds
- [X] T016 [P] [US2] Write failing CLI test in `backend/tests/test_cli_import.py` for `campanha importar --zip --email [--slug]` (owner by email; same count assertions)
- [X] T017 [P] [US2] Write failing test that import with images sum > default `cota_bytes` returns `COTA_EXCEDIDA` and creates no control row / no leftover UUID dir

### Implementation for User Story 2

- [X] T018 [US2] Implement validate + import pipeline (temp extract → validate → new UUID site → head DB → insert preserving IDs → copy images → reconcile → `Campanha` + `Membro` dono; rollback on failure) in `backend/app/services/campaign_import.py`
- [X] T019 [US2] Implement media URL rewrite old slug → `/api/c/{new}/media/…` during import (reuse `url_rewrite` patterns) inside `campaign_import.py` or helper
- [X] T020 [US2] Add `POST /api/campanhas/import` (multipart `file` + optional `slug`, CSRF + session, any authenticated user → dono) in `backend/app/routers/campanhas.py`; mount in `backend/app/main.py`
- [X] T021 [US2] Add CLI `campanha importar --zip --email [--slug]` in `backend/app/cli.py` using the same import service
- [X] T022 [US2] Wire anonymous → 401 on import; success → 201 JSON `{slug,id,nome,sistema}` per `contracts/api-export-import.md`

**Checkpoint**: T014–T017 green; SC-001 round-trip

---

## Phase 5: User Story 3 - Zip mau / `.db` / zero rasto (Priority: P1)

**Goal**: Pacotes malformados, path traversal, extras, `.db` cru ou no zip, FK partidas, imagem referida ausente → recusa com código; zero linha controlo / zero pasta órfã; nunca abrir `.db` de utilizador

**Independent Test**: Fixtures em `backend/tests/fixtures/packages/` para cada caso de `contracts/security-refusals.md`; assert códigos + estado limpo (SC-002)

### Tests for User Story 3 ⚠️

- [X] T023 [P] [US3] Write failing tests in `backend/tests/test_import_refusals.py` for missing manifesto, invalid JSON, broken FK, missing referenced image, zip-slip/`..`, absolute paths, extra entries (`.db`, `.txt`, script), raw `.db` upload, zip-bomb / oversized uncompressed → correct codes and zero side effects
- [X] T024 [P] [US3] Write failing test that mid-import failure (simulate after mkdir) cleans UUID dir and leaves no orphan `Campanha` row

### Implementation for User Story 3

- [X] T025 [US3] Harden zip entry allowlist, path checks, uncompressed size cap, and refuse-before-create in `backend/app/services/campaign_import.py` (+ helpers) per `contracts/package-zip.md` and `security-refusals.md`
- [X] T026 [US3] Ensure FK/image-reference validation rejects entire package before control write; never open/copy user `.db` as `campanha.db`
- [X] T027 [US3] Implement rollback/cleanup path for partial failure (rmtree site + no control commit) and assert via T024

**Checkpoint**: T023–T024 green; SC-002

---

## Phase 6: User Story 4 - Schema futuro recusado; antigo migrado (Priority: P1)

**Goal**: `schema_version` desconhecida/futura → recusa; antiga reconhecida → migrators até head; sistema do manifesto imutável

**Independent Test**: Fixture future schema → `SCHEMA_FUTURO` / `SCHEMA_DESCONHECIDO`, zero sítio; fixture `000_pre` (or documented old id) → import succeeds on head with expected counts (SC-005)

### Tests for User Story 4 ⚠️

- [X] T028 [P] [US4] Write failing tests in `backend/tests/test_import_schema.py` for future/unknown `schema_version` refusal with no side effects
- [X] T029 [P] [US4] Write failing test for recognized older schema fixture (synthetic `000_pre` + identity/remap migrator) importing to current head with coherent counts; assert `sistema`/`modulos_ativos` from manifesto only

### Implementation for User Story 4

- [X] T030 [US4] Implement schema registry + migrator chain in `backend/app/services/package_schema.py` (head = current Alembic campaign revision; refuse unknown/newer)
- [X] T031 [US4] Call migrators on `content.json` (and manifesto fields if needed) inside `campaign_import.py` before inserts; create DB only via app head (`ensure_campaign_schema`), never Alembic-on-user-db
- [X] T032 [US4] Add synthetic older-schema fixture under `backend/tests/fixtures/packages/` and register its migrator for T029

**Checkpoint**: T028–T029 green; SC-005

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Docs, CHANGELOG, suite verde — sem bump SemVer salvo pedido; sem UI; sem `/opt`

- [X] T033 [P] Document export/import API + CLI + package layout + `require_dono` in `backend/README.md`
- [X] T034 [P] Add `[Unreleased]` **Added** for export/import (spec 097) in `CHANGELOG.md`; set **Status: Implemented** in `specs/097-exportar-importar/spec.md` and update row in `specs/v2/README.md`
- [X] T035 Run `cd backend && uv run pytest` twice (0 failures including export/import/refusals/schema); walk `specs/097-exportar-importar/quickstart.md` scenarios 1–5

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → blocks all US
- **US1** after Foundational (export first — produces real zips for later stories)
- **US2** after US1 export service stable (round-trip uses export output; fixtures can stub early)
- **US3** after import validation entry points exist (US2 pipeline or shared validators from Foundational); can harden in parallel with US2 finish
- **US4** after import pipeline (US2) can accept `content.json` transforms
- **Polish** last

### User Story Dependencies

- **US1**: Foundational only → **MVP**
- **US2**: Prefer after US1 (shared zip contract + real export); independently testable with hand-built fixture zip
- **US3**: Depends on import validator surface (US2 or early shared validate); fixtures-driven
- **US4**: Depends on import + `package_schema` registry

### Within Each User Story

- Tests MUST fail before implementation (II)
- No FE buttons (098)
- No `/opt/codex-*` (099)
- No SemVer bump unless explicitly requested

### Parallel Opportunities

- T001 ∥ T002
- T003 then T004 ∥ T005 ∥ T006
- T007 ∥ T008 ∥ T009 after Foundational
- T014 ∥ T015 ∥ T016 ∥ T017 after US1 zip available
- T023 ∥ T024
- T028 ∥ T029
- T033 ∥ T034

---

## Parallel Example: User Story 1

```bash
Task: "failing tests test_export_auth.py"
Task: "failing tests test_export_package.py"
Task: "failing CLI test_cli_export.py"
# Then campaign_export.py + admin export route + CLI
```

---

## Parallel Example: User Story 2

```bash
Task: "failing round-trip test_import_roundtrip.py"
Task: "failing slug / cota tests"
Task: "failing CLI test_cli_import.py"
# Then campaign_import.py + POST /api/campanhas/import + CLI
```

---

## Parallel Example: User Story 3

```bash
Task: "failing test_import_refusals.py + mid-fail cleanup"
# Then harden allowlist / FK / rollback in campaign_import.py
```

---

## Implementation Strategy

### MVP First (US1 export)

1. Setup + Foundational (`require_dono` + package constants)
2. US1 export API + CLI
3. **STOP and VALIDATE**: T007–T009 green; isolation A≠B

### Incremental Delivery

1. US1 → backup portátil existe
2. US2 → round-trip / transferência entre instâncias
3. US3 → endurecimento segurança (pode overlap finais de US2)
4. US4 → compat schema antigo / recusa futuro
5. Polish → docs + CHANGELOG + suite

### Parallel Team Strategy

- After Foundational: Dev A = US1; Dev B can draft US3 fixtures
- After US1 zip: Dev A = US2; Dev B = US3 refusals
- US4 after import path lands

---

## Notes

- [P] = different files, no incomplete-task dependency
- Exact paths from `plan.md`; adjust only if repo already has an equivalent module
- Verify tests fail before implementing
- Stop at checkpoints to validate each story
- Avoid adopting user `.db`; avoid UI; avoid `/opt` cuts
