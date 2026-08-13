# UI Contract: Detecção e persistência de locale

**Feature**: `080-i18n-interface`  
**Scope**: US1, FR-002, FR-003, FR-009

## Supported locales

| Code | Label (selector) | Role |
|------|------------------|------|
| `pt-BR` | PT | Default / fallback |
| `en` | EN | English UI |

## Detection chain

Priority order (first match wins):

1. **localStorage** — key managed by `i18next-browser-languagedetector` (override manual)
2. **navigator.language** — normalized by prefix rules
3. **fallback** — `pt-BR`

## Prefix normalization

| Browser language examples | Resolved locale |
|---------------------------|-----------------|
| `pt-BR`, `pt-PT`, `pt` | `pt-BR` |
| `en`, `en-US`, `en-GB` | `en` |
| `fr-FR`, `de`, `ja` | `pt-BR` |

Implementation: `normalizeBrowserLanguage()` in `frontend/src/i18n/normalizeLocale.ts`, wired into custom detector or `convertDetectedLanguage`.

## i18next configuration (requirements)

| Setting | Value |
|---------|-------|
| `supportedLngs` | `['pt-BR', 'en']` |
| `fallbackLng` | `{ en: ['pt-BR'], default: ['pt-BR'] }` |
| `load` | `'currentOnly'` or bundled imports (no HTTP backend) |
| `interpolation.escapeValue` | `false` (React escapes) |

Missing key in active locale → show **PT-BR** string (FR-009); omission counts against SC-002 audit.

## Persistence

- Manual change via selector → `i18n.changeLanguage('en' | 'pt-BR')` → persisted to localStorage automatically.
- Scope: **per browser/device**, not per campaign or GM session.

## Non-goals

- Server-side locale header
- `Accept-Language` on API requests (v2)
- Hub static site detection

## Verification

| Scenario | Expected |
|----------|----------|
| First visit, `navigator.language = en-US` | UI EN |
| First visit, `navigator.language = pt-PT` | UI PT-BR |
| First visit, `fr-FR` | UI PT-BR |
| Select PT, reload | PT-BR |
| Select EN, reload | EN |
