# Visual Audit Contract

## Inputs

- Production frontend served by the existing E2E preview configuration.
- `frontend-next` prototype served locally on a distinct port, using its existing hash routes.
- Disposable backend E2E data for authenticated campaign screens and invite/reset token screens.
- Typed audited-surface manifest mapping each product route/state to a prototype reference.

## Required product surfaces

| ID | Product route/state | Prototype reference | Reference type |
|---|---|---|---|
| `landing` | `/` | `#/` | page |
| `explore` | `/explorar` | `#/explorar` | page |
| `panel` | `/painel` | `#/painel` | page |
| `new-codex` | `/painel/novo` | `#/painel/novo` | page |
| `login` | `/login` | `#/entrar` | page |
| `invite` | `/convite/:token` | `#/entrar` invite state | state |
| `reset` | `/reset/:token` | `#/entrar` | auth-shell-only |
| `account` | `/conta` | `#/entrar` | auth-shell-only |
| `map` | `/c/:slug` | `#/c/:slug` | page |
| `relations` | `/c/:slug/relacoes` | `#/c/:slug/relacoes` | page |
| `route` | `/c/:slug/rota` | `#/c/:slug/rota` | page |
| `route-digitizer` | `/c/:slug/rota`, digitizer open | `#/c/:slug/rota`, digitizer open | state |
| `sessions` | `/c/:slug/sessoes` | `#/c/:slug/sessoes` | page |
| `map-route-tab` | Existing route tab within `/c/:slug` | `#/c/:slug` route tab | state, retained baseline |

Reset and Account have no content-equivalent prototype pages. Their paired reference is explicitly shell-only and cannot be labeled as content parity.

## Product capture matrix

Capture every product surface in pt-BR and en at:

- Desktop light, 1280×720
- Desktop dark, 1280×720
- Mobile light, 390×844

This produces 6 product captures per state (84 for 14 states). The existing map route-tab state remains included. Prototype reference images are captured in pt-BR at the matching viewport/theme where supported; the gallery labels reference locale and visual mode. There is no automatic app-to-prototype pixel comparison.

## Quality gates

1. Playwright captures match the in-product baseline policy and test every manifest entry.
2. Axe reports zero `critical` findings for each app state. Lower severities remain visible in reports under the existing spec 109 contract.
3. `lint:tokens` rejects every production hex literal outside `frontend/src/styles/tokens.css` unless it is a narrowly inventoried pin-content declaration/fallback.
4. The nocturne checker rejects legacy class families outside the spec 117 UI-kit exclusions; `frontend/src/styles/nocturne.css` must be absent and no entrypoint may import it.
5. Gallery completeness validation fails if either side of any declared pair is missing.
6. CI artifact labels and gallery metadata must not expose raw invitation/reset tokens or session data.

## Output

One audit bundle containing a labeled side-by-side product/prototype gallery, machine-readable surface metadata, Playwright/axe reports, and the per-surface human review checklist. The CI workflow uploads it on successful quality runs as well as failure diagnostics.

## Human review

For every surface/state, record `parity-ok` or `deviation`. Consider shell/layout/tokens; content, locale, and campaign fixture differences are expected. Any visible structural-shell deviation must be corrected in its source feature or documented and corrected before spec 122 closes. Reset/account shell-only references must remain marked as such.
