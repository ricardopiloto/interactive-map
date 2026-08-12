# Implementation Plan: Disc Portrait

**Branch**: `069-disc-portrait` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/069-disc-portrait/spec.md`

## Summary

On the Relações graph, if a personagem has `retrato_url`, fill the 58px disc with that image (CSS cover, centred crop). If there is no URL or the image fails, keep the current two-letter initials. Visual states (PJ/NPC border, selection halo, morto grayscale, ~28% fade) stay on the disc wrapper. Detail panel / ficha still show the full image (`contain`). No API, schema, or layout (067/068) changes.

## Technical Context

**Language/Version**: TypeScript / React 19  
**Primary Dependencies**: `GraphStage.tsx`, `GraphStage.css`; existing `Personagem.retrato_url`  
**Storage**: N/A (reuse persisted portrait URL)  
**Testing**: Manual quickstart visual QA  
**Target Platform**: Web Relações stage  
**Project Type**: Monorepo frontend visual change  
**Performance Goals**: ≤ ~20 discs; browser image cache; no extra network protocol  
**Constraints**: Cover crop (clarify A); disc 58px unchanged; 067 anchors / 068 opacities untouched; Portuguese UI; no emoji  
**Scale/Scope**: Disc inner content + CSS; optional tiny `DiscAvatar` helper in GraphStage  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Clarification 1/1 locked (fill / centred crop): **PASS**
- No new data store; reuse `retrato_url`: **PASS**
- Constitution placeholder — follow repo patterns (Nocturne, GraphStage): **PASS**

**Post-Phase 1**: Unchanged — UI contract only; no backend.

## Project Structure

### Documentation (this feature)

```text
specs/069-disc-portrait/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-disc-portrait.md
└── tasks.md   # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/relacoes/GraphStage.tsx   # portrait <img> inside disc; onError → initials
frontend/src/components/relacoes/GraphStage.css   # overflow clip, object-fit: cover
CHANGELOG.md / version manifests                  # patch bump (0.8.3)
```

**Structure Decision**: Frontend-only. Portrait source is already on `Personagem`; RelacoesPage / APIs unchanged.

## Complexity Tracking

> None.
