# Implementation Plan: Fix NPC Portrait Expand Sizing

**Branch**: `057-fix-npc-portrait-expand` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/057-fix-npc-portrait-expand/spec.md`

## Summary

Fix the expanded NPC portrait in the side menu so the image box **shrink-to-fits** the portrait aspect ratio (no fixed 110px crop), with **max-height ≈ 50vh** so the layout/screen stay usable. Collapsed circular thumbnail unchanged. Frontend-only CSS/markup in `SideMenu` (+ small `ImageSlot` fit override if needed).

## Technical Context

**Language/Version**: TypeScript, React 19  
**Primary Dependencies**: Existing `SideMenu`, `ImageSlot`  
**Storage**: N/A  
**Testing**: Manual visual quickstart (desktop + ~375px)  
**Target Platform**: Web (desktop + narrow sidebar / mobile)  
**Project Type**: Frontend UI fix in monorepo web app  
**Performance Goals**: N/A (static layout)  
**Constraints**: No map/routes changes; no lightbox; FR-001a shrink-to-fit; FR-003 ≤50vh  
**Scale/Scope**: Side menu NPC expanded portrait only  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder — Spec Kit norms.

- Clarified shrink-to-fit + 50vh cap: **PASS**
- Screen must not break: **PASS**
- Scope limited to NPC expand portrait: **PASS**

**Post-Phase 1**: Unchanged — UI contract only.

## Project Structure

### Documentation (this feature)

```text
specs/057-fix-npc-portrait-expand/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-npc-portrait-expand.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/components/sidebar/SideMenu.tsx    # expanded portrait props/class
frontend/src/components/sidebar/SideMenu.css    # natural size + max-height 50vh
frontend/src/components/media/ImageSlot.css     # optional override for natural/contain in context
# Thumbnail (collapsed) stays inline 40×40 circle — do not change sizing behavior
```

**Structure Decision**: Frontend-only; prefer SideMenu-scoped CSS over rewriting ImageSlot globally.

## Complexity Tracking

> None.
