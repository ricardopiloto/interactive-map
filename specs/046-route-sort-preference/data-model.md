# Data Model: Route Sort Preference

**Feature**: `046-route-sort-preference` | **Date**: 2026-08-04

No new persisted tables. Preference is a request/UI parameter.

## Entities

### OrdenacaoRota (enum)

| Value | Meaning |
|-------|---------|
| `mais_rapida` | Rank / discover by travel time (default) |
| `mais_barata` | Rank / discover by **custo Dentro (bp)** |

### RoutePlanItem (existing)

Unchanged fields (`tempo_horas`, `distancia_milhas`, `custo_dentro_bp`, `custo_fora_bp`, `tipos`, `geometria`, …). Ordering of the **list** in `RoutePlanResponse.rotas` changes with preference.

### Plan request (extended)

| Field | Type | Notes |
|-------|------|--------|
| `origem_waypoint_id` | int | Existing |
| `destino_waypoint_id` | int | Existing |
| `ritmo` | enum | Existing |
| `velocidade_media_mph` | float? | Existing optional |
| `ordenacao` | OrdenacaoRota | **New**; default `mais_rapida` |

## Ranking rules

| Preference | Discovery weight | Final sort key (asc) |
|------------|------------------|----------------------|
| `mais_rapida` | edge `tempo` | tempo → distância → Dentro |
| `mais_barata` | edge Dentro (+ ε·tempo if needed) | Dentro → Fora → tempo → distância |

**Limit**: at most **6** items after sort.

## UI state (Calcular rota)

| Field | Notes |
|-------|--------|
| `ordenacao` | Local state; default `mais_rapida` |
| On change | Auto-call plan when De/Para valid |

## Validation

- Unknown `ordenacao` → 422.
- Omitted → `mais_rapida`.
- Empty path set → `rotas: []` unchanged.
