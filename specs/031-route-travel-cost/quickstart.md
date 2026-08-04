# Quickstart: Validar custo de viagem nas rotas

## Prerequisites

- App a correr; rede com trechos estrada e/ou rio (ideal: alternativas)
- [api-routes-plan-cost.md](./contracts/api-routes-plan-cost.md)
- [ui-route-planner-cost.md](./contracts/ui-route-planner-cost.md)

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

## Cenários

### A — Ambos os custos (SC-001–SC-003)

1. Abrir **Calcular rota**; deixar velocidade **vazia**.
2. Escolher De/Para com rota conhecida (ou anotar milhas/tipos do resultado).
3. **Esperado**: cada item mostra Dentro e Fora em bp; para 10 mi só-estrada → 20 / 10; só-rio → 50 / 20.

### B — Velocidade vazia vs preenchida (SC-004–SC-005)

1. Calcular com velocidade vazia; anotar tempos e bp.
2. Preencher velocidade (ex. 4) e recalcular o mesmo par.
3. **Esperado**: tempos mudam; bp Dentro/Fora **iguais**; com vazia, só-rio vs só-estrada mesma milhagem → razão tempo ≈ 6/8.

### C — Ordenação (SC-006)

1. Par com ≥2 rotas.
2. **Esperado**: primeira = mais rápida; ambos os custos visíveis em cada linha.

### D — Validação

1. Velocidade `0` ou negativa → erro; sem lista nova.
2. Trilha-only (se existir) → Dentro e Fora **0 bp**.

### API smoke

```bash
# Modo tabela (sem velocidade)
curl -s "http://127.0.0.1:8000/api/routes/plan?origem_waypoint_id=1&destino_waypoint_id=2&ritmo=normal" | jq .

# Override
curl -s "http://127.0.0.1:8000/api/routes/plan?origem_waypoint_id=1&destino_waypoint_id=2&ritmo=normal&velocidade_media_mph=4" | jq .
```

## Referências

- [spec.md](./spec.md)
- [research.md](./research.md)
