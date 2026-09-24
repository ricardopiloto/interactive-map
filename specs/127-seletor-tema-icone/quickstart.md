# Quickstart: Seletor de tema compacto

Run from the repository root after implementation.

## Prerequisites

- Frontend dependencies installed and Playwright Chromium available.
- Use a clean test browser context so existing `codex.theme` preference does not affect the first screenshot.

## Run validation

1. From `frontend`, run `npm run build`.
2. Run the existing browser suite with `npm run test:e2e`; focused selector tests should be included in that suite.
3. Inspect the Playwright/axe report and the campaign header screenshots at desktop and mobile sizes.

## Interaction checks

1. Open a campaign page at desktop width. Confirm the closed trigger shows only Sun or Moon, with no text or chevron. Repeat at mobile width.
2. Verify the trigger has a localized accessible name and opens the menu with mouse, touch and keyboard.
3. Select Auto, Light and Dark. Confirm the menu labels remain visible in pt-BR/en and the selected option is announced/marked.
4. Set Auto and emulate both operating-system color schemes. Verify the rendered mode and trigger icon follow each change. Select Light/Dark and repeat; verify these preferences remain fixed.
5. Reload after each preference selection and verify saved selection persists.
6. Use Tab/Shift+Tab and arrow keys, activate with Enter/Space, close with Escape and outside click, and confirm focus returns to the trigger.
7. Check genres that force dark styling to ensure the existing campaign appearance constraints are unchanged.
8. On Home/Painel, confirm theme choices remain available through the existing UserMenu.
9. Run axe on the closed and open menu states in both locales.

## Expected results

- The campaign-header trigger is icon-only at every supported viewport and keeps an accessible name and usable target.
- Auto follows system preference in both visual mode and icon; explicit Light/Dark remain selected regardless of system changes.
- All three localized menu options remain available and keyboard/touch operable.
- Preference persistence, genre behavior, Home/Painel controls and unrelated header actions are unchanged.
