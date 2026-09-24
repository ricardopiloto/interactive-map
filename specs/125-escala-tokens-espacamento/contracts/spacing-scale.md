# Spacing Scale Contract

## Canonical values

Production spacing tokens match the established prototype scale:

| Token | Value |
|---|---:|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |

There is no canonical `--space-8`. Consumers previously using it must map to the intended level in the seven-step scale.

## Consumer requirements

- Audit all production usages and fallbacks before changing canonical values.
- Every spacing reference resolves to a defined token or to a documented, justified exception.
- A `var(--space-N, fallback)` fallback agrees with the canonical token unless its distinct value is documented as intentional.
- When remapping a consumer, retain its layout intention and check affected responsive layouts; do not keep an old number solely because it was attached to a misnumbered token.
- Shared CSS, UI kit, Home, Explore, Sessions, New Codex, map, route planner and route digitizer references are included in source-level review.

## Validation contract

- Existing Home visual baseline is reviewed in all current locale/theme/viewport variants.
- Explore and Sessions are covered by the same existing Playwright matrix.
- Shared components affected by levels 5/6 are checked in at least one representative rendering.
- No overlaps, clipped controls or accidental spacing hierarchy changes appear in desktop or mobile captures.
- No API, data, i18n or backend behavior is changed.
