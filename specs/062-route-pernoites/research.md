# Research: Route Overnight Stops (Pernoites)

**Feature**: `062-route-pernoites` | **Date**: 2026-08-07

## 1. Where to compute pernoites

**Decision**: Server-side, when assembling each `RoutePlanItem` in `plan_routes` / `item_from_edges` (or a dedicated helper called there). Client only displays.

**Rationale**: Single source of truth; list summaries and map markers share the same payload; fatigue peak needs day-by-day simulation.

**Alternatives considered**: Client-only simulation (duplicates logic, drifts); persist pernoites in DB (unnecessary — derived).

## 2. Daily budget vs tempo_dias

**Decision**: Close each march day by accumulating **path distance** until `milhas_por_dia = horas_por_dia * effective_mph` (same `HORAS_POR_DIA` + `resolve_speed_and_zero_costs` as today). Tolerance window = `± tolerancia_pernoite_pct * milhas_por_dia` along the path.

Use edge `distancia` (miles) for progress. Place overnight at chosen Local waypoint or interpolated geometry point at the ideal mile mark.

**Rationale**: Matches clarification (miles/day = hours × speed) and PRD distance framing. Edge type modifiers still affect `tempo_*` as today; overnight day count is distance-budget-based. Document that `len(pernoites) == max(0, dias_marcha - 1)` where `dias_marcha` is derived from this simulation (expose `dias_marcha` or reuse counting from simulation), and keep existing `tempo_texto` unchanged (fatigue/pernoite must not rewrite travel time).

**Alignment note**: Prefer asserting overnight count against simulation days, not forcing equality with `tempo_dias` when type mods make hours diverge from distance/base-speed. UI can show both; SC-005 uses simulation days.

**Alternatives considered**: Close days by cumulative edge **tempo** hours (perfect match to `tempo_dias`) — rejected as secondary because FR-002/clarification lock distance budget; revisit only if QA finds large UX mismatch.

## 3. ±Tolerance Local selection

**Decision**: After computing ideal close distance `D` from day start along the chosen path:

1. Collect waypoints on the remaining path (from day start through destination) that have `local_id` set (load Local name).
2. Candidates whose path-distance from day-start is in `[D - tol, D + tol]` and **strictly before destination** (arrival is never an overnight).
3. Pick candidate minimizing `|dist - D|`; ties → earlier along path (stable).
4. Advance day-start to that waypoint’s cumulative distance (stretch or shorten).
5. If no candidate → relento at interpolate(`D`) on polyline; advance to `D`.

**Rationale**: Clarifications Q1 + Q5 (± window, min adjustment, progress advances).

**Alternatives considered**: Forward-only stretch (rejected); pick nearest in map Euclidean space (rejected — must be on path).

## 4. Geometry interpolation for relento

**Decision**: Walk ordered `geometria` / edge polylines with cumulative miles; linear interpolate between consecutive points when target mile falls mid-segment.

**Rationale**: Same 0–1 coords as pins; FR-004.

## 5. Fatigue

**Decision** (ritmo `intenso` only):

- Start saldo = 0, peak = 0.
- Each completed march day (including arrival day without overnight): saldo += 1; peak = max(peak, saldo); **then** if that day has a `local` overnight, saldo = max(0, saldo - 1).
- `relento` overnight: no recovery.
- Ritmo `normal`: omit fatigue fields / zeros; no soft warn; no death alert.
- Soft warn flag: `saldo_final > 1`.
- Death alert: `peak >= 6` (warn only; still selectable).

**Rationale**: Locked clarifications; WFRP death at 6.

**Alternatives considered**: Mechanical fatigue slowing next day (rejected); warn at peak 5 (rejected); block selection (rejected).

## 6. Settings

**Decision**: Add `tolerancia_pernoite_pct: float = 0.20` to `Settings` (env override). No public UI. Miles/day not a separate setting.

**Rationale**: FR-008.

## 7. API shape

**Decision**: Additive fields on `RoutePlanItem`:

- `pernoites: list[Pernoite]`
- `fadiga_saldo: int` (0 if normal)
- `fadiga_pico: int`
- `fadiga_aviso: bool` (saldo > 1)
- `fadiga_morte: bool` (pico ≥ 6)

Optional: `pernoite_resumo: str` for convenience — or let frontend format (prefer frontend format from structured list to keep i18n/copy flexible).

**Rationale**: Additive, backward compatible for older clients ignoring fields.

## 8. Frontend

**Decision**:

- List: every multi-day row shows overnight summary; intenso rows show saldo; CSS class for `fadiga_aviso`; stronger class/copy for `fadiga_morte`.
- Map: when a route is selected, render overnight markers (local + relento) distinct from Local pins; update with selection.
- Markers for `local` type may sit on/near existing pin — use distinct glyph/badge (e.g. moon) so “overnight here” is clear.

**Rationale**: US3–US5, FR-007/007b/015–019.

## 9. Non-goals

Encounters, editing tolerance in UI, renaming ritmos, starting fatigue input, changing k-shortest or costs.
