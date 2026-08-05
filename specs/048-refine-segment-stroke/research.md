# Research: Refine Segment Stroke Weight

**Feature**: `048-refine-segment-stroke` | **Date**: 2026-08-05

## 1. Baseline after 042

**Decision**: Treat current digitizer widths as the “actual” baseline for the ⅔ factor: normal **1.5**, hover **3.5**, hit **12**.

**Rationale**: Spec clarifications say “⅔ do peso actual”; 042 already set ~1.5 from ~2.5.

**Alternatives considered**: Re-deriving from pre-042 2.5 — rejected; user locked “current” weight.

## 2. Target widths

**Decision**:

| Role | Current | ×⅔ target |
|------|---------|-----------|
| `.route-digitizer__seg` (saved + draft) | 1.5 | **1.0** |
| `.route-digitizer__seg.is-hovered` | 3.5 | **2.3** (≈ 2.333) |
| `.route-digitizer__seg-hit` | 12 | **12** (unchanged) |

**Rationale**: Clarifications A/B; FR-005 keeps hit fat for usability.

**Alternatives considered**: Thinning hit area — rejected by assumptions; hover left at 3.5 — rejected by clarification B.

## 3. Draft and type dashes

**Decision**: Draft uses the same `.route-digitizer__seg` width (class `--draft` only sets color/dash). Optionally leave `stroke-dasharray` as-is; only tweak if dashes look oversized after thinning (QA).

**Rationale**: FR-002 same thinness family; minimal diff.

## 4. Scope boundaries

**Decision**: Change only `RouteDigitizer.css` segment stroke rules. No `CampaignMap` / `RouteOverlay` / lore connections; no TSX unless a hardcoded stroke appears (none today).

**Rationale**: FR-006/007; matches 042 scope.

## 5. CHANGELOG

**Decision**: Note under next patch (e.g. 0.6.9 or after 0.6.8): Rede segment strokes refined to ~⅔ of prior weight (normal + hover).
