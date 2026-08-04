# Feature Specification: Segment Hover Info

**Feature Branch**: `044-segment-hover-info`  
**Created**: 2026-08-04  
**Status**: Draft  
**Input**: User description: "Ao passar o mouse sobre um segmento desenhado, ele deve me passar os dados de qual segment é este, para facilitar deleção do segmento."

## Clarifications

### Session 2026-08-04

- Q: How should segment identity be shown on hover? → A: Both — tooltip/label on the map **and** highlight the matching row in the Segmentos list (Option C)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identify a drawn segment on hover (Priority: P1)

On **Rede de rotas**, the GM sees many drawn segments on the map. Finding the matching row in the segment list (to press Apagar) is hard when several look similar. Hovering a drawn segment must show clear identity data so the GM can match it to the list and delete the right one.

**Why this priority**: Direct request — hover identification to support safe deletion.

**Independent Test**: With ≥ 2 saved segments on the map, hover each polyline; expect readable identity (endpoints, type, distance) that matches the corresponding list row.

**Acceptance Scenarios**:

1. **Given** at least one saved (non-draft) segment on Rede de rotas, **When** the GM hovers the pointer over that segment’s line, **Then** they see identity information for that segment (enough to distinguish it from others).
2. **Given** the GM is hovering a segment, **When** they move the pointer off the segment, **Then** the hover identity UI for that segment is no longer shown.
3. **Given** several segments nearby, **When** the GM hovers one of them, **Then** the identity shown corresponds to that segment only (not a neighbor).
4. **Given** the segment list is visible, **When** the GM hovers a map segment, **Then** they can match the hover data to the list entry that has **Apagar** for that segment (same endpoints / type / distance cues as the list).
5. **Given** the segment list is visible, **When** the GM hovers a map segment, **Then** the matching list row is highlighted and the map shows a tooltip/label with that segment’s identity.

---

### User Story 2 - Hover makes the segment easier to spot (Priority: P2)

While inspecting which segment is which, the hovered line should be visually emphasized so the GM is sure which geometry the data refers to.

**Why this priority**: Reduces mis-identification when lines cross or overlap; supports deletion confidence.

**Independent Test**: Hover a segment; the hovered line looks distinct from non-hovered segments; leave hover and emphasis clears.

**Acceptance Scenarios**:

1. **Given** multiple saved segments, **When** the GM hovers one, **Then** that segment is visually emphasized relative to the others.
2. **Given** a hovered/emphasized segment, **When** the pointer leaves it, **Then** emphasis returns to the normal saved-segment appearance.

---

### Edge Cases

- Draft (in-progress) polyline: no “saved segment” hover identity required (draft is not deletable via the segment list the same way).
- Very short or thin segments: hover target must still be reasonably hittable (wider hit area than the painted stroke if needed).
- Crossing / overlapping segments: nearest or topmost under the pointer wins; identity must match the emphasized line.
- Zoom/pan: hover still works after zoom; identity remains correct for that segment.
- Campaign map travel overlay / route planner preview: out of scope unless the same “Rede” digitizer surface — this feature targets drawn network segments in Rede de rotas.
- Empty network: nothing to hover; no error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On Rede de rotas, hovering a **saved** drawn segment MUST reveal identity data for that segment.
- **FR-002**: Identity data MUST include cues sufficient to match the segment list row used for deletion: endpoint pair, route type (estrada / rio / trilha), and distance when available.
- **FR-003**: Endpoint cues SHOULD prefer waypoint display names when present; otherwise use the same id-style labels the list already shows.
- **FR-004**: Leaving the segment with the pointer MUST dismiss the hover identity presentation (map tooltip/label and list-row highlight).
- **FR-005**: The hovered saved segment MUST be visually distinguishable from non-hovered saved segments while hovered.
- **FR-006**: Hover MUST NOT delete a segment by itself; deletion remains an explicit action (e.g. list **Apagar**).
- **FR-007**: Draft-in-progress drawing MUST NOT be treated as a saved-segment hover target for this feature.
- **FR-008**: Lore campaign map pins, party pin, and Calcular rota UI MUST NOT change for this feature.
- **FR-009**: While hovering a saved segment, the UI MUST show a map-side tooltip or label with the segment identity **and** highlight the corresponding row in the Segmentos list (Clarifications 2026-08-04).
- **FR-010**: If the matching list row is outside the visible list viewport, the list SHOULD scroll (or otherwise bring) that row into view while hovered.

### Key Entities

- **Saved segment**: Persisted route segment between two waypoints, with type and distance, shown on the digitizer map and in the segment list.
- **Segment identity**: Human-readable summary (endpoints, type, distance) used to match map geometry to the list row.
- **Hover presentation**: Temporary map tooltip/label **and** Segmentos list-row highlight, shown only while the pointer is over the segment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a smoke test with ≥ 5 saved segments, hovering each map segment yields identity that matches its list row in ≥ 9/10 trials.
- **SC-002**: A GM unfamiliar with the network can identify which list **Apagar** to use for a chosen map segment within ~10 seconds using hover (timed informal trial).
- **SC-003**: Leaving hover clears identity UI and visual emphasis in under ~1 second of perception (no sticky false identity).
- **SC-005**: On hover, both map identity (tooltip/label) and list-row highlight appear together; clearing hover removes both.

## Assumptions

- “Segmento desenhado” means a **saved** polyline on **Rede de rotas**, not the campaign-map travel path preview and not the in-progress draft.
- Goal is **identification to support deletion**, not delete-on-hover or a new map-only delete control (can be a later feature).
- Identity presentation is **both** map tooltip/label and Segmentos list-row highlight (Clarifications 2026-08-04); list row should come into view if scrolled away.
- Showing the same fields as the segment list (A↔B, tipo, milhas), improved with names when available, is sufficient “dados”.
- Emphasizing the hovered map line is in scope for US2 / FR-005.
- Hit-testing may use a wider invisible stroke than the thin painted line (042) so hover remains usable.

## Out of Scope

- Delete by clicking the map segment (unless added later).
- Editing segment type/geometry from hover.
- Hover identity on campaign map or planner route preview.
- Changing segment stroke thickness globally (042).
