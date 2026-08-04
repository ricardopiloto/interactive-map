# Quickstart: Tighter Finish Snap

**Feature**: `043-tighter-finish-snap`  
**Date**: 2026-08-04

Validação manual. Ver [contracts/ui-tighter-finish-snap.md](./contracts/ui-tighter-finish-snap.md) e [data-model.md](./data-model.md).

## Prerequisites

- Frontend + backend; Modo GM
- Rede com ≥ 2 nós (preferência: um par próximo o suficiente para o antigo snap 0.01 fechar “cedo”)
- Mapa da campanha com pins (regressão)

## Scenarios

### A — Aura = origem (sem draft)

1. Abrir **Rede de rotas** (sem segmento a meio).

**Expect**: Aura dos nós no tamanho “origem” (como pós-041, ~disco+halo 22px) (SC-005).

### B — Aura encolhe com draft aberto

1. Iniciar segmento (origem num nó).
2. Observar auras dos outros nós.

**Expect**: Auras passam ao tamanho de fecho (~metade) — o que se vê = zona que fecha (SC-005 / FR-007).

### C — Não fecha fora da zona apertada

1. Com draft aberto, clicar **perto** de outro nó mas **fora** da aura pequena (ainda dentro da antiga zona ~0.01 mental).

**Expect**: Segmento **não** fecha; midpoint (ou continua draft) (SC-002 / FR-002).

### D — Fecha dentro da zona apertada

1. Clicar **dentro** da aura pequena de um nó destino válido.

**Expect**: Segmento fecha normalmente (SC-003 / FR-003).

### E — Origem ainda usável

1. Cancelar/terminar draft; iniciar novo segmento clicando perto (dentro da aura grande) de um nó.

**Expect**: Origem pega com a mesma folga de antes (SC-004 / FR-004).

### F — Activo distinto

1. Com origem seleccionada, observar `.is-active` vs auras de fecho nos outros nós.

**Expect**: Origem continua claramente distinta.

### G — Regressão mapa lore / stroke

1. Fechar Rede; usar pins/grupo no mapa.
2. Na Rede, confirmar traço dos segmentos ainda fino (042).

**Expect**: Lore map inalterado (FR-006); stroke inalterado.

## Regression

- Undo de midpoints / cancelar draft.
- Colocar nó / apagar / vincular Local.
- Zoom da Rede: aura acompanha o disco.
