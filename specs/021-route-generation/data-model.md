# Data Model: 021-route-generation

## Entity: Waypoint

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | int | yes (PK) | |
| nome | str | no | Ex. “Cruzamento do Moinho” |
| x, y | float | yes | 0–1, mesmo sistema de Local |
| local_id | int FK → Local | no | Unique when set; Local no seletor jogador |

**Rules**: Local sem waypoint não aparece em De/Para. Waypoint sem local participa do grafo só como nó intermediário. Delete Local → `local_id` null (nó permanece) ou cascade null.

## Entity: RouteSegment

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | int | yes (PK) | |
| waypoint_a_id | int FK | yes | Extremo (ordem do desenho) |
| waypoint_b_id | int FK | yes | Outro extremo; ≠ a |
| tipo | enum | yes | `estrada` \| `rio` \| `trilha` |
| pontos_intermediarios | list[{x,y}] | no | Ordenados ao longo do traçado A→B |
| distancia_milhas | float | yes | Derivada na create/update |
| modificador_velocidade | float | no | Default por tipo se omitido |

**Rules**: Bidirecional no grafo. Sem self-loop. Distância recalculada se pontos/escala mudam.

## Entity: MapScale (singleton)

| Field | Type | Notes |
|-------|------|-------|
| id | int | sempre 1 |
| miles_per_map_unit | float | Fator global |
| notas | str | opcional (cidades de calibração) |

## Route plan (não persistido)

Request: `origem_local_id`, `destino_local_id`, `ritmo` ∈ {cauteloso, normal, arriscado}

Response item:

| Field | Notes |
|-------|-------|
| waypoint_ids | Sequência de nós |
| distancia_milhas | Soma |
| tempo_horas | Soma tempos das arestas |
| tipos | Tipos tocados (ou por aresta) |
| geometria | Opcional: lista de pontos para desenhar (waypoints + intermediários na ordem) |

Máx. **k=5** rotas; ordenadas por `tempo_horas` asc.

## Relationships

```text
Local 1 ──0..1── Waypoint
Waypoint * ──* Waypoint via RouteSegment (bidirecional em runtime)
MapScale 1 (global)
```

## State (UI)

| Estado | Papel |
|--------|-------|
| `routeDigitizer` (GM) | Vista dedicada; sem pins lore |
| `routePlan` + `selectedRouteIndex` | Resultado do cálculo; índice 0 = mais rápida |
| Overlay viagem vs overlay `saida_ids` | Independentes |
