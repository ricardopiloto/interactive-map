# Research: Digitizer Node Hit Aura

**Feature**: `041-digitizer-node-aura` | **Date**: 2026-08-04

## 1. Unify snap constants

**Decision**: Replace `ORIGIN_SNAP` (0.03) and `FINISH_SNAP` (0.01) with a single `NODE_SNAP` used for origin and finish picks.

**Rationale**: Clarification A / FR-003a — one aura = one zone.

**Target magnitude**: `NODE_SNAP ≤ 0.7 × 0.03 ≈ 0.021` (SC-001 vs prior generous origin). Prefer **~0.008–0.012** so the zone feels close to the compact ~11px disk and clearly tighter than 0.03 (e.g. start at **0.01**, tune in QA).

**Alternatives considered**:
- Keep asymmetric snaps — rejected by clarify
- Screen-pixel hit testing only — more accurate across zoom but larger rewrite; deferred unless CSS+normalized snap fails SC-003

## 2. Aura presentation

**Decision**: Always-on aura via CSS on `.route-digitizer__wp` — prefer `box-shadow: 0 0 0 Npx color-mix(...)` or a `::before` circular halo behind the disk fill. Include aura in the painted control so the GM sees the zone; `pointer-events` remain on the button (and `::before` if used, with `pointer-events: none` on pseudo if hits go through to stage — prefer hits on the wp element covering the aura).

**Rationale**: FR-002/004; no extra DOM per node.

**Active state**: Keep stronger fill + ring (existing `.is-active`); aura may stay but active highlight must dominate (FR-005).

**Alternatives considered**:
- Hover-only aura — weaker vs “ver a área”
- Separate SVG circle layer — more code, sync risk

## 3. Align aura size with NODE_SNAP

**Decision**: Size aura in **screen px** so at zoom≈1 on a typical map stage it roughly matches `NODE_SNAP × mapWidth`. Document QA: click just inside/outside aura (SC-003). If mismatch is bad at extreme zoom, prefer adjusting `NODE_SNAP` slightly over introducing screen-space math in v1.

**Rationale**: Normalized snap + counter-scaled CSS cannot be perfect at all zooms; good enough for GM digitizer; SC-003 is the gate.

## 4. Painted disk size

**Decision**: Keep current ~11px disk unless aura-alone looks wrong; primary change is snap + aura (spec assumption).

## 5. Direct button click vs stage snap

**Decision**: Leave both paths: clicking the `__wp` button still works; stage clicks use `NODE_SNAP`. Ensure button’s hit box (including aura extent if part of the element) does not feel larger than the snap zone in a contradictory way — if using `::before` larger than the button box, expand the button’s layout size (transparent padding / larger width+margin recenter) to match aura, **or** keep aura visual-only and rely on snap for “zone” honesty (prefer expanding hit box to match aura for FR-003).

**Preferred**: Element size (or padding) ≈ aura diameter; disk fill centered inside; snap ≈ that radius in map space.

## 6. Backend / lore map

**Decision**: No changes.

## 7. CHANGELOG

**Decision**: Note under next patch after 0.6.3 when shipping (e.g. 0.6.4 or fold into next release).
