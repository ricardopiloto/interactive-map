# Feature Specification: Named Route Endpoints Only

**Feature Branch**: `040-named-route-endpoints`  
**Created**: 2026-08-04  
**Status**: Draft  
**Input**: User description: "No calculo de rodas, nós não vamos mostrar nós sem nome, dessa maneira não teremos a opção do usuário calcular rota de um local nomeado para um local sem nome."

## Clarifications

### Session 2026-08-04

- Q: Should unnamed endpoints be blocked only in the UI, or also rejected by the plan API? → A: UI only — De/Para hides unnamed nodes; plan API still accepts any waypoint id

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pick only named places for De/Para (Priority: P1)

A player or GM opens route calculation and chooses origin and destination. Only waypoints that have a usable name appear in the lists, so they cannot start or end a route on an unnamed network node.

**Why this priority**: Core request — prevent routes whose endpoints are unnamed nodes.

**Independent Test**: With a mix of named and unnamed waypoints in the network, open De/Para and confirm unnamed entries are absent; a named→named plan still completes.

**Acceptance Scenarios**:

1. **Given** the route network includes both named and unnamed waypoints, **When** the user opens the origin or destination picker in route calculation, **Then** only named waypoints appear as selectable options.
2. **Given** the user selects a named origin and a named destination that are connected (possibly via unnamed intermediate nodes), **When** they calculate the route, **Then** a valid plan is still returned as today.
3. **Given** an unnamed waypoint exists, **When** the user searches in the De/Para picker, **Then** that waypoint does not appear in results (including under fallback labels like a bare node id).

---

### User Story 2 - Unnamed nodes remain part of the network (Priority: P2)

Unnamed waypoints may still sit on the road network for digitizing and pathfinding; they simply are not offered as journey endpoints.

**Why this priority**: Preserves existing GM network work without forcing every junction to be named.

**Independent Test**: Route between two named endpoints whose shortest path crosses an unnamed junction still succeeds; GM digitizer still lists/edits all nodes.

**Acceptance Scenarios**:

1. **Given** two named endpoints connected only through one or more unnamed intermediate waypoints, **When** the user calculates the route, **Then** the plan succeeds and may traverse those intermediates.
2. **Given** the GM opens the route network editor (digitizer), **When** they view waypoints, **Then** unnamed nodes remain visible and editable (this feature does not hide them there).

---

### Edge Cases

- Waypoint with blank/whitespace name but linked to a location that has a name: treat as **named** (usable label = location name).
- Waypoint with neither its own name nor a linked location name: treat as **unnamed** — excluded from De/Para.
- Waypoint with only a linked location that itself has an empty name: treat as **unnamed**.
- After filtering, if fewer than two named waypoints exist: pickers may be sparse; calculation remains blocked or empty as today when origin/destination cannot be chosen — no crash.
- Previously saved UI state pointing at an unnamed id (if any): selection clears or is ignored; user must pick a named endpoint.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: In route calculation, origin and destination pickers MUST list only **named** waypoints.
- **FR-002**: A waypoint is **named** when it has a non-empty own name after trim, OR it is linked to a location that has a non-empty name after trim; otherwise it is **unnamed**.
- **FR-003**: Unnamed waypoints MUST NOT appear in De/Para options, search results, or as selectable endpoints for route calculation.
- **FR-004**: Pathfinding MUST still be allowed to traverse unnamed waypoints as intermediate graph nodes when computing routes between named endpoints.
- **FR-005**: GM route-network editing (digitizer / Rede) MUST continue to show and manage unnamed waypoints; this feature scopes only to route-calculation endpoint choice.
- **FR-006**: Users MUST NOT be able to select an unnamed waypoint as origin or destination via the normal route-calculation UI (De/Para pickers and search).
- **FR-007**: Server-side route planning NEED NOT reject unnamed endpoint ids for this feature; enforcement is the UI filter (Clarifications 2026-08-04).

### Key Entities

- **Waypoint (node)**: Network point; may have optional name and optional link to a campaign location.
- **Named waypoint**: Has a usable display name per FR-002.
- **Route calculation endpoints**: Origin and destination chosen in the travel/route planner UI.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a test network with at least 3 unnamed and 3 named waypoints, 100% of De/Para listed options are named (0 unnamed entries).
- **SC-002**: Using only the route-calculation UI (not raw API calls), testers cannot select an unnamed waypoint as origin or destination in a 5-try adversarial check (0 successful selections).
- **SC-003**: In ≥ 90% of trials where two named endpoints are path-connected only via unnamed intermediates, calculation still returns a usable plan.
- **SC-004**: GM digitizer still shows all waypoints including unnamed ones after this change (no regression in network editing visibility).

## Assumptions

- “Cálculo de rotas” / “calculo de rodas” means the player/GM travel route planner (De/Para), not the GM digitizer map of all nodes.
- Fallback labels such as “Nó {id}” count as unnamed presentation and must not appear in De/Para.
- Unnamed intermediates remain valid for distance/cost along the path; only endpoint eligibility changes.
- No requirement to rename existing unnamed nodes or to delete them from the database.
- API consumers outside this UI (if any) are out of scope unless they power the same De/Para lists; primary change is what users can choose in the planner.
- Plan/calculate API is not required to validate “named” endpoints in this feature; defense-in-depth server rejection is explicitly deferred.

## Out of Scope

- Forcing all waypoints to have names.
- Removing unnamed nodes from the digitizer or from stored segments.
- Changing travel cost formulas or speed options.
- Hiding unnamed nodes on the campaign lore map (location pins).
- Rejecting unnamed origem/destino on the route-plan API (deferred; UI filter only).
