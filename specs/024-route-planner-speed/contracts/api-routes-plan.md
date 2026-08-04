# API Contract: GET /api/routes/plan

**Feature**: 024-route-planner-speed  
**Router**: `backend/app/routers/public/routes.py`

## Request

```
GET /api/routes/plan
  ?origem_local_id=<int>
  &destino_local_id=<int>
  &ritmo=normal|intenso
  &velocidade_media_mph=<float>   # optional, default 4, must be > 0
```

| Param | Required | Notes |
|-------|----------|--------|
| origem_local_id | yes | Local com waypoint |
| destino_local_id | yes | ≠ origem; com waypoint |
| ritmo | yes | `normal` (6 h/dia) ou `intenso` (8 h/dia) |
| velocidade_media_mph | no | Default `4`; base estrada |

### Errors

| Case | Status / behavior |
|------|-------------------|
| Ritmo inválido | 422 |
| velocidade ≤ 0 | 422 |
| Local sem waypoint | 404 ou lista vazia (manter padrão atual do router) |
| Sem caminho | 200 com `rotas: []` |

## Response

```json
{
  "rotas": [
    {
      "waypoint_ids": [1, 2, 5],
      "distancia_milhas": 24.0,
      "tempo_horas": 6.0,
      "tempo_dias": 1,
      "tempo_horas_resto": 0.0,
      "tempo_texto": "1 dia",
      "tipos": ["estrada"],
      "geometria": [{ "x": 0.1, "y": 0.2 }, ...]
    }
  ]
}
```

### Invariants

1. `rotas` ordenadas por `tempo_horas` crescente (mais rápida primeiro).
2. Até **K=5** alternativas.
3. Tempo de aresta usa `dist / (velocidade_media_mph * tipo_mod)` com mods 1.0 / 1.4 / 0.8.
4. Pathfinding minimiza tempo (MultiGraph se segmentos paralelos).
5. `tempo_texto` reflete `ritmo` (horas/dia).

Ver também [data-model.md](../data-model.md).
