# Quickstart: Refine Segment Stroke Weight

**Feature**: `048-refine-segment-stroke`  
**Date**: 2026-08-05

Validação manual. Ver [contracts/ui-refine-segment-stroke.md](./contracts/ui-refine-segment-stroke.md) e [research.md](./research.md).

## Prerequisites

- Frontend + backend; Modo GM; **Rede de rotas** with mixed segment types
- Idle mode available for hover (not Novo nó / Traçar segmento)

## Scenarios

### A — Traço normal ~⅔

1. Open Rede with existing segments; compare to memory of pre-048 (~1.5).

**Expect**: Clearly thinner (~1.0); map art more readable (SC-001–002).

### B — Tipos

1. View estrada, rio, trilha.

**Expect**: Still distinguishable (SC-003).

### C — Draft

1. Start tracing a segment along a printed road.

**Expect**: Draft stroke same thinness family as saved (FR-002).

### D — Hover

1. In idle, hover several segments.

**Expect**: Hover stroke ~⅔ of old hover (~2.3), still clearly thicker than normal; tooltip/list still work; easy to hit (SC-004).

### E — Fluxo

1. Place node + draw segment (+ undo midpoint if used).

**Expect**: No new interaction errors (SC-005).

### F — Regressão

1. Campaign map: Calcular rota overlay + lore exit lines; digitizer nodes/auras.

**Expect**: Overlay/lore stroke unchanged; nodes/auras unchanged (FR-006/007).

## Non-goals

- Do not thin `__seg-hit` unless hover becomes hard to trigger (then re-check FR-005 only).
