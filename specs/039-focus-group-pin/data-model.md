# Data Model: Focus Group Pin

**Feature**: `039-focus-group-pin` | **Date**: 2026-08-04

Sem entidades persistidas novas. Modelo = pedido de foco de UI + marcador de grupo já existente.

## Entities (UI)

### GrupoPosicao (existing)

| Field | Notes |
|-------|--------|
| `x`, `y` | Normalized map coords; party placed with `%` left/top |
| `formato` | Visual form (`bandeira` / `brasao`); unrelated to focus math |

**Invariant**: At most one party marker on the campaign map. Focus targets that single marker.

### MapFocusRequest (UI, extended)

| Field | Type | Notes |
|-------|------|--------|
| `target` | `'local' \| 'group'` | Discriminator |
| `localId` | number \| omit | Required when `target === 'local'` |
| `nonce` | number | Monotonic; re-click with same target still retriggers |

**Transitions**:
1. User clicks “Ir ao grupo” → enqueue `{ target: 'group', nonce: n+1 }`
2. Controller finds `#map-party` → `zoomToElement` → clear request
3. Missing element → clear or leave cleared; no error UI

### Party DOM anchor

| Attribute | Value |
|-----------|--------|
| Element id | `map-party` (stable) |
| Present when | `grupo != null` and lore pins not hidden |

## Validation

- With `grupo` set: control visible; click → party centered at focus scale.
- With `grupo` null: control absent from zoom cluster.
- Repeat click increments nonce → animation may re-run; no crash.
