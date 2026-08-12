# Implementation Plan: Disc Edge Anchor

**Branch**: `067-disc-edge-anchor` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/067-disc-edge-anchor/spec.md`

## Summary

Fix Relações edge endpoints: SVG lines and mid-labels use the **geometric centre of the 58px disc**, not the centre of the 172×112 node box. Geometry still runs through the disc centre (no rim clip / no gap); lines stay behind discs + selection halo. Ring layout math unchanged.

## Technical Context

**Language/Version**: TypeScript/React 19  
**Primary Dependencies**: `graphLayout.ts`, `GraphStage.tsx` / `.css`  
**Storage**: N/A  
**Testing**: Manual quickstart visual QA  
**Target Platform**: Web Relações stage  
**Project Type**: Monorepo frontend visual fix  
**Performance Goals**: Unchanged (same edge count, one extra offset per node)  
**Constraints**: Clarification A — centre-through, behind disc, no gap; do not change 066 animation, visibility, or ring spacing  
**Scale/Scope**: Helper + GraphStage line/label coords; optional z-order check  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clarification 1/1 locked (centre, no gap): **PASS**
- Scope = visual anchor only; no API/schema: **PASS**
- Constitution placeholder — follow repo patterns: **PASS**

**Post-Phase 1**: Unchanged — UI contract + helper; no data-model entities to persist.

## Project Structure

### Documentation (this feature)

```text
specs/067-disc-edge-anchor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-disc-edge-anchor.md
└── tasks.md   # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/graphLayout.ts   # discCenterFromNodePos (offset from box centre)
frontend/src/components/relacoes/GraphStage.tsx   # line x1/y1/x2/y2 + label mid from disc centres
frontend/src/components/relacoes/GraphStage.css   # confirm edges under nodes / halo
CHANGELOG.md / version manifests
```

**Structure Decision**: Frontend-only; layout rings keep using node box; only edge geometry uses disc centre.

## Complexity Tracking

> None.
