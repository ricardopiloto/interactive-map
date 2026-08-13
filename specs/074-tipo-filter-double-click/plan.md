# Implementation Plan: Tipo Filter Double-Click

**Branch**: `074-tipo-filter-double-click` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/074-tipo-filter-double-click/spec.md`

## Summary

Add double-click on Relações **Tipos de vínculo** chips: first dblclick isolates to that tipo only; dblclick again on the sole active chip restores all six tipos. Single-click keeps current per-chip toggle. Defer single-click briefly so dblclick does not flicker through intermediate toggles (especially the empty-filter flash when restoring).

## Technical Context

**Language/Version**: TypeScript / React 19  
**Primary Dependencies**: `RelacoesSideColumn.tsx`, `RelacoesPage.tsx` (`activeTipos` / `toggleTipo`)  
**Storage**: N/A (UI state only)  
**Testing**: Manual quickstart  
**Target Platform**: Web `/relacoes` side column  
**Project Type**: Monorepo frontend polish  
**Performance Goals**: Immediate filter update; click delay ≤ ~300ms  
**Constraints**: Portuguese UI; no emoji; no zero-tipos path via dblclick  
**Scale/Scope**: Side column chips + page handlers; patch version  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clear (clarify: no open questions): **PASS**
- Presentation-only: **PASS**

**Post-Phase 1**: Unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/074-tipo-filter-double-click/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-tipo-filter-double-click.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/RelacoesSideColumn.tsx   # onDoubleClick + click delay
frontend/src/pages/RelacoesPage.tsx                       # soloTipo / restoreAllTipos
CHANGELOG.md / version manifests                          # patch e.g. 0.10.1
```

**Structure Decision**: Keep `activeTipos` in `RelacoesPage`; column emits toggle vs solo/restore intents.

## Complexity Tracking

> None.
