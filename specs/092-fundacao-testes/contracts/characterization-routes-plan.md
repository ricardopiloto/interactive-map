# Contract: `GET /api/routes/plan`

Query obrigatória: `origem_waypoint_id`, `destino_waypoint_id`, `ritmo` (`normal` \| `intenso`).

## Plano com sucesso (clarificação C)

Pré-condição: dois waypoints + um segmento `estrada` com `distancia_milhas > 0`.

`GET /api/routes/plan?origem_waypoint_id={A}&destino_waypoint_id={B}&ritmo=normal`

- 200
- corpo `{"rotas": [ ... ]}` com `len(rotas) >= 1`
- cada item no formato actual (`waypoint_ids`, `distancia_milhas`, `tempo_horas`, `tipos`, `geometria`, …)

## Rede insuficiente (clarificação C)

Pré-condição: dois waypoints **sem** segmento a ligá-los.

Mesmo GET:

- 200 (não 500)
- `{"rotas": []}` — comportamento actual de `plan_routes` quando não há caminho (`NetworkXNoPath` / sem arestas)

## Já definidos (extras úteis, não substituem os dois pins)

| Caso | Código |
|------|--------|
| Origem = destino | 422 `ROTA_ORIGEM_DESTINO_IGUAIS` |
| Waypoint origem inexistente | 422 `ROTA_ORIGEM_INVALIDA` |
| Waypoint destino inexistente | 422 `ROTA_DESTINO_INVALIDO` |
