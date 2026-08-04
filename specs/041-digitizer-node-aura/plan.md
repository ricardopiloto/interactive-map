# Implementation Plan: Digitizer Node Hit Aura

**Branch**: `041-digitizer-node-aura` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/041-digitizer-node-aura/spec.md`

## Summary

On **Rede de rotas**, shrink node pick/snap to a single smaller radius (origin = finish), show that zone as a always-on **aura** on each waypoint, and keep active-origin styling distinct. Lore map unchanged. Frontend digitizer only.

## Technical Context

**Language/Version**: TypeScript / React 19 / CSS

**Primary Dependencies**: `RouteDigitizerView.tsx` (`ORIGIN_SNAP`, `FINISH_SNAP`, `nearestWaypoint`); `RouteDigitizer.css` (`.route-digitizer__wp`, `.is-active`); existing `--map-zoom` counter-scale

**Storage**: N/A

**Testing**: Manual via [quickstart.md](./quickstart.md)

**Target Platform**: Modern browsers (GM desktop primary)

**Project Type**: Web application (GM digitizer UX)

**Performance Goals**: No per-frame cost beyond existing node DOM; CSS-only aura preferred

**Constraints**:
- Unified snap = aura (clarification A / FR-003a)
- Pick zone ≤ ~70% of prior generous origin snap (SC-001)
- Aura always visible (FR-004); active distinct (FR-005)
- No CampaignMap pin/party changes (FR-007)

**Scale/Scope**: `frontend/src/components/gm/RouteDigitizerView.tsx`, `RouteDigitizer.css` only

## Constitution Check

| Gate | Status |
|------|--------|
| Clarification closed (unified zone) | PASS |
| Digitizer-only; no API/DB | PASS |
| Minimal CSS + snap constant change | PASS |

**Post-design re-check**: PASS — UI contract; snap/aura model; no HTTP.

## Project Structure

### Documentation (this feature)

```text
specs/041-digitizer-node-aura/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-digitizer-node-aura.md
└── tasks.md
```

### Source Code

```text
frontend/src/components/gm/
├── RouteDigitizerView.tsx   # NODE_SNAP replaces ORIGIN/FINISH; both call sites
└── RouteDigitizer.css       # aura on __wp; keep is-active louder
```

**Structure Decision**: One `NODE_SNAP` constant (normalized 0–1 distance) used for all `nearestWaypoint` picks. Aura as CSS on `.route-digitizer__wp` (e.g. `box-shadow` / `::before`) sized to read as that pick zone at typical zoom; counter-scale with `--map-zoom` so aura stays screen-stable with the disk. Do not touch `CampaignMap`.

## Complexity Tracking

Sem violações. Snap assimétrico rejeitado na clarification.
