# Research: Disc Portrait

**Feature**: `069-disc-portrait`  
**Date**: 2026-08-11

## 1. Crop vs contain in the disc

**Decision**: `object-fit: cover` + `object-position: center` + circular clip (`border-radius: 50%` + `overflow: hidden` on `.graph-node__disc`).

**Rationale**: Clarification A — fill the medallion; crop overflow. 58px discs look empty with letterbox (`contain`).

**Alternatives considered**:
- `object-fit: contain` (clarification B) — rejected.
- Cover on disc + contain in detail (clarification C) — detail already uses `ImageSlot` `fit="contain"`; disc-only cover is the same outcome as A without extra work.

## 2. Fallback when URL missing or image fails

**Decision**: Always render initials as the disc’s base layer. When `retrato_url` is set, overlay an `<img>` that covers the disc. `onError` hides the image (display none / remove), revealing initials. Empty or null URL → initials only.

**Rationale**: Spec FR-002 / edge case — never a blank disc. Layering avoids a flash-to-empty and needs no per-node React state beyond `onError`.

**Alternatives considered**:
- Conditional render img XOR initials — on load failure the disc goes empty until a state update.
- Default silhouette asset — out of spec.

## 3. Same asset as ficha / map

**Decision**: Use `personagem.retrato_url` as-is (same string already used by `RelacoesDetailPanel` / map NPC pin / `ImageSlot`). No new field, thumbnail endpoint, or resize API.

**Rationale**: FR-003. Browser scales the existing file; cover crop is CSS-only.

## 4. Visual states with a photo in the disc

**Decision**: Keep existing modifiers on `.graph-node` / `.graph-node__disc`. Grayscale (`--morto`) and node `opacity` (focus fade ~28%) apply to the whole disc, including the img. Halo (`--selected`) is `box-shadow` on the disc — still visible around the circle. PJ/NPC borders stay on the disc, not the image.

**Rationale**: FR-004. Avoid duplicating filters on the img.

## 5. Layout / edges

**Decision**: Do not change `DISC` (58), `discCenterFromNodePos` (067), or edge opacity constants (068).

**Rationale**: FR-006.

## 6. Seed portraits

**Decision**: Do not add seed images in this feature. Quickstart uses GM upload (or any existing DB portraits).

**Rationale**: Seed has no `retrato` today; shipping binary assets is out of scope. SC-001 sampling is a QA checklist, not a seed requirement.
