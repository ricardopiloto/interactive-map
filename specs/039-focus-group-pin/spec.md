# Feature Specification: Focus Group Pin

**Feature Branch**: `039-focus-group-pin`  
**Created**: 2026-08-04  
**Status**: Draft  
**Input**: User description: "Agora vamos adicionar um botão na GUI para que o usuário possa clicar e ser direcionado para o pin do grupo (centralizar o pin na tela)"

## Clarifications

### Session 2026-08-04

- Q: Where should the focus-group control be placed on the main map UI? → A: Alongside the existing map zoom controls (+/−/reset)
- Q: When no group position exists, should the control be hidden, disabled, or show a warning? → A: Hide the control when no group position exists

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Locate the party from anywhere on the map (Priority: P1)

A player or GM has panned/zoomed away from the party marker and wants to quickly bring the group pin back to the center of the map view without hunting for it manually.

**Why this priority**: Core value of the feature — one-click return to the party location.

**Independent Test**: With the group visible on the map and the viewport elsewhere, activate the control and confirm the group pin ends centered in the visible map area.

**Acceptance Scenarios**:

1. **Given** the campaign map is showing and a group position exists, **When** the user activates the “focus group” control, **Then** the map view animates so the group pin is centered in the visible map area within about one second.
2. **Given** the group pin is already near the center of the view, **When** the user activates the control again, **Then** the view still settles with the group pin centered (no error; may be a short or no-op animation).

---

### User Story 2 - Control is discoverable and safe when group is missing (Priority: P2)

Users should find the control without opening nested menus, and the UI must not break if the group position is unavailable.

**Why this priority**: Usability and robustness without blocking the primary story.

**Independent Test**: Inspect the main map screen for the control; simulate missing group data and confirm the control is absent and the map remains usable.

**Acceptance Scenarios**:

1. **Given** a group position exists, **When** the user views the main map screen (player or GM), **Then** a dedicated control to focus the group is visible alongside the map zoom controls, without requiring a specific side-menu tab.
2. **Given** no group position is available, **When** the user views the map, **Then** the focus-group control is not shown and the map remains fully usable (no blank screen, no error dialog).

---

### Edge Cases

- Group marker temporarily not rendered (e.g. overlay mode that hides lore markers): activating focus does nothing harmful; prefer no-op until the marker is visible again.
- User triggers focus while already animating a previous focus: the latest request wins; view ends on the group pin.
- Very high or very low zoom before focus: after focus, zoom settles at a comfortable level comparable to focusing a location pin (party readable, map still usable).
- Mobile / narrow viewport: group pin still lands in the center of the visible map region (not under an opaque panel if the map area itself is the transform target).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST provide a clear control alongside the existing map zoom controls (+/−/reset) that focuses the party/group pin (label or accessible name indicating “go to group” / equivalent in Portuguese UI copy).
- **FR-002**: Activating the control MUST pan (and adjust zoom as needed) so the group pin is centered in the visible map viewport.
- **FR-003**: The focus transition MUST complete in under about one second for typical maps (same comfort bar as location-pin focus).
- **FR-004**: The control MUST be available to both players and GMs whenever a group position exists.
- **FR-005**: When no group position exists, the control MUST be hidden (not shown disabled); the map MUST remain usable.
- **FR-006**: Focusing the group MUST NOT open unrelated detail panels unless the product already does so for equivalent “locate on map” actions; default is view-only recenter (no forced modal).
- **FR-007**: The control MUST remain usable after the user has freely panned/zoomed away from the party.

### Key Entities

- **Group position**: The single party marker on the campaign map (coordinates + display form).
- **Map viewport**: The visible map area the user sees; focus targets centering within this area.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual checks, after activating the control from a panned-away view, the group pin appears visually centered in the map viewport in ≤ 1 second in ≥ 95% of trials.
- **SC-002**: 100% of testers (player and GM roles) can locate and use the control in the map zoom control cluster without being told which side-menu tab to open.
- **SC-003**: With no group data, the map loads and remains interactive; the focus-group control is not visible and no crash or blocking error occurs.
- **SC-004**: After focus, the group pin remains readable at the settled zoom (comparable comfort to focusing a location pin).

## Assumptions

- There is at most one party/group pin on the campaign map.
- “Centralizar o pin na tela” means center within the map viewport (the interactive map surface), not necessarily the full browser window if chrome (side menu, bars) overlays the page.
- Focus behavior and zoom comfort match the existing “focus location pin from the menu” experience unless product copy distinguishes them.
- Portuguese UI labels are preferred for user-facing text (e.g. “Ir ao grupo” / “Centralizar grupo”).
- Digitizer or other full-screen tools that replace the campaign map are out of scope; the control lives on the main campaign map screen, in the same control cluster as zoom.
- The focus-group control is not placed in the page header, legend, or Grupo side-menu tab as the primary entry point.
- A disabled-but-visible button and an on-click warning are rejected in favor of hiding the control when the group is absent.

## Out of Scope

- Auto-follow / continuous tracking of the group while the GM repositions it.
- Focusing arbitrary locations from this same button (location focus remains a separate flow).
- Changing how the group pin looks or where it is stored.
