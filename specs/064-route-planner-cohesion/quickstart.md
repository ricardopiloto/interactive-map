# Quickstart: Route Planner Cohesion

**Feature**: `064-route-planner-cohesion`  
**Prereqs**: App running; named waypoints; multi-day river and road options useful.

See [contracts](./contracts/) and [data-model.md](./data-model.md).

## Setup

```bash
# From repo root — usual backend + frontend start (see README)
```

## Validation scenarios

### 1. Overnight ≤ M − 1 (river / mixed)

1. Calcular rota (via side tab **Rota**) for a long trip that shows ~6 days (or “N dias e R h”).
2. Note published D/R → compute M (D or D+1).
3. Select the route; count intermediate overnight pins/badges.
4. **Expect**: count ≤ M − 1 (not ~10 for a ~6-day published trip).
5. Spot-check a Local overnight only when a Local-linked node sits near the day mark (±20% of daily miles).

### 2. One-day march

1. Short hop with published time &lt; one full day or exactly 1 day with R=0 → M=1.
2. **Expect**: no intermediate overnight markers.

### 3. Side tab + map space

1. Confirm **Rota** appears beside Locais / NPCs / História (and Grupo if GM).
2. Open Rota — planner controls live in the side panel.
3. **Expect**: no floating planner panel over the map; more map visible than before.

### 4. Map-pick only on Rota

1. On **Rota**, click eligible city pin → fills De or Para (no Local modal).
2. Switch to **Locais**, click same pin → Local detail / select (no De/Para fill).

### 5. Overlay hide/show

1. On Rota, calculate so routes draw on the map.
2. Switch to Locais — **Expect**: travel overlay gone.
3. Return to Rota — **Expect**: same plan redrawn without pressing Calcular again.

### 6. Alt routes red

1. Result with ≥2 routes; select first.
2. **Expect**: others dashed **red**; selected green (and fatigue reds only on selected residual days if intenso).

## Pass criteria

SC-001–SC-005 in [spec.md](./spec.md); contracts satisfied.
