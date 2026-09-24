# Research: Escala consistente de espaçamento

## Decisions

### 1. Match the production scale to the existing prototype's seven steps

- **Decision**: Canonical target for `--space-1..7` is `4, 8, 12, 16, 24, 32, 48px`; no `--space-8` step remains.
- **Rationale**: This is the reference scale already used by `frontend-next` and described in BKLG-003/spec 125. It is ordered, gap-free, and has no separate 20px step.
- **Alternatives considered**: Keep eight production steps or reorder only space-7/8; rejected because that leaves production divergent from the chosen reference and retains an undocumented 20px level.

### 2. Audit consumers before changing token values

- **Decision**: Inventory all 207 `var(--space-N)` references and 21 fallbacks, classify every use of levels 5–8, then correct the use to the token that matches its intended visual spacing. Specifically review Home, Explore, Sessions, global/shared styles, UI kit and route controls.
- **Rationale**: Space-5 changes from 20→24px, space-6 from 24→32px, space-7 remains 48px and space-8 is removed (currently 32px). Blindly changing values could alter padding, gaps and layout across many surfaces.
- **Alternatives considered**: Change only `tokens.css`; rejected because it would silently change 21 consumers in the first two affected levels, and leave `space-8` undefined.

### 3. Correct fallbacks to agree with the canonical value and intent

- **Decision**: For every `var(--space-N, fallback)` in production, verify that the fallback equals the canonical token or is removed/replaced with a justified value. Prioritize conflicting fallbacks in Home and Explore (`space-5: 1.25rem` vs desired 24px, `space-6: 2rem` vs desired 32px) and digitizer `space-4: 0.75rem` vs canonical 16px.
- **Rationale**: A fallback that differs from its defined token conceals incorrect assumptions and makes layout depend on whether the token stylesheet loaded.
- **Alternatives considered**: Keep all existing fallbacks untouched; rejected because it preserves contradictions and makes component intent ambiguous.

### 4. Preserve the former 32px space-8 consumer through semantic remapping

- **Decision**: Review the `SessoesPage.css` bottom padding using `--space-8` and replace it with the level that expresses its intended 32px separation (expected `--space-6` after alignment), unless visual review shows a different existing level is intended.
- **Rationale**: Prototype's `--space-6` is 32px, while current production `--space-8` is 32px. The consumer should use the shared semantic step rather than a removed token.
- **Alternatives considered**: Retain `--space-8` as compatibility alias; rejected because it perpetuates an eighth level outside the reference scale.

### 5. Use existing visual regression infrastructure and add missing page coverage

- **Decision**: Preserve and compare Home snapshots, and extend the existing Playwright quality suite to include Explore and Sessions in the same pt-BR/en, desktop light/dark and mobile light matrix. Use existing a11y helper and visual baselines.
- **Rationale**: Home is already covered. Explore and Sessions are named in the spec but absent from the current five-surface quality suite. Shared token changes may also affect other consumers, which are covered by source inventory and representative component/page checks.
- **Alternatives considered**: Add a new screenshot framework or snapshot every app route here; rejected because existing Playwright provides the needed matrix and broad expansion is outside this focused token cleanup.

### 6. Add no new tool or design-token family

- **Decision**: Keep current CSS variable naming and use the existing browser test/build workflow.
- **Rationale**: The issue is inconsistent values and consumer mapping, not missing technology.
- **Alternatives considered**: Introduce a CSS-in-JS/token package; rejected by simplicity principle.

## Repository findings

- `frontend/src/styles/tokens.css` currently defines `--space-1..8` as `4/8/12/16/20/24/48/32px`: levels 7 and 8 are out of order, level 5 differs from the prototype, and level 8 is an extra step.
- `frontend-next/src/styles/tokens.css` defines `--space-1..7` as `4/8/12/16/24/32/48px`.
- Production has 207 token references by level: space-1 17, space-2 56, space-3 59, space-4 46, space-5 13, space-6 8, space-7 7, space-8 1.
- 21 fallback declarations need review. Home/Explore have token fallbacks that imply prototype values; route digitizer's `space-4` fallback is 12px although the canonical token is 16px.
- Home already appears in `frontend/e2e/quality.spec.ts`; Explore and Sessions do not. Existing Playwright variants are pt-BR/en × desktop light/dark + mobile light at 1280×720/390×844.
- Shared/global styles and the UI kit use many lower-level tokens; these do not change in the proposed alignment. Levels 5 and 6 affect Home, Explore, Sessions, New Codex and shared styles.

## Open clarifications

None. The exact consumer remapping is an audit deliverable; the target canonical scale itself is explicit.
