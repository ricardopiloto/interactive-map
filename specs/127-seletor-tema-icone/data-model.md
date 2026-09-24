# Data Model: Seletor de tema

This feature introduces no new persistent entity. It uses the existing theme preference and its resolved display mode.

## ThemePreference (existing)

| Value | Meaning | Persistence |
|---|---|---|
| `auto` | Follow the operating system's current light/dark preference | Existing `codex.theme` key |
| `light` | Explicitly use the light preference where supported | Existing `codex.theme` key |
| `dark` | Explicitly use the dark preference | Existing `codex.theme` key |

Missing, malformed or inaccessible saved values resolve to Auto under existing behavior.

## ResolvedThemeMode (derived)

| Value | Resolution |
|---|---|
| `light` | Preference is Light, or Auto and system prefers light |
| `dark` | Preference is Dark, or Auto and system prefers dark |

The selector icon represents the resolved preference mode, while the menu marks the selected preference. The selected option remains Auto even when its resolved mode is currently light/dark. Existing campaign-genre forcing behavior remains in effect and is not persisted as a preference.

## Transient menu state

The control holds whether the menu is open and which option currently has keyboard focus. It is not persisted. Selecting a menu option writes the existing preference and closes the menu; Auto mode tracks system changes. Outside click and Escape close the menu, and focus returns to the trigger.
