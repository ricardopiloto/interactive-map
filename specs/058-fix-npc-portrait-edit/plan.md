# Implementation Plan: Fix NPC Portrait in Edit Mode

**Branch**: `058-fix-npc-portrait-edit` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/058-fix-npc-portrait-edit/spec.md`

## Summary

Fix the GM **NPC create/edit dialog** portrait `ImageSlot`: remove fixed `height: 110` + cover crop; apply the same **shrink-to-fit** + **`max-height: 50vh`** policy as 057, scoped to the dialog so upload remains editable and the modal stays usable. Local form image deferred. Frontend-only.

## Technical Context

**Language/Version**: TypeScript, React 19  
**Primary Dependencies**: `NpcFormDialog` in `NpcAdminList.tsx`, `ImageSlot`  
**Storage**: N/A  
**Testing**: Manual visual quickstart (GM edit dialog)  
**Target Platform**: Web (desktop + narrow)  
**Project Type**: Frontend UI fix  
**Performance Goals**: N/A  
**Constraints**: Keep editable upload; ≤50vh; no regression of 057; LocalForm out of scope  
**Scale/Scope**: One dialog portrait slot + CSS  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder — Spec Kit norms.

- Align with 057 sizing policy: **PASS**
- Dialog must remain usable: **PASS**
- Scope = NPC edit only: **PASS**

**Post-Phase 1**: Unchanged — UI contract only.

## Project Structure

### Documentation (this feature)

```text
specs/058-fix-npc-portrait-edit/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-npc-portrait-edit.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/components/admin/NpcAdminList.tsx   # NpcFormDialog ImageSlot class/fit
frontend/src/styles/nocturne.css                   # OR admin-scoped CSS for .npc-form__portrait
# Prefer a small rule block next to dialog styles in nocturne.css, or NpcAdminList-adjacent CSS if one exists
# Do not change SideMenu 057 rules; do not change LocalFormDialog
```

**Structure Decision**: Mirror 057 pattern with a dialog-scoped class (e.g. `npc-form__portrait`); keep ImageSlot editable.

## Complexity Tracking

> None.
