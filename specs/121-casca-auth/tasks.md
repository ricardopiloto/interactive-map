---

description: "Task list for the shared authentication and account visual shell"
---

# Tasks: Casca visual de login, convite, reset e conta

**Input**: Design documents from `/specs/121-casca-auth/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/auth-pages.md](./contracts/auth-pages.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test tasks. This is UI polish only; validate the existing auth journeys and visual states with [quickstart.md](./quickstart.md), plus TypeScript compilation. Do not change auth contracts.

**Organization**: Tasks are grouped by user story. US1 implements the shared visual shell; US2 and US3 verify behavior and route invariants.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because the tasks touch separate files and have no dependency on one another.
- **[Story]**: User story from [spec.md](./spec.md): US1, US2, or US3.
- Every task includes a concrete file path.

## Path Conventions

Web application — production frontend under `frontend/src/`. `frontend-next/` is a visual reference only.

---

## Phase 1: Setup

**Purpose**: Project setup is already present: React/Vite, four auth routes, shared auth classes, UI Button and theme tokens. No dependency or config changes are required.

**Checkpoint**: No setup tasks. Preserve `package.json`, route definitions and backend configuration.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No new foundation is needed; the existing `.auth-page` and `.auth-card` classes are already shared by the four pages.

**Checkpoint**: Proceed with US1 using the existing shared selectors and production tokens.

---

## Phase 3: User Story 1 — Shared visual shell (Priority: P1) 🎯 MVP

**Goal**: Give Login, Convite, Reset and Conta the same responsive centered card, genre-default gradient, pill fields and wide primary action.

**Independent Test**: Open the four routes and compare their card placement, width, background, fields and primary action against the prototype; repeat in light/dark and a narrow viewport.

### Implementation for User Story 1

- [X] T001 [US1] Update `.auth-page` and `.auth-card` in `frontend/src/styles/global.css` for a viewport-height responsive layout, centered card near 380px, rounded surface, token-based border/shadow and readable genre-default gradient.
- [X] T002 [US1] Style `.auth-card` labels and inputs in `frontend/src/styles/global.css` with pill radius, existing field/background tokens and visible focus state; make card actions full-width while preserving narrow-screen scrolling.
- [X] T003 [P] [US1] Set the Conta logout `Button` in `frontend/src/pages/AuthPages.tsx` to the primary, block presentation used by the auth forms; preserve its handler and the existing account links.

**Checkpoint**: All four existing page components share the visual shell; the auth logic and route parameters remain unchanged.

---

## Phase 4: User Story 2 — Preserve auth flows and errors (Priority: P1)

**Goal**: Confirm the visual changes do not alter login, invite acceptance, password reset or account behavior.

**Independent Test**: Follow the matching flows in `quickstart.md` with a test GM account and valid/invalid credentials or tokens; compare messages and redirects with the contract.

### Validation for User Story 2

- [ ] T004 [US2] Run the login, invitation and password-reset success/error scenarios in `specs/121-casca-auth/quickstart.md`; verify `frontend/src/pages/AuthPages.tsx` still uses the same fields, autocomplete, validation, `authApi` calls, error copy and redirects.
- [ ] T005 [P] [US2] Run the account scenario in `specs/121-casca-auth/quickstart.md`; verify `frontend/src/pages/AuthPages.tsx` still loads the current email, logs out through `authApi.logout()` and preserves the Panel/Home links.

**Checkpoint**: The four user-facing flows match the existing behavior contract.

---

## Phase 5: User Story 3 — Separate token routes (Priority: P2)

**Goal**: Keep invitation and reset independently addressable by their token-bearing URLs, without a login toggle.

**Independent Test**: Load `/convite/:token` and `/reset/:token` directly (including invalid tokens); each page renders at its own route and retains its current submit behavior.

### Validation for User Story 3

- [ ] T006 [US3] Verify the separate `/convite/:token` and `/reset/:token` declarations in `frontend/src/App.tsx` and direct-load scenarios in `specs/121-casca-auth/quickstart.md`; confirm `frontend/src/pages/AuthPages.tsx` has no toggle that replaces either route.

**Checkpoint**: Email deep-links continue to reach their dedicated pages; no routing or token changes are introduced.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Check the finished presentation and preserve acceptance evidence.

- [X] T007 [P] Run `npx tsc --noEmit` from `frontend/` and record the result in the implementation report.
- [ ] T008 [P] Capture all four auth/account routes in light and dark themes at desktop and narrow viewport widths under `specs/121-casca-auth/screenshots/`; compare with `frontend-next/src/pages/LoginPage.tsx` and `frontend-next/src/pages/LoginPage.css` for SC-001.
- [ ] T009 Execute the remaining applicable scenarios in `specs/121-casca-auth/quickstart.md`; confirm route, error, validation and redirect behavior, with no backend/schema changes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Already satisfied by the current frontend structure; no setup task.
- **Foundational (Phase 2)**: Already satisfied by shared auth classes, the Button kit and theme tokens.
- **US1 (Phase 3)**: Can start immediately; styling is contained in shared auth CSS and a visual-only Button prop update.
- **US2 (Phase 4)**: Depends on US1 styling so behavior can be checked on the final UI.
- **US3 (Phase 5)**: Route invariants can be checked independently; run after US1 to confirm the final pages still honor token deep-links.
- **Polish (Phase 6)**: T007–T009 follow the implementation; the type check and visual capture can run independently after US1.

### User Story Dependencies

- **US1 (P1)**: No dependency on another story; MVP.
- **US2 (P1)**: Depends on the shared presentation from US1; it does not introduce new auth behavior.
- **US3 (P2)**: No code dependency on US2; verify after US1 to cover the final UI.

### Parallel Opportunities

- T003 can run alongside T001/T002 because it edits `AuthPages.tsx` while T001/T002 edit `global.css`.
- T005 can run alongside T004 because the account flow and login/invite/reset flows are separate scenarios in the same quickstart document; avoid editing `AuthPages.tsx` concurrently if validation discovers a needed fix.
- After US1 implementation, T007 (type check) and T008 (visual capture) can run in parallel. T009 is the final combined quickstart pass.

---

## Parallel Example: User Story 1

```text
Task: T001 Update shared page and card presentation in frontend/src/styles/global.css
Task: T003 Set the Conta action presentation in frontend/src/pages/AuthPages.tsx
```

T002 also edits `global.css`, so run it after T001 rather than in parallel with T001.

## Implementation Strategy

### MVP First (User Story 1)

1. Complete T001 and T002 for the shared card and fields.
2. Complete T003 for the Conta primary action.
3. **Stop and validate** all four pages against the US1 independent test.

### Incremental Delivery

1. US1 delivers the shared visual shell.
2. US2 confirms existing login, invite, reset and account flows still work.
3. US3 confirms token URLs remain separate and directly addressable.
4. Polish captures the visual states and runs the full quickstart.

## Notes

- Task IDs follow execution order; every task follows the required checkbox/ID/story-label format and names its file path.
- No automated auth tests are added because this feature changes presentation only; do not modify handlers or API contracts to make the visual work.
- Screenshots are validation artifacts; source mock pages in `frontend-next/` are read-only references.
- Implementation checkpoint (2026-09-23): T001–T003 and T007 are complete. T004–T006, T008 and T009 remain unchecked because this environment has no available browser surface, and the flow scenarios require a test GM account plus valid/invalid invitation and reset tokens.
