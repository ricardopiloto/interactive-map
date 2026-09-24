# Implementation Plan: Auditoria final de paridade visual

**Branch**: `122-auditoria-paridade-visual` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/122-auditoria-paridade-visual/spec.md`

## Summary

Expand the existing spec 109 Playwright and axe suite to cover every product surface in spec 122, retain in-product screenshot baselines, and emit a human-review gallery pairing product captures with `frontend-next` references. Add CI hygiene gates for hex colors and retired nocturne classes, using spec 117's migration gates. Cross-product pixel comparison is explicitly excluded. The prototype has no dedicated reset/account pages; those product routes will pair with the prototype's shared authentication shell and be labeled shell-only in the audit manifest/gallery.

## Technical Context

**Language/Version**: TypeScript, React, Vite; Python 3.11+ for existing E2E seed tooling

**Primary Dependencies**: Existing Playwright 1.63, axe helper, React Testing Library not required; no new dependencies

**Storage**: No persistent storage or schema changes; temporary E2E data in the existing disposable test data directory

**Testing**: Existing Playwright + axe suite, screenshot baselines, `npm run lint:tokens`; add nocturne source/import/file gate and parity-gallery completeness checks

**Target Platform**: Chromium CI and local development, desktop 1280×720 and mobile 390×844

**Project Type**: Web application with separate production frontend and visual prototype

**Performance Goals**: Complete the added audit in the existing CI job without external services; no user-facing runtime impact

**Constraints**: Product matrix is pt-BR/en × desktop light/dark + mobile light. Prototype has no English locale, so references are pt-BR and must disclose that label. No app↔prototype pixel assertion. Token routes must use disposable fixtures; secrets must not enter published artifacts. Preserve existing visual baselines and axe critical threshold.

**Scale/Scope**: 13 required spec surfaces plus the existing map route-tab baseline retained as a 14th state; 84 product captures across the six existing variants, with prototype references and paired gallery entries. Human reviewer records a per-surface verdict.

## Constitution Check

- **I. Isolamento**: PASS / N/A. No HTTP route or campaign data behavior changes. Existing authenticated E2E fixture is scoped to disposable seed data.
- **II. Testes primeiro**: PASS. These changes are quality gates: first prove each new check fails for a missing surface, forbidden hex, nocturne class/import/file, and critical axe violation; then integrate/fix the implementation and retain passing checks. No auth, permission, migration, or import/export behavior is changed.
- **III. Produção legada**: PASS. Work is limited to repository product/prototype and CI; no `/opt` changes.
- **IV. Simplicidade**: PASS. Reuse Playwright, axe, existing seed and CI. Do not add a visual-diff package or other dependency. Run the prototype's existing Vite app only as a reference capture source.
- **V. i18n**: PASS. Product screenshots include pt-BR and en. New harness labels are generated from the audit manifest and should not add user-facing product copy.
- **VI. Migrações**: PASS / N/A. No schema changes.

## Project Structure

### Documentation (this feature)

```text
specs/122-auditoria-paridade-visual/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── visual-audit.md
└── tasks.md             # Generated in the speckit-tasks phase
```

### Source Code (repository root)

```text
frontend/
├── e2e/
│   ├── quality.spec.ts       # Extend required surfaces and states
│   ├── helpers.ts            # Reuse locale/theme/auth/session setup
│   ├── seed_e2e.py           # Disposable auth/token fixtures as needed
│   └── audit-surfaces.ts     # Route/reference/fixture/variant manifest
├── scripts/
│   ├── check-no-hex.mjs      # Tighten documented content-color exceptions
│   └── check-no-nocturne.mjs # Enforce spec 117 removal gates
└── playwright.config.ts     # Serve product and prototype on distinct ports

frontend-next/
└── src/                      # Existing reference prototype; no redesign

.github/workflows/
└── frontend-quality.yml      # Install/reference prototype and publish gallery
```

**Structure Decision**: Extend the current production E2E/quality setup and add only the audit manifest, retirement checker, gallery output, and workflow wiring. The prototype remains a reference input. No backend, API, database, or production route implementation changes are planned.

## Complexity Tracking

No constitution exceptions or added dependencies.
