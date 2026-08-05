# API / UI Contract: Route Sort Preference

**Feature**: `046-route-sort-preference`  
**Date**: 2026-08-04

## HTTP: `GET /api/routes/plan`

### New / changed query

| Param | Type | Required | Default | Values |
|-------|------|----------|---------|--------|
| `ordenacao` | string | no | `mais_rapida` | `mais_rapida`, `mais_barata` |

Existing params (`origem_waypoint_id`, `destino_waypoint_id`, `ritmo`, `velocidade_media_mph`) unchanged.

### Response

`RoutePlanResponse` unchanged shape. `rotas` length ≤ **6**, ordered per `ordenacao`:

- `mais_rapida`: fastest first  
- `mais_barata`: lowest **custo_dentro_bp** first (Fora / tempo / distância tie-breaks)

### Errors

- Invalid `ordenacao` → 422  
- Same origin/destination → existing 422  

## UI: Calcular rota panel

| Aspect | Contract |
|--------|----------|
| Control | User can select Mais rápida / Mais barata before calculate |
| Default | Mais rápida |
| Request | Passes `ordenacao` to plan API |
| Auto-refresh | Changing preference with valid De/Para recalculates without extra Calcular click |
| First row | Badge/cue matches preference (“mais rápida” / “mais barata”) |
| Row body | Distance, time, types, Dentro & Fora costs unchanged |
| Selection | Index 0 selected after each successful plan |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001–002, US2 | UI control + default |
| FR-003–006, SC-001 | Top 6 + order |
| FR-004 clarification | Dentro primary for barata |
| FR-005 | Server discovery by preference |
| FR-007–008 | Select first; costs visible |
| FR-009, SC-005 | Auto-recalc |
| FR-010 | Digitizer untouched |
