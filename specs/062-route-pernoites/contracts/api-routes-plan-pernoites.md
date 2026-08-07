# Contract: `GET /api/routes/plan` — Pernoites & Fadiga

**Feature**: `062-route-pernoites`  
**Base**: Existing query params unchanged (`origem_waypoint_id`, `destino_waypoint_id`, `ritmo`, `modo_transporte`, `velocidade_media_mph`, `ordenacao`, `preferencia_via`, …).

## Response extension

Each element of `rotas[]` gains:

```json
{
  "waypoint_ids": [3, 7, 11],
  "distancia_milhas": 62.0,
  "tempo_horas": 18.0,
  "tempo_dias": 2,
  "tempo_horas_resto": 6.0,
  "tempo_texto": "2 dias e 6 h",
  "tipos": ["estrada"],
  "geometria": [{ "x": 0.1, "y": 0.2 }],
  "custo_dentro_bp": 0,
  "custo_fora_bp": 0,
  "pernoites": [
    {
      "dia": 1,
      "tipo": "local",
      "local_id": 7,
      "nome": "Fielbach",
      "x": 0.42,
      "y": 0.55
    }
  ],
  "fadiga_saldo": 1,
  "fadiga_pico": 1,
  "fadiga_aviso": false,
  "fadiga_morte": false
}
```

### `pernoites[]` item

| Field | Required | Notes |
|-------|----------|--------|
| dia | yes | int ≥ 1 |
| tipo | yes | `local` \| `relento` |
| local_id | if local | int |
| nome | if local | string |
| x, y | yes for markers | floats 0–1; required for `relento`; recommended for `local` |

Empty array when single-day march or no overnights.

### Fatigue fields

| Field | ritmo=normal | ritmo=intenso |
|-------|--------------|---------------|
| fadiga_saldo | 0 | final balance |
| fadiga_pico | 0 | max during sim |
| fadiga_aviso | false | true iff saldo > 1 |
| fadiga_morte | false | true iff pico ≥ 6 |

## Compatibility

Clients that ignore unknown fields keep working. No new query params required for MVP.

## Errors

Unchanged from existing plan endpoint.
