# Implementation Plan: Auditoria de paridade da Rede de Relações

**Branch**: `128-paridade-rede-relacoes` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/128-paridade-rede-relacoes/spec.md`

## Summary

Audit the current relationship graph against `main`, the relationship manual and prior specifications. Retain this branch's approved floating-panel/list/detail experience and current search, filters, selection, editing and focus layout. Correct the confirmed visual gaps: identify private bonds and player-unknown directions for the GM, use straight relationship lines, give all eight types clearly distinct colors with redundant stroke/text cues, and ensure PJ/NPC positions remain understandable in the graph area beside the floating panel. Keep player privacy enforced by the existing server projection. No new endpoint, persisted field, dependency or graph service is planned. Update the relationship manual and the current structural reference spec to record accepted criteria and intentional differences from `main`/historical design.

## Technical Context

**Language/Version**: TypeScript, React 19, SVG/CSS; Python 3.12+ / FastAPI for existing relationship read contracts and regression tests

**Primary Dependencies**: Existing React, i18next, SVG and UI components; FastAPI/SQLModel and pytest; Playwright + axe. No new dependencies.

**Storage**: Existing per-campaign SQLite `NPC` and `Vinculo` records. No schema or persistence change.

**Testing**: Backend pytest for public privacy projection and GM completeness; Playwright for GM/player rendering, straight SVG segments, eight-type styling, dark/light themes, panel states, responsive placement and preserved list/detail/edit flows; existing axe and build gates.

**Target Platform**: Existing Chromium web app, desktop and mobile campaign layout, light/dark themes, pt-BR/en

**Project Type**: Full-stack web application; scope is existing relationship UI and read-only validation of existing API behavior

**Performance Goals**: Preserve current graph layout and interaction responsiveness; do not add per-edge requests or layout service.

**Constraints**: Keep the current floating `MapSidePanel` structure and this branch's list/detail interaction. Draw straight SVG line segments. Use eight individually distinguishable type colors plus pattern/text cues; maintain legibility in both themes. GM-only privacy cues must never be present in the public projection. Preserve the radial overview/focus rules and only make minimal viewport/panel-aware positioning adjustments if verified overlap requires them. No API/schema/dependency change unless audit proves an existing privacy contract gap.

**Scale/Scope**: `RelacoesPage`, `GraphStage`, relationship style/direction/layout helpers, localized UI, existing public vinculo projection, the manual and reference documentation; four user stories in `spec.md`.

## Constitution Check

- **I. Isolamento**: PASS. No new route or campaign-data scope. Player data stays filtered/redacted by the existing campaign-scoped public endpoint; add regression coverage for private pairs and unknown directions.
- **II. Testes primeiro**: PASS. Add/fix privacy projection tests before any change to the public relation API. Visual UI corrections use focused E2E, manual matrix and axe checks.
- **III. Produção legada**: PASS. Repository changes only; no `/opt` changes.
- **IV. Simplicidade**: PASS. Reuse SVG, existing relationship fields, design tokens, current graph layout and test tools; no dependencies or service.
- **V. i18n**: PASS. Any new private/unknown direction label, visual help, or accessibility text must have pt-BR/en entries; GM-authored names and notes stay unchanged.
- **VI. Migrações**: PASS / N/A. No persisted fields or schema changes.

No constitution violations or exceptions are proposed. Re-evaluate these gates after design and implementation discoveries.

## Research Decisions

- `main` draws straight SVG lines and has eight individual type colors. The current worktree draws quadratic curves and uses four shared color families. Spec 128's explicit criteria supersede the historical curved-edge/four-family decision from spec 105; the current floating-panel UI remains the approved structural baseline.
- The server already excludes private pairs, hidden-character links and redacts unknown directional content from public responses. Keep this boundary and prove it with endpoint tests; do not use client-only hiding as privacy enforcement.
- Existing radial algorithms already place PJs in the inner overview ring, NPCs outside, and selected characters at center with directs inside. Preserve those algorithms; verify the useful graph viewport and adjust only its origin/fit if the floating panel covers essential nodes.
- Existing data supports the required distinctions: `Vinculo.publico`, `tipo_ab/tipo_ba`, `conhecido_ab/conhecido_ba`, qualifiers, notes and direction. Represent privacy/knowledge state visually for GM without adding fields.
- Use the type-specific aliases already present in the branch's design tokens to assign distinct colors to each type in both themes. Keep line patterns and text samples as redundant cues. Validate against the manual's eight type meanings and update docs if any current label/color convention is intentionally changed.
- Update `docs/manual-relacoes.md` and `specs/116-relacoes-rota-reconstrucao/spec.md` as the manual and current structural reference. Retain spec 105 as historical design evidence and document the intentional divergence instead of restoring its curve/four-family requirements.

## Project Structure

### Documentation (this feature)

```text
specs/128-paridade-rede-relacoes/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── parity-matrix.md
└── contracts/
    └── relationship-visual-contract.md
```

### Source Code (repository root)

```text
backend/
├── app/routers/public/vinculos.py       # Existing filter/redaction boundary; change only for proven gap
└── tests/test_visibility_relacoes.py    # Regression tests for hidden pairs and unknown directions

frontend/src/
├── components/relacoes/GraphStage.tsx  # Straight segments; GM-only bond/direction markers
├── components/relacoes/GraphStage.css
├── components/relacoes/graphLayout.ts  # Preserve radial algorithm; viewport fit only if required
├── components/relacoes/vinculoStyles.ts
├── components/relacoes/vinculoDirection.ts
├── pages/RelacoesPage.tsx              # Type swatches, detail indicators, preserve flows
├── pages/RelacoesPage.css
├── components/map/MapSidePanel.tsx     # Shared floating panel; no structural redesign
├── styles/tokens.css                   # Existing per-type aliases for theme-aware color values
├── locales/{pt-BR,en}/relacoes.json    # New GM-only/help/accessibility copy
└── e2e/relacoes-parity.spec.ts         # Graph, privacy, theme, responsive and interaction scenarios

backend/tests/test_visibility.py        # Existing hidden-character/public-link coverage to retain
docs/manual-relacoes.md                 # Accepted criteria and current user instructions
specs/116-relacoes-rota-reconstrucao/spec.md # Current panel/layout reference and intentional differences
```

**Structure Decision**: Keep the existing full-stack structure and model. The UI changes belong in the existing relation stage/page and helper modules. Backend work is limited to regression tests or the smallest redaction correction if a test proves the public endpoint leaks. Documentation records the accepted behavior and deliberate conflicts with older design decisions.

## Complexity Tracking

No violations or added complexity are planned. Any discovered need for new state, API contract, dependency or schema will require a documented justification and a re-evaluation of this plan before implementation.
