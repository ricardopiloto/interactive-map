# UI Contract: Focus Group Pin

**Feature**: `039-focus-group-pin`  
**Surface**: `CampaignMap` zoom control cluster + party marker  
**Date**: 2026-08-04

## Scope

Map chrome + viewport focus. No HTTP. No change to group persistence or pin artwork beyond a stable DOM id / optional control styling.

## Control

| Aspect | Contract |
|--------|----------|
| Placement | Inside `.campaign-map__controls`, with +/−/1:1 (and GM “Mapa” if present) |
| Visibility | Rendered only when party is shown (`grupo` present and lore not hidden) |
| Affordance | Accessible name in Portuguese (e.g. “Ir ao grupo”); icon OK if labelled |
| Roles | Player and GM |
| Missing group | Control not in the DOM (not disabled) |

## Focus behaviour

| Aspect | Contract |
|--------|----------|
| Action | Pan + zoom so `#map-party` is centered in the map viewport |
| Scale / duration | Same constants as location focus (`FOCUS_SCALE`, `FOCUS_ANIM_MS`) |
| Side effects | No modal; no forced side-menu tab; no local pin selection change |
| Missing DOM | No-op; map stays usable |
| Concurrent | Latest focus request wins |
| Repeat | Second click still recenters (nonce) |

## Party marker

| Aspect | Contract |
|--------|----------|
| Id | Stable `map-party` when rendered |
| Visual | Unchanged art/size rules from prior features |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001, SC-002 | Control in zoom cluster |
| FR-002, FR-003, SC-001, SC-004 | zoomToElement + shared focus constants |
| FR-004 | Player + GM |
| FR-005, SC-003 | Hidden when no group |
| FR-006 | View-only |
| FR-007 | Works after free pan/zoom |
| Edge: hideLorePins | Hide control and/or no-op |
