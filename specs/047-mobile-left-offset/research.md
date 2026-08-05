# Research: Mobile Left Offset for Nodes and Locals

**Feature**: `047-mobile-left-offset` | **Date**: 2026-08-05

## 1. How “modo celular” is detected

**Decision**: Reuse the existing `MapPage` rule: `window.innerWidth < MOBILE_BP` (`800`) → class `map-page--mobile` on the page root. Style markers with `.map-page--mobile …` so the nudge appears/disappears on resize without new JS.

**Rationale**: Spec assumption — same criterion as the rest of the mobile UI (FR-007, SC-004).

**Alternatives considered**:
- Duplicate `@media (max-width: 799px)` in `CampaignMap.css` — can drift from `MOBILE_BP`
- Pass `isMobile` prop into `CampaignMap` — unnecessary if ancestor class already exists

## 2. Screen-constant ~8px under map zoom

**Decision**: Target **8px** (midpoint of clarified 6–10). Inside the zoomed map content, compose:

`translateX(calc(-8px / var(--map-zoom, 1)))` **before** existing `rotate` / `scale(calc(1 / var(--map-zoom)))` on `.campaign-map__pin` (and the same for any campaign-map node marker class).

Parent `TransformComponent` scale ≈ `--map-zoom`; dividing the translate by zoom yields ~8 **screen** pixels after parent scaling. Update **all** pin transform variants (default, selected, hovered) so the nudge does not drop on state change.

**Rationale**: Spec requires screen-pixel magnitude; pins already use `--map-zoom` (038).

**Alternatives considered**:
- Extra `margin-left` only — easier, but magnitude scales with zoom (not true screen px)
- Nudge in map `%` coordinates — would look different at different zoom; risks feeling like data shift
- JS offset on `left` style — more code; fights `%` positioning

## 3. What “nós” means on the campaign map today

**Decision**: Primary deliverable is **local pins** (`.campaign-map__pin`). Campaign map currently has **no** waypoint node discs (nodes live in `RouteDigitizerView`, which is **out of scope**). If a campaign-map node marker class is added later or already exists under another name, apply the **same** mobile translate rule. Document in contract: digitizer `__wp` MUST NOT change.

**Rationale**: Clarification B — campaign map only; FR-002 is “when visible” on that map.

**Alternatives considered**: Applying nudge to digitizer “for consistency” — rejected by clarification.

## 4. Group pin and routes

**Decision**: Do not alter `.campaign-map__party*` or travel/connection SVG strokes. Legend miniatures optional no-op (not map geoposition markers).

**Rationale**: FR-005, FR-006, SC-003.

## 5. Persistence and GM placement

**Decision**: CSS presentation only. Click/touch handlers keep using map coordinates from the transform layer; do not bake the nudge into saved `x`/`y`.

**Rationale**: FR-004; edge cases in spec.

## 6. Backend / CHANGELOG

**Decision**: No API or DB work. Note under next patch (e.g. 0.6.8) when shipping: mobile-only left nudge for campaign map local pins.
