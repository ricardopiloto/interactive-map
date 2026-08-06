# Data Model: Fix NPC Portrait in Edit Mode

**Feature**: `058-fix-npc-portrait-edit` | **Date**: 2026-08-05

No persisted entities.

## Entities

### EditDialogPortraitLayout

| State | Rules |
|-------|--------|
| With `retrato_url` | Width 100% of dialog body; height auto shrink-to-fit; max-height 50vh; contain |
| Without image | Editable placeholder; modest min-height for drop target; not a destructive empty frame |

### Relationship to 057

| Surface | Class (example) | Shared policy |
|---------|-----------------|---------------|
| Side menu expand | `side-menu__npc-portrait` | 50vh + shrink-to-fit |
| NPC edit dialog | `npc-form__portrait` | Same policy; editable |

## Validation

- Fixed height 110 MUST NOT remain on filled portrait.
- Upload MUST still call `onUploaded`.
