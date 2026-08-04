# Quickstart: Digitizer Node Hit Aura

**Feature**: `041-digitizer-node-aura`  
**Date**: 2026-08-04

Validação manual. Ver [contracts/ui-digitizer-node-aura.md](./contracts/ui-digitizer-node-aura.md) e [data-model.md](./data-model.md).

## Prerequisites

- Frontend + backend; Modo GM
- Rede com ≥ 2 nós próximos e alguns isolados
- Mapa da campanha com pins (regressão)

## Scenarios

### A — Aura visível

1. Abrir **Rede de rotas**.

**Expect**: Cada nó tem aura/halo visível sem hover (SC-002).

### B — Zona única origem/fecho

1. Iniciar segmento: clicar perto de um nó (dentro da aura) → origem.
2. Clicar noutro nó dentro da aura → fecho.
3. Repetir cliques ligeiramente **fora** das auras.

**Expect**: Dentro → pick; fora → não pega esse nó; mesma “folga” ao iniciar e ao fechar (FR-003a).

### C — Mais apertado que antes

1. Comparar mentalmente com a antiga zona generosa (~3% do mapa).

**Expect**: Precisa apontar mais perto do nó; menos falsos positivos entre nós vizinhos (SC-001).

### D — Activo distinto

1. Com origem seleccionada (`.is-active`), observar vs nós inactivos com aura.

**Expect**: Origem claramente distinta (SC-004).

### E — Zoom

1. Zoom in/out na Rede.

**Expect**: Aura acompanha o disco do nó (não “descola”).

### F — Regressão mapa lore

1. Fechar Rede; usar pins/grupo no mapa da campanha.

**Expect**: Hit dos pins/grupo inalterados (FR-007).

## Regression

- Colocar nó / apagar / vincular Local ainda funcionam.
- Controles de zoom da Rede intactos.
