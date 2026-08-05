# Feature Specification: Route Sort Preference

**Feature Branch**: `046-route-sort-preference`  
**Created**: 2026-08-04  
**Status**: Draft  
**Input**: User description: "no Calcular Rota, vamos adicionar uma opção para o usuário selecionar como ele quer ordenar as rotas, se ele quer da mais barata primeiro ou da mais rápida. Lembrando que temos que trazer todas as 6 primeiras opções possíveis dado o filtro que o usuário selecionar (+ barata ou + rapida)"

## Clarifications

### Session 2026-08-04

- Q: What cost defines “mais barata”? → A: Lower **custo Dentro (bp)** first; Fora only as tie-breaker (Option A)
- Q: When sort preference changes while results are showing? → A: **Recalculate automatically** if De/Para are valid (Option A)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose cheapest or fastest ordering (Priority: P1)

On **Calcular rota**, the user can choose whether results are ordered by **mais barata** or **mais rápida**. The list shows up to the **first 6** routes that best match that choice (not merely a re-label of an unrelated set). The top result is selected/highlighted by default.

**Why this priority**: Direct request — sort preference drives which alternatives matter.

**Independent Test**: Same De/Para; switch preference and recalculate; order and which six appear match the criterion; UI control is clear before/with calculate.

**Acceptance Scenarios**:

1. **Given** De/Para válidos and preference **mais rápida**, **When** the user calculates, **Then** up to **6** routes appear ordered from fastest to slowest, and the fastest is selected first.
2. **Given** the same De/Para and preference **mais barata**, **When** the user calculates, **Then** up to **6** routes appear ordered from lowest **custo Dentro** to highest, and the cheapest-Dentro route is selected first.
3. **Given** fewer than 6 possible distinct routes, **When** the user calculates with either preference, **Then** all available routes are shown, still ordered by the chosen preference (no empty placeholders).
4. **Given** a preference already set and results showing, **When** the user switches preference, **Then** the product recalculates automatically and the result set/order reflect the **new** preference (top 6 for that criterion).
5. **Given** preference **mais rápida**, **When** results appear, **Then** the first item is labeled or clearly identifiable as the fastest (existing “mais rápida” cue may adapt when preference is cheapest — e.g. “mais barata” on the first item).

---

### User Story 2 - Preference is easy to set before calculating (Priority: P2)

The user can see and change the sort preference in the Calcular rota panel without hunting; default remains **mais rápida** so existing habit is preserved until they opt into cheapest.

**Why this priority**: Discoverability; safe default.

**Independent Test**: Open panel; see preference control; default is mais rápida; change to mais barata and calculate.

**Acceptance Scenarios**:

1. **Given** a fresh Calcular rota panel, **When** the user looks at controls, **Then** they can select **mais rápida** or **mais barata** before calculating.
2. **Given** no prior change, **When** they calculate without touching the control, **Then** ordering behaves as **mais rápida** (compatible with prior product behavior).

---

### Edge Cases

- No path: existing empty/error messaging; preference irrelevant.
- Same origin and destination: unchanged rejection/empty behavior.
- Ties on the primary criterion: stable secondary keys (see Assumptions) so order is deterministic.
- Changing preference while a plan is showing: **recalculate automatically** with current De/Para/ritmo/velocidade when inputs are valid (Clarifications 2026-08-04); do not leave a stale top-6 from the other criterion.
- Costs Dentro vs Fora: both remain visible on each row; “mais barata” ranks by **custo Dentro** (Clarifications 2026-08-04); Fora is tie-breaker only.
- Digitizer / Rede de rotas authoring: out of scope.
- Map overlay still highlights the selected route among the returned set.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Calcular rota MUST offer a user-visible preference between ordering by **mais rápida** and **mais barata**.
- **FR-002**: Default preference MUST be **mais rápida**.
- **FR-003**: When preference is **mais rápida**, the product MUST return up to the **6** best routes by travel time (fastest first).
- **FR-004**: When preference is **mais barata**, the product MUST return up to the **6** best routes by **custo Dentro (bp)** ascending (cheapest Dentro first); **custo Fora** MUST be used only as a secondary sort key (Clarifications 2026-08-04).
- **FR-005**: The returned set MUST be the top candidates **for the selected preference**, not only a client-side reorder of a fixed time-only discovery set when that would omit cheaper (or faster) alternatives that belong in the top 6 for the other criterion.
- **FR-006**: If fewer than 6 routes exist, MUST return all of them, ordered by the preference.
- **FR-007**: The first result MUST be auto-selected / highlighted for map overlay (same spirit as today).
- **FR-008**: Each result MUST still show distance, time, types, and both Dentro/Fora costs as today.
- **FR-009**: Changing preference while a plan is displayed (or De/Para are already valid) MUST recalculate automatically with the current De/Para/ritmo/velocidade so the top-6 list matches the new filter (Clarifications 2026-08-04). If required inputs are missing/invalid, MUST NOT invent a plan; keep or clear results consistently with existing validation.
- **FR-010**: Rede de rotas digitizer and lore map pins MUST NOT change except as needed to consume the new preference for planning.

### Key Entities

- **Sort preference**: `mais_rapida` | `mais_barata` (user choice for Calcular rota).
- **Route alternative**: One distinct path option with time, distance, costs, geometry.
- **Top-6 result set**: At most six alternatives ranked for the active preference.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With ≥ 6 distinct alternatives available, each preference returns exactly **6** routes in the correct order for that preference in ≥ 9/10 scripted De/Para trials.
- **SC-002**: Switching from mais rápida to mais barata (same De/Para) changes which route is first whenever the cheapest and fastest routes differ (verified on a prepared network pair).
- **SC-003**: Default preference smoke test matches prior “mais rápida first” UX without requiring the user to change the control.
- **SC-005**: With a valid plan on screen, changing preference triggers an updated list matching the new criterion without requiring a separate Calcular click (informal trial).

## Assumptions

- “6 primeiras opções” means **at most six** distinct route alternatives for the chosen ranking; not six arbitrary paths.
- **Mais barata** ranks primarily by **custo Dentro (bp)** ascending (Clarifications 2026-08-04 / Option A), then **custo Fora**, then time, then distance for ties. Both costs remain displayed.
- **Mais rápida** ranks primarily by **tempo** ascending, then distance, then Dentro cost for ties.
- Discovery/search must respect the active preference so the top 6 are meaningful for that objective (may supersede today’s time-only path enumeration + sort).
- Current product may return fewer than 6 (e.g. historical K=5); this feature sets the cap to **6**.
- Preference applies to Calcular rota for players and GM using that panel.

## Out of Scope

- Sorting by distance only, or by Fora as the primary cheapness key.
- Changing Coach/Balsa tariff tables.
- Showing more than 6 alternatives in the default UI.
- Editing the road network geometry in this feature.
