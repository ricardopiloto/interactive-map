# Quickstart: Focus Group Pin

**Feature**: `039-focus-group-pin`  
**Date**: 2026-08-04

Validação manual. Ver [contracts/ui-focus-group-pin.md](./contracts/ui-focus-group-pin.md) e [data-model.md](./data-model.md).

## Prerequisites

- Frontend (+ backend) a correr com campanha que tenha posição de grupo
- Mapa carregado; zoom controls visíveis

## Scenarios

### A — Controlo visível (com grupo)

1. Abrir o mapa (modo jogador).
2. Localizar o cluster de zoom (+/−/1:1).

**Expect**: Botão “Ir ao grupo” (ou equivalente acessível) presente no mesmo cluster.

### B — Centralizar a partir de longe

1. Afastar/panear até o pin do grupo sair do ecrã (ou ficar na margem).
2. Clicar no botão de foco do grupo.

**Expect**: Em ≤ 1 s o pin do grupo fica centrado no viewport do mapa; zoom confortável (legível); sem modal.

### C — Repetir

1. Com o grupo já centrado, clicar de novo.

**Expect**: Sem erro; vista permanece (ou reanima) centrada no grupo.

### D — GM

1. Entrar em modo GM (com grupo).

**Expect**: Mesmo botão no cluster de zoom; foco funciona; não abre painéis desnecessários.

### E — Sem grupo

1. (Dev/teste) estado sem `grupo`, ou campanha sem posição.

**Expect**: Botão ausente; +/−/1:1 continuam; mapa usável.

### F — Lore oculto (se aplicável)

1. Abrir fluxo que esconde pins/grupo (ex. digitizer overlay no mapa principal, se `hideLorePins`).

**Expect**: Controlo de foco do grupo não oferecido de forma enganosa; sem crash.

## Regression

- Foco de local pelo menu lateral continua a funcionar.
- Posição/formato do grupo inalterados na BD.
- Controles de zoom e reset intactos.
