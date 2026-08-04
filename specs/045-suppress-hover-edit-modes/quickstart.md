# Quickstart: Suppress Segment Hover in Edit Modes

**Feature**: `045-suppress-hover-edit-modes`  
**Date**: 2026-08-04

Validação manual. Ver [contracts/ui-suppress-hover-edit-modes.md](./contracts/ui-suppress-hover-edit-modes.md) e [data-model.md](./data-model.md).

## Prerequisites

- Frontend + backend; Modo GM
- Rede com ≥ 2 segmentos gravados (044 hover já disponível em idle)

## Scenarios

### A — Traçar segmento: sem hover

1. Activar **Traçar segmento**.
2. Passar o rato sobre segmentos gravados.

**Expect**: Sem tooltip, sem destaque na lista, sem traço enfatizado (SC-001).

### B — Novo nó: sem hover

1. Activar **Novo nó**.
2. Passar o rato sobre segmentos gravados.

**Expect**: Idem — sem UI de hover (SC-002).

### C — Clique serve desenho/colocação

1. Em Traçar segmento (com origem), clicar perto de um segmento gravado para midpoint.
2. Em Novo nó, clicar perto de um segmento para colocar nó.

**Expect**: Acção de desenho/colocação ocorre; hit de hover não “engole” o clique (SC-005).

### D — Idle restaura 044

1. Voltar a idle (desactivar ferramentas).
2. Hover num segmento.

**Expect**: Tooltip + lista + ênfase como 044 (SC-003).

### E — Limpar ao entrar no modo

1. Em idle, hover um segmento (tooltip visível).
2. Clicar **Traçar segmento** ou **Novo nó**.

**Expect**: Tooltip/lista/ênfase desaparecem de imediato (SC-004).

### F — Regressão lore

1. Sair da Rede; mapa da campanha.

**Expect**: Inalterado (FR-006).

## Regression

- Apagar segmento pela lista ainda funciona.
- Snap origem/fecho e aura dos nós (043) intactos.
