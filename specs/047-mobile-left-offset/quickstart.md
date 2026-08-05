# Quickstart: Mobile Left Offset

**Feature**: `047-mobile-left-offset`  
**Date**: 2026-08-05

Validação manual. Ver [contracts/ui-mobile-left-offset.md](./contracts/ui-mobile-left-offset.md) e [research.md](./research.md).

## Prerequisites

- Frontend (+ backend se o mapa precisar de dados)
- Mapa da campanha com pelo menos um **local** com pin visível
- DevTools ou dispositivo para viewport &lt; 800px e ≥ 800px

## Scenarios

### A — Mobile: pins à esquerda

1. Abrir o mapa da campanha; estreitar a janela para &lt; 800px (`map-page--mobile`).
2. Comparar mentalmente (ou screenshot) a posição do pin vs desktop.

**Expect**: Pin ~6–10px (≈8px) mais à esquerda no ecrã (SC-001).

### B — Desktop: sem nudge

1. Alargar para ≥ 800px.

**Expect**: Alinhamento como antes desta feature (SC-002).

### C — Resize na mesma sessão

1. Alternar várias vezes &lt;800 ↔ ≥800.

**Expect**: Nudge aparece/desaparece sem reload (SC-004).

### D — Zoom/pan em mobile

1. Em &lt;800px, zoom in/out e pan; observar o mesmo pin.

**Expect**: Deslocamento relativo à esquerda permanece estável em píxeis de ecrã (não “salta”).

### E — Exclusões

1. Em mobile: notar pin do **grupo** e linhas de rota/overlay.
2. Abrir **Rede de rotas / digitizer**; observar nós `__wp`.

**Expect**: Grupo e rotas sem o nudge desta feature; digitizer igual ao actual (SC-003 / FR-008).

### F — Toque / selecção

1. Em mobile, tocar um pin de local.

**Expect**: Selecção/modal continua a funcionar.

## Non-goals

- Não validar API
- Não exigir nós de waypoint no mapa da campanha se ainda não existirem (FR-002 só quando visíveis)
