# Research: Route Sort Preference

**Feature**: `046-route-sort-preference` | **Date**: 2026-08-04

## 1. API parameter

**Decision**: `ordenacao` query on `GET /api/routes/plan` with values `mais_rapida` | `mais_barata`; default `mais_rapida` when omitted (backward compatible).

**Rationale**: FR-001/002; matches Portuguese UI labels.

**Alternatives considered**: `sort=time|cost` — less aligned with product language.

## 2. K_MAX = 6

**Decision**: Raise `K_MAX` from 5 to **6**; `plan_routes(..., k=K_MAX)` unchanged signature except new `ordenacao` arg.

**Rationale**: Spec “6 primeiras opções”.

## 3. Preference-aware path discovery (FR-005)

**Decision**:
- Build graph edges with both `tempo` and `custo_dentro_bp` (already present).
- For **mais_rapida**: keep today’s behavior — simple-graph edge = min-`tempo` parallel; `shortest_simple_paths(..., weight="tempo")`.
- For **mais_barata**: simple-graph edge = min-`custo_dentro_bp` parallel (tie-break Fora then tempo); `shortest_simple_paths(..., weight="custo_dentro_bp")` (see §4 for zero weights).
- Expand parallel variants as today; **final sort** by preference keys; take top 6.

**Rationale**: Top-k by cost must enumerate cost-optimal simple paths, not only re-rank time-k paths.

**Alternatives considered**:
- Client-only reorder of time results — rejected by FR-005
- Enumerate huge k by time then filter — wasteful and incomplete for cheap/slow routes

## 4. Zero-cost edges (trilhas)

**Decision**: For barata **enumeration weight only**, use a composite if needed: `custo_dentro_bp + 1e-9 * tempo` (store as edge attr `peso_barata` or pass via weight function) so all-zero trail paths still differentiate by time; **reported costs** remain true bp. Final sort still uses real `custo_dentro_bp`, then Fora, then tempo.

**Rationale**: NetworkX / Yen-style simple paths with many 0-weight edges can yield arbitrary ties; tiny tempo epsilon preserves stability without changing displayed costs.

## 5. Final sort keys

**Decision**:
- `mais_rapida`: `(tempo_horas, distancia_milhas, custo_dentro_bp)`
- `mais_barata`: `(custo_dentro_bp, custo_fora_bp, tempo_horas, distancia_milhas)`

**Rationale**: Clarifications + Assumptions.

## 6. Parallel hop “primary” selection

**Decision**: `hops_for_pair` / graph collapse sort key depends on `ordenacao` (tempo vs custo_dentro + Fora + tempo), so primary variant matches the objective.

**Rationale**: Consistent with discovery weight.

## 7. Frontend UX

**Decision**: Radio group or segmented control “Ordenar: Mais rápida | Mais barata” default rápida. Pass `ordenacao` to `planRoute`. On preference change: if origem/destino valid, invoke the same calculate logic automatically (FR-009); reset selection to index 0. First list item badge: `mais rápida` or `mais barata` per active preference.

**Rationale**: Clarification auto-recalc; US2 discoverability.

## 8. Tests / CHANGELOG

**Decision**: Manual quickstart; note under next patch (e.g. 0.6.7) when shipping. Add/adjust backend unit tests for sort order if a planner test module exists.
