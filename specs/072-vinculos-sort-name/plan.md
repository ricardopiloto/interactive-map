# Implementation Plan: Vínculos Sort by Name

**Branch**: `072-vinculos-sort-name` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/072-vinculos-sort-name/spec.md`

## Summary

Sort the Relações detail panel vínculo list A→Z by the **other** personagem’s name (`localeCompare` with `pt`, base sensitivity). Unresolved names go last; ties break by vínculo id. No API or schema changes.

## Technical Context

**Language/Version**: TypeScript / React 19  
**Primary Dependencies**: `RelacoesDetailPanel.tsx` (or sort before pass from `RelacoesPage` `selectedVinculos`)  
**Storage**: N/A  
**Testing**: Manual quickstart  
**Target Platform**: Web Relações detail sheet  
**Project Type**: Monorepo frontend polish  
**Performance Goals**: Sort ≤ ~20 rows — negligible  
**Constraints**: Ascending only; pt locale; panel only  
**Scale/Scope**: One sort in the detail vínculo list  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clear; no clarifications needed: **PASS**
- Presentation-only: **PASS**

**Post-Phase 1**: Unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/072-vinculos-sort-name/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-vinculos-sort-name.md
└── tasks.md   # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/RelacoesDetailPanel.tsx   # sort before map (preferred)
# or RelacoesPage.tsx selectedVinculos useMemo
CHANGELOG.md / version manifests                           # patch 0.9.1
```

**Structure Decision**: Sort inside `RelacoesDetailPanel` so any caller gets A→Z; keep `personagemById` for names.

## Complexity Tracking

> None.
