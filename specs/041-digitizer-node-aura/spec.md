# Feature Specification: Digitizer Node Hit Aura

**Feature Branch**: `041-digitizer-node-aura`  
**Created**: 2026-08-04  
**Status**: Draft  
**Input**: User description: "Vamos reduzir ainda mais a área clicável do node, como diminuimos o tamanho dele, precisamos diminuir a área clicável também. Para facilitar a visualização na tela de Rede de Rotas, deixe essa área clicável com uma \"aura\", dessa maneira o GM consegue ver qual é a área do node."

## Clarifications

### Session 2026-08-04

- Q: Should origin and finish snap sizes differ, or match one aura? → A: Single zone per node — origin and finish use the same radius as the visible aura

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Smaller, honest click target (Priority: P1)

The GM works on **Rede de rotas** with compact nodes. The interactive pick zone around each node is tighter than before so nearby nodes and map clicks are less likely to grab the wrong node, and the zone matches the smaller visual disk better.

**Why this priority**: Core request — shrink clickable area after the size reduction.

**Independent Test**: On Rede de rotas with several close nodes, attempt picks near but outside the new zone; wrong-node grabs decrease vs previous generous target.

**Acceptance Scenarios**:

1. **Given** the GM is on Rede de rotas with at least two nodes near each other, **When** they click clearly outside a node’s interactive zone but still where the old larger zone would have hit, **Then** that node is not selected / snapped.
2. **Given** the GM clicks inside a node’s interactive zone (as shown by its aura), **When** the click is meant to pick that node as origin **or** as segment finish, **Then** that node is used — both actions share the same zone size.

---

### User Story 2 - See the clickable zone (Priority: P1)

While editing the network, the GM sees a clear **aura** around each node that shows the interactive area, so they know where a click will register without guessing.

**Why this priority**: Equal priority for usability — visibility of the smaller hit zone.

**Independent Test**: Open Rede de rotas; every node shows a visible aura; aura extent matches where clicks succeed.

**Acceptance Scenarios**:

1. **Given** Rede de rotas is open with nodes present, **When** the GM views the map without hovering a specific control, **Then** each node displays a visible aura marking its interactive zone.
2. **Given** the aura of a node, **When** the GM clicks inside the aura, **Then** interaction targets that node; **When** they click outside all auras (and not on another control), **Then** no node is picked via that zone.
3. **Given** a node is the active/selected origin while drawing a segment, **When** the GM views it, **Then** the active state remains distinguishable from the default aura (aura does not hide “this is the current origin”).

---

### Edge Cases

- Zoom in/out: aura and hit zone stay aligned with the node on screen (same comfort as fixed marker size — zone does not drift off the disk).
- Dense clusters: smaller zones reduce overlap; if two auras still overlap, the nearest / topmost node wins consistently (same as today’s nearest-neighbor spirit).
- Empty network: no auras; no errors.
- Campaign map (player/GM lore map) pins and party marker: **out of scope** — aura and tighter hit zone apply only on Rede de rotas.
- Touch / coarse pointer: smaller zone is intentional; GM can zoom in; no separate mobile enlargement required for this feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On Rede de rotas, each network node MUST have a reduced interactive (click/snap) zone compared to the pre-change behavior, sized in proportion to the already-reduced visual node.
- **FR-002**: The interactive zone MUST be visually indicated by an **aura** around the node so the GM can see the clickable/pickable area at a glance.
- **FR-003**: The aura’s apparent extent MUST match the effective interactive zone (what you see is what you can hit).
- **FR-003a**: Origin pick and finish/snap pick MUST use the **same** interactive radius per node (no more-generous origin vs tighter finish); that radius MUST equal the visible aura.
- **FR-004**: Auras MUST be visible for nodes on Rede de rotas during normal editing (not only after a hover), for all placed nodes.
- **FR-005**: Active/selected node styling MUST remain clearly distinct from the default aura.
- **FR-006**: Segment drawing and node placement flows MUST continue to work; only the size/visibility of the pick zone changes.
- **FR-007**: Lore map pins and party marker hit targets MUST NOT be changed by this feature.

### Key Entities

- **Network node (waypoint)**: Point on Rede de rotas with a visual disk and an interactive zone.
- **Aura**: Visual ring/halo that depicts the interactive zone of a node for the GM.
- **Interactive zone**: The area where a pointer interaction selects or snaps to that node.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a side-by-side or before/after check, the interactive zone radius (or equivalent area) is ≤ ~70% of the previous digitizer pick/hit size used after the last marker shrink (clearly tighter; not a trivial 1–2% change).
- **SC-002**: 100% of visible nodes on Rede de rotas show an aura in a spot-check of ≥ 10 nodes.
- **SC-003**: In ≥ 9/10 scripted clicks inside an aura, the intended node is picked; in ≥ 9/10 clicks just outside that aura (and outside others), that node is not picked.
- **SC-004**: Active-origin node remains identifiable vs inactive nodes with auras in a 5-person informal GM check (≥ 4/5 agree).

## Assumptions

- “Área clicável” includes both direct node hits and proximity snap used when finishing/starting segments on Rede de rotas; those mechanisms stay consistent with the visible aura.
- Asymmetric origin-vs-finish snap radii are rejected; one aura = one pick radius for all node targeting on Rede de rotas (Clarifications 2026-08-04).
- Aura is a presentation aid for GMs on Rede de rotas only; players never see this screen’s auras in normal play.
- Exact color/opacity of the aura follows the existing Nocturne / digitizer palette (subtle, not louder than the active-origin highlight).
- Further shrinking of the **painted** disk itself is optional; primary ask is hit zone + aura. If the disk stays at current size, the aura may extend slightly beyond the disk fill so the zone remains readable.

## Out of Scope

- Changing campaign-map local pins or party marker hit areas.
- Auto-layout / moving nodes to reduce density.
- Player-facing route planner UI.
- Changing segment line thickness or finish-zone rules unrelated to node pick radius (except where snap must match the new aura).
- Keeping a larger origin-snap than finish-snap (superseded by Clarifications 2026-08-04).
