# Research: Login em modal com retorno ao contexto

## Decisions

### 1. Use a route modal with background location

- **Decision**: Capture a valid background `Location` in router state for in-app modal entry. Render the normal app routes at that location and render `/login` as an overlay at the actual location. If no background exists, render `/login` as a full page.
- **Rationale**: The project already uses React Router DOM 7.18, which supports the background-location pattern; this preserves a real `/login` URL, deep links and refresh behavior while keeping one form.
- **Alternatives considered**: Local Dialog at every call site or a global auth-modal provider; rejected because they duplicate wiring/state and can make `/login` stop working as a direct URL.

### 2. Track background and post-login destination separately

- **Decision**: Store the screen to render under the modal separately from any explicit internal target the triggering action intends after login. Use the background when there is no explicit target; allow only validated same-app paths and reject absolute/protocol-relative/external values.
- **Rationale**: The two Home calls currently carry `next` destinations, while UserMenu has no target and guarded routes are the target themselves. A single value cannot simultaneously preserve visual background and intent.
- **Alternatives considered**: Drop all `next` values and always close to background; rejected because it changes the Home CTAs' current post-login intent. Trust raw `next`; rejected because it can redirect outside the app.

### 3. Audit all nine call sites and keep session-ending transitions full-page

- **Decision**: Migrate seven login-entry paths to modal: legacy AdminRedirect, Painel guard, New Codex guard, UserMenu, two Home CTAs, and Conta expired-session redirect. Keep two transition paths as full-page `/login`: successful password reset and logout.
- **Rationale**: Source audit confirms nine `navigate`/Link/href sites. Reset success occurs after an external token flow and logout ends a session; both should not preserve a private background under a login modal. The prior TR inventory counted nine but omitted ResetPage success and treated both Conta transitions as normal modal entry.
- **Alternatives considered**: Convert every `/login` navigation mechanically; rejected because reset completion and logout have different security/session semantics.

### 4. Use the existing Dialog accessibility behavior and add a visible close action

- **Decision**: Reuse `Dialog` focus trapping, focus restoration, Escape/backdrop close and scroll lock. Add a visible, translated close button inside the modal form and verify focus behavior when the background route remounts.
- **Rationale**: Existing `Dialog` already implements modal semantics and keyboard focus handling, but does not render its own close control. React Router background rendering may unmount/remount the trigger, so restore behavior needs integration testing.
- **Alternatives considered**: Implement another modal component; rejected because it duplicates a complete existing primitive.

### 5. Prevent guarded-route close loops

- **Decision**: On successful login from a guard, resume the protected destination. On modal close/cancel from a protected route, navigate to a safe public fallback or previous safe location so the guard does not immediately reopen login. A CTA modal closes to its actual background when canceled.
- **Rationale**: The Painel and New Codex guards replace navigation to login; blindly navigating back to the protected location after close can retrigger the guard indefinitely.
- **Alternatives considered**: Always use browser `navigate(-1)`; rejected because a guard may replace history and there may be no useful entry.

### 6. Keep form and authentication behavior single-sourced

- **Decision**: Keep existing email/password fields, `authApi.login`, busy/error behavior and translation keys; change the presentation wrapper based on modal state. Add alert semantics for auth errors only if needed to satisfy existing accessibility contract.
- **Rationale**: No API or form rewrite is required. One LoginPage behavior in two presentation modes avoids divergent validation.
- **Alternatives considered**: Duplicate a separate ModalLogin form; rejected because it risks inconsistent auth/error behavior.

## Repository findings

- `frontend/src/App.tsx` uses BrowserRouter and one Routes tree; `/login` maps directly to `LoginPage`.
- `LoginPage` uses the existing auth client, reads `?next=`, navigates to a validated same-origin-looking path or `/painel`, and already preserves form values when API authentication fails.
- The existing `Dialog` is a portal with `role=dialog`, `aria-modal`, labelled title, body scroll lock, initial focus, Tab trap, Escape/backdrop close and focus restore. It has no built-in visible close button.
- The current E2E quality suite uses Playwright with seeded session cookie, locale/theme helpers and axe (blocking critical violations); it has no dedicated login modal scenarios.
- The TR's nine invocations are: App AdminRedirect, Painel guard, New Codex guard, UserMenu, two Home CTAs, ResetPage success, Conta expired-session guard and Conta logout. Reset success is omitted from the TR table; this plan explicitly classifies it as full-page.
- `UserMenu` currently uses `window.location.href`, causing a full document navigation. The other internal callers use React Router links/navigation.
- `ContaPage` is a protected account view; logout clears the session then navigates to login. It should not leave this view visible under a login overlay after the session ends.
- Invite and reset components are separate full-page routes and should not be changed by the modal presentation.
- The TR-recommended route pattern preserves route URLs, but a close operation cannot rely on browser history alone because protected guards currently use `replace`.

## Open clarifications

None. The two full-page transitions and the safe fallback for protected-route cancellation are explicit in the design contract.
