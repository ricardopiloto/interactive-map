# Tasks: Cores de Vínculo (Sangue, Inimizade, Adversário)

**Input**: Design documents from `/specs/085-vinculo-color-rethink/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = Sangue borgonha; US2 = Inimizade magenta + Adversário cobre; US3 = cinco tipos intactos + doc §6

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Docs / version: `docs/feature-rede-relacoes.md`, `CHANGELOG.md`, `README.md`, package manifests

---

## Phase 1: Setup

**Purpose**: Align with palette contract and existing catalog consumers

- [x] T001 Skim `specs/085-vinculo-color-rethink/contracts/ui-vinculo-palette.md`, `research.md`, `data-model.md`, and `quickstart.md`
- [x] T002 [P] Skim `frontend/src/components/relacoes/vinculoStyles.ts`, `GraphStage.tsx`, `RelacoesSideColumn.tsx`, `RelacoesDetailPanel.tsx`, and `vinculoDirection.ts`

---

## Phase 2: Foundational (Blocking)

**Purpose**: Confirm a single color catalog before changing hex values

**⚠️ CRITICAL**: No hex edits until leftover hardcoded colors are ruled out (or routed through `vinculoStyle`)

- [x] T003 Grep `frontend/src` for `#6a3d8c`, `#e0707a`, and `#c86b3c`; they MUST appear only in `frontend/src/components/relacoes/vinculoStyles.ts` — if found elsewhere, replace with `vinculoStyle` / `VINCULO_STYLES`

**Checkpoint**: Catalog is the only source of tipo colors

---

## Phase 3: User Story 1 - Vínculo de Sangue lê-se como sangue (Priority: P1) 🎯 MVP

**Goal**: `vinculo_sangue` paints borgonha `#9e2436` on graph, chips, legend, and detail dot

**Independent Test**: Quickstart scenario 1 (isolate Blood Bond → solid `#9e2436`, not violet `#6a3d8c`)

### Implementation for User Story 1

- [x] T004 [US1] Set `vinculo_sangue.color` to `'#9e2436'` in `frontend/src/components/relacoes/vinculoStyles.ts` (`dashed: false` unchanged)

**Checkpoint**: Quickstart 1 passes; Blood Bond is wine-red on all surfaces that read the catalog

---

## Phase 4: User Story 2 - Inimizade e Adversário distinguíveis (Priority: P1)

**Goal**: Inimizade becomes magenta `#d12d9a`; Adversário stays copper `#c86b3c`; three-way distinction + duas-vias gradients

**Independent Test**: Quickstart scenarios 2–4 (three types side by side; Inimizade ≠ Romance; mixed duas vias)

### Implementation for User Story 2

- [x] T005 [US2] Set `inimizade.color` to `'#d12d9a'` in `frontend/src/components/relacoes/vinculoStyles.ts`; leave `adversario.color` as `'#c86b3c'` (`dashed: false` on both)
- [x] T006 [US2] Confirm `frontend/src/components/relacoes/GraphStage.tsx`, `RelacoesSideColumn.tsx`, `RelacoesDetailPanel.tsx`, and `vinculoDirection.ts` still use `vinculoStyle` / `VINCULO_STYLES` (no new hex); duas-vias gradient picks up both catalog colors

**Checkpoint**: Quickstart 2–4 pass; magenta ≠ borgonha ≠ cobre ≠ Romance `#e08fc0`

---

## Phase 5: User Story 3 - Paleta restante e documentação (Priority: P2)

**Goal**: Aliado, Amizade, Romance, Família, Conhecido unchanged; product doc §6 matches the new families

**Independent Test**: Quickstart scenarios 5–6

### Implementation for User Story 3

- [x] T007 [US3] Verify `aliado`, `amizade`, `romance`, `familia`, and `conhecido` entries in `frontend/src/components/relacoes/vinculoStyles.ts` match [data-model.md](./data-model.md) (Conhecido still `dashed: true`)
- [x] T008 [P] [US3] Update the type table in `docs/feature-rede-relacoes.md` §6: Vínculo de Sangue = vermelho escuro / borgonha (`#9e2436`); Inimizade = magenta/fúcsia (`#d12d9a`); Adversário = cobre (`#c86b3c`); do **not** edit `docs/v2/feature-rede-relacoes.md`

**Checkpoint**: Quickstart 5–6 pass; §6 no longer calls Sangue «violeta» or Inimizade «vermelho»

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Version 0.17.1, changelog, build, spec status

- [x] T009 [P] Add `[0.17.1]` entry in `CHANGELOG.md` (Sangue borgonha `#9e2436`; Inimizade magenta `#d12d9a`; Adversário cobre inalterado); do **not** rewrite the `[0.16.0]` historical hex
- [x] T010 [P] Bump version to **0.17.1** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`; add 085 row in `specs/v2/README.md` follow-ups table
- [x] T011 Run `cd frontend && npm run build` then `specs/085-vinculo-color-rethink/quickstart.md`
- [x] T012 Set **Status: Implemented** in `specs/085-vinculo-color-rethink/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T002) → Foundational (T003) → US1 (T004) → US2 (T005–T006) → US3 (T007–T008) → Polish
- US1 and US2 edit the same `vinculoStyles.ts` — sequential (T004 then T005)
- T007 inspects the same file after T005
- T008 can run in parallel with T007 (different file)
- Polish after US1–US3

### User Story Dependencies

- **US1**: Foundational catalog grep; only `vinculo_sangue` hex
- **US2**: Depends on T004 landing first (same file); then Inimizade hex + consumer check
- **US3**: Depends on T004–T005 so the five unchanged rows can be verified against the new catalog; doc §6 independent of T007

### Parallel Opportunities

- T001 ∥ T002
- T007 ∥ T008 (after T005)
- T009 ∥ T010

---

## Parallel Example: Setup

```bash
Task: "Skim 085 contracts/research (T001)"
Task: "Skim vinculoStyles + consumers (T002)"
```

---

## Parallel Example: US3 + Polish docs

```bash
Task: "Verify five unchanged styles (T007)"
Task: "docs/feature-rede-relacoes.md §6 (T008)"
```

---

## Parallel Example: Polish

```bash
Task: "CHANGELOG 0.17.1 (T009)"
Task: "Bump manifests 0.17.1 (T010)"
```

---

## Implementation Strategy

### MVP

1. Setup + Foundational (T001–T003)
2. US1 (T004) — Sangue borgonha
3. **STOP and VALIDATE**: Quickstart 1
4. US2 (T005–T006) — Inimizade magenta
5. US3 (T007–T008) — regressão + doc
6. 0.17.1 + quickstart

### Incremental Delivery

1. Setup + Foundational → catalog confirmed
2. US1 → Blood Bond reads as blood (MVP)
3. US2 → three hostile/coercive types distinguishable
4. US3 → docs honest; other five untouched
5. Polish → 0.17.1

### Notes

- Sem backend, sem migração, sem i18n nova
- Hex canónicos: Sangue `#9e2436`, Inimizade `#d12d9a`, Adversário `#c86b3c`
- Afinar cobre só se o quickstart mostrar colisão com borgonha (research §2)
- `docs/v2/feature-rede-relacoes.md` fora de âmbito
- Sem testes automatizados
