# Tasks: Vínculos Sort by Name

**Input**: Design documents from `/specs/072-vinculos-sort-name/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: Single P1 story — sort detail panel vínculos A→Z by neighbour name

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Docs: `CHANGELOG.md`, version manifests at repo root / `frontend/package.json`

---

## Phase 1: Setup

**Purpose**: Confirm touch points before coding

- [x] T001 Skim sort target and name resolution in `frontend/src/components/relacoes/RelacoesDetailPanel.tsx` and how `vinculos` / `personagemById` are passed from `frontend/src/pages/RelacoesPage.tsx`
- [x] T002 [P] Confirm comparator rules in `specs/072-vinculos-sort-name/research.md` and `specs/072-vinculos-sort-name/contracts/ui-vinculos-sort-name.md`

---

## Phase 2: Foundational

**Purpose**: No shared infra; mark ready for US1

- [x] T003 Note: no API/schema work — proceed to Phase 3

**Checkpoint**: Ready for User Story 1

---

## Phase 3: User Story 1 - Lista de vínculos em ordem A→Z (Priority: P1) 🎯 MVP

**Goal**: Detail panel **Vínculos** list is always sorted ascending by neighbour name (`pt`, base sensitivity); unresolved names last; ties by vínculo id

**Independent Test**: Select a personagem with ≥3 vínculos whose names are not already A→Z; confirm list order and that row content (tipo, notas, duas vias, GM) is unchanged

### Implementation for User Story 1

- [x] T004 [US1] In `frontend/src/components/relacoes/RelacoesDetailPanel.tsx`, before rendering the vínculo list, sort a copy by neighbour `Personagem.nome` via `personagemById`: `localeCompare(..., 'pt', { sensitivity: 'base' })`; missing personagem last; tie-break by `vinculo.id` ascending (per `specs/072-vinculos-sort-name/contracts/ui-vinculos-sort-name.md`)
- [x] T005 [US1] Smoke-check 0/1 vínculo and ≥3 vínculos in the UI (manual) against `specs/072-vinculos-sort-name/quickstart.md` scenarios 1–2

**Checkpoint**: US1 complete — MVP delivered

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Release notes and version bump

- [x] T006 [P] Add `[0.9.1]` entry for vínculos A→Z sort in `CHANGELOG.md`
- [x] T007 [P] Bump version to `0.9.1` in `frontend/package.json` and any other version manifests used by the project (same pattern as 0.9.0)
- [x] T008 Run full `specs/072-vinculos-sort-name/quickstart.md` validation (incl. SC-003 content unchanged)
- [x] T009 Set feature status to Implemented in `specs/072-vinculos-sort-name/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: After Setup (noop marker)
- **User Story 1 (Phase 3)**: After Phase 2 — only story
- **Polish (Phase 4)**: After US1

### User Story Dependencies

- **User Story 1 (P1)**: No other stories

### Within User Story 1

- T004 before T005

### Parallel Opportunities

- T002 with T001
- T006 with T007 after US1

---

## Parallel Example: User Story 1

```bash
# Single-file story — sequential:
Task: "Sort vínculo list in RelacoesDetailPanel.tsx (T004)"
Task: "Manual smoke quickstart scenarios 1–2 (T005)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup T001–T002
2. Foundational T003
3. Implement sort T004 → validate T005
4. Polish T006–T009

### Incremental Delivery

- This feature is one increment; ship after Phase 4

---

## Notes

- Prefer sort inside `RelacoesDetailPanel.tsx` (plan Structure Decision); do not change API or graph order
- No automated tests requested
- Commit after logical groups if asked
