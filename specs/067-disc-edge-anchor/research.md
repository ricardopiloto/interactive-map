# Research: Disc Edge Anchor

**Feature**: `067-disc-edge-anchor`  
**Date**: 2026-08-11

## 1. Anchor point vs layout point

**Decision**: Keep `computeInitialLayout` / `computeFocusLayout` positions as the **centre of the node box** (`NODE_W`×`NODE_H`). Add `discCenterFromNodePos(pos): Point` that offsets to the disc centre for edge drawing only.

**Rationale**: Ring spacing must still use the full box (name/papel) so labels do not overlap (066 FR-008). Edges must use the disc (067 FR-001). Splitting “layout pos” vs “edge pos” avoids retuning ring radii.

**Geometry** (current CSS: `padding-top: 2px`, disc `DISC=58`, flex column, `align-items: center`):

- Box centre = layout `pos`
- Disc centre X = `pos.x` (horizontally centred)
- Disc centre Y = `pos.y - NODE_H/2 + paddingTop + DISC/2`  
  with `paddingTop = 2` → `pos.y - 25`

Export `DISC_PAD_TOP` (or equivalent) next to `DISC` so CSS and math stay aligned.

**Alternatives considered**:
- Reposition the node so layout `pos` *is* the disc centre — would shift name/papel relative to rings and risk collisions.
- Clip line at circumference — rejected in clarification A.

## 2. No gap / no clip

**Decision**: `<line>` endpoints = disc centres; SVG remains **before** node DOM in `GraphStage` so discs (and `box-shadow` halo) paint on top. Do not shorten by radius.

**Rationale**: Clarification A; matches 066 “straight centre-to-centre, behind discs”.

**Alternatives considered**: `stroke` stop at `r` or `r+gap` — out of scope.

## 3. Drag offsets

**Decision**: Apply the same disc offset **after** adding session `dragOffsets` to layout `pos`. Label midpoint = average of the two disc centres.

**Rationale**: FR-004 / FR-005; offsets already live in `GraphStage`.

## 4. Versioning

**Decision**: Patch/minor bump in CHANGELOG at implement (follow current 0.8.x line).

**Rationale**: Visual bugfix on 066; no API change.
