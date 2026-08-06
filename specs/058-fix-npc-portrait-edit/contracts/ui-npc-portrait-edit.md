# UI Contract: NPC Portrait in Edit Dialog

**Feature**: `058-fix-npc-portrait-edit`  
**Date**: 2026-08-05  
**Surface**: GM mode → create/edit NPC dialog (`NpcFormDialog`)

## With portrait

| Property | Required |
|----------|----------|
| Width | 100% of dialog body content |
| Height | Auto (shrink-to-fit) |
| Max height | `50vh` |
| Fit | Full image visible (contain), not fixed-height cover |
| Editable | Click / drop upload still works |

## Without portrait

- Placeholder upload area remains usable (modest min-height OK).

## Dialog chrome

- Title, fields, Guardar/Cancelar remain reachable (body scroll OK).
- No page horizontal scroll.

## Non-goals

- Local form image slot
- Side menu (057) changes
- Lightbox

## Acceptance mapping

| Spec | UI |
|------|-----|
| FR-001 / FR-002 | Shrink-to-fit in dialog |
| FR-003 / SC-002 | max-height 50vh |
| FR-006 | editable ImageSlot |
| FR-008 | 057 untouched |
