# Data Model: Route Planner Cohesion

**Feature**: `064-route-planner-cohesion` | **Date**: 2026-08-07

No new persisted tables. Computed planning fields and UI state only.

## March-day derivation (per RoutePlanItem)

| Symbol | Source | Rule |
|--------|--------|------|
| D | `tempo_dias` | Full days from `format_tempo_texto` |
| R | `tempo_horas_resto` | Leftover hours (≥ 0) |
| M | derived | `D` if R ≈ 0 else `D + 1`; if D = 0 and R > 0 → M = 1; if no travel → M = 0 / skip overnight |
| milhas_por_dia | derived | `distancia_milhas / M` when M ≥ 1 |
| pernoites | sim | Intermediate only; count ≤ M − 1 |
| tolerancia | settings | `tolerancia_pernoite_pct` (default 0.20) × milhas_por_dia |

## Overnight classification (unchanged types)

| tipo | When |
|------|------|
| `local` | Waypoint on path with `local_id`, within ±tol miles of ideal day mark |
| `relento` | No such waypoint; position at ideal mark |

Arrival day (last of M) never emits a pernoite.

## UI state (MapPage / SideMenu)

| State | Behaviour |
|-------|-----------|
| `tab === 'rota'` | Show planner in side content; map-pick on; pass `travelPlan` to map |
| `tab !== 'rota'` | Hide travel overlay (pass empty plan to map); map-pick off; keep `travelPlan` / form state in memory |
| `SideTab` | Adds `'rota'` alongside locais, npcs, arcos, (grupo) |

## Relationships

```text
RoutePlanItem.tempo_dias/resto ──► M ──► milhas_por_dia ──► Pernoite[] / DiaVisual[]
SideTab 'rota' ──► visibility of overlay + map-pick
```
