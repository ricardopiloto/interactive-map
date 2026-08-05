# UI Contract: Align Altdorf Pin to Map Target

**Feature**: `051-altdorf-pin-target`  
**Date**: 2026-08-05

## Surface: Campaign map (mobile)

| Aspect | Contract |
|--------|----------|
| Viewport | `map-page--mobile` (width &lt; 800) |
| Markers | All **locais** pins + **grupo** |
| Alignment | Marker anchor coincides with map art at stored `(x,y)` — Altdorf tip on print **green** target (city), not Flats |
| Zoom/pan | Alignment stable after zoom/pan |
| Desktop | No perceptible regression vs pre-fix |
| 047 | Deliberate left screen nudge **absent** |
| 049 | Pin and party share the same horizontal presentation rule; no left nudge |
| Digitizer | Unchanged |
| Overlay / Rede strokes | Unchanged |
| Coords | Primary path does not bulk-rewrite `x`/`y`; optional Altdorf-only if FR-007 |

## Layout invariant (implementation acceptance)

| Rule | Meaning |
|------|---------|
| One box | Percentage `left`/`top` are relative to the **same** box that paints the map image pixels (no side-crop of art inside a taller/wider percentage stage) |
| Cover crop | MUST NOT leave `object-fit: cover` (or equivalent) cropping the map relative to the pin coordinate box on mobile |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001–002, SC-001/007 | Altdorf ↔ green |
| FR-003, SC-003–004 | All pins + group |
| FR-004, SC-005 | Desktop OK |
| FR-005, SC-002 | Zoom/pan |
| FR-008, SC-006 | No 047 left nudge |
| FR-009–010 | Beyond 049; shared markers |
| FR-007 | Fallback only after presentation |
