# Quickstart: Segment Hover Info

**Feature**: `044-segment-hover-info`  
**Date**: 2026-08-04

Validação manual. Ver [contracts/ui-segment-hover-info.md](./contracts/ui-segment-hover-info.md) e [data-model.md](./data-model.md).

## Prerequisites

- Frontend + backend; Modo GM
- Rede com ≥ 3–5 segmentos gravados (tipos mistos se possível; alguns nós com nome)
- Lista Segmentos longa o suficiente para testar scroll (ou temporariamente encolher o painel)

## Scenarios

### A — Tooltip + lista

1. Abrir **Rede de rotas**.
2. Passar o rato sobre um segmento gravado no mapa.

**Expect**: Tooltip/rótulo com A↔B · tipo · mi; linha correspondente na lista destacada (SC-005 / FR-009).

### B — Match com Apagar

1. Comparar texto do tooltip com a linha destacada.

**Expect**: Mesmos extremos/tipo/distância; **Apagar** dessa linha é o segmento correcto (SC-001).

### C — Nomes

1. Hover num segmento cujos nós têm `nome`.

**Expect**: Tooltip prefere nomes aos ids crus (FR-003).

### D — Ênfase visual

1. Hover; observar o traço vs outros segmentos.

**Expect**: Segmento sob o rato claramente enfatizado; ao sair, volta ao normal (US2).

### E — Sair do hover

1. Mover o rato para o mapa vazio / outro sítio.

**Expect**: Tooltip e destaque da lista desaparecem depressa (SC-003).

### F — Lista fora do viewport

1. Scroll da lista para longe; hover num segmento cujo row não está visível.

**Expect**: Lista traz a linha à vista (FR-010).

### G — Draft excluído

1. Iniciar traçado de segmento (draft vermelho).

**Expect**: Draft não mostra identidade de “segmento gravado”; segmentos gravados ainda podem ser hoverados se o hit o permitir (FR-007).

### H — Não apaga no hover

1. Hover repetido (≥ 20 vezes) sem clicar Apagar.

**Expect**: Nenhum segmento apagado (FR-006).

### I — Regressão lore / stroke

1. Fechar Rede; mapa da campanha / pins.
2. Confirmar traços ainda finos na Rede.

**Expect**: Lore inalterado (FR-008); stroke base inalterado.

## Regression

- Apagar pela lista ainda funciona.
- Traçar segmento / midpoints / undo draft intactos.
- Zoom/pan: hover continua correcto.
