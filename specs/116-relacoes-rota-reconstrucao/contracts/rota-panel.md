# Contract: Rota panel + map highlight (116)

**Feature**: `116-relacoes-rota-reconstrucao`  
**Surface**: `/c/:slug/rota` (canonical planner UX)

## Shell

Same as [shared-floating-panel.md](./shared-floating-panel.md).

## Head (form)

- Origin + destination controls (existing waypoint combobox behaviour).
- Swap control.
- Option chips/controls: transport mode, pace, ordering, path preference, own-speed when applicable (106).
- Primary «Calcular rota» (i18n).
- Hint when origin === destination.

## Body (results)

| State | Content |
|-------|---------|
| Not calculated | Empty or short hint (optional) |
| Loading | Existing loading pattern |
| Zero routes | Empty state i18n |
| N routes | Clickable **cards**: title/disambiguation, humanized time (days+h), distance mi/km, overnight timeline when present |

Selected card: visual `is-selected`; drives map highlight.

## Map

| Requirement | Notes |
|-------------|--------|
| Full-bleed campaign map behind panel | Same stage idea as Map/Rota prototype |
| Selected route polyline | Stroke uses **campaign accent** |
| Alternate routes | Dimmer/dashed secondary (existing alt style OK) |
| Fatigue day slices | Preserve if already shown; must not remove 106 behaviour |

## Algorithm

- MUST call the same planning path as today (`campaignApi` / existing planner).
- MUST NOT reimplement prototype `computeRoutes`.

## Canonical surface

- `/rota` is the planner UX after this feature.
- Residual Map-page route tab / embedded old planner MUST NOT remain the visual standard (remove or redirect).

## Permissions

- Public route planning data as today; no new ACL.
