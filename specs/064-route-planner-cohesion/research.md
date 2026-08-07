# Research: Route Planner Cohesion

**Feature**: `064-route-planner-cohesion` | **Date**: 2026-08-07

## 1. Why overnight count diverged from published days

**Decision**: Stop using a global road `budget_mph × horas_por_dia` as overnight `milhas_por_dia`. Compute **M** from this route’s published tempo (D, R), then `milhas_por_dia = distancia_milhas / M`.

**Rationale**: Clarifications FR-001b/c. River/mixed paths have different hours than road-budget miles imply → too many (or too few) overnight march days. Anchoring to miles÷M forces at most M−1 intermediate stops.

**Alternatives considered**: Hard-cap truncate after sim (uneven); equal geometric splits without continuous budget (B rejected in clarify).

## 2. Computing M from tempo

**Decision**: Reuse `format_tempo_texto` outputs: `tempo_dias` = D, `tempo_horas_resto` = R.  
`M = D if R == 0 else D + 1`. If total hours &lt; one day such that D=0 and R&gt;0 → M=1. If distance≈0 or M&lt;1 → no intermediate overnights.

**Rationale**: Locked Q1. Matches user-visible copy.

**Alternatives considered**: Round-half-up on R (C); ignore R (B).

## 3. Local vs relento window

**Decision**: Keep path-mile search for waypoints with `local_id` within **± `tolerancia_pernoite_pct` × milhas_por_dia`** of the ideal day mark (default 0.20). Prefer closest deviation; else relento at interpolated mark.

**Rationale**: Locked Q3 (“area around node” = mile tolerance along route). Settings key already exists.

**Alternatives considered**: Fixed map-coord radius; nearest-node half-day only.

## 4. Order of operations in `build_route_item`

**Decision**: Sum edge distance/time → format tempo → derive M → `milhas_por_dia = dist/M` → `simulate_overnights_and_fatigue(..., milhas_por_dia)` → attach `dias_visuais` as today (063).

**Rationale**: Overnight needs final route miles and M; cannot use plan-level road budget anymore.

**Alternatives considered**: Second pass over plan list (heavier).

## 5. Side menu “Rota” tab

**Decision**: Extend `SideTab` with `'rota'`. Label **"Rota"**. Render `RoutePlannerPanel` (or extracted form) as tab body. Remove floating `routePlannerOpen` panel and the map-adjacent “Calcular rota” toggle. `routePlannerActive = tab === 'rota'`.

**Rationale**: FR-005/006; short label per assumptions.

**Alternatives considered**: Keep floating button that only switches tab (extra chrome); label “Calcular rota” (longer).

## 6. Map-pick and overlay gating

**Decision**: Map-pick De/Para only when `tab === 'rota'`. Pass `travelPlan` into `CampaignMap` only when `tab === 'rota'` (else `[]` / hide overlay); keep `travelPlan` state in `MapPage` so returning to Rota restores overlay without recalculate.

**Rationale**: FR-007b/c, clarify Q4/Q5 option B.

**Alternatives considered**: Keep overlay always (A); hide only pins (C).

## 7. Alternative route colour

**Decision**: `.campaign-map__travel-route--alt` stroke → red family (dashed/lighter), distinct from selected green and from selected residual-fatigue reds (alts stay uniform dashed red, no per-day fadiga slices).

**Rationale**: FR-009/010; avoids painting fatigue chrome on non-selected routes (063 FR-008 preserved).

**Alternatives considered**: Same red intensity scale as fatigue (confusing).

## 8. Non-goals

Change WFRP fatigue +1/−1 rules beyond day-count consistency; redesign other side tabs; digitizer.
