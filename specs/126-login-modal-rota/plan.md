# Implementation Plan: Login em modal com retorno ao contexto

**Branch**: `126-login-modal-rota` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/126-login-modal-rota/spec.md`

## Summary

Use React Router's existing background-location routing pattern so `/login` remains a real, directly addressable page while internal sign-in opens one shared login form in a modal above the current screen. Preserve each action's safe internal destination when one is explicit; otherwise close the modal and restore the background. Audit all nine current `/login` navigation sites: seven user-initiated/guard flows use the modal, while successful password reset and logout remain full-page transitions so auth-token flows and ended sessions do not retain an authenticated/account page behind the login. Use the existing accessible `Dialog`, add a visible localized close control, retain form state/error handling, and verify modal focus/history behavior. No API, schema or dependency changes.

## Technical Context

**Language/Version**: TypeScript, React 19, React Router DOM 7.18, Vite 8

**Primary Dependencies**: Existing `react-router-dom`, existing `Dialog`, existing auth client and i18n; no new dependencies

**Storage**: No new storage. Session cookie and route state behave as they do today; background route/destination are transient navigation state.

**Testing**: Playwright E2E with seeded test session and auth API; axe critical gate; frontend build. Add coverage for direct/full-page login, internal modal, success/error, close/guard fallback, history/refresh, logout and reset completion.

**Target Platform**: Browser web app (desktop/mobile), supported locales pt-BR/en

**Project Type**: Frontend web application

**Performance Goals**: No full document reload for the seven modal entry flows; no extra auth request beyond the current login/session verification flow.

**Constraints**: Preserve direct `/login` and refresh behavior. Modal route shares one LoginPage/form implementation. Keep safe internal `next` intent distinct from the background location; reject external/protocol-relative destinations. Closing from a protected route must not loop back into the guard. Logout/reset completion remain full-page transitions. Invite and reset pages themselves remain unchanged. Login copy and validation remain localized.

**Scale/Scope**: One shared router/modal integration, LoginPage modal/full-page presentation, nine call-site classifications across six source files, and E2E/a11y coverage. No backend, API, persistent state or dependency changes.

## Constitution Check

- **I. Isolamento**: PASS / N/A. No campaign-data route or cross-campaign behavior changes.
- **II. Testes primeiro**: PASS. This changes session/auth navigation: add failing E2E coverage for direct and modal login, success/error, protected-route cancellation, logout/reset exceptions and external destination rejection before migration of entry sites.
- **III. Produção legada**: PASS. Repository application only; no `/opt` or legacy instance changes.
- **IV. Simplicidade**: PASS. Reuse installed React Router, auth client and Dialog; no new package/provider or duplicated form.
- **V. i18n**: PASS. New close labels and any new helper/errors must have pt-BR and en keys. Existing login form messages remain localized; no GM content is involved.
- **VI. Migrações**: PASS / N/A. No schema change.

## Project Structure

### Documentation (this feature)

```text
specs/126-login-modal-rota/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── login-modal.md
└── tasks.md                    # Created by speckit-tasks, not this phase
```

### Source Code (repository root)

```text
frontend/src/
├── App.tsx                      # Background-location route rendering
├── pages/AuthPages.tsx           # LoginPage modal/full-page modes; reset/account transitions
├── pages/HomePage.tsx            # Two login CTAs with explicit internal destination
├── pages/PainelPage.tsx          # Protected-route guard entry
├── pages/NovoCodexPage.tsx       # Protected-route guard entry
├── components/layout/UserMenu.tsx # Replace full-page href with SPA navigation
├── components/ui/Dialog.tsx      # Reuse focus trap/restore/escape/backdrop behavior
├── e2e/                          # Login navigation/auth/accessibility scenarios
└── locales/{pt-BR,en}/           # Localized close/accessibility copy if added
```

**Structure Decision**: Keep the single LoginPage and render it as an overlay only when the router has a valid background location. The URL remains `/login`; a second route render handles the overlay while the ordinary route tree is rendered at the saved background location. Direct login or refresh without in-memory background state renders the existing full page. Route-level auth checks remain where they are; this feature changes how they navigate, not the auth architecture.

## Complexity Tracking

No constitution violations or added dependencies. Keeping logout and reset-success as full-page transitions is a scoped session-safety exception, documented in the product contract.
