# Data Model: Prefer River or Road

**Feature**: `054-prefer-river-road` | **Date**: 2026-08-05

No new persisted tables. Preference is a **request-time** parameter.

## Entities

### PreferenciaVia (enum)

| Value | Meaning |
|-------|---------|
| `nenhuma` | No soft bias (current planner behavior) |
| `rio` | Soft-prefer river segments |
| `estrada` | Soft-prefer road segments |

Default: `nenhuma`.

### RoutePlanItem (existing)

Unchanged fields. Preference affects **which** items are returned / order, not the schema. Optionally compute preferred share only server-side for sorting (not required in response).

### Soft-bias application (ephemeral)

| Field | Description |
|-------|-------------|
| `preferencia_via` | Active enum for this plan call |
| `share_preferred` | Internal: preferred miles / total miles |
| Edge weight | `base_weight * mult(tipo, preferencia)` during discovery |

## Validation

- `preferencia_via` ∈ {`nenhuma`, `rio`, `estrada`} or omitted → `nenhuma`
- Invalid → 422
- Does not change segment geometry or stored `RouteSegment.tipo`

## State (UI)

```text
panel closed → open: preferencia_via = nenhuma
user selects rio|estrada|nenhuma → auto-recalc if De/Para valid
panel close → next open: reset nenhuma
```

## Relationships

```text
Plan request
  ├── modo_transporte (050)
  ├── ordenacao (046)
  ├── ritmo
  └── preferencia_via (054) ──soft──► discovery weights + sort tie-break
```
