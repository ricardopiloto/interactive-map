# Research: Focus Group Pin

**Feature**: `039-focus-group-pin` | **Date**: 2026-08-04

## 1. Reuse location-pin focus vs new camera API

**Decision**: Reuse `zoomToElement` with the same `FOCUS_SCALE` (2) and `FOCUS_ANIM_MS` (400) as side-menu location focus.

**Rationale**: Spec requires comfort comparable to location-pin focus (FR-003, SC-004). Pattern already proven in `PinFocusController`; avoids inventing pan math.

**Alternatives considered**:
- `setTransform` / `centerView` with raw x/y — more code, easy to desync with marker size/anchor
- Instant jump without animation — fails “directed to” UX feel and SC-001 timing narrative

## 2. How to identify the party DOM node

**Decision**: Assign a stable element id on the party marker (canonical: `map-party`), mirroring `map-pin-{localId}`.

**Rationale**: `zoomToElement` resolves by id/DOM node; party currently has class + title only, no id.

**Alternatives considered**:
- Query `.campaign-map__party` — brittle if multiple matches or legend icons share naming
- Focus via percent coordinates without DOM — bypasses library helpers

## 3. Focus request shape

**Decision**: Generalize focus to support group OR local (e.g. discriminated union / optional `target: 'local' | 'group'` with `localId` only for local), still driven by a `nonce` so repeat clicks re-fire. Clear after apply (same as 016) to avoid re-zoom on unrelated re-renders.

**Rationale**: One controller, one animation path; button and menu share behavior.

**Alternatives considered**:
- Separate `groupFocusNonce` prop from MapPage — works but duplicates clear/apply plumbing
- Imperative ref method `focusGroup()` on CampaignMap — possible, less React-idiomatic with current codebase

## 4. Button placement & visibility

**Decision**: Render the control inside `campaign-map__controls` next to +/−/1:1; render only when `grupo != null`. Portuguese accessible name (e.g. `aria-label="Ir ao grupo"`); icon or short glyph acceptable if label is accessible.

**Rationale**: Clarifications Session 2026-08-04 (placement A, hide A).

**Alternatives considered**: Header bar, legend, Grupo tab — rejected by clarify.

## 5. Behavior when party not in DOM

**Decision**: No-op if element missing (`hideLorePins`, race before mount). Do not show errors. If `grupo` exists but lore is hidden, prefer still **hiding** the button when the party is not renderable, OR keep button but no-op — prefer hide when party would not render (same condition as party JSX: `!hideLorePins && grupo`).

**Rationale**: Spec edge case + FR-005 spirit (don’t offer a useless control).

## 6. Side effects (selection / modal)

**Decision**: Focus only — do not open PinModal, do not force Grupo tab, do not change `selectedLocalId`.

**Rationale**: FR-006 / clarification defaults.

## 7. Backend

**Decision**: No changes. Group position already provided by campaign data.

## 8. CHANGELOG

**Decision**: Document under next patch (e.g. 0.6.5) when implementing — UX control addition.
