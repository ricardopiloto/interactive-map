# UI Contract: Mobile left offset (campaign map)

**Feature**: `047-mobile-left-offset`  
**Surface**: `CampaignMap` under `MapPage` mobile layout  
**Date**: 2026-08-05

## Scope

Visual alignment of **local pins** (and campaign-map **node** markers if present) on mobile only. No HTTP. No digitizer.

## Must

| Aspect | Contract |
|--------|----------|
| Trigger | Ancestor has `map-page--mobile` (same as `innerWidth < 800`) |
| Local pins | Appear ~**6–10 screen px** left vs desktop (target **8px**) |
| Campaign-map nodes | Same nudge **if** such markers exist on this map |
| Zoom/pan | Nudge stays ~constant in **screen** pixels (compose with `--map-zoom`) |
| Desktop | No extra left nudge |
| Resize | Entering/leaving mobile toggles nudge without reload |

## Must not

| Aspect | Contract |
|--------|----------|
| Group pin | No this-feature nudge |
| Travel / connection lines | Geometry unchanged |
| RouteDigitizer / `__wp` | Styles and layout unchanged |
| Persisted coords | No write of nudge into `Local` / waypoint positions |
| Hit targets | Must remain usable (tap still hits the pin) |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001, SC-001 | Pin left nudge on mobile |
| FR-002 | Same for campaign-map nodes when visible |
| FR-003, SC-002 | Desktop unchanged |
| FR-004 | Visual only |
| FR-005–006, SC-003 | Grupo + routes + digitizer excluded |
| FR-007, SC-004 | Class-driven toggle on resize |
| FR-008 | Digitizer untouched |
