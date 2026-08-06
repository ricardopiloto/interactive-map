# Quickstart: Apply Portrait Sizing Policy to Locals

**Feature**: `059-fix-local-image-sizing`  
**Date**: 2026-08-05

Validação visual. Ver [contracts/ui-local-image-sizing.md](./contracts/ui-local-image-sizing.md).

## Prerequisites

- Frontend running
- At least one Local with a tall image (or upload during the test)
- GM mode for form scenarios

## Scenarios

### A — Pin modal shows full Local image (SC-001, FR-001)

1. Select a pin / Local with `imagem_url` so the pin modal opens.

**Expect**: Image recognizable end-to-end; not a ~150px cropped strip; box height follows image (≤ 50vh).

### B — Edit dialog shows full Local image (SC-001, FR-002)

1. GM: open create/edit Local for a place with image.

**Expect**: Same shrink-to-fit + ≤ 50vh; not fixed 150 crop.

### C — Screen / dialog safe (SC-002, SC-003)

1. Tall Local image in pin modal and in form on desktop and ~375px width.

**Expect**: Image block ≤ ~50vh; remaining content reachable; no page horizontal scroll.

### D — Upload still works (FR-006)

1. Drop/replace an image in the Local form.

**Expect**: Preview updates with new sizing; save still works.

### E — Empty states (FR-007)

1. Open pin modal for Local without image; open create Local without image.

**Expect**: No broken giant empty box; form drop target still obvious.

### F — Regression 057 / 058 (SC-004, FR-008)

1. Expand an NPC in side menu; open NPC edit dialog.

**Expect**: Portrait sizing from 057/058 unchanged.

## Non-goals

- Do not require Locais list or map ImageSlot changes.
