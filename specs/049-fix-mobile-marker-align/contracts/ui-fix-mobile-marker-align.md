# UI Contract: Fix mobile marker alignment (after 047)

**Feature**: `049-fix-mobile-marker-align`  
**Surface**: `CampaignMap` under `MapPage` mobile layout  
**Date**: 2026-08-05

## Scope

Horizontal alignment of **local pins**, **group pin**, and campaign-map **nodes** (if present) on mobile. No digitizer segment strokes. No HTTP.

## Must

| Aspect | Contract |
|--------|----------|
| Problem | Markers must not sit perceptibly **left** of map points on mobile |
| 047 | Remove (or fully replace) the mobile **left** pin nudge |
| Locais | Correct tip alignment on mobile |
| Grupo | Same horizontal correction policy on mobile |
| Nodes | Same policy when visible on campaign map |
| Desktop | Unchanged vs pre-049 (aside from removing bad mobile-only rules) |
| Zoom/pan | Alignment stays correct on mobile |

## Must not

| Aspect | Contract |
|--------|----------|
| More left nudge | Forbidden as the “fix” |
| Digitizer `__wp` / segment strokes | Unchanged by this feature |
| Travel / lore lines | Unchanged |
| Persisted coordinates | Unchanged |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001–003, SC-001 | Mobile markers aligned (not left-biased) |
| FR-004, SC-002 | Desktop OK |
| FR-005 | No further left nudge; 047 removed/replaced |
| FR-006, SC-003 | Stable under zoom/pan |
| FR-007–008 | Digitizer/overlay/data untouched |
