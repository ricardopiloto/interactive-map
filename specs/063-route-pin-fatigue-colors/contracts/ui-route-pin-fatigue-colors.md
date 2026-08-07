# Contract: UI — overnight pins & fatigue colours

**Feature**: `063-route-pin-fatigue-colors`  
**Surfaces**: Map overlay (`RouteOverlay` + `CampaignMap`), Calcular rota list (`RoutePlannerPanel`)

## Selected route — map

| Element | When | Behaviour |
|---------|------|-----------|
| Base / non-residual day polyline | Selected route | Solid **green** stroke |
| Residual day polyline | `dias_visuais[i].residual && fadiga_apos ≥ 1` | **Red** stroke; intensity by `min(6, fadiga_apos)` |
| Segment hover | Pointer over residual (or any day with title) | Tooltip / `title`: e.g. “Ganho de fadiga — saldo N” |
| Relento pin | `pernoite.tipo === "relento"` | Small blue HTML pin; hover “Pernoite”; not a Local |
| Local overnight | `pernoite.tipo === "local"` + `local_id` | Badge/halo on existing Local pin; hover “Pernoite”; click opens Local detail |
| Death | Peak ≥ 6 | Darkest red only — **no** separate death badge |

## Alternative routes — map

| Element | Behaviour |
|---------|-----------|
| Polyline | Dashed / lighter **green** |
| Red / overnight chrome | **None** |

## Calcular rota list

| Field | Behaviour |
|-------|-----------|
| Distance / time / costs | Unchanged |
| Overnight summary text | **Removed** |
| Fatigue summary text | **Removed** |

## Non-goals (UI)

- Changing Local pin colours for non-overnight reasons
- Showing overnight/fatigue chrome when no route is selected
- Restoring 062 fat SVG overnight discs on the overlay
