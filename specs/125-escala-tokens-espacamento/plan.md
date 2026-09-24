# Implementation Plan: Escala consistente de espaçamento

**Branch**: `125-escala-tokens-espacamento` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/125-escala-tokens-espacamento/spec.md`

## Summary

Align the production spacing tokens to the established seven-step sequence `4/8/12/16/24/32/48px` and remove the out-of-order eighth level after auditing consumers. The current production scale is `4/8/12/16/20/24/48/32px`; `--space-5` and `--space-6` would change, and one `--space-8` consumer must be mapped to its intended level. Audit all 207 token usages and 21 CSS fallbacks, preserve layout intent by selecting the right target token per consumer, correct fallbacks that disagree with runtime values, and verify Home, Explore, Sessions and shared components with existing visual/accessibility coverage. No dependency or backend change.

## Technical Context

**Language/Version**: CSS and TypeScript in the existing React 19 + Vite frontend

**Primary Dependencies**: Existing design-token CSS and Playwright 1.63 + axe; no new dependencies

**Storage**: N/A. Design tokens are static CSS custom properties; no persistent data.

**Testing**: Inventory/source review of every `--space-1..8` reference and fallback; existing Playwright visual snapshots and axe matrix; frontend build. Add Explore and Sessions coverage to the visual suite if they are not already covered by implementation time.

**Target Platform**: Production web frontend in Chromium desktop 1280×720 and mobile 390×844, locales pt-BR/en; all supported themes in existing quality suite

**Project Type**: Frontend web application / shared design system

**Performance Goals**: No runtime cost or bundle dependency; CSS token lookup remains constant-time.

**Constraints**: Match prototype's seven-level scale `4/8/12/16/24/32/48px`. Classify each affected usage before changing semantic values. Preserve visual intent by mapping each use to an existing level, correcting stale fallbacks, or recording a justified exception. No arbitrary visual redesign, API/schema changes, dependency additions or production legacy deployment changes.

**Scale/Scope**: 207 production references across levels 1–8: 17/56/59/46/13/8/7/1 respectively; 21 fallback declarations. Direct consumers include shared styles/UI kit and Home, Explore, Sessions, New Codex, route planner/digitizer and map surfaces.

## Constitution Check

- **I. Isolamento**: PASS / N/A. No routes, campaign data or authorization behavior changes.
- **II. Testes primeiro**: PASS. This is visual polish; the constitution allows quickstart/manual validation. Capture the current state first, classify the changed usages, then make token changes and compare/update snapshots deliberately. Run layout/a11y checks on representative desktop/mobile pages; do not treat this as a security/data TDD feature.
- **III. Produção legada**: PASS. Repository frontend only; no `/opt` or deployed legacy changes.
- **IV. Simplicidade**: PASS. Use existing CSS custom properties and current browser/Playwright tooling; no new package.
- **V. i18n**: PASS / N/A. No user-visible copy change.
- **VI. Migrações**: PASS / N/A. No database schema.

## Project Structure

### Documentation (this feature)

```text
specs/125-escala-tokens-espacamento/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── spacing-scale.md
└── tasks.md                    # Created by speckit-tasks, not this phase
```

### Source Code (repository root)

```text
frontend/src/
├── styles/tokens.css           # Canonical seven-level scale
├── pages/HomePage.css          # Conflicting token fallbacks
├── pages/ExplorarPage.css      # Conflicting token fallbacks
├── pages/SessoesPage.css       # sole --space-8 consumer
├── pages/NovoCodexPage.css
├── components/ui/ui.css
├── components/gm/RouteDigitizer.css
├── components/routes/RoutePlanner.css
└── e2e/quality.spec.ts         # Existing matrix; add Explore/Sessions scenarios as needed

frontend-next/src/styles/tokens.css # Reference scale; read-only design source
```

**Structure Decision**: Keep the prototype scale as the reference; change the production token definitions and only the production consumers/fallbacks whose audited intent requires it. Preserve visual baselines by comparing affected app pages, not by introducing new screenshot tooling.

## Complexity Tracking

No constitution violations or added dependencies.
