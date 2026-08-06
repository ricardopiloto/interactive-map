# API Contract: Route Type Coverage

**Feature**: `056-route-type-coverage`  
**Date**: 2026-08-05  
**Endpoint**: `GET /api/routes/plan` (unchanged request/response schema)

## Request

No new parameters. Existing: `origem_waypoint_id`, `destino_waypoint_id`, `ritmo`, `ordenacao`, `modo_transporte`, `preferencia_via`, optional `velocidade_media_mph`.

## Response (behavioral)

`{ "rotas": RoutePlanItem[] }` with `len(rotas) ≤ 6`.

### Coverage invariant

For each `tipo` ∈ `{estrada, rio, trilha}`:  
**If** the road network admits a continuous walk from origem to destino using **only** segments of that `tipo`,  
**Then** `rotas` MUST contain ≥1 item where `tipos == [tipo]` (the best such path under the active `ordenacao`, subject to keeping the overall best item and the ≤6 cap).

### Ordering invariant

- With `ordenacao=mais_rapida`, `rotas[0]` MUST be the minimum `tempo_horas` among returned items (ties broken as today: preferência share, distance, cost).
- With `ordenacao=mais_barata`, `rotas[0]` MUST be the minimum `custo_dentro_bp` among returned items (Fora / share / time as today).

### Preferência invariant

`preferencia_via` MUST NOT remove coverage of an opposite pure tipo when that pure path exists.

### Non-goals

- No new fields on `RoutePlanItem`.
- No hard filter that returns only one tipo.
- Digitizer endpoints unchanged.

## Canonical acceptance (this campaign)

| Call | Expect |
|------|--------|
| `origem=1` (Altdorf), `destino=5` (Ubersreik), `ordenacao=mais_rapida`, `modo_transporte=pago`, `preferencia_via=nenhuma` | ≥1 rota with `tipos == ["estrada"]`; also typically ≥1 with `tipos == ["rio"]` |
| Same with `ordenacao=mais_barata` | Still ≥1 `tipos == ["estrada"]` |
| Same with `preferencia_via=rio` | Still ≥1 `tipos == ["estrada"]` if network allows |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001 / SC-001 | Canonical Altdorf→Ubersreik mais_rapida includes pure estrada |
| FR-002 / FR-009 | Coverage invariant |
| FR-004 / FR-005 / SC-003 | ≤6 + ordering invariant |
| FR-006 | Preferência invariant |
| FR-003 | No invented tipos |
