# Quickstart: Fix NPC Portrait in Edit Mode

**Feature**: `058-fix-npc-portrait-edit`  
**Date**: 2026-08-05

Validação visual. Ver [contracts/ui-npc-portrait-edit.md](./contracts/ui-npc-portrait-edit.md).

## Prerequisites

- Frontend running; GM mode unlocked
- At least one NPC with a tall portrait (or upload one during the test)

## Scenarios

### A — Edit dialog shows full portrait (SC-001)

1. Open create/edit NPC for a character with `retrato_url`.

**Expect**: Portrait recognizable end-to-end; not a ~110px cropped strip; box height follows image (≤ 50vh).

### B — Screen / dialog safe (SC-002, SC-003)

1. Tall portrait in dialog on desktop and ~375px width.

**Expect**: Image block ≤ ~50vh; fields + Guardar/Cancelar reachable; no page horizontal scroll.

### C — Upload still works (FR-006)

1. Drop/replace a portrait in the dialog.

**Expect**: Preview updates with new sizing; save still works.

### D — Regression 057

1. Expand same NPC in side menu Personagens.

**Expect**: Expanded portrait still shrink-to-fit per 057.

### E — Empty placeholder

1. Create NPC without image yet.

**Expect**: Drop/upload target still obvious; no broken giant empty box.

## Non-goals

- Do not require Local form changes.
