# Implementation Plan: Focus Edge Opacity

**Branch**: `068-focus-edge-opacity` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/068-focus-edge-opacity/spec.md`

## Summary

Always draw role/filter-visible vínculo lines on Relações. Idle and mid-animation: **~18%** opacity. After the 0.6s layout animation, edges incident to the selected personagem go to **~90%**; all others stay ~18%. Deselect drops highlight immediately. Keep ring focus layout (066) and disc-centre anchors (067). Isolate still hides non-neighbour nodes and edges.

## Technical Context

**Language/Version**: TypeScript/React 19  
**Primary Dependencies**: `GraphStage.tsx`, `RelacoesPage.tsx` (`showEdges` timer)  
**Storage**: N/A  
**Testing**: Manual quickstart visual QA  
**Target Platform**: Web Relações stage  
**Project Type**: Monorepo frontend visual change  
**Performance Goals**: Draw all visible edges (seed ~15; still fine)  
**Constraints**: Clarifications — 18% / 90%; highlight only after animation; no API/visibility-rule changes  
**Scale/Scope**: Edge list + opacity in GraphStage; reinterpret `showEdges` as “highlight ready”  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clarifications 2/2 locked: **PASS**
- Scope = presentation of existing edges; filters/`publico` unchanged: **PASS**
- Constitution placeholder — follow repo patterns: **PASS**

**Post-Phase 1**: Unchanged — UI contract only.

## Project Structure

### Documentation (this feature)

```text
specs/068-focus-edge-opacity/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-focus-edge-opacity.md
└── tasks.md   # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/GraphStage.tsx   # always paint filtered edges; opacity 0.18 / 0.90
frontend/src/components/relacoes/GraphStage.css   # optional opacity transition; labels only on highlight
frontend/src/pages/RelacoesPage.tsx               # showEdges = highlight-after-animation (not hide all)
CHANGELOG.md / version manifests
```

**Structure Decision**: Frontend-only. Page timer still gates **highlight**, not **existence** of lines.

## Complexity Tracking

> None.
