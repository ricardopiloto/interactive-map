# Implementation Plan: Revert Pin Alignment Fixes (047 / 049 / 051)

**Branch**: `052-revert-pin-align-fixes` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/052-revert-pin-align-fixes/spec.md`

## Summary

Fully **undo** campaign-map marker presentation changes from **047**, **049**, and **051** (mobile left nudge → “fix” → stage/image aspect). Restore **pré-047** layout so **desktop** pins again match the map art (print: green = where red Altdorf pin should sit). Mobile may regress to pré-047; do **not** reintroduce nudges or keep 051 stage shrink-wrap. Leave 048/050/digitizer alone.

## Technical Context

**Language/Version**: CSS (primary); TypeScript/React unchanged for this feature

**Primary Dependencies**: `frontend/src/components/map/CampaignMap.css`; baseline = **git `HEAD`** copy of that file (pré-047 already committed; 047/049/051 exist only as uncommitted working-tree edits)

**Storage**: N/A

**Testing**: Manual via [quickstart.md](./quickstart.md) vs desktop print (green target)

**Target Platform**: Web campaign map — success criterion is **desktop** (≥ `MOBILE_BP` 800)

**Project Type**: Web application (SPA)

**Performance Goals**: Negligible

**Constraints**:
- Full removal/restore, not a new half-fix (FR-004)
- Desktop Altdorf → green (FR-002); pré-047 for other markers (FR-003)
- No mass coord edits (FR-006)
- Do not revert 048 / 050 / digitizer (FR-007)
- Mobile regression to pré-047 accepted

**Scale/Scope**: Restore `CampaignMap.css` from HEAD; surgically edit `CHANGELOG.md` to drop 047/049/051 version notes while keeping 048/050 notes if present

## Constitution Check

| Gate | Status |
|------|--------|
| Spec clear: full revert 047–051; desktop green | PASS |
| Baseline identifiable (git HEAD CampaignMap.css) | PASS |
| Out of scope (048/050/digitizer) respected | PASS |

**Post-design re-check**: PASS — research locks restore-from-HEAD; UI contract + quickstart; no data model change.

## Project Structure

### Documentation (this feature)

```text
specs/052-revert-pin-align-fixes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-revert-pin-align-fixes.md
└── tasks.md
```

### Source Code

```text
frontend/src/components/map/CampaignMap.css   # restore from git HEAD (pré-047)
CHANGELOG.md                                  # remove 0.6.8 / 0.6.9 / 0.6.12 notes only; keep 048/050
```

**Structure Decision**:
1. `git checkout HEAD -- frontend/src/components/map/CampaignMap.css` (or equivalent overwrite with HEAD content) to restore stage `min-height` + `object-fit: cover`, pin/party transforms **without** `--mobile-marker-nudge-x` / `translateX` nudge plumbing.
2. Edit `CHANGELOG.md`: delete uncommitted sections for **0.6.8** (047), **0.6.9** (049), **0.6.12** (051). Keep **0.6.10** (048 stroke) and **0.6.11** (050 transport) if those features remain in the tree.
3. Do not touch `RouteDigitizer*`, `RoutePlanner*`, or backend route planner files as part of this feature.
4. Spec folders `specs/047-*` … `051-*` stay as historical docs (do not delete).

## Complexity Tracking

Sem violações. Restore-from-HEAD is the simplest correct approach.
