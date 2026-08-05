# Research: Align Altdorf Pin to Map Target

**Feature**: `051-altdorf-pin-target` | **Date**: 2026-08-05

## 1. Why 047 / 049 failed (and what to keep)

**Decision**: Treat **047’s intentional left nudge** as permanently rejected. Keep **049’s** removal of that nudge and **shared pin+party** transform plumbing. Do **not** treat another ±8px screen nudge as the primary 051 fix.

**Rationale**: Spec Prior Art + print magnitude (Altdorf city → Altdorf Flats) is far larger than 6–10 screen px. Clarification: systematic mobile presentation for all markers; desktop OK.

**Alternatives considered**:
- Re-tune nudge only — rejected (FR-010; already tried)
- Rewrite all local `x`/`y` — rejected as primary (FR-007 / Out of Scope)

## 2. Root cause hypothesis (presentation)

**Decision**: Primary investigation target is **mismatch between the stage box (pin `%` coordinates) and the painted map image** on mobile, driven by current CSS:

```text
.campaign-map__stage { min-width: min(100%, 960px); min-height: 540px; }
.campaign-map__image { width: 100%; min-height: 540px; height: auto; object-fit: cover; }
```

On a **narrow** mobile viewport, `min-width` ≈ device width and `min-height: 540px` yields a **taller-than-landscape** box. With `object-fit: cover`, the landscape map art is **cropped on the sides**. Pins still use `left/top` as % of the **full stage**, so markers sit systematically off the visible art (often left of cities) — matching “all pins”, “mobile only”, “desktop OK”, and large geographic-looking error.

**Rationale**: Explains why micro-nudges failed; aligns with clarifications without blaming stored Altdorf coords first.

**Alternatives considered**:
- Safe-area / bottom nav only — may shift UI chrome, not pin-vs-city by Flats distance
- TransformWrapper `centerOnInit` alone — pan/zoom doesn’t change % of stage vs cover crop
- Wrong transform-origin on pin tip — would affect desktop similarly; desktop is OK

## 3. Fix strategy

**Decision** (ordered):

1. Make the **displayed image define the stage geometry** used for `%` positioning: prefer natural aspect (`height: auto` from width; **remove `object-fit: cover`** or replace with behaviour that does not crop relative to the percentage box). Ensure stage width/height match the image’s laid-out box on mobile and desktop.
2. Re-check pin/party anchors (`margin` + `transform-origin` tip) still tip on `left`/`top` after layout change (030/034 lessons).
3. Confirm `--mobile-marker-nudge-x` stays **0** (or small **positive** only if residual &lt;~10px after aspect fix); **never** negative.
4. Visual QA vs print (Altdorf green) + ≥2 other pins + group; desktop spot-check.
5. Only if still wrong: FR-007 Altdorf data/reposition.

**Rationale**: Restores one coordinate space for art and markers; mobile/desktop share the same rule so desktop doesn’t regress.

**Alternatives considered**:
- `object-fit: contain` with letterboxing inside a fixed stage — possible, but letterbox voids must not receive wrong % mapping; image-driven stage is simpler
- JS measuring naturalWidth/Height to set aspect-ratio — use if pure CSS is insufficient

## 4. Scope boundaries

**Decision**: Campaign map markers only (locais + grupo). Digitizer nodes/segments, route overlay stroke weight, Calcular rota — untouched.

**Rationale**: Spec Out of Scope; same as 047/049 campaign-map-only clarifications.

## 5. CHANGELOG

**Decision**: Note under next patch: mobile campaign map — fix pin/group alignment to map art (stage/image aspect; not left nudge).
