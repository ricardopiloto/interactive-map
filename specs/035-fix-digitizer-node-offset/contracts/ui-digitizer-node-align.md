# UI Contract: Digitizer node alignment

**Feature**: 035-fix-digitizer-node-offset  
**Surface**: GM — Rede de rotas (Traçar segmento, Colocar nó, idle)

## Alignment rule

For every waypoint marker on the digitizer map:

- The **center** of the node marker MUST sit on the map point `(x, y)`.
- That point MUST match the same location on the **visible** campaign map image (no lateral/vertical slip from cropped/letterboxed art).
- Stage click → stored `(x,y)` MUST round-trip so a newly placed node appears under the cursor position (within normal pointer tolerance).

## Modes

| Mode | Requirement |
|------|-------------|
| Traçar segmento | Nodes aligned; selecting origin/destination by marker or snap uses aligned positions |
| Colocar nó | Click place → marker on click point |
| Idle | Same markers, same alignment |

## Non-goals

- Changing campaign map pin CSS (034)
- Re-enabling 030 tip-anchor styles
- Bulk updating waypoint rows in the database
- Redesigning segment drawing UX

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001, SC-001, SC-003 | Traçar segmento alignment |
| FR-002, SC-002 | Colocar nó / idle |
| FR-003, SC-004 | Zoom stable |
| FR-004–005 | No data rewrite; segments coherent |
| FR-007 | Campaign map untouched |
