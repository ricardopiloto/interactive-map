# Feature Specification: Thinner Segment Lines

**Feature Branch**: `042-thinner-segment-lines`  
**Created**: 2026-08-04  
**Status**: Draft  
**Input**: User description: "Vamos deixar as linhas dos segmentos mais fina, isso ajudará o GM a criar rotas mais alinhadas com o mapa real."

## Clarifications

### Session 2026-08-04

- Q: Where should thinner strokes apply? → A: Rede de rotas only (saved + draft segments); not campaign travel overlay or lore exit lines

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trace roads more precisely (Priority: P1)

The GM draws or reviews segments on **Rede de rotas**. Thinner segment strokes reveal more of the underlying map art, making it easier to follow printed roads, rivers, and paths when placing midpoints and aligning endpoints.

**Why this priority**: Sole product goal — better visual alignment while authoring the network.

**Independent Test**: Open Rede with existing segments; compare stroke weight to previous; draw a new draft segment along a map road and confirm the line does not heavily obscure the artwork.

**Acceptance Scenarios**:

1. **Given** Rede de rotas shows saved segments, **When** the GM views the map, **Then** segment strokes appear clearly thinner than before while remaining visible and color-coded by type (estrada / rio / trilha).
2. **Given** the GM is drawing a segment (draft line), **When** they place intermediate points along a map feature, **Then** the draft stroke is also thinner, so the map underneath stays readable for alignment.
3. **Given** several overlapping or nearby segments, **When** the GM zooms in, **Then** thinner lines still allow distinguishing types and following the intended path without the strokes dominating the map.

---

### Edge Cases

- Very light map backgrounds: thinner lines must remain visible (contrast not reduced to invisibility).
- Zoom extremes: stroke remains usable (does not disappear at max zoom or become a thick blob at min zoom beyond today’s behavior).
- Empty network: no segments — no visual change; no errors.
- Campaign map travel-plan overlay (player/GM calculated routes): **out of scope** (Clarifications 2026-08-04); this feature targets Rede de rotas segment drawing/display only.
- Lore-map exit connection lines between locations: **out of scope**.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On Rede de rotas, saved segment polylines MUST render with a thinner stroke than the current weight.
- **FR-002**: Draft (in-progress) segment lines MUST use a thinner stroke consistent with saved segments (same order of thinness).
- **FR-003**: Segment type differentiation (estrada / rio / trilha) MUST remain visually distinguishable after thinning (color and/or dash patterns unchanged in intent).
- **FR-004**: Thinning MUST NOT remove interactivity of the digitizer (placing nodes, drawing segments, undo) beyond the visual stroke change.
- **FR-005**: Node auras, node disks, and UI chrome outside segment strokes MUST NOT be required to change for this feature.
- **FR-006**: Campaign-map travel-plan overlay strokes and lore exit-connection lines MUST NOT change as part of this feature.

### Key Entities

- **Segment**: A saved path between two network nodes (optional midpoints), shown as a colored polyline on Rede de rotas.
- **Draft segment**: Temporary polyline while the GM is tracing a new segment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Stroke width of digitizer segments is ≤ ~60% of the pre-change width (clearly thinner; not a trivial 1–2% tweak).
- **SC-002**: In a GM spot-check of ≥ 5 segments on a busy map area, ≥ 4/5 raters agree the map underneath is easier to see for alignment than before.
- **SC-003**: 100% of segment types present in a mixed test set remain distinguishable by type after the change.
- **SC-004**: A GM can complete place-node + draw-segment flows without new errors attributable to stroke styling (smoke test).

## Assumptions

- “Linhas dos segmentos” means Rede de rotas polylines (saved + draft), not lore-map connection lines between locations and not the travel-plan overlay on the campaign map (locked in Clarifications 2026-08-04).
- Thinner ≈ about half to 60% of current stroke (current reference ~2.5 units); exact px left to implementation within SC-001.
- Colors and dash styles for types stay as today unless a tiny contrast tweak is needed for visibility when thinner.
- No change to stored geometry or segment data model.

## Out of Scope

- Changing waypoint/node size or aura (feature 041).
- Changing campaign-map exit connection lines or calculated-route overlay strokes.
- Auto-snapping midpoints to map features (manual alignment only gets easier visually).
- Backend or API changes.
