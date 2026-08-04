# Quickstart: 024-route-planner-speed

Validação do calculador com velocidade, ritmo e alternativas.

## Prerequisites

- Backend + frontend a correr; rede de rotas com locais ligados a waypoints
- Ideal: dois caminhos (ex. estrada vs rio) entre o mesmo par ou rotas alternativas
- Contratos: [api-routes-plan.md](./contracts/api-routes-plan.md), [ui-route-planner.md](./contracts/ui-route-planner.md)

## A — UI campos

1. Abrir **Calcular rota**.
2. Confirmar De, Para, Ritmo (Normal/Intenso), Velocidade média (=4).
3. **Pass**: sem Cauteloso/Arriscado.

## B — SC-001 / SC-002 (tempo dias+horas)

1. Escolher De/Para cuja rota só-estrada tenha ~24 mi (ou anotar distância mostrada).
2. Normal, 4 mi/h → Calcular.
3. **Pass**: tempo coerente (24 mi → 6 h → “1 dia”).
4. Se distância ~28 mi → “1 dia e 1 h” (ou equivalente).
5. Mesmo par, ritmo Intenso → calendário ≤ Normal.

## C — Modificadores

1. Comparar rota só-rio vs só-estrada com mesma distância (ou API).
2. **Pass**: tempo rio ≈ estrada/1.4; trilha ≈ estrada/0.8 (±5%).

## D — Alternativas e seleção

1. Par com ≥2 rotas.
2. **Pass**: lista ordenada por tempo; #1 selecionada; tipos/distância/tempo visíveis.
3. Selecionar #2 → mapa/destaque mudam.

## E — API smoke

```bash
curl -s "http://127.0.0.1:8000/api/routes/plan?origem_local_id=1&destino_local_id=2&ritmo=normal&velocidade_media_mph=4" | jq .
```

**Pass**: `rotas[].tempo_texto`, `tempo_dias`, `tempo_horas_resto`; ordem por `tempo_horas`.
