# Research: Seletor de tema compacto

## Decisions

### 1. Limit the compact trigger change to the dedicated campaign ThemeSelector

- **Decision**: Make `frontend/src/components/layout/ThemeSelector.tsx` icon-only at every viewport size. Keep Home/Painel's existing theme options inside `UserMenu` unchanged.
- **Rationale**: `CodexHeader` uses the dedicated selector in campaign chrome; `SiteChrome` uses UserMenu, where Auto/Light/Dark are already menu entries rather than a labeled standalone trigger. This matches BKLG-009's concrete comparison.
- **Alternatives considered**: Replace the Home/Painel UserMenu theme entries with a new icon trigger; rejected because it changes a separate interaction not described by the backlog and could duplicate controls.

### 2. Keep the three preference semantics and storage key

- **Decision**: Reuse `ThemePreference = auto|light|dark`, `codex.theme`, existing `setThemePreference`, and existing translated `theme.auto/light/dark` labels.
- **Rationale**: Preference persistence and system-following behavior already exist; the request is presentational, not a new theme model.
- **Alternatives considered**: Add a second campaign-specific preference or new storage; rejected because it would split behavior across the app.

### 3. Base the icon on the resolved light/dark mode and react to Auto changes

- **Decision**: Use Moon for resolved dark and Sun for resolved light. When preference is Auto, update the icon as the operating system setting changes; explicit Light/Dark remain stable. Preserve current genre-specific visual constraints.
- **Rationale**: Prototype's trigger uses resolved `mode`. Production currently selects the Moon only when preference is explicitly `dark`, so Auto always renders Sun even when the system is dark; the theme engine updates `<html data-theme>` on media changes but ThemeSelector state does not rerender.
- **Alternatives considered**: Display an Auto/device icon; rejected because the prototype uses the effective mode and the spec wants a light/dark representative icon. Keep current Sun icon for all Auto states; rejected because it misstates the resolved mode.

### 4. Keep semantic menu state and improve keyboard handling

- **Decision**: Preserve the trigger's accessible label, `aria-haspopup`, expanded/control relationship, role=menu and menuitemradio/checked semantics. Support keyboard open/close, Escape, arrow navigation among radio items, selection and focus return; continue closing on outside pointer interaction.
- **Rationale**: Product already has stronger menu semantics than the prototype, but ThemeSelector currently lacks Escape handling, arrow-key navigation and explicit focus management. The spec requires accessible keyboard operation.
- **Alternatives considered**: Copy prototype menu literally; rejected because it has hardcoded Portuguese labels, no expanded/menu semantics, no explicit selected role, and closes on mouseleave (poor keyboard/touch behavior).

### 5. Keep the trigger compact while retaining a usable touch target

- **Decision**: Remove visual text and chevron at desktop and mobile; retain the current visible icon, border/surface treatment and a target at least as usable as the existing 32px control.
- **Rationale**: Current CSS hides only the text under 860px, while the desktop still shows text and chevron. The prototype shows only the icon. The compact change should not make the control difficult to hit.
- **Alternatives considered**: Hide label only on desktop or shrink the button to the icon glyph; rejected because the request asks for icon-only consistently and a too-small target harms mobile usability.

### 6. Use the existing Playwright stack for focused behavior checks

- **Decision**: Add targeted browser coverage for locale/viewport, user selection, localStorage persistence, `prefers-color-scheme` events, explicit mode behavior and keyboard/menu semantics, then retain current screenshot/axe quality gate.
- **Rationale**: Current E2E quality tests set theme in localStorage for screenshots but do not interact with ThemeSelector; no focused theme test exists.
- **Alternatives considered**: Add a new component test framework; rejected because Playwright is already installed and covers rendered interactions/accessibility.

## Repository findings

- The production dedicated selector is in `frontend/src/components/layout/ThemeSelector.tsx` and rendered from campaign `CodexHeader`. Home/Painel display theme choices as rows in `UserMenu` instead.
- Production trigger currently renders icon + translated preference text + chevron; CSS hides only the label below 860px.
- Production menu already has `aria-haspopup`, `aria-expanded`, `aria-controls`, role=menu and role=menuitemradio with `aria-checked`; it closes on outside mousedown but does not explicitly handle Escape or arrow-key movement.
- Production icon selection checks stored preference: `dark` means Moon and both `auto` and `light` mean Sun. `themePreference.ts` resolves Auto with `matchMedia` and the app-wide `startThemePreferenceSync` updates `html[data-theme]`, but the selector has no media-query subscription to rerender its icon.
- Existing locale keys `theme.auto`, `theme.light`, `theme.dark`, `theme.aria` and `theme.menuAria` exist in pt-BR/en. No new UI text is required if the current generic aria name is retained.
- Prototype ThemeSelector is icon-only and chooses Moon/Sun from its resolved `mode`; its option labels are hardcoded Portuguese and its menu lacks expanded/selected ARIA semantics, outside-click handling, Escape and robust keyboard support. Do not port these gaps.
- `frontend/e2e/quality.spec.ts` captures pages with the selected preference but never opens the theme menu; dedicated E2E coverage is needed for behavior.
- No backend/API, persisted schema, or package changes are needed.

## Open clarifications

None. The visual trigger reference, three preference states, locale support and scope boundaries are explicit.
