# Contract: Kit extensions (117)

**Feature**: `117-aposentar-nocturne`  
**Package**: `frontend/src/components/ui/`

## SegmentedControl (NEW)

| Prop | Type | Notes |
|------|------|--------|
| `options` | `{ value: string; label: ReactNode }[]` | |
| `value` | string | Controlled |
| `onChange` | `(value: string) => void` | |
| `aria-label` | string | radiogroup |

Classes: `ui-seg`, `ui-seg__opt`, selected via `:has(input:checked)` or `aria-checked` / data-state — mirror nocturne `.seg` look with tokens (pill/radius per 110).

Export from `index.ts`.

## Chip (extend)

| Prop | Type | Notes |
|------|------|--------|
| `variant` | `'default' \| 'accent' \| 'neutral' \| 'outline'` | Map from tag-* |
| `children` | ReactNode | |
| Interactive | optional `onClick` → render `<button type="button">` | For chip-as-toggle rows |

Classes: `ui-chip`, `ui-chip--accent`, etc.

## Button (extend)

| Prop | Type | Notes |
|------|------|--------|
| `block` | boolean | full width |
| `size` | `'sm' \| 'md'` | default md |

Keep variants: primary | secondary | ghost | danger. Icon-only → `IconButton`.

## Dialog body class

- Replace leftover `dialog-body` in kit with `ui-dialog__body` (or existing `ui-dialog` child class).
- Markdown/detail content that used `dialog-body` for typography MUST use the kit class or a local BEM class that does not depend on nocturne.

## MUST NOT

- Add a new global CSS file that redefines `.btn` / `.input` / `.tag`.
- Export nocturne class names from the kit.
