# UI Contract: NPC Portrait Expand Sizing

**Feature**: `057-fix-npc-portrait-expand`  
**Date**: 2026-08-05  
**Surface**: Side menu → tab Personagens → NPC card expanded body

## Collapsed (unchanged)

- Circle thumbnail ~40×40 next to name/status.
- MUST NOT inherit expanded portrait sizing.

## Expanded + has `retrato_url`

| Property | Required |
|----------|----------|
| Width | 100% of card body |
| Height | Auto (follows image), shrink-to-fit |
| Max height | `50vh` |
| Visibility | Entire image recognizable (contain), not fixed-height cover crop |
| Overflow | No page horizontal scroll; menu vertical scroll OK |

## Expanded + no portrait

- No broken empty image box (omit image block as today).

## Non-goals

- Lightbox / fullscreen zoom
- Admin upload UI redesign
- Map / routes / digitizer

## Acceptance mapping

| Spec | UI |
|------|-----|
| FR-001 / FR-001a | Auto height shrink-to-fit |
| FR-002 | Width constrained to card |
| FR-003 / SC-003 | max-height 50vh |
| FR-005 | Thumbnail unchanged |
| SC-002 | No horizontal page scroll |
