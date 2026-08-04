# Feature Specification: Tighter Finish Snap

**Feature Branch**: `043-tighter-finish-snap`  
**Created**: 2026-08-04  
**Status**: Draft  
**Input**: User description: "reduza ainda mais a area de snap do node para fechamento de rota,, ele está dando o \"snap\" antes do que eu gostaria para encerrar a rota."

## Clarifications

### Session 2026-08-04

- Q: Should the node aura stay larger than the tighter finish snap, shrink to match finish, or show both? → A: Aura must show **exactly** the same size as the snap zone in effect (no larger halo than the active snap)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Close the segment only when close enough (Priority: P1)

While drawing a segment on **Rede de rotas**, the GM places midpoints along the map. Today the destination node snaps/closes too early — before they intended to finish. The finish/close snap zone must be tighter so a click near a node (but not deliberately on it) continues the draft instead of ending the segment.

**Why this priority**: Direct request — premature finish snap while authoring.

**Independent Test**: Start a segment, click near but outside a smaller finish zone around another node; expect a midpoint (or no finish), not a completed segment. Click clearly on the node (inside the tighter zone) to close.

**Acceptance Scenarios**:

1. **Given** the GM has started a segment (origin chosen) and is placing midpoints, **When** they click near another node but outside the tighter finish zone, **Then** the segment does **not** close on that node (draft continues with a midpoint or equivalent non-finish behavior).
2. **Given** the same draft, **When** they click inside the tighter finish zone of a different node, **Then** the segment closes on that node as today.
3. **Given** a draft segment is in progress, **When** the GM views node auras, **Then** each aura’s size matches the tighter finish snap (not the larger origin zone).
4. **Given** the GM is choosing the **origin** of a new segment (no open draft), **When** they view node auras, **Then** aura size matches the origin snap zone.
5. **Given** the GM is choosing the **origin** of a new segment, **When** they click near a node, **Then** origin pick behavior remains at least as usable as today (origin snap is not reduced by this feature).

---

### Edge Cases

- Click exactly on the node disk / center: still finishes when inside the tighter zone.
- Overlapping nodes: nearest node within the tighter finish radius wins (same nearest-neighbor spirit).
- Origin equals attempted finish: existing “must differ” rules unchanged.
- Aura (feature 041): **must match** the snap zone currently in effect (Clarifications 2026-08-04). While choosing origin (or idle), aura size = origin snap; while a draft is open and the next click may finish, aura size = tighter finish snap.
- Campaign map / route planner: out of scope.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On Rede de rotas, the snap/pick radius used to **finish** (close) a segment on an existing node MUST be smaller than the current unified finish radius.
- **FR-002**: A click outside the tighter finish zone MUST NOT close the segment on that node solely by proximity snap.
- **FR-003**: A click inside the tighter finish zone of a valid different node MUST still close the segment successfully.
- **FR-004**: The snap/pick radius used to **start** a segment (choose origin) MUST remain unchanged by this feature (or at least not reduced).
- **FR-005**: Segment drawing, undo, and node placement flows MUST otherwise continue to work.
- **FR-006**: Lore map pins, travel overlay, and route planner MUST NOT change.
- **FR-007**: The visible node aura MUST match exactly the snap radius in effect for the current interaction (origin pick → origin snap size; finish/close → finish snap size). The aura MUST NOT extend beyond the active snap zone.

### Key Entities

- **Origin snap zone**: Area used to pick the starting node of a new segment.
- **Finish snap zone**: Area used to close a draft segment onto an existing node (the zone to shrink).
- **Draft segment**: In-progress polyline with origin and optional midpoints.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Finish snap radius is ≤ ~50% of the pre-change finish radius (current unified ~0.01 → clearly tighter, e.g. about half).
- **SC-002**: In ≥ 9/10 scripted clicks just outside the new finish zone (but inside the old one), the segment does **not** close.
- **SC-003**: In ≥ 9/10 scripted clicks inside the new finish zone on a valid destination, the segment **does** close.
- **SC-004**: Origin selection still succeeds in a smoke test of ≥ 5 origin picks without perceived regression vs today.
- **SC-005**: While finishing a draft, measured aura extent matches the finish snap zone (what you see is what closes the segment); while picking origin, aura matches origin snap.

## Assumptions

- “Fechamento de rota” means **closing a digitizer segment** onto an existing waypoint (finish snap), not deleting routes or the travel planner.
- Origin and finish snap may differ again (partially supersedes 041’s “same radius for origin and finish” for the finish side only).
- Aura is **not** allowed to be larger than the active snap: it must equal the snap zone in effect (Clarifications 2026-08-04). When origin and finish radii differ, aura size updates with mode (draft open → finish-sized auras).
- Magnitude target: about half of current finish/unified snap (~0.01 → ~0.005), tunable in implementation within SC-001.
- No geometry or persistence changes.

## Out of Scope

- Changing segment stroke thickness (042).
- Shrinking origin snap (unless later requested).
- Changing campaign-map or planner UI.
- Auto-align midpoints to map art.
