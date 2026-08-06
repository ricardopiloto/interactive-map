# Research: Route Type Coverage in Alternatives

**Feature**: `056-route-type-coverage` | **Date**: 2026-08-05

## 1. Root cause (confirmed)

**Decision**: Treat as selection/coverage bug, not missing map data.

**Rationale**: `plan_routes` takes the first `K_MAX=6` node paths from `nx.shortest_simple_paths` by mixed weight, then edge variants. Altdorf→Ubersreik pure **estrada** (~367 mi, longer node chain) never enters that pool under **mais_rapida** (rio is faster at table speeds). It already appears under **mais_barata** because cost-ordered discovery surfaces it within k.

**Alternatives considered**:
- Only increase k — fragile; pure road may still be outside any fixed k
- Rely on preferência=estrada soft bias — reproduced: still no pure estrada in top 6 under mais_rapida

## 2. How to find the best pure path per tipo

**Decision**: For each `tipo` in `{estrada, rio, trilha}`:

1. Build a **type-restricted** undirected graph from `parallels`: for each node pair, keep only hop attrs with `tipo == T`; if several, pathfinding uses the best hop by the same `hop_sort_key` / weights as today (true tempo / `peso_barata`, with soft preferência multipliers still applied for consistency with mixed discovery).
2. If origem/destino are connected, compute **one** shortest path by the active weight (`tempo` or `peso_barata`).
3. Materialize `RoutePlanItem` via existing `edge_variants_for_path` but **filter hops to tipo T only** (or a dedicated pure variant builder) so the item’s `tipos == [T]`.
4. Among pure items of type T, keep the single best by the same final sort keys as mixed candidates (tempo or custo_dentro + preferência share tie-break).

**Rationale**: Clarification Q3 — existence on the network is sufficient; type-restricted shortest path guarantees the best pure by the discovery weight aligned with ordenação. Clarification Q2 — one representative = best pure of that type.

**Alternatives considered**:
- Expand mixed `shortest_simple_paths` until all pures found — unbounded / may miss disconnected-looking long detours
- Yen-style with type constraints — heavier than needed for k=1 pure per tipo
- Hard filter preferência — rejected in clarify Q1

## 3. Assembling the final ≤6 set

**Decision** (after collecting mixed candidates as today + up to 3 pure representatives):

1. Deduplicate by segment-id signature (`tuple(seg_id)`), same as today.
2. Identify **overall best** = first after full sort (ordenação + preferência share).
3. Identify **coverage set** = best pure item per tipo that exists (may overlap overall best).
4. Build result:
   - Always include overall best.
   - Add any missing coverage pures.
   - Fill remaining slots (up to `K_MAX`) from remaining sorted mixed candidates that are not already included.
   - If over capacity before fill completes: drop lowest-ranked **non-coverage, non-#1** mixes first (never drop a unique pure coverage slot or #1).
5. Re-sort the final list with the same sort keys; return `[:K_MAX]`.

**Rationale**: FR-004/005; Assumptions on displacement.

**Alternatives considered**:
- Replace entire list with only pures — out of scope
- Append pures without re-sort — breaks “mais rápida first” UX

## 4. Preferência de via interaction

**Decision**: Soft bias remains on all graphs (mixed + type-restricted). Coverage injection is **independent** of preferência: opposite pure types still get a slot if connected (clarify Q1). Preferência only affects weights and tie-break share.

**Rationale**: Locked clarification.

## 5. API / UI surface

**Decision**: No new query params or response fields. Frontend unchanged for behavior (titles already from `tipos`). Validation via API + optional UI smoke.

**Rationale**: FR behavioral; keep 055 panel as-is.

## 6. Canonical regression IDs

**Decision**: Document Altdorf waypoint id `1`, Ubersreik `5` in this campaign DB for quickstart (seed-stable assumption).

**Rationale**: Reproduced in specify/plan sessions against running backend.
