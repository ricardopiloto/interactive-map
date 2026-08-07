# Data Model: Route Overnight Stops (Pernoites)

**Feature**: `062-route-pernoites` | **Date**: 2026-08-07

No new persisted tables. All entities below are **computed** on `GET /api/routes/plan` and returned on each route item.

## Pernoite

| Field | Type | Rules |
|-------|------|--------|
| dia | int | 1-based march day that **ends** with this overnight (≥ 1) |
| tipo | `"local"` \| `"relento"` | Required |
| local_id | int \| null | Required when tipo=local; null for relento |
| nome | string \| null | Local display name when tipo=local; null for relento |
| x | float \| null | 0–1 map coord; required for relento; for local may repeat waypoint/Local coords for markers |
| y | float \| null | Same as x |

**Count rule**: `len(pernoites) == max(0, dias_marcha - 1)` where `dias_marcha` is the number of march days produced by the distance-budget simulation (arrival day included; no overnight on arrival).

**Validation**:

- Never emit overnight at destination waypoint for the final arrival.
- `local` only if waypoint on path has `local_id`.
- Relento coordinates must lie on the route polyline.

## Fadiga (per RoutePlanItem)

| Field | Type | Rules |
|-------|------|--------|
| fadiga_saldo | int | ≥ 0; final balance after last day; 0 when ritmo=normal |
| fadiga_pico | int | ≥ fadiga_saldo; max saldo after any +1 (before or after same-night −1? **after +1, before −1** for peak — peak must catch death mid-day before recovery). Spec: peak during simulation including after day’s +1; recovery after may lower saldo but peak already recorded |
| fadiga_aviso | bool | `ritmo==intenso && fadiga_saldo > 1` |
| fadiga_morte | bool | `ritmo==intenso && fadiga_pico >= 6` |

**State machine (intenso, per day)**:

```text
saldo, peak := 0, 0
for each march day:
  saldo += 1
  peak = max(peak, saldo)
  if day has overnight tipo=local:
    saldo = max(0, saldo - 1)
  # relento or no overnight (arrival): no recovery
```

## Orçamento diário

| Concept | Definition |
|---------|------------|
| horas_por_dia | From existing `HORAS_POR_DIA[ritmo]` |
| effective_mph | From existing `resolve_speed_and_zero_costs` |
| milhas_por_dia | `horas_por_dia * effective_mph` |
| tolerancia | `settings.tolerancia_pernoite_pct` (default 0.20) × milhas_por_dia |

## RoutePlanItem (extensions)

Existing fields unchanged. Add:

- `pernoites: list[Pernoite]` (default `[]`)
- `fadiga_saldo`, `fadiga_pico`, `fadiga_aviso`, `fadiga_morte` as above

## Settings

| Key | Default | Notes |
|-----|---------|--------|
| tolerancia_pernoite_pct | 0.20 | Env-overridable; not player-editable |

## Relationships

```text
RoutePlanItem 1──* Pernoite
Waypoint (path) ──optional── Local  (enables tipo=local)
Pernoite.relento ── coordinates on RoutePlanItem.geometria polyline
```
