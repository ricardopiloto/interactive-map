# UI Contract: Calcular rota — Pernoites & Fadiga

**Feature**: `062-route-pernoites`  
**Surfaces**: `RoutePlannerPanel` list rows; `CampaignMap` / `RouteOverlay` when a route is selected.

## List (every route row)

| Condition | UI |
|-----------|-----|
| Multi-day (`pernoites.length ≥ 1`) | Show overnight summary, e.g. “2 dias — pernoite em Fielbach” / “2 dias — 1 noite ao relento” / mixed night-by-night or compact equivalent |
| Single-day (`pernoites` empty) | No overnight sentence |
| ritmo intenso | Show fadiga saldo (e.g. “Fadiga: 2”) |
| `fadiga_aviso` | Soft visual highlight on the row (distinct from selected state) |
| `fadiga_morte` | Stronger alert copy mentioning **morte** and peak ≥ 6 (e.g. “Alerta: fadiga atingiu 6 (morte — WFRP)”); must not disable click |
| ritmo normal | No fadiga UI |

Selecting a death-alert row works like any other row (FR-019, SC-012).

## Map (selected route only)

| Marker | Style intent |
|--------|----------------|
| pernoite `local` | Distinct from normal Local pin (overnight badge/glyph); not a new lore pin |
| pernoite `relento` | Discrete point on path; must not look like a named Local |

On selection change / clear plan: markers update or disappear. Count of markers == `pernoites.length` for the selected route (SC-006).

## Non-goals

- Player controls for tolerance or miles/day  
- Blocking selection  
- Near-death tier at 5  
- Separate screen
