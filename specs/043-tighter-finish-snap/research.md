# Research: Tighter Finish Snap

**Feature**: `043-tighter-finish-snap` | **Date**: 2026-08-04

## 1. Split snap constants again

**Decision**: Replace unified `NODE_SNAP = 0.01` with:
- `ORIGIN_SNAP = 0.01` (unchanged vs post-041)
- `FINISH_SNAP = 0.005` (~50% of 0.01; SC-001)

Use `ORIGIN_SNAP` when `mode === 'draw-seg' && draftA == null`; use `FINISH_SNAP` when `draftA != null` (finish/midpoint path).

**Rationale**: FR-001/004; premature close is finish-only.

**Alternatives considered**:
- Shrink unified snap for both — rejected (FR-004 / origin usability)
- Pixel-space finish hit test — accurate across zoom but larger rewrite; defer unless QA fails SC-005 at extreme zoom

## 2. Aura must equal active snap (mode-aware)

**Decision**: While `draftA != null`, add a CSS modifier on each `__wp` that halves the interactive element diameter (22px → 11px hit/aura chrome, disk `::after` unchanged ~11px or slightly adjusted so disk still fits). When idle / picking origin / place-wp, keep current 22px aura (= origin snap presentation from 041).

**Rationale**: Clarification 2026-08-04 / FR-007 — no halo larger than the snap in effect. Origin and finish radii differ → aura must change with phase.

**Alternatives considered**:
- Keep large aura during finish (Option A) — rejected by user
- Dual concentric rings always — more visual noise; not requested
- Always finish-sized aura — would under-represent origin snap and hurt FR-004 discoverability

## 3. Align CSS px with FINISH_SNAP

**Decision**: Current 22px ≈ `NODE_SNAP` 0.01 at typical stage. Finish aura ≈ **11px** diameter (half) to match `FINISH_SNAP` 0.005. Keep counter-scale via `--map-zoom`. Document QA: while drafting, click just inside/outside smaller aura (SC-002/003/005).

**Rationale**: Same calibration approach as 041; good enough for GM digitizer.

## 4. Direct `__wp` button click

**Decision**: Leave direct button selection: clicking the disk/button still starts or finishes on that waypoint without a separate distance check. Hit box shrinks with finish modifier so accidental large-halo clicks disappear; intentional disk click remains valid (edge case “click on disk”).

**Rationale**: Disk is always inside both snap radii; FR-003 / edge cases.

## 5. Midpoint vs finish when outside zone

**Decision**: Keep existing stage logic: if `nearestWaypoint(..., FINISH_SNAP)` misses, treat click as midpoint (current `else` path). No new “reject click” behavior.

**Rationale**: Spec allows “midpoint or equivalent non-finish”; current code already does midpoints.

## 6. Backend / lore map / planner

**Decision**: No changes.

## 7. Relationship to 041

**Decision**: Partially supersede 041’s “single radius for origin and finish” for the finish side only. Origin + idle aura remain the 041 size; finish phase reintroduces a smaller radius with matching aura.

## 8. CHANGELOG

**Decision**: Note under next patch (e.g. after 0.6.4) when shipping.
