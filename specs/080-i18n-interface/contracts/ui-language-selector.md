# UI Contract: Seletor de idioma

**Feature**: `080-i18n-interface`  
**Scope**: FR-008, CodexHeader (Mapa + Relações)

## Placement

- **Component**: `LanguageSelector` rendered inside `CodexHeader`
- **Region**: `codex-header__right`, **before** GM toggle button (`children` slot or fixed slot left of GM)
- **Visibility**: Always visible (player + GM modes)

## Visual

| Element | Requirement |
|---------|-------------|
| Trigger | Ghost button; shows active sigla **`PT`** or **`EN`** |
| Menu | Two options: Português (PT-BR), English (EN) — dropdown or segmented control |
| Active state | Current locale visually distinct (accent or check) |
| Size | Discrete; must not dominate GM actions |

## Behaviour

| Action | Result |
|--------|--------|
| Choose EN | `i18n.changeLanguage('en')`; all visible `t()` update without full page reload |
| Choose PT | `i18n.changeLanguage('pt-BR')` |
| Persist | localStorage via detector |

**Performance**: visible update &lt;1 s (SC-004).

## Accessibility

- `aria-label`: "Idioma da interface" / translated equivalent once i18n bootstrapped
- Keyboard operable (Enter/Space on trigger; arrow keys in menu if dropdown)

## Non-goals

- Flag icons as sole indicator
- Locale picker in hub/
- Per-field language for master content

## Verification

1. Open Mapa → selector visible next to GM toggle.
2. Open Relações → same header placement.
3. Switch EN → nav labels change (`Mapa` → `Map`, etc.) without reload.
4. Reload → choice preserved.
