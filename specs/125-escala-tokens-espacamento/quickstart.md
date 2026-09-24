# Quickstart: Escala de espaçamento

Run from the repository root. This guide is for validating the token change after implementation.

## Before the change

1. Record the existing Playwright captures for Home and inspect representative existing consumers in Explore, Sessions, New Codex, the UI kit and route controls.
2. Inventory every production `var(--space-1..8)` use and every fallback declaration. For levels 5–8, record file, property, intent and proposed canonical target in the implementation review.
3. Confirm current and target values against [the scale contract](contracts/spacing-scale.md).

## Apply and inspect

1. Update the production tokens to the seven canonical values.
2. Remap the former `--space-8` use and any level-5/6 usages only after their layout intent is understood.
3. Correct any fallback that disagrees with the token or remove unnecessary fallbacks.
4. Run the frontend build and existing visual/axe quality suite. Add Explore and Sessions cases to the suite if they are still absent.
5. Review snapshot changes deliberately; do not accept broad changes without checking the affected surfaces.

The existing frontend scripts include `npm run build` and `npm run test:e2e`. Run them from `frontend`. The existing suite uses Chromium desktop (1280×720) and mobile (390×844), with pt-BR/en and desktop light/dark plus mobile light.

## Expected results

- The seven values are strictly increasing and match `4/8/12/16/24/32/48px`.
- No production consumer uses an undefined `--space-8` token.
- Every changed token consumer and fallback has been reviewed and classified.
- Home, Explore and Sessions retain coherent spacing across desktop/mobile and supported locales/themes.
- Shared controls, forms and route panels show no unintended layout breakage.
- No UI copy, API, database, or runtime dependency changes are introduced.

## Review checklist

- Check hero and section spacing on Home.
- Check page padding, toolbar and card-grid gaps on Explore.
- Check Sessions page top/bottom padding and card/list gaps, including the old 32px `space-8` consumer.
- Check New Codex card/step/action spacing and shared UI surfaces using levels 5 or 6.
- Check route digitizer and planner fallback consistency.
- Record each unavoidable spacing exception with its visual purpose and owner.
