# Implementation Plan: Apply Portrait Sizing Policy to Locals

**Branch**: `059-fix-local-image-sizing` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/059-fix-local-image-sizing/spec.md`

## Summary

Apply the same **shrink-to-fit** + **`max-height: 50vh`** image policy from 057/058 to Local surfaces that still use fixed-height `ImageSlot` (~150px + cover crop): **PinModal** (player/GM detail) and **LocalFormDialog** (GM create/edit). Frontend-only; mirror NPC class pattern (`npc-form__portrait`).

## Technical Context

**Language/Version**: TypeScript, React 19  
**Primary Dependencies**: `PinModal.tsx`, `LocalFormDialog.tsx`, `ImageSlot`, CSS (PinModal.css and/or nocturne.css)  
**Storage**: N/A  
**Testing**: Manual visual quickstart (pin modal + Local edit dialog)  
**Target Platform**: Web (desktop + narrow)  
**Project Type**: Frontend UI fix  
**Performance Goals**: N/A  
**Constraints**: Editable upload in form; ≤50vh; no regression of 057/058; side-menu Locais list unchanged; map/digitizer out of scope  
**Scale/Scope**: Two Local image slots + CSS classes  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder — Spec Kit norms.

- Align with 057/058 sizing policy: **PASS**
- Modal/dialog remain usable: **PASS**
- Scope = Local pin modal + Local edit only: **PASS**

**Post-Phase 1**: Unchanged — UI contract only; no schema/API.

## Project Structure

### Documentation (this feature)

```text
specs/059-fix-local-image-sizing/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-local-image-sizing.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/components/common/PinModal.tsx          # ImageSlot: remove height 150; class + fit contain
frontend/src/components/common/PinModal.css          # OR nocturne: .pin-modal__image rules
frontend/src/components/admin/LocalFormDialog.tsx    # ImageSlot: remove height 150; class + fit contain; empty modifier
frontend/src/styles/nocturne.css                     # Prefer form rules here (mirror .npc-form__portrait)
# Do not change SideMenu NPC 057 / NpcForm 058 rules; do not change map ImageSlot
```

**Structure Decision**: Mirror 058 — dialog/form-scoped classes (`local-form__image`, `local-form__image--empty`) in nocturne.css; pin-modal-scoped class (`pin-modal__image`) in PinModal.css or nocturne. Keep ImageSlot editable only in the form.

## Complexity Tracking

> None.
