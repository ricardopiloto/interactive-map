# Contract: Migration map (117)

**Feature**: `117-aposentar-nocturne`  
**Source of truth (detail)**: [research.md](../research.md) §2

## Target selectors (must reach zero outside `components/ui/`)

| Family | Selectors / class tokens |
|--------|---------------------------|
| Buttons | `btn`, `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-danger`, `btn-icon`, `btn-block`, `btn-sm` |
| Fields | `input` used as className on form controls (not BEM like `*-input`) |
| Segment | `seg`, `seg-opt` |
| Tags | `tag`, `tag-accent`, `tag-accent-2`, `tag-neutral`, `tag-outline` |
| Cards | `card`, `card-meta`, `card-title`, `card-body`, `card-kicker`, `elev-sm/md/lg` when paired with legacy card |
| Dialogs | `dialog-backdrop`, `dialog`, `dialog-title`, `dialog-body`, `dialog-actions`, `dialog__*` |

## Destinations (summary)

| Family | Kit / global destination |
|--------|---------------------------|
| Buttons | `Button` / `IconButton` (+ block/size) |
| Fields | `Input` / `Textarea` / `Select` |
| Segment | `SegmentedControl` (new) |
| Tags | `Chip` + variants |
| Cards | `Card` + `ui-card__*` |
| Dialogs | `Dialog` / `Drawer` / `ConfirmDialog` |
| Globals | `global.css` (typography, focus, `text-muted`) |
| Form media chrome | Move `.npc-form__*` / `.local-form__*` out of nocturne into form/media CSS |

## Non-targets (do not fail the gate)

- `ui-*`, `auth-card`, `map-page__*`, `painel-page__*`, `search-field`, page BEM
- `frontend-next/**`, `docs/**`
