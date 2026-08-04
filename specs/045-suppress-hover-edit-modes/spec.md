# Feature Specification: Suppress Segment Hover in Edit Modes

**Feature Branch**: `045-suppress-hover-edit-modes`  
**Created**: 2026-08-04  
**Status**: Draft  
**Input**: User description: "Se estiver em modo traçar segment ou novo nó, não destacar o segment-hover"

## Clarifications

### Session 2026-08-04

- Q: In edit modes, suppress only hover UI or also disable segment-hover hit targets? → A: Both — hide presentation **and** disable hit targets (Option B)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - No segment hover while placing or drawing (Priority: P1)

On **Rede de rotas**, when the GM is in **Novo nó** or **Traçar segmento**, the pointer is busy with placement and drawing. Segment hover identity (tooltip, list highlight, stroke emphasis from feature 044) must stay off so it does not distract or fight with drawing midpoints / placing nodes.

**Why this priority**: Direct request — hover chrome conflicts with edit modes.

**Independent Test**: Enter Traçar segmento or Novo nó; move over saved segments; expect no hover tooltip, no list row highlight, no hovered stroke emphasis. Leave those modes (idle); hover works again as in 044.

**Acceptance Scenarios**:

1. **Given** the GM is in **Traçar segmento**, **When** they move the pointer over a saved segment, **Then** segment-hover identity UI does **not** appear (no map tooltip/label, no Segmentos list highlight, no hover stroke emphasis).
2. **Given** the GM is in **Novo nó**, **When** they move the pointer over a saved segment, **Then** segment-hover identity UI does **not** appear.
3. **Given** the GM is in idle (neither Novo nó nor Traçar segmento), **When** they hover a saved segment, **Then** segment-hover identity behaves as today (044: tooltip + list highlight + stroke emphasis).
4. **Given** the GM had a segment hover active in idle, **When** they switch into Novo nó or Traçar segmento, **Then** any active hover presentation is cleared immediately.
5. **Given** the GM is in Novo nó or Traçar segmento, **When** they click near a saved segment (where the idle hover hit zone would be), **Then** the click serves placement/drawing (place node, midpoint, or finish snap) and is not consumed by segment-hover hit targets.

---

### Edge Cases

- Switching modes mid-hover: clear hover state when entering edit modes.
- In edit modes, segment-hover hit targets are inactive so wide hover zones do not intercept placement/drawing clicks (Clarifications 2026-08-04).
- Draft polyline while drawing: still not a saved-segment hover target (unchanged from 044); additionally all saved-segment hover is suppressed for the whole draw/place mode.
- Leaving edit mode back to idle: hover (UI + hit) becomes available again without requiring a page reload.
- Campaign map / planner: out of scope.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: While **Traçar segmento** is active, the product MUST NOT show segment-hover presentation for saved segments (tooltip/label, list-row highlight, hover stroke emphasis).
- **FR-002**: While **Novo nó** is active, the product MUST NOT show segment-hover presentation for saved segments.
- **FR-003**: While neither of those modes is active (idle), saved-segment hover MUST continue to work per feature 044.
- **FR-004**: Entering Novo nó or Traçar segmento MUST clear any currently shown segment-hover presentation.
- **FR-005**: Suppression MUST apply to all hover surfaces together (map + list + stroke), not only one of them.
- **FR-006**: Lore campaign map and Calcular rota MUST NOT change for this feature.
- **FR-007**: While Novo nó or Traçar segmento is active, segment-hover hit targets MUST be disabled (not only hidden), so those zones do not intercept pointer for placement/drawing (Clarifications 2026-08-04).
- **FR-008**: When returning to idle, segment-hover hit targets and presentation MUST become available again as in feature 044.

### Key Entities

- **Edit modes**: Novo nó (place node) and Traçar segmento (draw segment) on Rede de rotas.
- **Segment-hover presentation**: The 044 identity UI (map tooltip/label, list highlight, stroke emphasis).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In ≥ 10 pointer passes over saved segments while in Traçar segmento, segment-hover UI appears 0 times.
- **SC-002**: In ≥ 10 pointer passes over saved segments while in Novo nó, segment-hover UI appears 0 times.
- **SC-003**: In idle, a smoke test of ≥ 5 saved-segment hovers still shows identity UI (≥ 9/10 trials), confirming 044 not broken.
- **SC-004**: Switching from idle hover into an edit mode clears hover UI within one interaction (no sticky tooltip/highlight).
- **SC-005**: In edit modes, scripted clicks intended for place/draw near saved segments succeed as place/draw actions (not blocked by segment-hover hit) in ≥ 9/10 trials.

## Assumptions

- “Não destacar o segment-hover” means suppress the full 044 hover package (tooltip, list highlight, and stroke emphasis), not only visual stroke.
- In edit modes, hit targets for segment-hover are also disabled (Clarifications 2026-08-04 / Option B).
- Idle (default) keeps hover; only the two named tool modes suppress it.
- No change to how segments are deleted (list Apagar) or to snap/aura behavior.

## Out of Scope

- Changing hover content or hit-target size from 044.
- Suppressing hover in other GM screens.
- Delete-on-map or new edit tools.
