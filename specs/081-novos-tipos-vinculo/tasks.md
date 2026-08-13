# Tasks: Novos Tipos de Vínculo (Rede de Relações)

**Input**: Design documents from `/specs/081-novos-tipos-vinculo/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = persistência + formulário + direcção default; US2 = grafo/legenda/filtros; US3 = qualificadores + doc produto

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Backend: `backend/app/`
- Docs: `docs/feature-rede-relacoes.md`, `CHANGELOG.md`, `README.md`

---

## Phase 1: Setup

**Purpose**: Align with contracts before touching enum/catalog

- [x] T001 Skim `specs/081-novos-tipos-vinculo/contracts/api-vinculo-tipo.md`, `contracts/ui-vinculo-catalog.md`, `contracts/ui-vinculo-form.md`, `research.md`, and `data-model.md`
- [x] T002 [P] Skim `backend/app/models/vinculo.py`, `frontend/src/types/index.ts`, `frontend/src/components/relacoes/vinculoStyles.ts`, `qualificadorSuggestions.ts`, and `VinculoFormDialog.tsx`

---

## Phase 2: Foundational (Blocking)

**Purpose**: 8-type catalog compiles end-to-end — blocks US1–US3

**⚠️ CRITICAL**: Extending `VinculoTipo` without `VINCULO_STYLES` / `BY_TIPO` breaks `tsc` (`Record<VinculoTipo, …>`)

- [x] T003 Add `adversario = "adversario"` and `vinculo_sangue = "vinculo_sangue"` to `VinculoTipo` in `backend/app/models/vinculo.py` (no DB migration; `VARCHAR(20)` already fits)
- [x] T004 Extend `VinculoTipo` union in `frontend/src/types/index.ts` with `'adversario'` and `'vinculo_sangue'`
- [x] T005 Update `VINCULO_STYLES` and `VINCULO_TIPOS` in `frontend/src/components/relacoes/vinculoStyles.ts` per `contracts/ui-vinculo-catalog.md` (ordem canónica; `adversario` `#c86b3c` sólida; `vinculo_sangue` `#6a3d8c` sólida)
- [x] T006 [P] Add `vinculoTipo.adversario` and `vinculoTipo.vinculo_sangue` to `frontend/src/locales/pt-BR/relacoes.json` (Adversário / Vínculo de Sangue) and `frontend/src/locales/en/relacoes.json` (Adversary / Blood Bond)
- [x] T007 Add `adversario` and `vinculo_sangue` keys to `BY_TIPO` in `frontend/src/components/relacoes/qualificadorSuggestions.ts` (empty arrays OK — US3 fills lists) so `Record<VinculoTipo, string[]>` typechecks

**Checkpoint**: `npm run build` typechecks; API accepts the two new `tipo_ab` values; form/legenda already iterate `VINCULO_TIPOS` (8 entradas)

---

## Phase 3: User Story 1 - Criar e editar vínculos com os novos tipos (Priority: P1) 🎯 MVP

**Goal**: GM escolhe Adversário / Vínculo de Sangue; recíproco pré-preenche direcção A→B **ao seleccionar** o tipo

**Independent Test**: Quickstart 1–4 (criar Adversário; select Blood Bond → A→B; editar existente não reset; duas vias mistura)

### Implementation for User Story 1

- [x] T008 [US1] In `frontend/src/components/relacoes/VinculoFormDialog.tsx`, on reciprocal tipo `<select>` `onChange`: if new value is `vinculo_sangue`, set `direcao: 'a_para_b'` together with `tipo_ab` / `tipo_ba`; do **not** change `direcao` on dialog open (`startEditVinculo` in `frontend/src/pages/RelacoesPage.tsx` stays as-is)
- [x] T009 [US1] Confirm duas-vias tipo selects in `frontend/src/components/relacoes/VinculoFormDialog.tsx` do **not** auto-set `direcao` when either side is `vinculo_sangue` (`contracts/ui-vinculo-form.md`)

**Checkpoint**: Quickstart 1–4 pass; 6 tipos legados inalterados ao editar sem mudar o tipo

---

## Phase 4: User Story 2 - Grafo, legenda e filtros (Priority: P1)

**Goal**: 8 cores/estilos na ordem canónica; filtro isola Adversário (cobre) e Vínculo de Sangue (violeta)

**Independent Test**: Quickstart 5–6, 8 (8 chips/legenda; filtro; EN labels; legados)

### Implementation for User Story 2

- [x] T010 [P] [US2] Grep `frontend/src` for leftover 6-type arrays or hardcoded tipo lists; replace with `VINCULO_TIPOS` from `frontend/src/components/relacoes/vinculoStyles.ts` (`RelacoesSideColumn.tsx`, `RelacoesPage.tsx`)
- [x] T011 [US2] Confirm `frontend/src/components/relacoes/GraphStage.tsx` and `RelacoesDetailPanel.tsx` use `vinculoStyle` / `getVinculoTipoLabel` (no hardcoded hex); dashed remains only `conhecido`

**Checkpoint**: Quickstart 5–6: ordem Aliado → Vínculo de Sangue → … → Conhecido; cores `#c86b3c` / `#6a3d8c`

---

## Phase 5: User Story 3 - Qualificadores e documentação (Priority: P2)

**Goal**: Lacaio em Aliado e Vínculo de Sangue; Adversário = sugestões de Inimizade; doc produto 8 tipos

**Independent Test**: Quickstart 7 e 9

### Implementation for User Story 3

- [x] T012 [US3] Fill `BY_TIPO` in `frontend/src/components/relacoes/qualificadorSuggestions.ts`: `aliado` += `'Lacaio'`; `vinculo_sangue: ['Lacaio']`; `adversario` copy of `inimizade` (`Rival`, `Traidor`, `Antigo aliado`); Medo global unchanged
- [x] T013 [P] [US3] Add `qualificador.lacaio` (`Lacaio` / `Minion`) to `frontend/src/locales/pt-BR/relacoes.json` and `frontend/src/locales/en/relacoes.json` (parity; datalist keeps stored PT literals)
- [x] T014 [US3] Update `docs/feature-rede-relacoes.md` §§ 3.1, 6, 6.1, 11 per FR-009 / research §8 (8 tipos, ordem canónica, Lacaio, nota agnóstica); do **not** edit `docs/v2/feature-rede-relacoes.md`

**Checkpoint**: Quickstart 7 (datalist) e 9 (tabela §6 com 8 linhas)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Version 0.16.0, changelog, build, spec status

- [x] T015 [P] Add `[0.16.0]` entry in `CHANGELOG.md` (Adversário + Vínculo de Sangue / Blood Bond)
- [x] T016 [P] Bump version to **0.16.0** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T017 Run `cd frontend && npm run build` then `specs/081-novos-tipos-vinculo/quickstart.md`
- [x] T018 Set **Status: Implemented** in `specs/081-novos-tipos-vinculo/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T002) → Foundational (T003–T007) → US1 (T008–T009) → US2 (T010–T011) → US3 (T012–T014) → Polish
- US2 can start as soon as T005–T006 land (catalog + i18n); US1 needs T005 for the form options
- US3 T012 depends on T007 stubs
- Polish after US1–US3

### User Story Dependencies

- **US1**: Foundational; form already lists `VINCULO_TIPOS` after T005
- **US2**: Foundational (styles); independent of T008–T009
- **US3**: Foundational T007; independent of US1 direction logic

### Parallel Opportunities

- T001 ∥ T002
- T003 ∥ T004 ∥ T006 (depois T004, T005 e T007 no mesmo “compile fix”)
- T010 ∥ T011 (ficheiros diferentes)
- T013 ∥ T014 (depois T012)
- T015 ∥ T016

---

## Parallel Example: Foundational

```bash
Task: "VinculoTipo Python (T003)"
Task: "VinculoTipo TS (T004)"
Task: "i18n keys (T006)"
# Then sequential (Record completeness):
Task: "vinculoStyles catalog (T005)"
Task: "BY_TIPO stub keys (T007)"
```

---

## Parallel Example: User Story 2

```bash
Task: "Grep leftover 6-type lists (T010)"
Task: "GraphStage + detail panel styles (T011)"
```

---

## Implementation Strategy

### MVP

1. Setup + Foundational (T001–T007) — API + catálogo visual
2. US1 (T008–T009) — direcção default Blood Bond
3. US2 visual check (T010–T011)
4. US3 qualificadores + `docs/feature-rede-relacoes.md`
5. 0.16.0 + quickstart

### Notes

- Sem migração SQL; sem seed obrigatório
- Qualifiers no datalist = literais PT persistidos (075)
- Direcção default só no `onChange` do select recíproco, nunca no mount
- `docs/v2/feature-rede-relacoes.md` fora de âmbito
- Sem testes automatizados
