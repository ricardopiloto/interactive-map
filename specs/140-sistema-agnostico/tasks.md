# Tasks: Sistema de RPG system agnostic (aceitar qualquer nome)

**Input**: Design documents from `/specs/140-sistema-agnostico/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/sistema-livre.md](./contracts/sistema-livre.md), [quickstart.md](./quickstart.md)

**Depends on**: Existing `create_campanha` / package import; `DEFAULT_MODULOS_BY_SISTEMA`; Pydantic `min_length=1, max_length=40`.

**Tests**: **REQUIRED** (Constitution II + spec) — update/add pytest that today expect `SISTEMA_INVALIDO` / allowlist rejection; write failing expectations first where practical, then remove allowlist.

**Organization**: US1 (P1 create) then US2 (P2 import). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1], [US2]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Locate allowlist gates and existing tests

- [X] T001 Skim `backend/app/services/campanha_admin.py` — `KNOWN_SISTEMAS`, `create_campanha` `SISTEMA_INVALIDO` check, `default_modulos`
- [X] T002 [P] Skim `backend/app/services/campaign_import.py` — `validate_package_members` `SISTEMA_DESCONHECIDO` check; `backend/app/schemas/campanhas.py` `sistema` Field lengths
- [X] T003 [P] Skim `backend/tests/test_campanha_criar_http.py` (case `sistema: "desconhecido"` → `SISTEMA_INVALIDO`) and [contracts/sistema-livre.md](./contracts/sistema-livre.md)

---

## Phase 2: Foundational — confirm schema limits only

**Purpose**: No migration; validation stays min/max length

- [X] T004 Confirm `CriarCampanhaRequest.sistema` and `Campanha.sistema` already enforce non-empty / max 40 — no schema change planned; empty still 422 (FR-005)

**Checkpoint**: Ready to flip tests + remove allowlist

---

## Phase 3: User Story 1 — Criar campanha com qualquer sistema (P1) 🎯 MVP

**Goal**: `POST /api/campanhas` accepts free-form `sistema`; `wfrp4e` still gets fadiga

**Independent Test**: [quickstart.md](./quickstart.md) §1–3 + pytest create tests

### Tests for User Story 1 (REQUIRED — write/update first)

- [X] T005 [US1] In `backend/tests/test_campanha_criar_http.py`, change the `sistema: "desconhecido"` case to expect **success** (2xx) and assert no `SISTEMA_INVALIDO`; assert free-form campaign has empty/`[]` default modules (no fadiga) — test MUST fail until T007
- [X] T006 [P] [US1] In `backend/tests/test_campanha_criar_http.py` (or adjacent), ensure/add assertion that creating with `sistema: "wfrp4e"` still yields `modulos_ativos` including `"fadiga"` (SC-002)

### Implementation for User Story 1

- [X] T007 [US1] In `backend/app/services/campanha_admin.py`, remove `if sistema not in KNOWN_SISTEMAS: raise … SISTEMA_INVALIDO` and remove unused `KNOWN_SISTEMAS` constant (keep `default_modulos` / `DEFAULT_MODULOS_BY_SISTEMA`)
- [X] T008 [US1] Confirm router still `strip()`s `body.sistema` (`backend/app/routers/campanhas.py`); no `.lower()` added (research Decisão 3)
- [X] T009 [US1] Run `cd backend && uv run pytest tests/test_campanha_criar_http.py -q` until green

**Checkpoint**: Free-form create works; wfrp4e modules intact; empty sistema still rejected by Pydantic

---

## Phase 4: User Story 2 — Importar pacote com qualquer sistema (P2)

**Goal**: Package validation no longer rejects unknown `manifest["sistema"]`

**Independent Test**: [quickstart.md](./quickstart.md) §4 + import pytest

### Tests for User Story 2 (REQUIRED)

- [X] T010 [US2] Add or extend a test under `backend/tests/` (e.g. `test_import_schema.py` / `test_import_roundtrip.py` or new focused test) so a valid package manifesto with free-form `sistema` (e.g. `"shadowdark"` / `"mothership"`) is **accepted** by `validate_package_members` / import path — MUST NOT raise `SISTEMA_DESCONHECIDO`; test fails until T011

### Implementation for User Story 2

- [X] T011 [US2] In `backend/app/services/campaign_import.py`, remove the `KNOWN_SISTEMAS` / `SISTEMA_DESCONHECIDO` allowlist check in `validate_package_members`; drop unused import of `KNOWN_SISTEMAS`
- [X] T012 [US2] Run `cd backend && uv run pytest tests/test_import_roundtrip.py tests/test_import_schema.py -q` (plus the new free-sistema test) until green

**Checkpoint**: Import not blocked by sistema name; other package validations unchanged

---

## Phase 5: Polish & Cross-Cutting

**Purpose**: Gates, grep, docs

- [X] T013 Run [quickstart.md](./quickstart.md) §1–4 (UI or HTTP smoke optional if servers up)
- [X] T014 [P] Grep sanity: `rg -n 'KNOWN_SISTEMAS|SISTEMA_INVALIDO|SISTEMA_DESCONHECIDO' backend/app backend/tests` — zero allowlist checks in services; no test expecting `SISTEMA_INVALIDO` for free names
- [X] T015 [P] Note feature in `CHANGELOG.md` (Unreleased) — campanha `sistema` is free-form (create + import); `wfrp4e`/`wod` module defaults unchanged
- [X] T016 Optional: leave i18n keys `SISTEMA_INVALIDO` / `SISTEMA_DESCONHECIDO` in locales (dead codes OK) — do not invent new copy

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **US2 (4)** → **Polish (5)**
- Within US1: T005/T006 before T007 (TDD); T007 before T009
- Within US2: T010 before T011 before T012
- US2 can start after T007 (same allowlist concept) but prefer after US1 green

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | MVP — create path |
| **US2** | US1 recommended | Same product rule on import |

### Parallel Opportunities

```text
T001 || T002 || T003
T005 || T006
T014 || T015
```

---

## Implementation Strategy

### MVP (User Story 1)

1. Flip create HTTP test (T005–T006)
2. Remove allowlist in `campanha_admin.py` (T007)
3. Pytest green (T009)

### Incremental Delivery

1. Create free-form  
2. Import free-form  
3. CHANGELOG + grep  

---

## Format Validation

- All tasks use `- [ ]`, sequential `T00N`, file paths, and `[US1]`/`[US2]` on story phases only.
- Test tasks included because Constitution II + spec require them.
- No Alembic / frontend code tasks (UI already free-text).
