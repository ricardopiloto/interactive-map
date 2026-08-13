# UI Contract: Language combobox

**Feature**: `082-language-combobox`  
**Scope**: FR-001–FR-007, US1, US2, SC-001–SC-004  
**Supersedes (visual only)**: [080 `ui-language-selector.md`](../080-i18n-interface/contracts/ui-language-selector.md) segmented two-button control — placement and `changeLanguage` behaviour unchanged.

## Placement

- Component: `LanguageSelector` inside `CodexHeader` → `codex-header__right`
- Order: after page `children`, **before** GM toggle
- Visible: player and GM

## Structure

```text
.language-selector
  button.language-selector__trigger   (sigla + chevron)
  ul.language-selector__list          (when open)
    li > button[role=option] × 2
```

## Visual

| Element | Requirement |
|---------|-------------|
| Trigger | Ghost button; text `PT` or `EN`; decorative chevron (`aria-hidden`) |
| Open list | Panel below trigger; elevation Nocturne (surface + shadow); z-index above header content |
| Active option | Accent highlight + `aria-selected=true`; **no** checkmark |
| Keyboard focus row | Distinct outline/focus ring if different from selected |
| Width | Compact — single control narrower than previous two-button group |

## Labels

| Locale UI | Option pt-BR | Option en |
|-----------|--------------|-----------|
| pt-BR | Português | Inglês |
| en | Portuguese | English |

Keys: `comum:language.pt`, `comum:language.en`. Trigger siglas never translated.

## Behaviour

| Action | Result |
|--------|--------|
| Open | `aria-expanded=true`; list visible; focusIndex on active |
| Choose EN / PT | `i18n.changeLanguage(...)`; list closes; trigger updates; UI re-renders &lt;1 s |
| Escape / outside click | Close; language unchanged; focus → trigger |
| After any close | Focus → trigger |

## Keyboard

| Key | Closed | Open |
|-----|--------|------|
| Enter / Space | Open | Confirm focused option |
| ArrowDown / ArrowUp | Open | Move focusIndex |
| Escape | — | Close without change |

## Accessibility

- Trigger: `aria-label={t('language.aria')}`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`
- List: `role="listbox"`
- Options: `role="option"`, `aria-selected`
- Chevron: `aria-hidden="true"`

## Non-goals

- Native `<select>`
- Searchable combobox / third language
- Hub selector
- Flag icons

## Verification

1. Header shows one control with `PT`/`EN` + chevron (not two side-by-side buttons).
2. Open in PT → Português / Inglês; active highlighted.
3. Switch EN → UI updates; reopen → Portuguese / English.
4. Reload → choice kept.
5. Keyboard-only switch; focus returns to trigger.
6. ≤800px: control still left of GM toggle, both usable.
