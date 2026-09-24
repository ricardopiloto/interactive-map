# Login Modal Contract

## Route and presentation

- `/login` remains a registered route and works through direct URL, bookmark and refresh.
- When opened by an internal sign-in action, `/login` renders as a modal above the route captured as background.
- If navigation state is missing or invalid, `/login` renders as the existing full page.
- The login form is single-sourced in both presentations and uses the current auth endpoint/session behavior.
- A validated explicit in-app action destination (for example a Home CTA to the panel) takes precedence after successful login; otherwise success returns to the background route.
- External, protocol-relative, malformed and unsafe destinations are rejected in favor of the safe background/default route.

## Entry-point classification

| Current source | Behavior after change |
|---|---|
| `App.tsx` legacy AdminRedirect | Modal; successful login resumes campaign destination |
| `PainelPage.tsx` auth guard | Modal; successful login resumes `/painel`; cancel uses a safe public fallback to avoid guard loop |
| `NovoCodexPage.tsx` auth guard | Modal; successful login resumes `/painel/novo`; cancel uses a safe public fallback to avoid guard loop |
| `UserMenu.tsx` | SPA modal navigation; no document reload; success/cancel returns to the current background |
| `HomePage.tsx` hero CTA | Modal; preserve its internal post-login destination |
| `HomePage.tsx` final CTA | Modal; preserve its internal post-login destination |
| `ContaPage` expired-session guard | Modal over account context; success restores route; cancellation uses a safe route without reopening login |
| `ResetPage` successful reset | Full-page `/login`; reset route remains independent |
| `ContaPage` logout | Full-page `/login`; do not retain the account screen behind login |

The classification has seven modal-entry flows and two full-page transitions. Invite/reset routes themselves remain unchanged.

## Close, focus and accessibility

- Modal provides a visible translated close button.
- Existing Dialog keyboard behavior remains: initial focus, focus trap, Escape and backdrop close, body scroll lock and focus restoration.
- Title is associated with the dialog; submit/error states are announced, with focus restored to a valid background target.
- Closing never authenticates and never grants a protected action.
- The UI offers a safe way to retry sign-in after cancellation of a protected action.

## Auth states

- Loading disables duplicate form submission.
- Invalid credentials and network errors stay in the current presentation and are localized.
- Successful auth establishes the existing session before navigating to the explicit destination/background.
- Logout and password-reset success do not render authenticated/account pages behind a login overlay.

## Verification

Automated browser scenarios cover direct/login refresh, internal modal, success and failure, each entry class, cancel/fallback, protected action continuation, full-page logout/reset transitions, destination safety, keyboard/focus and axe critical violations. No backend/API contract changes are required.
