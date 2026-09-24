# Implementation Plan: Seletor de tema compacto

**Branch**: `127-seletor-tema-icone` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/127-seletor-tema-icone/spec.md`

## Summary

Match the production campaign-header ThemeSelector to the prototype's icon-only trigger while preserving the existing Auto/Light/Dark preference menu and storage behavior. Remove the always-visible label and chevron at all viewport widths, retain an accessible name and minimum touch target, show Sun/Moon for the resolved light/dark preference (including live OS changes while Auto), and add complete keyboard menu behavior. Scope is the dedicated campaign `ThemeSelector`; Home/Painel theme options already live inside UserMenu and remain there. Do not copy prototype accessibility gaps. No API, schema or dependency changes.

## Technical Context

**Language/Version**: TypeScript/React 19 + Vite 8; CSS

**Primary Dependencies**: Existing `@tabler/icons-react`, `react-i18next`, Playwright and theme-preference utilities; no new dependencies

**Storage**: Existing `localStorage` key `codex.theme`; no new persistent data

**Testing**: Playwright E2E for icon-only visible trigger, accessible name, three options, selection, persistence, Auto/media-query changes, manual lock, keyboard dismissal/focus and axe. Existing frontend build and quality suite.

**Target Platform**: Campaign header on desktop/mobile; pt-BR and en

**Project Type**: Frontend web application / shared campaign chrome control

**Performance Goals**: No new network or storage request pattern; theme selection continues to update immediately.

**Constraints**: Keep three preferences (`auto`, `light`, `dark`) and current persistence semantics. Trigger contains only icon visually; accessible name remains. Menu retains translated text labels and selected state. Auto icon must track system mode changes; explicit light/dark stays fixed. Preserve existing genre forcing behavior and ensure adequate hit target. Do not alter UserMenu's Home/Painel preference list unless needed to avoid conflicting state semantics.

**Scale/Scope**: One dedicated campaign-header control, its styling, effective-mode rendering, keyboard interactions and focused browser tests. No backend, route, database, design-token system or dependency changes.

## Constitution Check

- **I. Isolamento**: PASS / N/A. This is a display preference and does not access campaign data.
- **II. Testes primeiro**: PASS. UI polish may use browser/quickstart validation. Add focused interaction tests before replacing the current control presentation to protect all three preference states and persistence.
- **III. Produção legada**: PASS. Repository UI only; no `/opt` changes.
- **IV. Simplicidade**: PASS. Reuse current icons, preference module and menu styling; no dependencies.
- **V. i18n**: PASS. Existing theme labels and generic accessible label exist in both pt-BR and en; any changed/dynamic accessible name must use both locale dictionaries.
- **VI. Migrações**: PASS / N/A. No schema change.

## Project Structure

### Documentation (this feature)

```text
specs/127-seletor-tema-icone/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── theme-selector.md
└── tasks.md                    # Created by speckit-tasks, not this phase
```

### Source Code (repository root)

```text
frontend/src/
├── components/layout/ThemeSelector.tsx  # Icon-only trigger and current mode
├── components/layout/ThemeSelector.css  # Compact visual trigger and responsive target
├── theme/themePreference.ts             # Existing preference/effective-mode behavior
├── components/layout/CodexHeader.tsx    # Existing campaign-header usage
├── locales/{pt-BR,en}/comum.json        # Existing localized labels/accessibility names
└── e2e/                                 # Focused theme selector interaction coverage

frontend-next/src/components/layout/ThemeSelector.tsx # Visual reference only
```

**Structure Decision**: Change the existing campaign ThemeSelector implementation and its CSS; keep it in CodexHeader. Reuse the current `codex.theme` preference model and add only the smallest reactive behavior needed for the icon to follow Auto's resolved mode. The prototype is a visual reference, not an accessibility behavior source. Home/Painel continue to expose preferences through UserMenu.

## Complexity Tracking

No constitution violations or added dependencies.
