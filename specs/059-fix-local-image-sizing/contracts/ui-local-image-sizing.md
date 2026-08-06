# UI Contract: Local Image Sizing (Pin Modal + Edit Dialog)

**Feature**: `059-fix-local-image-sizing`  
**Date**: 2026-08-05  
**Surfaces**:
1. Pin / Local detail modal (`PinModal`) — read
2. GM create/edit Local dialog (`LocalFormDialog`) — write

## With image (`imagem_url` set)

| Property | Required |
|----------|----------|
| Width | 100% of dialog/modal body content |
| Height | Auto (shrink-to-fit) |
| Max height | `50vh` |
| Fit | Full image visible (contain), not fixed-height cover |
| Pin modal | Not editable (display only) |
| Form dialog | Click / drop upload still works |

## Without image

- **Pin modal**: No broken giant empty box (current empty behaviour OK).
- **Form**: Placeholder upload area remains usable (modest min-height OK).

## Chrome

- Pin modal: title, description, chips, close remain reachable (body scroll OK).
- Form: fields + Guardar/Cancelar remain reachable.
- No page horizontal scroll (desktop or ~375px).

## Non-goals

- Side menu Locais list (no large image)
- NPC surfaces (057 / 058)
- Campaign map ImageSlot
- Digitizer / routes
- Lightbox

## Acceptance mapping

| Spec | UI |
|------|-----|
| FR-001 | Pin modal shrink-to-fit |
| FR-002 | Local form shrink-to-fit |
| FR-003 / SC-002 | max-height 50vh both |
| FR-006 | editable ImageSlot in form |
| FR-007 | empty states |
| FR-008 | NPC + map untouched |
