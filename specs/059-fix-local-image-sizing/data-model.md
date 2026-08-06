# Data Model: Apply Portrait Sizing Policy to Locals

**Feature**: `059-fix-local-image-sizing` | **Date**: 2026-08-05

No persisted entities.

## Entities

### PinModalLocalImageLayout

| State | Rules |
|-------|--------|
| With `imagem_url` | Width 100% of modal body; height auto shrink-to-fit; max-height 50vh; contain |
| Without image | No destructive empty frame; modest placeholder OK |

### LocalFormImageLayout

| State | Rules |
|-------|--------|
| With `imagem_url` | Same policy as pin modal |
| Without image | Editable placeholder; modest min-height for drop target |

### Relationship to 057 / 058

| Surface | Class (example) | Shared policy |
|---------|-----------------|---------------|
| Side menu NPC expand | `side-menu__npc-portrait` | 50vh + shrink-to-fit |
| NPC edit dialog | `npc-form__portrait` | Same; editable |
| Local pin modal | `pin-modal__image` | Same; read-only slot |
| Local edit dialog | `local-form__image` | Same; editable |

## Validation

- Fixed height 150 MUST NOT remain on filled Local images in PinModal or LocalFormDialog.
- Form upload MUST still call `onUploaded`.
- NPC classes MUST remain unchanged.
