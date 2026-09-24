# Tasks: Migração das instâncias legadas e corte

**Input**: Design documents from `/specs/099-migracao-legado-corte/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (Constituição I–II) — import legado, relatório de contagens, origem intacta, isolamento WFRP/WoD, recusas (zip/`.db`/cota), scripts 078 recusam, snippets sem write: escrever testes **a falhar** antes da implementação. Sem UI nova. Sem API de import legado. Sem escrever em `/opt/codex-*`. Zip 097 intocado. Bump **2.0.0** só no fecho (CHANGELOG `[Unreleased]` até lá).

**Organization**: US1 = CLI import legado (MVP); US2 = WFRP+WoD contagens + isolamento; US3 = relatório ensaio PASS/FAIL; US4 = snippets corte; US5 = runbook 14 dias / origem intacta; US6 = aposentar 078 + docs

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/`
- Scripts: `scripts/`
- Specs: `specs/099-migracao-legado-corte/`
- Docs: `docs/`, `README.md`, `CHANGELOG.md`, `backend/README.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhamento com contratos; zero deps novas

- [X] T001 [P] Skim `specs/099-migracao-legado-corte/contracts/cli-importar-legado.md`, `relatorio-verificacao.md`, `url-rewrite-persist.md`, `runbook-corte.md`, `isolation-legado.md`, `scripts-aposentados.md`, `research.md`, `data-model.md`, and `quickstart.md`
- [X] T002 Confirm no new Python/npm dependencies (Constitution IV); note if anything unexpected appears
- [X] T003 [P] Create `backend/tests/fixtures/legado/README.md` describing wfrp/wod trees (`mapa.db` + `uploads/`; tests MAY materialize SQLite via helper)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helpers de árvore legada, códigos de erro, módulo de serviço vazio — base partilhada. Sem Alembic novo. Sem router HTTP novo.

**⚠️ CRITICAL**: Nenhuma história de import até o helper de fixture e os códigos do contrato existirem. `campanha importar` (zip) MUST permanecer intacto.

- [X] T004 [P] Add `backend/tests/legado_helpers.py`: build pre-Alembic `mapa.db` (reuse pattern from `backend/tests/test_legacy_bridge_stamp.py`), copy uploads layout, `hash_tree()`, table counts via `__tablename__` list in `data-model.md`
- [X] T005 [P] Add `LegacyImportError` + códigos (`ORIGEM_INVALIDA`, `COTA_EXCEDIDA`, `CONTAGEM_DIVERGENTE`, `URL_MIDIA_DESCONHECIDA`, `UPLOADS_LAYOUT_DESCONHECIDO`) in `backend/app/services/legacy_import.py` (stub; no copy yet)
- [X] T006 [P] Document origin path resolution (`mapa.db` vs `data/mapa.db`, `uploads/` vs `data/uploads/`) as functions in `backend/app/services/legacy_import.py` per `research.md` §3

**Checkpoint**: Helper cria árvore tmp; códigos importáveis; zip CLI 097 ainda verde

---

## Phase 3: User Story 1 - Super-admin importa uma instância legada (Priority: P1) 🎯 MVP

**Goal**: CLI copia `mapa.db`+`uploads/` para sítio UUID novo, ponte+stamp só no destino, URLs de mídia persistidas, dono atribuído, origem intacta; recusa zip/`.db` solto

**Independent Test**: Fixture tmp wfrp-like; `campanha importar-legado`; origem hash igual; destino head Alembic; dono = `--email`; `GET` mídia no slug novo (SC-002)

### Tests for User Story 1 ⚠️

- [X] T007 [P] [US1] Write failing tests in `backend/tests/test_cli_importar_legado.py`: happy path slug+sistema+nome+email; dest `campanha.db` stamped; owner membro; origin byte-equal
- [X] T008 [P] [US1] Write failing tests in `backend/tests/test_cli_importar_legado.py` for `ORIGEM_INVALIDA` (zip file, raw `.db`, missing `mapa.db`, missing `uploads/` dir) with zero `Campanha` row / zero UUID dir
- [X] T009 [P] [US1] Write failing tests in `backend/tests/test_cli_importar_legado.py` for `SLUG_DUPLICADO`, `USUARIO_NAO_ENCONTRADO`, `COTA_EXCEDIDA` (`--cota-bytes` below uploads sum) + rollback

### Implementation for User Story 1

- [X] T010 [US1] Implement copy pipeline in `backend/app/services/legacy_import.py`: validate origin → `create_campanha` → replace `campanha.db` with copy of `mapa.db` → copy uploads (layout `research.md` §4) → `ensure_campaign_schema(fresh=False)` on dest only
- [X] T011 [US1] Persist media URL rewrite on dest `npc.retrato_url` / `local.imagem_url` in `backend/app/services/legacy_import.py` per `contracts/url-rewrite-persist.md` (extend `backend/app/services/url_rewrite.py` if needed)
- [X] T012 [US1] After copy: stamp `mapa_arquivo` (096), `reconcile_bytes_usados`, apply `--cota-bytes`, `assign_owner`; refuse `COTA_EXCEDIDA` with rollback in `backend/app/services/legacy_import.py`
- [X] T013 [US1] Add CLI `campanha importar-legado` (flags per `contracts/cli-importar-legado.md`) in `backend/app/cli.py`; stdout `OK {slug} {caminho} PASS` (report payload MAY still be stub until US3)
- [X] T014 [US1] Implement dest rollback (rmtree site + delete `Campanha`/`Membro` created by this op) on any failure in `backend/app/services/legacy_import.py`

**Checkpoint**: T007–T009 green; origem intacta; zip 097 inalterado

---

## Phase 4: User Story 2 - WFRP e WoD: contagens idênticas e isolamento (Priority: P1)

**Goal**: Duas importações no mesmo `control.db`; relatórios/contagens por mesa; zero cruzamento de linhas ou ficheiros

**Independent Test**: Fixtures N≠M; import ambas; listagens `/api/c/wfrp` ≠ `/api/c/wod`; mídia cruzada 404 (SC-001 / FR-011)

### Tests for User Story 2 ⚠️

- [X] T015 [P] [US2] Write failing tests in `backend/tests/test_isolation_legado.py` per `contracts/isolation-legado.md`: two imports; local/NPC ids and files do not leak across slugs; anonymous GET media of A via slug B → 404
- [X] T016 [P] [US2] Write failing assertions in `backend/tests/test_isolation_legado.py` that per-table counts and upload file counts match origin vs dest for **both** campaigns (distinct N/M)

### Implementation for User Story 2

- [X] T017 [US2] Extend `backend/tests/legado_helpers.py` so wfrp-like and wod-like trees have distinct row/file counts (and different image bytes)
- [X] T018 [US2] Use existing HTTP test client helpers (`backend/tests/helpers.py`) in `backend/tests/test_isolation_legado.py` to exercise `/api/c/{slug}/locais` and `/api/c/{slug}/media/…` after CLI import (no new router)

**Checkpoint**: T015–T016 green; SC-001 nas duas mesas

---

## Phase 5: User Story 3 - Ensaio obrigatório com relatório (Priority: P1)

**Goal**: JSON de verificação (tabelas + ficheiros + `origem_intacta` + Alembic); PASS só se iguais; FAIL aborta corte (rollback dest)

**Independent Test**: Import feliz → JSON PASS; destorcer contagem (fixture inconsistente ou hook de teste) → `CONTAGEM_DIVERGENTE`, origem intacta, zero campanha (SC-001 / FR-005)

### Tests for User Story 3 ⚠️

- [X] T019 [P] [US3] Write failing tests in `backend/tests/test_cli_importar_legado.py` for `--relatorio PATH.json` schema per `contracts/relatorio-verificacao.md` (`tabelas`, `ficheiros_uploads`, `alembic_destino`, `origem_intacta`, `resultado`)
- [X] T020 [P] [US3] Write failing test that a forced count mismatch yields `ERRO CONTAGEM_DIVERGENTE`, `resultado=FAIL` if file written, and dest rolled back

### Implementation for User Story 3

- [X] T021 [US3] Implement count-before (origin `mapa.db`) vs count-after (dest stamped) + file counts in `backend/app/services/legacy_import.py`
- [X] T022 [US3] Print/write report JSON; gate `PASS` vs `FAIL` → `CONTAGEM_DIVERGENTE` + rollback in `backend/app/services/legacy_import.py`
- [X] T023 [US3] Wire `--relatorio` in `backend/app/cli.py`; keep stdout `OK … PASS` only on success

**Checkpoint**: T019–T020 green; ensaio documentável via JSON

---

## Phase 6: User Story 4 - Snippets de corte sem tocar no host (Priority: P1)

**Goal**: Imprimir Caddy + Cloudflare Tunnel para `campaign-codex.1nodado.com.br`; não escrever Caddyfile/hub/`codex-*`; sem redirect dos hosts antigos

**Independent Test**: Correr script contra tmp; stdout contém hostname; `deploy/Caddyfile` e `hub/campanhas.json` hashes iguais (SC-003 / FR-007)

### Tests for User Story 4 ⚠️

- [X] T024 [P] [US4] Write failing tests in `backend/tests/test_snippets_codex.py` (or `tests/test_snippets_codex.py` at repo root if easier to invoke bash): script exists; stdout includes `campaign-codex.1nodado.com.br`; no `redir` to old hosts
- [X] T025 [P] [US4] Write failing test that running the snippet script does not modify `deploy/Caddyfile`, `deploy/Caddyfile.local`, or `hub/campanhas.json`

### Implementation for User Story 4

- [X] T026 [US4] Create `scripts/imprimir-snippets-codex.sh` filling `deploy/snippets/caddy.site.tpl` and `deploy/snippets/cloudflared.ingress.tpl` (hostname fixed; `--porta-api` / `--porta-web`); stdout only
- [X] T027 [US4] Ensure snippet Caddy block has **no** `redir`/`redir permanent` for legacy hostnames in `scripts/imprimir-snippets-codex.sh` / templates used

**Checkpoint**: T024–T025 green

---

## Phase 7: User Story 5 - Retorno 14 dias, instâncias antigas intactas (Priority: P1)

**Goal**: Runbook: Codex verificado **antes** de parar as antigas; 14 dias paradas e intactas; religar sem alterar ficheiros

**Independent Test**: Runbook contém ordem FR-007, duração 14 dias, «sem `git pull` / sem apagar na janela»; teste código: origem read-only ainda importa (SC-004)

### Tests for User Story 5 ⚠️

- [X] T028 [P] [US5] Write failing test in `backend/tests/test_cli_importar_legado.py`: chmod origin tree read-only (or copy then chmod); import succeeds; origin hashes unchanged (reinforces FR-012)

### Implementation for User Story 5

- [X] T029 [US5] Write `docs/runbook-corte-campaign-codex.md` following `contracts/runbook-corte.md` (ensaio cópias → import → publish → snippets → smoke `/` `/c/wfrp` `/c/wod` → **then** stop `/opt/codex-*` → 14 days → rollback = up without file changes → after window archive/desligar, no delete during window)

**Checkpoint**: T028 green; runbook revistável por um operador

---

## Phase 8: User Story 6 - Aposentar multi-instância e actualizar docs (Priority: P2)

**Goal**: `nova-campanha.sh` / `migrar-wfrp.sh` avisam e `exit 1`; hub histórico; README/manuais usam host Codex + `/c/wfrp` `/c/wod`

**Independent Test**: Scripts não criam pastas; README não prescreve hub JSON como procedimento corrente (SC-005)

### Tests for User Story 6 ⚠️

- [X] T030 [P] [US6] Write failing tests in `backend/tests/test_scripts_aposentados.py` (invoke via subprocess from repo root): both scripts exit ≠ 0; stderr mentions aposentado/Codex; tmp dest root unchanged per `contracts/scripts-aposentados.md`

### Implementation for User Story 6

- [X] T031 [US6] Change `scripts/nova-campanha.sh` to print retirement message and `exit 1` **before** creating `codex-<slug>/`
- [X] T032 [P] [US6] Change `scripts/migrar-wfrp.sh` the same way (aviso + `exit 1`, no copy)
- [X] T033 [US6] Update `README.md`, `docs/manuais.md`, `docs/manual-mapa.md` (and en manuals **if they exist**) to Campaign Codex URLs `/c/wfrp` and `/c/wod`; stop recommending `nova-campanha.sh` as current procedure
- [X] T034 [P] [US6] Mark `hub/README.md` as historical (078); do not delete `hub/`

**Checkpoint**: T030 green; docs activas apontam ao Codex

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Docs de operador, CHANGELOG, regressão 097, quickstart

- [X] T035 [P] Document `campanha importar-legado` and `imprimir-snippets-codex.sh` in `backend/README.md`
- [X] T036 [P] Add `[Unreleased]` 2.0.0 notes (legado import, corte, 078 retired) in `CHANGELOG.md` — **do not bump** `pyproject` version until explicit release cut
- [X] T037 [P] Point `specs/v2/README.md` 099 to this plan/tasks (keep status Draft until implement completes)
- [X] T038 Run `specs/099-migracao-legado-corte/quickstart.md` suite: `uv run pytest tests/test_cli_importar_legado.py tests/test_isolation_legado.py tests/test_scripts_aposentados.py tests/test_snippets_codex.py -q` from `backend/`
- [X] T039 Confirm `campanha importar --zip` tests still pass (`backend/tests/test_cli_import.py`, `backend/tests/test_import_roundtrip.py`) — 097 must not regress

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: imediato
- **Foundational (Phase 2)**: após Setup — **bloqueia US1–US3 e US5 (teste read-only)**
- **US1 (Phase 3)**: após Phase 2 — MVP
- **US2 (Phase 4)**: após US1 (precisa do CLI/serviço)
- **US3 (Phase 5)**: após US1 (estende o mesmo serviço)
- **US4 (Phase 6)**: após Phase 1 — **não** depende do import Python (ficheiros `scripts/` + `deploy/snippets/`)
- **US5 (Phase 7)**: teste T028 após US1; runbook T029 pode em paralelo com US4
- **US6 (Phase 8)**: após Phase 1 — scripts 078 independentes do import; docs finais após runbook US5 de preferência
- **Polish (Phase 9)**: após as US desejadas

### User Story Dependencies

- **US1 (P1)**: após Foundational — sem outras US
- **US2 (P1)**: após US1
- **US3 (P1)**: após US1 (pode paralelo com US2 no mesmo `legacy_import.py` — **não** paralelo se um só implementador)
- **US4 (P1)**: independente após Setup
- **US5 (P1)**: T028 após US1; T029 docs independente
- **US6 (P2)**: independente após Setup; T033 melhor depois de T029

### Within Each User Story

- Testes MUST falhar antes da implementação da história
- Serviço antes do CLI (US1)
- Relatório (US3) depois da cópia (US1)
- Sem commit em `/opt`

### Parallel Opportunities

- T001 / T003
- T004 / T005 / T006
- T007 / T008 / T009
- T015 / T016
- T019 / T020
- T024 / T025
- T031 / T032 / T034
- T035 / T036 / T037
- US4 ∥ US6 ∥ (US1 depois da fundação)

---

## Parallel Example: User Story 1

```bash
Task: "Failing happy-path import tests in backend/tests/test_cli_importar_legado.py"
Task: "Failing ORIGEM_INVALIDA tests in backend/tests/test_cli_importar_legado.py"
Task: "Failing slug/user/cota tests in backend/tests/test_cli_importar_legado.py"
```

## Parallel Example: US4 + US6 (after Setup)

```bash
Task: "Failing snippet tests in backend/tests/test_snippets_codex.py"
Task: "Failing retired-script tests in backend/tests/test_scripts_aposentados.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + 2
2. Phase 3 US1 (testes vermelhos → serviço + CLI)
3. **STOP**: um import legado local com origem intacta
4. Depois US2 (duas mesas) — bloqueia o corte real

### Incremental Delivery

1. Setup + Foundational
2. US1 → MVP operador
3. US2 → critério-chave isolamento/contagens
4. US3 → ensaio com JSON
5. US4 + US5 → runbook colável
6. US6 → 078 morto como procedimento
7. Polish + pytest quickstart + regressão 097

### Parallel Team Strategy

- Dev A: US1 → US2 → US3
- Dev B: US4 + US6 scripts
- Dev C: US5 runbook + T033 docs

---

## Notes

- [P] = ficheiros distintos, sem depender de tarefa incompleta no mesmo ficheiro
- `backend/app/cli.py` é partilhado (US1 CLI + US3 `--relatorio`): não marcar essas tarefas [P] entre si
- `backend/app/services/legacy_import.py` é partilhado US1–US3–US5: um implementador de cada vez
- Testes **nunca** usam `/opt/codex-*`
- Verificar testes a falhar antes de implementar
- Próximo: `/speckit-implement`
