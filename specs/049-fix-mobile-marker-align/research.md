# Research: Fix Mobile Marker Alignment (after 047)

**Feature**: `049-fix-mobile-marker-align` | **Date**: 2026-08-05

## 1. Root cause of “too far left” on mobile

**Decision**: Treat **047’s mobile left nudge** (`--mobile-marker-nudge-x: -8px` on `.campaign-map__pin`) as a confirmed aggravating factor and **remove it first**. Then visually QA; if markers (including **group**, which 047 never nudged) still sit left of map points, apply a **shared rightward** screen-constant correction for pin + party under `.map-page--mobile`.

**Rationale**: Clarification — markers too far **left** on mobile only; 047 pushed pins further left. Group in scope but not affected by 047 ⇒ any residual shared left bias needs a common fix after removing 047, not more left nudge.

**Alternatives considered**:
- Increase left nudge — rejected (FR-005)
- Rewrite stored `x`/`y` — rejected (FR-008)
- Only fix pins — rejected (clarification includes group)

## 2. Screen-constant nudge mechanics

**Decision**: Keep using `translateX(calc(var(--mobile-marker-nudge-x) / var(--map-zoom, 1)))` before rotate/scale when a non-zero nudge is needed; default `0px`. After removing 047, if a right correction is required, set e.g. `--mobile-marker-nudge-x: 8px` (positive = right on screen after parent zoom) on **both** pin and party under `.map-page--mobile`.

**Rationale**: Same pattern as 047/038 zoom compensation; direction must be opposite of 047.

**Alternatives considered**: Tweaking only `margin-left` — zoom-variant magnitude; weaker for SC-003.

## 3. Party (grupo) transforms

**Decision**: Wire party (`--bandeira` / `--brasao`) to the same `--mobile-marker-nudge-x` (or equivalent shared mobile translate) so FR-003 holds. Today party has counter-scale but no 047 variable.

**Rationale**: Clarification C — group in scope on mobile.

## 4. Campaign-map nodes

**Decision**: No node discs on campaign map today. Do not invent them. If a `__wp`-like marker is added later on this map, reuse the same mobile nudge variable. Digitizer nodes stay out of scope (FR-007).

**Rationale**: Spec assumptions; FR-002 when visible.

## 5. Desktop / resize

**Decision**: Nudge variable stays `0` outside `.map-page--mobile`; rely on existing `MapPage` class toggle (`MOBILE_BP` 800).

**Rationale**: FR-004, SC-002.

## 6. CHANGELOG

**Decision**: Note under next patch: fix mobile campaign-map marker alignment (remove incorrect 047 left nudge; align locais + grupo).
