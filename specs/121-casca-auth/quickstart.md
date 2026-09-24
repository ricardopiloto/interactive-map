# Quickstart: Casca visual de autenticação — 121

## Prerequisites

- Backend and frontend running according to the repository README.
- Test GM account and valid invitation/reset tokens for end-to-end flow checks.
- `frontend-next` prototype LoginPage available as a visual reference.

## Static validation

```bash
cd frontend
npx tsc --noEmit
```

## Manual UI and behavior scenarios

1. Open `/login`, `/convite/<valid-token>`, `/reset/<valid-token>` and `/conta` separately. Confirm each uses a centered responsive card, genre-default gradient, pill fields where fields exist, and full-width primary action.
2. Repeat at a narrow mobile viewport and with light/dark preference. Confirm the card remains readable and does not overflow horizontally.
3. On `/login`, submit invalid and valid credentials. Confirm the existing i18n error and `next`/`/painel` redirect behavior.
4. On `/convite/<valid-token>` and `/reset/<valid-token>`, verify the URL token remains the input to the existing flow; exercise success and invalid/expired token errors. Confirm each remains its own route.
5. On `/conta`, confirm session lookup, current email, logout and existing links behave as before.
6. Compare screenshots of the four routes with the prototype card for placement, width, gradient, field shape and primary action.

## Expected

- Routes, token-bearing URLs, API contracts, validation, errors and redirects are unchanged.
- All four pages share one visual treatment; invitation and reset are not toggles inside login.
- No backend/schema or legacy deployment changes.
