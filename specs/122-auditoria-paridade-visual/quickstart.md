# Quickstart: Visual parity audit

This guide describes the end-to-end validation expected after implementation. Commands are run from the repository root unless noted.

## Prerequisites

- Node.js version supported by `frontend` and `frontend-next` lockfiles.
- Python environment and dependencies used by `frontend/e2e/seed_e2e.py`.
- Playwright Chromium installed for the frontend project.
- No real user credentials or production invite/reset links; seed only disposable E2E data.

## Prepare and run

1. Install locked dependencies in `frontend`, `frontend-next`, and the existing backend E2E environment.
2. Seed disposable backend E2E data, including an owner session and valid invite/reset fixtures. Keep generated tokens in ignored E2E fixture storage only.
3. Run the production and prototype Vite servers on their configured, distinct local ports.
4. From `frontend`, run the token-color and nocturne hygiene gates, then run the Playwright quality suite.
5. Inspect the generated gallery, machine-readable manifest output, Playwright report, and axe report.

Implementation task generation should translate these steps into the exact repository scripts established by the implementation; this plan intentionally avoids inventing additional npm script names or changing the existing command interface in advance.

## Expected results

- All 14 audit states are present: the 13 required surfaces/states plus the retained existing map route-tab baseline.
- Each product state has six captures (pt-BR/en × desktop light/dark + mobile light), for 84 app captures.
- Each state has a prototype reference and a side-by-side gallery row. Reset and Account are explicitly labeled `auth-shell-only`; all prototype references are labeled pt-BR.
- App screenshot assertions compare only with the app's own baseline. There is no automatic pixel comparison between app and prototype.
- Axe has zero critical findings for every app surface.
- Hex and nocturne gates pass. The nocturne stylesheet is absent and unimported.
- No raw token or session credential appears in artifact filenames, gallery labels, or metadata.

## Negative checks

In an isolated temporary worktree or disposable test fixture, verify that:

- Removing a required manifest entry or one side of a capture pair fails gallery completeness.
- Adding an unapproved hex literal to production UI source fails `lint:tokens`.
- Reintroducing an in-scope nocturne class, importing `nocturne.css`, or restoring the stylesheet fails the nocturne gate.
- An injected critical axe finding fails the Playwright quality job.

Restore the fixture/worktree after each negative check; do not introduce test violations into the working tree.

## Human sign-off checklist

For each row in the audit gallery, record reviewer, date, and either `parity-ok` or `deviation`. Check the outer shell, hierarchy, spacing, surface treatment, typography, and responsive behavior. Ignore expected content, locale, and campaign-data differences. For a deviation, record the source feature and corrected result before closing the audit. Reset and Account reviews are shell-only.

See [the visual audit contract](contracts/visual-audit.md) for the complete surface map and gate definitions.
