# Quickstart: Thinner Segment Lines

**Feature**: `042-thinner-segment-lines`  
**Date**: 2026-08-04

Validação manual. Ver [contracts/ui-thinner-segment-lines.md](./contracts/ui-thinner-segment-lines.md).

## Prerequisites

- Frontend + backend; Modo GM; Rede com segmentos de vários tipos
- Mapa com vias impressas visíveis sob os traços

## Scenarios

### A — Mais fino

1. Abrir **Rede de rotas** com segmentos existentes.

**Expect**: Linhas claramente mais finas que ~2.5; mapa por baixo mais legível (SC-001–002).

### B — Tipos

1. Observar estrada, rio e trilha.

**Expect**: Cores/traços ainda distinguíveis (SC-003).

### C — Rascunho

1. Traçar um segmento novo ao longo de uma estrada do mapa.

**Expect**: Linha de rascunho também fina; alinhamento visual mais fácil (FR-002).

### D — Fluxo

1. Colocar nó + traçar + desfazer ponto (botão direito) se aplicável.

**Expect**: Sem regressão de interação (SC-004).

### E — Regressão

1. Calcular rota no mapa da campanha; ver linhas de saída de um local.

**Expect**: Overlay e linhas de lore **sem** mudança de espessura (FR-006).

## Regression

- Auras/nós da Rede intactos.
- Sem alteração de dados de segmentos.
