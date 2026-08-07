# Quickstart: Route Default Red

**Feature**: `065-route-default-red`  
**Prereqs**: App running; Rota tab; multi-day intenso useful for fatigue.

See [contracts/ui-route-default-red.md](./contracts/ui-route-default-red.md).

## Setup

```bash
# Usual backend + frontend (README)
```

## Validation scenarios

### 1. Selected base is red (not green)

1. Open **Rota**, calculate a normal-pace route, select it.
2. **Expect**: selected polyline is **red**, not green.

### 2. Fatigue still darkens

1. Calculate **intenso** multi-day with at least one relento (or arrival residual).
2. **Expect**: residual day stretch darker red than base; higher saldo → darker (levels toward max).
3. Local overnight day that recovers → base red, not fadiga dark.

### 3. Alts still distinct

1. ≥2 routes in result.
2. **Expect**: non-selected dashed/lighter red; only selected shows fadiga darkening / overnight chrome.

## Pass criteria

SC-001–SC-005 in [spec.md](./spec.md).
