# Contract: UI — Rota side tab, overlay, alt colour

**Feature**: `064-route-planner-cohesion`  
**Surfaces**: `SideMenu`, `MapPage`, `RoutePlannerPanel`, `RouteOverlay` / map CSS

## Side menu

| Requirement | Behaviour |
|-------------|-----------|
| Tab | New tab id `rota`, label **Rota** (player + GM; coexist with Grupo for GM) |
| Content | Full plan flow (De/Para, ritmo, modo, preferências, Calcular, lista, select) |
| Floating panel | Removed — no second planner chrome over the map |
| Entry | Only via side tab (no separate floating “Calcular rota” open button) |

## Map interaction

| When | Map-pick De/Para | Travel overlay |
|------|------------------|----------------|
| `tab === 'rota'` | On (eligible pins fill De/Para; no Local modal) | On if `travelPlan.length > 0` |
| other tabs | Off (normal Local select) | Off (plan state retained in page memory) |

Returning to **Rota** restores overlay from memory without requiring recalculate.

## Map colours

| Route | Style |
|-------|--------|
| Selected | 063 selected (green base; residual day reds; overnight pins/badges) |
| Non-selected | **Red** dashed/discrete stroke; no overnight/fatigue chrome |

## Persistence

Form fields + `travelPlan` + selected index survive tab switches within the same page session.
