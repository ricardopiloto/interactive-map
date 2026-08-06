# Quickstart: Prefer River or Road

**Feature**: `054-prefer-river-road`  
**Date**: 2026-08-05

Validação manual. Ver [contracts/api-preferencia-via.md](./contracts/api-preferencia-via.md), [contracts/ui-preferencia-via.md](./contracts/ui-preferencia-via.md), [research.md](./research.md).

## Prerequisites

- Frontend + backend a correr
- Rede com De/Para que admitam alternativas **mistas** (rio e estrada em caminhos distintos ou mistos)
- Painel **Calcular rota**

## Scenarios

### A — Controlos e default (SC-001, SC-005, FR-007)

1. Abrir Calcular rota.
2. Fechar com “Por rio” seleccionado; reabrir.

**Expect**: Três opções visíveis; ao (re)abrir, **Sem preferência** activo.

### B — Sem preferência = comportamento actual (FR-002)

1. Sem preferência; De/Para válidos; Calcular (mais rápida, pago).

**Expect**: Lista coerente com o planner actual (sem enviesamento óbvio por tipo).

### C — Rio vs Estrada distintos (SC-002)

1. Mesmo De/Para; **Por rio**; notar topo / tipos / ordem.
2. Mudar para **Por estrada** (auto-recalc).

**Expect**: Lista ou rota de topo muda de forma coerente (mais rio vs mais estrada); rotas mistas ainda podem aparecer; sem lista vazia se existir caminho.

### D — Auto-recalc (SC-004, FR-006)

1. Com resultados, alternar Sem preferência ↔ Rio ↔ Estrada.

**Expect**: Lista actualiza sem clique extra em Calcular.

### E — Convive com ordenação e transporte (SC-003, FR-004/005)

1. Por rio + Mais barata + Próprio (e pelo menos uma outra combinação).

**Expect**: Sem erro; custos 0 em próprio; ordenação respeitada como eixo principal.

### F — Único caminho

1. De/Para com um só caminho possível; preferir o tipo “oposto” ao dominante.

**Expect**: Esse caminho ainda aparece (preferência suave).

## Optional API

```bash
BASE='http://localhost:8000/api/routes/plan'
Q='origem_waypoint_id=1&destino_waypoint_id=2&ritmo=normal&modo_transporte=pago&ordenacao=mais_rapida'

curl -s "$BASE?$Q&preferencia_via=nenhuma" | jq '[.rotas[0].tipos, .rotas[0].tempo_horas]'
curl -s "$BASE?$Q&preferencia_via=rio" | jq '[.rotas[0].tipos, .rotas[0].tempo_horas]'
curl -s "$BASE?$Q&preferencia_via=estrada" | jq '[.rotas[0].tipos, .rotas[0].tempo_horas]'
```

**Expect**: `rio` vs `estrada` podem diferir no topo quando a rede tem alternativas; `nenhuma` ≈ comportamento pré-054; valor inválido → 422.

## Non-goals

- Não exigir rotas 100% rio ou 100% estrada.
- Não testar digitizer nesta feature.
