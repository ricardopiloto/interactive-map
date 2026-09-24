# Tasks: Uploads com acesso controlado e cota por campanha

**Input**: Design documents from `/specs/096-uploads-cota/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (Constituição I–II) — ACL de mídia, cota, reconciliação, isolamento A/B no endpoint de mídia: escrever testes **a falhar** antes da implementação. Actualizar matriz/helpers 094 de `/uploads/c/…` para `/api/c/…/media/…`.

**Organization**: US1 = ACL retrato (critério-chave privacidade); US2 = mapa versionado + públicos + rewrite + FE URLs + `/uploads` 404; US3 = cota 10 GB + CLI reconciliar + aviso UI; US4 = Cache-Control

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/`
- Frontend: `frontend/`
- Specs: `specs/096-uploads-cota/`
- Docs: `backend/README.md`, `CHANGELOG.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhamento com contratos; zero deps novas

- [X] T001 [P] Skim `specs/096-uploads-cota/contracts/media-api.md`, `upload-quota.md`, `cache-headers.md`, `url-rewrite.md`, `isolation-media.md`, `cli-reconcile.md`, `research.md`, and `data-model.md`
- [X] T002 Confirm no new Python/npm dependencies required (Constitution IV); note in implement notes if anything unexpected appears

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Endpoint de mídia + path seguro + rewrite helper + fim do serve `/uploads`; base partilhada por todas as US

**⚠️ CRITICAL**: Nenhuma história até existir GET mídia com resolução de ficheiro no sítio da campanha e `/uploads` a 404. Sem CDN. Sem GC de órfãos.

- [X] T003 Add path helpers (resolve campaign uploads file by slug/category/basename; reject `..`) in `backend/app/services/media_paths.py` (or equivalent under `backend/app/services/`)
- [X] T004 [P] Implement URL rewrite `/uploads/c/{slug}/…` → `/api/c/{slug}/media/…` in `backend/app/services/url_rewrite.py`
- [X] T005 Remove or replace `GET /uploads/c/{slug}/…` in `backend/app/main.py` so it returns 404 and does not serve campaign files; ensure bare `/uploads/…` stays 404
- [X] T006 Create `GET /api/c/{slug}/media/{categoria}/{arquivo}` router (FileResponse, category allowlist `map|portraits|locals`) in `backend/app/routers/` (e.g. `public/media.py` or `media.py`); mount in `backend/app/main.py` or public router; ACL stub: serve if file exists (portrait ACL comes in US1)
- [X] T007 Apply `url_rewrite` on read for `retrato_url` / local image fields in public+admin serializers or response builders under `backend/app/` (personagens, locais, upload response path later in US2/US3)

**Checkpoint**: Anónimo GET mídia mapa/local existente → 200; GET `/uploads/c/…` → 404; path traversal → 404

---

## Phase 3: User Story 1 - Retrato oculto não vaza (Priority: P1) 🎯 MVP privacidade

**Goal**: Anónimo/não-membro só obtém retrato se personagem **dessa** campanha referencia o ficheiro e `visivel_para_todos`; membro da campanha sempre acede

**Independent Test**: Retrato oculto → 404 anónimo + 200 dono; visível → 200 anónimo; membro de B em slug A → 404 (SC-001)

### Tests for User Story 1 ⚠️

- [X] T008 [P] [US1] Write failing tests in `backend/tests/test_media_acl.py` for hidden portrait 404 anonymous, 200 member; visible portrait 200 anonymous; orphan portrait 404 anonymous / 200 member; other-campaign member treated as anonymous

### Implementation for User Story 1

- [X] T009 [US1] Implement ACL rules in `backend/app/services/media_acl.py` (member check via 095 session cookie; portrait visibility query on campaign DB only)
- [X] T010 [US1] Wire `media_acl` into media GET handler for `portraits` in the media router; keep opaque 404 on deny

**Checkpoint**: T008 green; SC-001

---

## Phase 4: User Story 2 - Mapa versionado, públicos, FE URLs (Priority: P1)

**Goal**: `mapa_arquivo` versionado; `has_map_image` sem varredura contínua; ponte 094; FE e API usam `/media/`; isolamento actualizado

**Independent Test**: Upload mapa → campo preenchido; config sem `campaign-map.*`; anónimo vê mapa/local; leftover stamp; cliente pede `/media/` (SC-004 / SC-005)

### Tests for User Story 2 ⚠️

- [X] T011 [P] [US2] Write failing tests for map upload → `mapa_arquivo`, `has_map_image` from field, ponte `campaign-map.*`, and `/uploads` 404 in `backend/tests/test_mapa_arquivo.py` (or extend existing upload/config tests)
- [X] T012 [P] [US2] Update `backend/tests/test_isolation_http.py` and `backend/tests/conftest.py` (`uploads_url` → media URL helper) per `contracts/isolation-media.md`

### Implementation for User Story 2

- [X] T013 [US2] Change map upload in `backend/app/services/uploads.py`: versioned filename only; set `Campanha.mapa_arquivo`; delete previous map file; return `/api/c/{slug}/media/map/…` (no `campaign-map.*` write)
- [X] T014 [US2] Update `backend/app/services/instance_config.py` and `backend/app/schemas/config.py`: `has_map_image` from `mapa_arquivo`; one-time ponte stamp; expose `mapa_arquivo` and/or `map_url` (no quota fields in public config)
- [X] T015 [US2] Ensure portrait/local uploads return media URLs in `backend/app/services/uploads.py` (and admin upload router if needed)
- [X] T016 [US2] Update `frontend/src/api/campaignSlug.ts` (and MapPage/config consumers): `campaignMediaUrl` / `defaultMapUrl` from config `mapa_arquivo` or `map_url`, not hardcoded `campaign-map.webp`

**Checkpoint**: T011–T012 green; FE Network shows `/api/c/…/media/…`

---

## Phase 5: User Story 3 - Cota 10 GB (Priority: P1)

**Goal**: Contador `bytes_usados`; recusa `COTA_EXCEDIDA`; aviso 90% no upload; substituição mapa por delta líquido; CLI reconciliar

**Independent Test**: Upload que cabe / que excederia; aviso ≥90%; mapa ≤ anterior em 100% aceite; reconciliar corrige desvio (SC-002 / SC-006 / SC-007)

### Tests for User Story 3 ⚠️

- [X] T017 [P] [US3] Write failing tests in `backend/tests/test_quota.py` for accept under cap, reject over cap (no disk write), 90% warning flag, map replace net delta at 100%, reject larger map at 100%
- [X] T018 [P] [US3] Write failing tests for `campanha reconciliar-cota` in `backend/tests/test_cli_reconcile.py` (or extend `test_cli_campanha.py`)

### Implementation for User Story 3

- [X] T019 [US3] Implement quota checks and `bytes_usados` updates (incl. map net delta) in `backend/app/services/uploads.py`; structured error `COTA_EXCEDIDA`; success payload with `aviso_cota` / usage fields per `contracts/upload-quota.md`
- [X] T020 [US3] Implement `campanha reconciliar-cota --slug` in `backend/app/cli.py` (+ helper service) per `contracts/cli-reconcile.md`
- [X] T021 [P] [US3] Add i18n keys pt-BR + en for quota warning/refusal in `frontend/src/locales/`
- [X] T022 [US3] Surface `aviso_cota` and `COTA_EXCEDIDA` in `frontend/src/components/media/ImageSlot.tsx` (and upload callers if needed)

**Checkpoint**: T017–T018 green; SC-002 / SC-006 / SC-007

---

## Phase 6: User Story 4 - Cache headers (Priority: P2)

**Goal**: map/locals `public, immutable`; portraits `private, no-store`

**Independent Test**: Inspect Cache-Control on successful media responses (SC / US4)

### Tests for User Story 4 ⚠️

- [X] T023 [P] [US4] Write failing tests asserting Cache-Control headers for map/locals vs portraits in `backend/tests/test_media_cache.py` (or extend `test_media_acl.py`)

### Implementation for User Story 4

- [X] T024 [US4] Set Cache-Control on media FileResponse per `contracts/cache-headers.md` in the media router

**Checkpoint**: T023 green

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Docs, CHANGELOG, suite verde — sem bump SemVer salvo pedido

- [X] T025 [P] Document media endpoint, `/uploads` 404, quota CLI, and removal of public static uploads in `backend/README.md`
- [X] T026 [P] Add `[Unreleased]` **Added/Changed** for media ACL + quota (spec 096) in `CHANGELOG.md`; set **Status: Implemented** in `specs/096-uploads-cota/spec.md` and update row in `specs/v2/README.md`
- [X] T027 Run `cd backend && uv run pytest` twice (0 failures including ACL, quota, isolation media); walk `quickstart.md` scenarios 1–6

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → blocks all US
- **US1** after Foundational (ACL on existing media GET)
- **US2** after Foundational (mapa/config/FE); can parallelize with US1 after T006 if careful on `uploads.py` vs ACL files
- **US3** after US2 map upload path stable (same `uploads.py`) — sequential with map changes preferred
- **US4** after media GET exists (after Foundational / with US1)
- **Polish** last

### User Story Dependencies

- **US1**: Foundational only (privacy MVP)
- **US2**: Foundational; touches upload + config + FE
- **US3**: Depends on US2 upload behavior for map delta; portraits/locals quota can start after Foundational
- **US4**: Media router from Foundational

### Within Each User Story

- Tests MUST fail before implementation (II)
- No GC, no CDN, no permanent quota banner, no `/opt` changes

### Parallel Opportunities

- T001 ∥ T002
- T003 ∥ T004 after skim
- T008 ∥ early US2 tests after Foundational
- T011 ∥ T012
- T017 ∥ T018
- T021 ∥ T019 after API shape known
- T025 ∥ T026

---

## Parallel Example: User Story 1

```bash
Task: "failing tests test_media_acl.py"
# Then media_acl.py + wire into media GET
```

---

## Parallel Example: User Story 3

```bash
Task: "failing tests test_quota.py"
Task: "failing tests CLI reconciliar-cota"
# Then uploads quota + CLI; FE i18n/ImageSlot after API payload
```

---

## Implementation Strategy

### MVP First (US1 privacidade)

1. Setup + Foundational (media GET + `/uploads` 404)
2. US1 ACL retrato
3. **STOP**: critério-chave SC-001 verificável só com pytest

### Incremental Delivery

1. … + US2 (mapa + FE URLs + isolamento)
2. US3 cota + CLI + aviso slot
3. US4 cache headers
4. Polish

### Parallel Team Strategy

Solo esperado. Após Foundational: A = US1/US4, B = US2, depois US3 em `uploads.py`.

---

## Notes

- [P] = ficheiros diferentes
- Suggested next: `/speckit-implement`
- Sem versão 0.19.2 automática; legado `/opt` intocado
- Contratos: `contracts/*.md`
