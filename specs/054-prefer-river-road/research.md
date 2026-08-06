# Research: Prefer River or Road in Route Planner

**Feature**: `054-prefer-river-road` | **Date**: 2026-08-05

## 1. Soft bias mechanism

**Decision**: Two cooperating soft effects when `preferencia_via` is `rio` or `estrada`:

1. **Discovery bias** — When building graph edge weights used by `nx.shortest_simple_paths`, multiply the active weight (`tempo` or `peso_barata`) by:
   - **0.75** if segment `tipo` matches the preference
   - **1.25** if segment `tipo` is the opposite of preference (`rio`↔`estrada`)
   - **1.0** if `trilha` (neutral)
2. **Ranking tie-break** — After collecting candidates, sort by existing `ordenacao` primary keys, then by **descending share of preferred miles** (`miles_preferred / miles_total`), then remaining tie-breaks as today.

When `preferencia_via` is `nenhuma` or omitted: **no** multipliers and **no** share tie-break — identical to current `plan_routes`.

**Rationale**: Spec requires soft preference + ordenação still applying. Weight bias pulls more preferred-type paths into the top-k pool; primary sort stays time/cost so FR-004 holds; share as secondary makes SC-002 perceptible without becoming a hard filter.

**Alternatives considered**:
- Post-sort only by share (primary) — rejected: fights `mais_rapida` / `mais_barata`
- Hard filter / exclude zero preferred miles — rejected in clarify (Option B/C)
- Bias only on discovery, no tie-break — weaker SC-002 when candidates already similar

## 2. Preferred-miles share metric

**Decision**: For a candidate route,  
`share = sum(distancia of edges with tipo == preferred) / sum(all edge distancias)`  
(0 if total distance is 0). Use distance, not hop count.

**Rationale**: Spec edge cases mention “mais distância (ou peso) no tipo escolhido”; miles match user mental model of “mais por rio/estrada”.

**Alternatives considered**: Hop count — rejected (short hops dominate unfairly).

## 3. API parameter

**Decision**: Query param `preferencia_via`: `nenhuma` | `rio` | `estrada`. Default when omitted: `nenhuma`. Invalid value → 422. UI always sends the param explicitly.

**Rationale**: Parallel to `modo_transporte` / `ordenacao`; Portuguese values match UI labels.

**Alternatives considered**: English `path_preference`; client-only reorder — rejected (must affect discovery per FR-002).

## 4. UI / lifecycle

**Decision**: Three radios (Sem preferência / Por rio / Por estrada). Default state `nenhuma`. On panel open (same pattern as modo → pago): reset to `nenhuma`. `useEffect` on preferência triggers `calcular` when De/Para válidos (with skip-first-mount ref like modo/ordenação).

**Rationale**: Clarifications Session 2026-08-05; FR-006/007.

## 5. Multipliers tunability

**Decision**: Constants `PREF_MATCH_MULT = 0.75`, `PREF_OPPOSITE_MULT = 1.25` in `route_planner.py`. If QA finds bias too weak/strong, adjust constants only (no API change).

**Rationale**: Small surface; SC-002 is the acceptance bar, not exact multiplier values.
