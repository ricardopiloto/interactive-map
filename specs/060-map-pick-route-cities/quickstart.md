# Quickstart: Map Pick Route Cities

**Feature**: `060-map-pick-route-cities`  
**Date**: 2026-08-05

Validação manual. Ver [contracts/ui-map-pick-route.md](./contracts/ui-map-pick-route.md).

## Prerequisites

- Frontend + backend running
- Mapa com ≥ 2 Locais ligados a nós nomeados (ex. seed Altdorf / Ubersreik)
- Ideal: ≥ 1 Local **sem** nó (para cenário C)

## Scenarios

### A — De depois Para só no mapa (SC-001)

1. Abrir **Calcular rota** (De e Para vazios).
2. Clicar pin cidade A (com nó).
3. Clicar pin cidade B (com nó).
4. Clicar **Calcular**.

**Expect**: De = A, Para = B; lista de rotas; **sem** modal do Local nos passos 2–3.

### B — Terceiro clique substitui Para

1. Após A, clicar pin cidade C (com nó).

**Expect**: De permanece A; Para = C; sem modal.

### C — Sem nó → modal (FR-002 / FR-008)

1. Painel aberto; clicar pin **sem** nó.

**Expect**: De/Para inalterados; modal do Local abre (jogador).

### D — Painel fechado inalterado (SC-004)

1. Fechar Calcular rota; clicar 3 pins.

**Expect**: Detalhe/selecção como antes desta feature.

### E — Combobox + mapa (FR-007 híbrido)

1. Abrir painel; escolher De no combobox.
2. Clicar pin com nó no mapa.

**Expect**: Para preenchido; De **não** sobrescrito.

### F — Sem zonas novas (SC-003)

1. Abrir painel; inspeccionar mapa.

**Expect**: Nenhum halo/overlay novo de “clicável para rota”.

## Non-goals

- Não testar digitizer / placement GM nesta feature.
