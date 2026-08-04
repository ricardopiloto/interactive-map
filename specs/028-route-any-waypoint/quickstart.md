# Quickstart: 028-route-any-waypoint

## Prerequisites

- Backend + frontend a correr; rede com ≥2 nós (ideal: um **sem** Local, ex. seed “Cruzamento do Reik”)
- [api-routes-plan-waypoints.md](./contracts/api-routes-plan-waypoints.md)
- [ui-route-planner-waypoints.md](./contracts/ui-route-planner-waypoints.md)

## API

```bash
# Listar todos os nós
curl -s "http://127.0.0.1:8000/api/waypoints" | jq '.[].id, .[].nome, .[].local_id'

# Planear por waypoint IDs (substituir IDs reais)
curl -s "http://127.0.0.1:8000/api/routes/plan?origem_waypoint_id=5&destino_waypoint_id=1&ritmo=normal&velocidade_media_mph=4" | jq .
```

Esperado: `200` com `rotas` ou lista vazia; **não** erro “sem waypoint vinculado”.  
Params antigos `origem_local_id` devem falhar (422 missing / não suportados).

## UI

1. Abrir **Calcular rota**.
2. Origem/destino mostram **nós** (incl. sem Local); rótulos seguem nome → Local → `Nó {id}`.
3. Calcular entre dois nós sem Local (com caminho) → rota(ões) no mapa.
4. Calcular entre nó-com-Local e nó-sem-Local → OK.
5. Mesmo nó origem=destino → erro claro.
6. Par que antes usava dois Locais: escolher os **nós** correspondentes → rota equivalente.

## Pass criteria

- [ ] Plan API usa `*_waypoint_id`
- [ ] Todos os nós na lista do painel
- [ ] Nó sem Local selecionável e calculável
- [ ] Rótulos FR-008 corretos
- [ ] Sem dependência de `linkedLocalIds` no planner
