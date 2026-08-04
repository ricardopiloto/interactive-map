# API Contract: GET /api/routes/plan (custo + velocidade opcional)

**Feature**: 031-route-travel-cost  
**Router**: `backend/app/routers/public/routes.py`  
**Supersede parcial**: default `velocidade_media_mph=4` de 024 — agora **omitido = tabela 6/8**

## Request

```
GET /api/routes/plan
  ?origem_waypoint_id=<int>
  &destino_waypoint_id=<int>
  &ritmo=normal|intenso
  &velocidade_media_mph=<float>   # OPTIONAL; if present must be > 0
```

| Param | Required | Notes |
|-------|----------|--------|
| origem_waypoint_id | yes | |
| destino_waypoint_id | yes | ≠ origem |
| ritmo | yes | `normal` \| `intenso` |
| velocidade_media_mph | **no** | Ausente → speeds 6 / 8 / 4.8; presente → V×mods |

### Errors

| Case | Status |
|------|--------|
| velocidade presente e ≤ 0 | 422 |
| Ritmo inválido | 422 |
| Origem=destino / nós inválidos | 422 |
| Sem caminho | 200 `rotas: []` |

## Response

```json
{
  "rotas": [
    {
      "waypoint_ids": [1, 2, 5],
      "distancia_milhas": 24.0,
      "tempo_horas": 4.0,
      "tempo_dias": 0,
      "tempo_horas_resto": 4.0,
      "tempo_texto": "4 h",
      "tipos": ["estrada", "rio"],
      "custo_dentro_bp": 35.0,
      "custo_fora_bp": 15.0,
      "geometria": [{ "x": 0.1, "y": 0.2 }]
    }
  ]
}
```

### Invariants

1. `rotas` ordenadas por `tempo_horas` crescente (mais rápida primeiro).
2. `custo_*_bp` = soma por trecho; trilha contribui 0; tarifas fixas (2/1 estrada, 5/2 rio).
3. Custos **iguais** com ou sem `velocidade_media_mph` para a mesma geometria/tipos.
4. Sem override: tempo estrada usa 6 mi/h, rio 8 mi/h (razão 6:8 na mesma milhagem).
5. Com override V: tempo = dist / (V × tipo_mod) com mods 1.0 / 1.4 / 0.8.
