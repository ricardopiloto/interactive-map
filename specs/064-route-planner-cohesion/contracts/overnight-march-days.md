# Contract: Overnight march days vs published tempo

**Feature**: `064-route-planner-cohesion`  
**Surface**: Route plan computation (`simulate_overnights_and_fatigue` / `build_route_item`)  
**Change type**: Behavioural (same response shape; different pernoite counts/positions)

## Inputs (per planned path)

- `distancia_milhas`, `tempo_horas`, `horas_por_dia` → published `tempo_dias` (D), `tempo_horas_resto` (R)
- Path geometry / waypoints with optional `local_id`
- `tolerancia_pernoite_pct` (default 0.20)

## Rules

1. `M = D` if `R ≈ 0`, else `M = D + 1` (and `M = 1` when `D = 0` and `R > 0`).
2. `milhas_por_dia = distancia_milhas / M` when `M ≥ 1`.
3. At most `M - 1` intermediate overnight records.
4. Ideal marks at `k * milhas_por_dia` for `k = 1 .. M-1` (from trip start in path miles).
5. Local if a path waypoint with Local lies within `± tolerancia_pernoite_pct * milhas_por_dia` of the ideal mark; else relento.
6. Intense fatigue still +1 per march day / −1 on local overnight; arrival day can leave residual (063 `dias_visuais`).

## Compatibility

- Response fields `pernoites`, `fadiga_*`, `dias_visuais` unchanged in schema.
- Clients must not assume overnight count from road mph × hours.

## Validation examples

| Published | M | Max intermediate pernoites |
|-----------|---|----------------------------|
| 6 dias | 6 | 5 |
| 2 dias e 3 h | 3 | 2 |
| 5 h (D=0) | 1 | 0 |
| 1 dia exact | 1 | 0 |
