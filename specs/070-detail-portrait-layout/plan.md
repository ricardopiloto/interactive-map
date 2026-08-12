# Implementation Plan: Detail Portrait Layout

**Branch**: `070-detail-portrait-layout` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/070-detail-portrait-layout/spec.md`

## Summary

Relações detail panel is a flex column with a fixed height and `overflow-y: auto`. Default `flex-shrink: 1` lets a long description (and vínculos) **squash** the portrait `ImageSlot`. Stop shrinking the image slot; size the photo like the map NPC portrait (intrinsic height, `contain`, max-height); wrap long words so the 300px panel does not widen. Map sidebar is out of scope.

## Technical Context

**Language/Version**: CSS / React 19 (markup unchanged unless a wrapper is required)  
**Primary Dependencies**: `RelacoesDetailPanel.css`, existing `ImageSlot` + `.relacoes-detail__portrait`  
**Storage**: N/A  
**Testing**: Manual quickstart visual QA  
**Target Platform**: Web Relações detail sheet  
**Project Type**: Monorepo frontend layout fix  
**Performance Goals**: N/A (paint only)  
**Constraints**: Clarification A — Relações only; no description truncate; ficha `contain` (not disc cover); short copy must not gain extra scroll  
**Scale/Scope**: One panel CSS file (+ img rules); no API  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clarification 1/1 locked (Relações only): **PASS**
- No new data; presentation fix: **PASS**
- Constitution placeholder — follow 057/058 portrait patterns: **PASS**

**Post-Phase 1**: Unchanged — UI contract only.

## Project Structure

### Documentation (this feature)

```text
specs/070-detail-portrait-layout/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-detail-portrait-layout.md
└── tasks.md   # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/RelacoesDetailPanel.css   # flex-shrink: 0; img contain; word wrap
frontend/src/components/relacoes/RelacoesDetailPanel.tsx   # only if a wrapper class is needed
CHANGELOG.md / version manifests                          # patch bump (0.8.4)
```

**Structure Decision**: Frontend CSS on the Relações ficha only. Do not change `SideMenu` / map NPC cards.

## Complexity Tracking

> None.
