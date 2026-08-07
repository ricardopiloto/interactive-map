# Contract: API — day visual segments on route plan

**Feature**: `063-route-pin-fatigue-colors`  
**Endpoint**: existing `POST /api/routes/plan` (and any cached plan payload that returns `RoutePlanItem`)  
**Change type**: Additive fields only

## Response — each `RoutePlanItem`

```json
{
  "dias_visuais": [
    {
      "dia": 1,
      "residual": false,
      "fadiga_apos": 0,
      "geometria": [{ "x": 0.1, "y": 0.2 }, { "x": 0.15, "y": 0.22 }]
    },
    {
      "dia": 2,
      "residual": true,
      "fadiga_apos": 1,
      "geometria": [{ "x": 0.15, "y": 0.22 }, { "x": 0.3, "y": 0.4 }]
    }
  ]
}
```

## Field semantics

| Field | Required | Notes |
|-------|----------|--------|
| `dias_visuais` | yes (may be `[]` if no march days) | Ordered by `dia` ascending |
| `dia` | yes | 1-based |
| `residual` | yes | See [data-model.md](../data-model.md) |
| `fadiga_apos` | yes | Int ≥ 0 |
| `geometria` | yes | Non-empty for drawable days; consecutive days share endpoint |

## Compatibility

- Clients that ignore `dias_visuais` keep working.
- Existing `pernoites` / `fadiga_saldo` / `fadiga_pico` remain authoritative for overnight positions and totals.
- `len(dias_visuais)` MUST equal `len(pernoites) + 1` when the plan has a positive march length.

## Errors

No new error codes. Invalid plans already return existing 4xx from the planner.
