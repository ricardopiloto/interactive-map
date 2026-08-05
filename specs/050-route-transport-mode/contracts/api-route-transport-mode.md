# API Contract: Route Transport Mode

**Feature**: `050-route-transport-mode`  
**Date**: 2026-08-05

## HTTP: `GET /api/routes/plan`

### New / changed query

| Param | Type | Required | Default | Values / rules |
|-------|------|----------|---------|----------------|
| `modo_transporte` | string | no | `pago` | `pago`, `proprio` |
| `velocidade_media_mph` | number | no | — | `> 0` when sent; semantics depend on mode (below) |

Existing params (`origem_waypoint_id`, `destino_waypoint_id`, `ritmo`, `ordenacao`) unchanged.

### Mode semantics

| `modo_transporte` | Speed | Costs (Dentro / Fora) | `peso_barata` |
|-------------------|-------|------------------------|---------------|
| `pago` | Table (ignore client mph) | Table tariffs | Table cost + ε·tempo |
| `proprio` | `velocidade_media_mph` or **4.0** if omitted | **0** / **0** | `0 + ε·tempo` (tie-break by time) |
| *omitted* + mph omitted | Table | Table | (today) |
| *omitted* + mph set | **Legacy**: override speed | Table costs (today) | (today) |

New UI **always** sends `modo_transporte` explicitly (`pago` or `proprio`).

### Response

`RoutePlanResponse` shape unchanged. In `proprio`, every rota MUST report `custo_dentro_bp = 0` and `custo_fora_bp = 0`. Ordering still respects `ordenacao` (em próprio, `mais_barata` effectively ranks by time).

### Errors

| Condition | Status |
|-----------|--------|
| Invalid `modo_transporte` | 422 |
| `proprio` with mph ≤ 0 (if sent invalid) | 422 |
| Same origin/destination | existing 422 |
| Missing waypoints | existing 422 |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-002 | `pago` → table speed; mph ignored |
| FR-003, FR-005 | `proprio` → override speed + zero costs in graph and response |
| FR-004 | default mph 4 when próprio and omitted |
| FR-007 | `ritmo` / `ordenacao` unchanged |
| Edge: mais barata em próprio | zero cost weights; time tie-break; no error |
| Legacy clients | omitted mode + mph keeps old override+tariffs |
