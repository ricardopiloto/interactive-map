# API Contract: Rotas de viagem

## Public

### `GET /api/routes/plan`

Query:

| Param | Type | Required |
|-------|------|----------|
| origem_local_id | int | yes |
| destino_local_id | int | yes |
| ritmo | `cauteloso` \| `normal` \| `arriscado` | yes |

**200** — exemplo:

```json
{
  "rotas": [
    {
      "waypoint_ids": [3, 7, 11],
      "distancia_milhas": 62.0,
      "tempo_horas": 18.0,
      "tipos": ["estrada", "rio"],
      "geometria": [{"x": 0.1, "y": 0.2}, {"x": 0.15, "y": 0.22}]
    }
  ]
}
```

| Caso | Status |
|------|--------|
| Local sem waypoint | **400** / **422** com detalhe |
| Sem caminho | **200** `{ "rotas": [] }` |
| origem = destino | **400** / **422** ou `rotas: []` (definir uma; preferir 422) |
| ritmo inválido | **422** |

Sem auth.

### `GET /api/waypoints`

Query opcional: `linked_only=true` — só waypoints com `local_id` (para UI).

**200**: lista `{ id, nome, x, y, local_id }`.

Leitura de segmentos públicos: `GET /api/route-segments` (opcional para desenhar rede; MVP pode omitir se geometria vier só no plan).

## Admin (Basic Auth)

### Waypoints

| Method | Path | Body |
|--------|------|------|
| GET | `/api/admin/waypoints` | — |
| POST | `/api/admin/waypoints` | `{ nome?, x, y, local_id? }` |
| PUT | `/api/admin/waypoints/{id}` | parcial |
| DELETE | `/api/admin/waypoints/{id}` | cascade segmentos incidentes |

### Route segments

| Method | Path | Body |
|--------|------|------|
| GET | `/api/admin/route-segments` | — |
| POST | `/api/admin/route-segments` | `{ waypoint_a_id, waypoint_b_id, tipo, pontos_intermediarios?, modificador_velocidade? }` — servidor calcula `distancia_milhas` |
| PUT | `/api/admin/route-segments/{id}` | |
| DELETE | `/api/admin/route-segments/{id}` | |

### Escala

| Method | Path |
|--------|------|
| GET/PUT | `/api/admin/map-scale` | `{ miles_per_map_unit, notas? }` |

## Auth

Escrita admin: mesmo `verify_admin` que demais `/api/admin/*`. Plan e listagens públicas: sem Basic Auth.
