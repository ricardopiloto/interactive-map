# Quickstart: Route Overnight Pins & Fatigue Segment Colors

**Feature**: `063-route-pin-fatigue-colors`  
**Prereqs**: App running (backend + frontend); feature 062 overnight simulation available; at least one route with multi-day Intense travel and Local near a day mark.

See [contracts](./contracts/) and [data-model.md](./data-model.md) for field meanings.

## Setup

```bash
# From repo root — follow README for your usual start
# Ensure ADMIN credentials if testing GM tools; player map is enough for this feature
```

## Validation scenarios

### 1. Green base + clean list

1. Open Calcular rota; plan a short trip (normal pace, ≤1 day or Local overnight every night).
2. **Expect**: Selected path is **green** (not the old solid red travel colour).
3. **Expect**: List rows show mi/tempo/custos only — **no** “Pernoite …” / fadiga lines.

### 2. Relento blue pin

1. Plan Intense multi-day where a day mark has no Local within ±20%.
2. Select the route.
3. **Expect**: Small **blue** pin at relento; hover “Pernoite”.
4. **Expect**: No large SVG disc from 062 overlay.

### 3. Local overnight badge

1. Plan so a day mark snaps to a Local.
2. Select the route.
3. **Expect**: That Local pin shows overnight badge/halo; hover “Pernoite”.
4. **Expect**: Click still opens Local detail (no second pin).

### 4. Red residual segments + intensity

1. Plan Intense with at least one relento overnight (and optionally arrival day without recovery).
2. Select the route.
3. **Expect**: Day stretch that ends at relento (or arrival without overnight) is **red**; Local overnight days stay **green**.
4. **Expect**: Later residual days with higher `fadiga_apos` look darker red (max at ≥6).
5. Hover a red segment → fatigue saldo hint.

### 5. Alternatives stay quiet

1. With multiple alternatives returned, leave only the primary selected.
2. **Expect**: Other routes are dashed/light green only — no red slices, no overnight pins/badges for them.

### 6. API smoke (optional)

```bash
# After POST /api/routes/plan, inspect selected item:
# - dias_visuais length === pernoites.length + 1
# - residual true only on relento days and arrival-without-overnight
```

## Pass criteria

All scenarios above match [spec.md](./spec.md) success criteria; list has no overnight/fatigue copy; map carries the meaning.
