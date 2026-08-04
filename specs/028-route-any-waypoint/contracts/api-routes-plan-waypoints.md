# API Contract: GET /api/routes/plan (por nós)

**Feature**: 028-route-any-waypoint  
**Breaking**: Substitui query params de Local por Waypoint.

## Request

```http
GET /api/routes/plan
  ?origem_waypoint_id=<int>
  &destino_waypoint_id=<int>
  &ritmo=normal|intenso
  &velocidade_media_mph=4
```

| Param | Required | Description |
|-------|----------|-------------|
| origem_waypoint_id | yes | ID do nó de origem |
| destino_waypoint_id | yes | ID do nó de destino |
| ritmo | yes | `normal` \| `intenso` |
| velocidade_media_mph | no (default 4, >0) | Velocidade média |

## Removido

- `origem_local_id`
- `destino_local_id`

## Errors (422)

| Condição | detail (orientação) |
|----------|---------------------|
| IDs iguais | Origem e destino devem ser diferentes |
| Waypoint inexistente | Origem/destino inválido (nó não encontrado) |
| ValueError do planner | Mensagem existente do serviço |

## Success

`200` + `RoutePlanResponse` (inalterado). `rotas: []` se sem caminho (comportamento atual do serviço / FE trata mensagem).

## Related

`GET /api/waypoints` — calculador usa lista **completa** (`linked_only` omitido ou `false`).
