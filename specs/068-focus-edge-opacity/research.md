# Research: Focus Edge Opacity

**Feature**: `068-focus-edge-opacity`  
**Date**: 2026-08-11

## 1. Always-on edges vs `showEdges`

**Decision**: Keep RelacoesPage’s 600ms timer. Rename meaning in GraphStage: `showEdges` becomes **`highlightReady`** (or keep the prop name, change behaviour). Edges render whenever they pass filters; `opacity = highlightReady && incidentToSelection ? 0.90 : 0.18`.

**Rationale**: Spec FR-004a — dim network during motion; full opacity only when settled. Reusing the timer avoids a second clock.

**Alternatives considered**:
- Hide all lines during animation (clarification C) — rejected.
- Highlight on click (clarification B) — rejected.

## 2. Which edges to draw

**Decision**: `visibleEdges` = all `vinculos` passed into GraphStage after tipo chips, minus isolate (if isolate && selected: only edges touching selected). Page already loads public vs admin lists.

**Rationale**: Today GraphStage filters to `selectedId` only and gates on `showEdges` — that produced “no idle network”.

## 3. Opacity constants

**Decision**: Export `EDGE_OPACITY_DIM = 0.18` and `EDGE_OPACITY_FOCUS = 0.90` next to layout constants (e.g. `graphLayout.ts` or a tiny `edgeOpacity.ts`) so CSS/JS stay aligned.

**Rationale**: Clarification ~18% / ~90%.

## 4. Labels

**Decision**: Render type labels only when `highlightReady && edge incident to selection` (and `rotulosVinculo` policy). Never on dim-only edges.

**Rationale**: FR-008.

## 5. Deselect

**Decision**: RelacoesPage already sets `showEdges=false` immediately on deselect — that drops highlight to 18% while nodes animate back. Keep that.

**Rationale**: FR-004a last sentence.
