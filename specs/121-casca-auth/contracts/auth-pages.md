# UI contract: Páginas de autenticação e conta (121)

## Routes and preserved behavior

| Route | Existing input | Existing success behavior |
|---|---|---|
| `/login` | Email and password; optional `?next=` | Login API; navigate to a same-site path beginning `/`, otherwise `/painel` |
| `/convite/:token` | Route token and new password (minimum 8 chars) | Accept invitation API; navigate to `/painel` |
| `/reset/:token` | Route token and new password (minimum 8 chars) | Confirm reset API; navigate to `/login` |
| `/conta` | Authenticated session | Load current email; logout and preserve existing panel/home links |

The routes and API request/response contracts do not change. Existing error messages, input types, autocomplete values, required flags, password minimum length, busy states and redirects remain in force.

## Shared visual contract

All four routes continue to render the shared `auth-page` viewport wrapper and `auth-card` content surface. The shared surface provides:

- a readable genre-default gradient background and centered, responsive card near 380px wide;
- rounded card treatment with adequate contrast in light/dark themes;
- pill-shaped form inputs with visible focus treatment;
- primary action spanning the card width;
- no horizontal overflow on narrow screens and enough vertical room to scroll;
- no login toggle that replaces `/convite/:token` or `/reset/:token`.

No new HTTP interface, auth token, schema, or translated string is required by this contract.
