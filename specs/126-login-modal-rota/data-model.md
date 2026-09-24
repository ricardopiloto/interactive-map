# Data Model: Login modal

No persisted model or API schema changes are introduced. The flow uses existing auth credentials/session and transient router state.

## NavigationContext (transient)

| Field | Type | Rule |
|---|---|---|
| `backgroundLocation` | router location | Present for internal modal presentation; identifies the route rendered beneath `/login` |
| `postLoginTarget` | internal path or absent | Optional explicit action destination, validated as same-app; Home CTAs currently specify a target |
| `closeFallback` | internal path or absent | Safe public destination used when closing from a protected route would retrigger a guard |
| `presentation` | `modal \| page` | Modal only when valid background exists and transition is an in-app sign-in entry |

The context lives only in browser navigation state. Refreshing `/login` may lose it; this deliberately falls back to full-page login and must remain usable.

## LoginAttempt (existing/transient)

Email and password are the existing form values. Password is never copied into navigation state or URL. `busy` and `error` remain local form state. On auth failure, preserve email and keep the chosen presentation. On success, the existing session cookie is established, then the app follows `postLoginTarget` or returns to the background location.

## Session (existing)

Authentication remains the existing session cookie flow. This feature does not create a new session type, role, token, endpoint or persistence record.

## Navigation transitions

- **Internal entry**: current route → `/login` with valid background and optional safe post-login target → modal.
- **Successful modal login**: authenticate → explicit target when provided, otherwise restore background; session is active.
- **Failed modal login**: remain on `/login` modal; retain non-sensitive form values and show localized error.
- **Cancel from public context**: close `/login` → background route, unauthenticated.
- **Cancel from protected guard**: close `/login` → safe public fallback; do not return to the guarded route and reopen the modal.
- **Direct `/login` or refresh without router state**: full-page login.
- **Logout / reset success**: full-page `/login`, with no authenticated route preserved behind it.
