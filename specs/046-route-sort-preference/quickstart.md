# Quickstart: Route Sort Preference

**Feature**: `046-route-sort-preference`  
**Date**: 2026-08-04

Validação manual. Ver [contracts/api-route-sort-preference.md](./contracts/api-route-sort-preference.md) e [data-model.md](./data-model.md).

## Prerequisites

- Frontend + backend; rede com várias alternativas De/Para (ideal: rota barata-lenta ≠ rápida-cara)
- Panel **Calcular rota** aberto

## Scenarios

### A — Controlo e default

1. Abrir Calcular rota.

**Expect**: Opção Mais rápida / Mais barata; default **Mais rápida** (SC-003 / US2).

### B — Mais rápida → até 6 por tempo

1. Preferência Mais rápida; De/Para com ≥ 6 alternativas; Calcular.

**Expect**: Até 6 rotas; ordem por tempo crescente; primeira marcada “mais rápida”; mapa na primeira (SC-001).

### C — Mais barata → até 6 por Dentro

1. Mesmo De/Para; preferência Mais barata; Calcular (ou mudar preferência e deixar auto-recalc).

**Expect**: Até 6 rotas; ordem por custo Dentro crescente; primeira “mais barata”; ambos Dentro/Fora visíveis (FR-004/008).

### D — Troca de preferência auto-recalcula

1. Com resultados no ecrã, mudar de Mais rápida → Mais barata (sem clicar Calcular).

**Expect**: Nova lista sem clique extra; primeira rota muda se barata ≠ rápida (SC-002 / SC-005).

### E — Menos de 6 rotas

1. Par com poucas alternativas.

**Expect**: Todas as existentes, ordenadas; sem placeholders vazios (FR-006).

### F — Regressão

1. Velocidade vazia / preenchida; ritmo Normal/Intenso; overlay no mapa.

**Expect**: Comportamento de custo/tempo existente intacto; digitizer inalterado (FR-010).

## Optional API check

```bash
curl -s "http://localhost:8000/api/routes/plan?origem_waypoint_id=1&destino_waypoint_id=2&ritmo=normal&ordenacao=mais_barata" | jq '.rotas | length, .[0].custo_dentro_bp'
```

**Expect**: ≤ 6 rotas; primeira com Dentro ≤ das seguintes.
