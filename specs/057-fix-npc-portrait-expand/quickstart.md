# Quickstart: Fix NPC Portrait Expand Sizing

**Feature**: `057-fix-npc-portrait-expand`  
**Date**: 2026-08-05

Validação visual. Ver [contracts/ui-npc-portrait-expand.md](./contracts/ui-npc-portrait-expand.md).

## Prerequisites

- Frontend running; at least one NPC with `retrato_url` (prefer a tall portrait and a wider one if available)
- Side menu → Personagens

## Scenarios

### A — Shrink-to-fit (SC-001, FR-001a)

1. Expand NPC with portrait.

**Expect**: Full portrait visible (not hard-cropped in a short strip); box height matches the scaled image, not a fixed ~110px slab.

2. If a second NPC has different aspect, expand it.

**Expect**: Box height changes with that image (still ≤ 50vh).

### B — Max height / screen safe (SC-002, SC-003, FR-003)

1. Expand a tall portrait on desktop.

**Expect**: Image block ≤ ~50% viewport height; name/description still reachable; menu may scroll vertically.

2. Repeat at ~375px width.

**Expect**: No horizontal page scroll; layout usable.

### C — Thumbnail regression (FR-005)

1. Collapse / view other NPC rows.

**Expect**: Circle thumbnails still small (~40px); list density unchanged.

### D — No portrait

1. Expand NPC without retrato.

**Expect**: Text/meta only; no broken empty image frame.

## Non-goals

- Do not validate admin upload forms or map.
