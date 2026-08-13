# Tasks: Multi-Deploy & Hub Índice

**Input**: Design documents from `/specs/078-multideploy-hub/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = scaffold `nova-campanha.sh`; US2 = hub estático; US4 = `migrar-wfrp.sh`; US3 = runbook update

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Scripts: `scripts/`
- Hub: `hub/`
- Deploy templates: `deploy/`
- Docs: `docs/`, `README.md`, `CHANGELOG.md`

---

## Phase 1: Setup

**Purpose**: Align on contracts and current compose/env layout

- [x] T001 Skim `specs/078-multideploy-hub/contracts/cli-nova-campanha.md`, `contracts/cli-migrar-wfrp.md`, `contracts/campanhas-json.md`, `contracts/ui-hub.md`, `research.md`, and `data-model.md`
- [x] T002 [P] Skim `docker-compose.yml`, `deploy/Caddyfile`, and `.env.example` (fixed `mapa-api` names vs unique `COMPOSE_PROJECT_NAME`)

---

## Phase 2: Foundational (Blocking)

**Purpose**: Shared helpers, snippet templates, compose uniqueness so N instâncias coexistem

**⚠️ CRITICAL**: Blocks US1 and US4; US2 can start after T001

- [x] T003 Add unique `COMPOSE_PROJECT_NAME` / document override pattern in `docker-compose.yml` comments and `deploy/docker-compose.override.tpl.yml` (host `ports` for API/web, `container_name` `codex-<slug>-api|web`)
- [x] T004 [P] Create Caddy site snippet template in `deploy/snippets/caddy.site.tpl`
- [x] T005 [P] Create cloudflared ingress snippet in `deploy/snippets/cloudflared.ingress.tpl`
- [x] T006 [P] Create hub JSON entry snippet in `deploy/snippets/campanhas.entry.tpl.json`
- [x] T007 Create `scripts/lib/codex-instance.sh` with: resolve `CODEX_INSTANCES_ROOT` (default `/opt`), slug validate, port-free check (`ss`/`lsof`), dest-exists abort, `.env` write from `.env.example`, password prompt + optional `caddy hash-password`, print snippets (MUST NOT write host Caddyfile or `hub/campanhas.json`)
- [x] T008 [P] Document `CODEX_INSTANCES_ROOT`, `PORTA_*`, and per-instance `CORS_ORIGINS` in `.env.example`

**Checkpoint**: Templates + lib exist; compose override can publish unique host ports

---

## Phase 3: User Story 1 - Nova campanha via scaffold (Priority: P1) 🎯 MVP

**Goal**: `nova-campanha.sh` cria pasta, `.env`, override Compose, imprime Caddy/tunnel/hub; aborta se portas ocupadas

**Independent Test**: Quickstart scenarios 1–2

### Implementation for User Story 1

- [x] T009 [US1] Implement `scripts/nova-campanha.sh` per `contracts/cli-nova-campanha.md`: args `nome porta-api porta-web sistema`, `--root`/`--url`/`--repo`, clone into `<root>/codex-<nome>/`, generate override from `deploy/docker-compose.override.tpl.yml`, call `scripts/lib/codex-instance.sh`
- [x] T010 [US1] Wire clone/rsync fallback and TTY-required password prompt in `scripts/nova-campanha.sh` (no password argv)
- [x] T011 [US1] Print next-step `docker compose up --build -d` and **do not** start containers from `scripts/nova-campanha.sh`

**Checkpoint**: Free ports → folder + `.env`; busy port → abort, no folder

---

## Phase 4: User Story 2 - Hub índice público (Priority: P1)

**Goal**: Site estático com cartões a partir de `campanhas.json` via fetch em runtime

**Independent Test**: Quickstart scenarios 3–4

### Implementation for User Story 2

- [x] T012 [P] [US2] Create hub markup/layout in `hub/index.html` per `contracts/ui-hub.md`
- [x] T013 [P] [US2] Create hub styles (Nocturne-compatible, cards, optional cover) in `hub/styles.css`
- [x] T014 [US2] Implement `fetch('campanhas.json')`, empty/error/partial-entry states in `hub/app.js` per `contracts/campanhas-json.md`
- [x] T015 [P] [US2] Add sample `hub/campanhas.json` (one WFRP placeholder, `capa_url` optional) and `hub/capas/.gitkeep`
- [x] T016 [P] [US2] Add `hub/Caddyfile.example` (static root, `Cache-Control: no-cache` for `campanhas.json`, no auth)

**Checkpoint**: Edit JSON + refresh shows new card; missing capa does not break layout

---

## Phase 5: User Story 4 - Migração WFRP (`migrar-wfrp.sh`) (Priority: P1)

**Goal**: Copiar/reconfigurar instância actual para `codex-wfrp` sem editar Caddy nem hub JSON

**Independent Test**: Quickstart scenario 6

### Implementation for User Story 4

- [x] T017 [US4] Implement `scripts/migrar-wfrp.sh` per `contracts/cli-migrar-wfrp.md`: dest `codex-wfrp`, `--source` default `/var/www/interactive-map`, copy `data/` and `uploads/` when present
- [x] T018 [US4] Reuse `scripts/lib/codex-instance.sh` for `.env` (`SISTEMA=wfrp4e`), override ports, snippet print; abort if dest exists
- [x] T019 [US4] Assert script never writes `deploy/Caddyfile`, host Caddyfile, or `hub/campanhas.json` (stdout snippets only) in `scripts/migrar-wfrp.sh`

**Checkpoint**: Fixture copy → `codex-wfrp` with db/uploads; hub/Caddy files unchanged

---

## Phase 6: User Story 3 - Actualização manual de instâncias (Priority: P2)

**Goal**: Runbook `git pull` + rebuild por pasta, sem orquestração multi-host

**Independent Test**: Quickstart scenario 5

### Implementation for User Story 3

- [x] T020 [US3] Write `docs/runbook-instancias.md`: per-folder `git pull && docker compose up --build -d`; `CODEX_INSTANCES_ROOT`; warning not to loop all instances in v2
- [x] T021 [P] [US3] Link runbook from `README.md` (produção / multi-instância)

**Checkpoint**: Operator can update one instance without touching others (documented)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Version 0.13.0, docs, quickstart

- [x] T022 [P] Add `[0.13.0]` changelog entry for v2 Frente B in `CHANGELOG.md`
- [x] T023 [P] Bump version to **0.13.0** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T024 [P] Mention `scripts/nova-campanha.sh`, `hub/`, and `docs/runbook-instancias.md` in `README.md`
- [x] T025 Run full `specs/078-multideploy-hub/quickstart.md`
- [x] T026 Set feature status to Implemented in `specs/078-multideploy-hub/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational (**blocks** US1/US4) → US1 → US4 (reuses lib) → US2 can parallel US1 after T001 → US3 anytime after Foundational → Polish
- US2 does not need working scaffold
- US4 should reuse T007/T009 patterns (same snippets)

### User Story Dependencies

- **US1**: T003–T008 then T009–T011
- **US2**: Independent of scripts (T012–T016)
- **US4**: Needs T007 + T003–T006; preferably after US1
- **US3**: Docs only after paths exist (`scripts/`, `hub/`)

### Parallel Opportunities

- T001 ∥ T002
- T004 ∥ T005 ∥ T006 ∥ T008
- T012 ∥ T013 ∥ T015 ∥ T016
- T022 ∥ T023 ∥ T024

---

## Parallel Example: Foundational snippets

```bash
Task: "Caddy snippet (T004)"
Task: "cloudflared snippet (T005)"
Task: "hub JSON snippet (T006)"
```

---

## Parallel Example: User Story 2

```bash
Task: "hub/index.html (T012)"
Task: "hub/styles.css (T013)"
Task: "sample campanhas.json (T015)"
# Then:
Task: "hub/app.js fetch + states (T014)"
```

---

## Implementation Strategy

### MVP

1. Foundational lib + templates (T003–T008)
2. US1 `nova-campanha.sh`
3. US2 hub
4. US4 `migrar-wfrp.sh`
5. US3 runbook + 0.13.0

### Notes

- Scripts MUST NOT start Docker or edit Caddy/`campanhas.json`
- Password only via TTY prompt
- Route/app runtime unchanged except compose uniqueness
- No automated tests requested
