# Theme Selector Contract

## Trigger

- Closed trigger displays the current Sun or Moon icon only; no visible preference label or decorative chevron at any breakpoint.
- The button retains a localized accessible name, `aria-haspopup=menu`, `aria-expanded` and an association to its menu.
- Target remains comfortably operable by touch and keyboard (at least the existing 32px control size).
- Sun/Moon represent resolved Light/Dark mode. In Auto, icon updates when `prefers-color-scheme` changes; explicit Light/Dark do not follow system changes.

## Menu

- Three translated choices remain visible: Auto, Light, Dark (localized as Automático/Claro/Escuro in pt-BR).
- Selected preference is indicated semantically (`menuitemradio` + `aria-checked`) and visually.
- Mouse, touch and keyboard can open and select a choice.
- Escape and outside pointer close the menu; focus returns to the trigger. Arrow keys move among menu choices without changing selection until activation.
- Labels and accessible names are provided in pt-BR and en.

## Persistence and scope

- Use existing `codex.theme` storage and `auto|light|dark` values.
- Use existing app-level theme application/sync; do not add storage keys, API or database state.
- Change the dedicated campaign `ThemeSelector`. Home/Painel theme entries stay in UserMenu.
- Preserve campaign genre theme constraints and all other header actions.

## Verification

Verify icon-only rendering and target on desktop/mobile; exercise all three options, selected state, reload persistence, system changes under Auto, fixed explicit modes, keyboard navigation, outside close, Escape, focus return, locale labels and axe results.
