# Research: Fix NPC Portrait Expand Sizing

**Feature**: `057-fix-npc-portrait-expand` | **Date**: 2026-08-05

## 1. Root cause

**Decision**: Treat as layout bug in expanded NPC body.

**Rationale**: `SideMenu.tsx` renders expanded portrait as `ImageSlot` with `style={{ width: '100%', height: 110 }}` and default `fit='cover'`. `ImageSlot.css` forces `img { width/height: 100%; object-fit: cover }`, so the box never follows image aspect — portraits look cropped/“broken.”

**Alternatives considered**:
- Only switch to `fit='contain'` but keep height 110 — still fixed box; letterboxing inside 110px; does not satisfy shrink-to-fit (clarify Q1)
- Fullscreen lightbox — out of scope

## 2. Shrink-to-fit + 50vh cap

**Decision**:

- Expanded portrait container: `width: 100%`; `height: auto`; `max-height: 50vh`.
- Image: `width: 100%`; `height: auto`; `max-height: 50vh`; `object-fit: contain`; `object-position: center`.
- Resulting box height = rendered image height (≤ 50vh) — no empty frame at 50vh when image is shorter (clarify Q1/Q2).
- Width never exceeds card content width (`max-width: 100%`).

**Rationale**: Locked clarifications; SC-002/SC-003.

**Alternatives considered**:
- Always reserve 50vh box — rejected in clarify Q1
- Fixed 240px max — rejected in clarify Q2

## 3. ImageSlot vs plain img

**Decision**: Keep `ImageSlot` for consistency, but drive expanded portrait via a SideMenu class (e.g. `side-menu__npc-portrait`) + `fit="contain"`, and **override** ImageSlot’s `height: 100%` / cover rules under that class in `SideMenu.css` (higher specificity). Do **not** change global ImageSlot behavior for admin uploads or circle thumbnails.

**Rationale**: Minimizes blast radius; FR-005 thumbnail stays `circle` + 40×40 inline styles.

**Alternatives considered**:
- New `fit="natural"` prop on ImageSlot — clean but wider API change; optional if overrides get messy
- Replace with raw `<img>` — acceptable fallback if ImageSlot fights too hard

## 4. Overflow / screen safety

**Decision**: Rely on existing side-menu vertical scroll; ensure no `min-height` that forces page horizontal overflow; `overflow: hidden` on portrait wrapper OK if image still fully visible via scaling (contain within max).

**Rationale**: FR-002/004; US2.

## 5. Backend

**Decision**: No API/schema changes.

**Rationale**: Presentation only.
