# Tasks: Alinhamento da Linha do Tempo ao protótipo

**Input**: Design documents from `specs/144-alinhamento-prototipo-timeline/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/timeline-ui.md`, `quickstart.md`

**Tests**: Included per plan. Add Playwright scenarios before changing the UI. No backend route, model, or migration changes are planned; existing backend isolation and visibility tests remain regression coverage.

**Organization**: Tasks are grouped by the three user stories in `spec.md`; tests for each story precede its implementation tasks.

## Phase 1: Setup

**Purpose**: Prepare deterministic E2E data using existing campaign APIs and fixtures.

- [X] T001 Add reusable timeline fixture setup and cleanup helpers in `frontend/e2e/timeline-flows.spec.ts`; create uniquely named visible/hidden events and sessions through existing admin endpoints and use seeded Local/Personagem references.

## Phase 2: Foundational

**Purpose**: Shared infrastructure required before the user stories.

No foundational application changes are required; the repository already provides Playwright, authenticated E2E helpers, campaign APIs, and the timeline route. T001 prepares the feature-specific E2E fixtures.

## Phase 3: User Story 1 - Consultar a cronologia como jogador (Priority: P1) 🎯 MVP

**Goal**: Show the player's visible event details directly, identify only visible linked sessions, and explain that unrevealed events may be absent.

**Independent Test**: Open the timeline in player mode with visible/hidden events and visible/hidden linked sessions; verify direct detail visibility, association redaction, linked-session omission when hidden, localized subtitle/note, and no admin actions.

### Tests for User Story 1

- [X] T002 [US1] Add failing Playwright player scenarios for fully visible event details without expansion, visible session metadata, hidden event/session omission, protected association redaction, role subtitle, final reminder, and absence of admin controls in `frontend/e2e/timeline-flows.spec.ts`.

### Implementation for User Story 1

- [X] T003 [P] [US1] Load public sessions alongside public events and render player cards with all available details and session metadata only when `sessao_id` resolves in the visible session list in `frontend/src/pages/LinhaTempoPage.tsx`.
- [X] T004 [P] [US1] Add the player-view subtitle and unrevealed-event reminder in Portuguese and English in `frontend/src/locales/pt-BR/linhaTempo.json` and `frontend/src/locales/en/linhaTempo.json`.

**Checkpoint**: The player can read complete visible event cards without expanding them; hidden event, entity, and session data remain undisclosed.

## Phase 4: User Story 2 - Consultar e administrar a cronologia como mestre (Priority: P1)

**Goal**: Give the master a role-specific page context, keep cards expandable with management actions, show linked session metadata, and preserve hidden month values in existing events.

**Independent Test**: In master mode, verify the subtitle and create action, expand/collapse cards, identify hidden events, resolve linked sessions, exercise existing edit/delete controls, and confirm editing another field does not clear a stored month.

### Tests for User Story 2

- [X] T005 [US2] Add failing Playwright scenarios for the master subtitle, collapsed and expanded card content, hidden badge, linked session number/title, existing create/edit/delete controls, and preservation of a stored month after editing another field in `frontend/e2e/timeline-flows.spec.ts`.

### Implementation for User Story 2

- [X] T006 [US2] Add the master subtitle and linked session metadata to the existing expandable card detail; remove month from visible form/labels while retaining the original `mes` in the edit draft and save payload in `frontend/src/pages/LinhaTempoPage.tsx`.
- [X] T007 [P] [US2] Add the localized master-view subtitle in Portuguese and English in `frontend/src/locales/pt-BR/linhaTempo.json` and `frontend/src/locales/en/linhaTempo.json`.

**Checkpoint**: The master retains current CRUD and expansion behavior while seeing the prototype's contextual subtitle and session detail; editing an existing event does not erase its month.

## Phase 5: User Story 3 - Usar a Linha do Tempo integrada ao produto (Priority: P2)

**Goal**: Keep navigation, accessibility, theme, and responsive behavior consistent with the current application while applying the prototype's information structure.

**Independent Test**: Verify local/person links, keyboard operation of master expansion, focus visibility, localized copy, theme compatibility, and mobile-width readability without horizontal scrolling.

### Tests for User Story 3

- [X] T008 [US3] Add failing Playwright checks for accessible master expand/collapse state, Local/Personagem destination links, PT-BR and English role copy, light/dark themes, and narrow viewport overflow in `frontend/e2e/timeline-flows.spec.ts`.

### Implementation for User Story 3

- [X] T009 [US3] Adjust timeline page/card/subtitle styling only as needed to use existing CSS tokens, preserve focus/expanded-state accessibility, and prevent horizontal overflow at narrow widths in `frontend/src/pages/LinhaTempoPage.css` and `frontend/src/pages/LinhaTempoPage.tsx`.

**Checkpoint**: The behavior follows the prototype while page shell, form, controls, tokens, accessibility, and responsive presentation remain aligned with the product.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the integrated stories and keep the validation guide accurate.

- [X] T010 Run the E2E scenarios and frontend build/lint commands from `specs/144-alinhamento-prototipo-timeline/quickstart.md`; resolve failures in their owning files and update the guide if the runnable commands or expected outcomes need correction.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No project initialization is needed; T001 prepares unique fixture data for the tests.
- **Foundational (Phase 2)**: No shared application work is needed; user stories can begin after T001.
- **User Stories (Phase 3–5)**: Execute in priority order for the MVP path. US2 can reuse the fixture helper and existing APIs; US3 validates the integrated experience after role-specific behavior is complete.
- **Polish (Phase 6)**: Depends on all selected user stories being implemented.

### User Story Dependencies

- **US1 (P1)**: Can start after T001. It is the MVP and has no dependency on other stories.
- **US2 (P1)**: Can start after T001; page edits are sequenced after US1 because both use `LinhaTempoPage.tsx` and the locale files.
- **US3 (P2)**: Starts after US1 and US2 so its cross-theme/accessibility checks cover the integrated behavior; no backend dependency.

### Parallel Opportunities

- After T002 is written, T003 and T004 can run in parallel because they change the page and locale files respectively.
- After T005 is written, T006 and T007 can run in parallel for the same reason.
- The visual/a11y E2E scenarios (T008) must be written before T009 changes the page/CSS.
- User stories share the E2E file and page/locale files, so there is no safe parallel execution across stories without introducing merge conflicts.

## Parallel Example: User Story 1

```text
After T002:
Task T003: implement player card rendering and visible-session lookup in LinhaTempoPage.tsx
Task T004: add player copy in both linhaTempo.json locale files
```

## Parallel Example: User Story 2

```text
After T005:
Task T006: implement master card/session/month-preservation behavior in LinhaTempoPage.tsx
Task T007: add master subtitle copy in both linhaTempo.json locale files
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 to prepare repeatable event/session fixtures.
2. Add T002 and confirm it fails on current player behavior.
3. Complete T003 and T004.
4. Validate US1 independently: players see complete visible cards, visible session metadata, no hidden data, localized role guidance, and no administrative controls.

### Incremental Delivery

1. Deliver US1 as the player-facing MVP.
2. Add US2 to align the master view and preserve existing month values while retaining CRUD.
3. Add US3 checks and only make token-based responsive/accessibility refinements if those checks find gaps.
4. Run the integrated quickstart in T010.
