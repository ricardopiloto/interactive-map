# UI Contract: RoutePlannerPanel por nós

**Feature**: 028-route-any-waypoint  
**Component**: `RoutePlannerPanel` (+ wiring `MapPage`)

## Antes → Depois

| Aspeto | Antes | Depois |
|--------|-------|--------|
| Opções origem/destino | Locais com waypoint (`linkedLocalIds`) | **Todos** os waypoints |
| Valor do select | `local.id` | `waypoint.id` |
| API plan | `origem_local_id` / `destino_local_id` | `origem_waypoint_id` / `destino_waypoint_id` |
| Props | `locais`, `linkedLocalIds` | `waypoints` (+ `locais` ou mapa de nomes só para rótulo) |

## Rótulo (FR-008)

1. `waypoint.nome` trim não vazio  
2. Senão nome do Local com `id === waypoint.local_id`  
3. Senão `Nó {waypoint.id}`

Ordenação: alfabética pelo rótulo.

## Copy

- Erros sem “Local sem waypoint”
- “Nenhuma rota encontrada entre esses nós” (ou equivalente)

## Invariantes

- Ritmo / velocidade / lista de resultados / overlay no mapa inalterados na forma
- Clique esquerdo / seleção de rota alternativa inalterados
