# Research: Fix NPC Portrait in Edit Mode

**Feature**: `058-fix-npc-portrait-edit` | **Date**: 2026-08-05

## 1. Root cause

**Decision**: Same class of bug as 057, different surface.

**Rationale**: `NpcFormDialog` in `NpcAdminList.tsx` uses `ImageSlot` with `style={{ width: '100%', height: 110 }}` and default `fit='cover'`, so the preview crops almost the entire portrait.

**Alternatives considered**: Reuse 057’s `.side-menu__npc-portrait` class in the dialog — rejected (wrong naming / coupling); duplicate the sizing rules under a dialog-specific class.

## 2. Sizing policy

**Decision**: Identical to 057 for images with `src`:

- `width: 100%`; `height: auto`; `max-height: 50vh`
- `img`: `height: auto`; `max-height: 50vh`; `object-fit: contain`
- `fit="contain"` on ImageSlot
- Shrink-to-fit (no empty frame stuck at 50vh)

**When empty (placeholder / editable drop zone)**: keep a modest **min-height** (e.g. ~110–140px) so the upload target stays obvious; min-height applies only when there is no image (via `:not(:has(img))` or a modifier class `npc-form__portrait--empty`). Prefer `:has(img)` / absence: `.npc-form__portrait:not(:has(img)) { min-height: 110px; }` with graceful fallback of always allowing min-height that collapses when img sets height — simplest: `min-height: 110px` on empty slot only via class toggled when `!retrato_url`.

**Rationale**: Spec FR-007; Assumptions on placeholder.

## 3. Where to put CSS

**Decision**: Add rules to `frontend/src/styles/nocturne.css` near `.dialog` / `.dialog__body` (dialog already styled there), **or** a tiny `NpcFormDialog.css` imported from `NpcAdminList.tsx`. Prefer **nocturne.css** to avoid new file churn unless dialog CSS is already split.

**Rationale**: Existing dialog tokens live in nocturne; SideMenu kept its own CSS for 057.

## 4. Non-goals

**Decision**: Do not change `LocalFormDialog` height 150; do not alter SideMenu 057; no API changes.

**Rationale**: Spec out of scope.
