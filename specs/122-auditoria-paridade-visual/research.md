# Research: Auditoria final de paridade visual

## Decisions

### 1. Extend the spec 109 Playwright suite

- **Decision**: Keep the existing Chromium projects, product screenshot snapshots, helper setup, and axe checks. Extend the current suite and preserve the existing map-route tab screenshot as an additional audited state.
- **Rationale**: The existing suite already defines the requested six product variants (pt-BR/en × desktop light/dark + mobile light), seeds authenticated campaign data, and enforces zero critical axe findings. Replacing it would discard stable baselines.
- **Alternatives considered**: Build a separate audit runner; rejected because it duplicates browser setup and can drift from the CI gate already in use.

### 2. Use an explicit surface manifest and human gallery

- **Decision**: Describe each app route/state, corresponding prototype route, auth fixture, supported product variants, and reference type in a typed E2E manifest. Capture prototype pages separately and generate a gallery that pairs the captures with labels.
- **Rationale**: A manifest makes completeness machine-checkable and lets the human reviewer see product locale/theme/viewport and prototype-reference locale/theme/viewport. Product screenshot baselines remain within-app only.
- **Alternatives considered**: Compare the app and prototype by pixels; rejected by FR-003 and because content, locale, and data differ. Check in prototype screenshots; rejected because the prototype evolves and no reference set is currently checked in.

### 3. Run the existing prototype as a capture source

- **Decision**: Start `frontend-next` Vite on a dedicated local CI port for reference captures and install its locked dependencies in the quality workflow. Use its hash routes and do not add a backend.
- **Rationale**: This keeps reference images current while reusing existing app code and lockfile. It adds no runtime/product dependency.
- **Alternatives considered**: Static checked-in references or remote hosted references; rejected due to staleness and network dependence.

### 4. Declare auth-shell-only mappings where pages are absent

- **Decision**: Login maps to the prototype login page; invite maps to its invite state; reset and account map to the same prototype login/auth shell with `referenceType: auth-shell-only`. Gallery and checklist must state that there is no content-equivalent prototype page for reset/account.
- **Rationale**: `frontend-next` exposes no separate reset/account pages, and the invite is represented as a state within LoginPage. This gives the reviewer an honest shell comparison without claiming content parity.
- **Alternatives considered**: Omit these product routes; rejected because spec 122 explicitly lists them. Invent new prototype pages; rejected because that expands scope into redesign.

### 5. Audit 13 required surfaces and preserve the existing route-tab baseline

- **Decision**: Cover Landing, Explore, Panel, New Codex, Login, Invite, Reset, Account, Map, Relations, Route, open Route Digitizer, and Sessions, plus the existing map route-tab state (14 total states). Product capture matrix yields 84 state/variant captures. Prototype captures use pt-BR only because the prototype has no English locale.
- **Rationale**: Route `/c/:slug/rota` and its open digitizer state are distinct from the current map route's route tab; preserving both avoids losing coverage while adding the actual page required by the spec.
- **Alternatives considered**: Rename the existing `rota` test to the dedicated route; rejected because it would erase its prior state baseline.

### 6. Use disposable fixtures for token routes

- **Decision**: Seed valid invite and reset tokens in the E2E-only data directory and keep token-bearing URLs/session files out of the gallery and public artifacts. Artifact labels contain only manifest IDs and route templates, not raw tokens.
- **Rationale**: The product needs valid token routes for realistic screenshots, while the spec prohibits exposing secrets.
- **Alternatives considered**: Reuse production tokens or screenshot invalid-token states; rejected as unsafe or unrepresentative.

### 7. Tighten color exception handling

- **Decision**: Keep `lint:tokens` as a CI gate but replace its broad substring exemptions with narrow, auditable pin-content exceptions: recognized `PIN_COLOR_*` declarations and explicitly annotated content fallbacks. Keep dynamic user-selected pin values classified as content, not design tokens.
- **Rationale**: Current checker exempts any line containing `cor_pin`/`pin-color`, which can hide unrelated hardcoded UI colors. The observed literals belong to selectable map-pin content and can be scoped precisely.
- **Alternatives considered**: Remove all exemptions; rejected because the spec explicitly allows master-selected pin colors.

### 8. Implement the nocturne gate from spec 117

- **Decision**: Add a focused checker using the exact legacy class families and exclusions in `specs/117-aposentar-nocturne/contracts/removal-gates.md` and `migration-map.md`; check source production markup/styles, ensure `nocturne.css` is absent and no entrypoint imports it, then run it in frontend quality CI.
- **Rationale**: The stylesheet has already been removed and the migration contract defines the authoritative classes. Excluding the UI kit and non-target `ui-*`/BEM classes prevents false positives.
- **Alternatives considered**: Broad grep for strings such as `input`, `.card`, or `dialog`; rejected because it flags native input markup, comments, and current `ui-*` classes.

### 9. Keep axe critical as the blocking threshold

- **Decision**: Run the existing axe helper on every app surface/state and fail only on `critical`; preserve current reporting for less severe findings.
- **Rationale**: This matches the spec 109 contract and FR-006 without broadening the existing accessibility gate.
- **Alternatives considered**: Gate on all severities; rejected because it changes the agreed spec 109 threshold.

## Repository findings

- `frontend/playwright.config.ts` already configures Chromium desktop (1280×720) and mobile (390×844), screenshot diff tolerance, reduced animation, and API/frontend servers.
- `frontend/e2e/quality.spec.ts` currently covers Home, Painel, Map, Relations, and the route tab within Map; snapshots exist for the six locale/theme/viewport variants.
- `frontend/e2e/helpers.ts` provides locale/theme and session-cookie setup. `seed_e2e.py` creates a disposable user/campaign but currently has no invite/reset token fixtures.
- Product routes are in `frontend/src/App.tsx`; the dedicated route page is `/c/:slug/rota`. Auth routes are `/login`, `/convite/:token`, `/reset/:token`, and `/conta`.
- Prototype routes are in `frontend-next/src/App.tsx` and use `HashRouter`; pages are Landing, Explore, Login, Panel, New Codex, Campaign Map, Relations, Route, and Sessions. Prototype has no English locale and no standalone reset/account pages.
- `.github/workflows/frontend-quality.yml` runs token/contrast lint and Playwright, but does not install or serve `frontend-next` and does not yet publish successful audit galleries.
- `frontend/scripts/check-no-hex.mjs` currently permits broad line-level substrings related to pin colors; this should be narrowed.
- `frontend/src/styles/nocturne.css` is absent and `frontend/src/main.tsx` has no nocturne import. Spec 117 defines the exact class families and exclusions for a source gate.

## Open clarifications

None. Auth reference limitations and prototype locale differences are recorded as explicit, reviewable exceptions in the manifest/gallery contract.
