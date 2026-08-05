# Research: Revert Pin Alignment Fixes (047 / 049 / 051)

**Feature**: `052-revert-pin-align-fixes` | **Date**: 2026-08-05

## 1. What “pré-047” means in this repo

**Decision**: Treat **git `HEAD`** of `frontend/src/components/map/CampaignMap.css` as the pré-047 baseline. Features 047/049/051 were applied as **uncommitted** edits on top of `main`; they are not separate commits on that file.

**Rationale**: `git show HEAD:…/CampaignMap.css` still has `min-height: 540px`, `object-fit: cover`, and pin `transform: rotate(-45deg) scale(...)` **without** `--mobile-marker-nudge-x`. Working tree adds 051 stage shrink-wrap + 049 nudge plumbing.

**Alternatives considered**:
- Reconstruct from spec text alone — riskier than HEAD
- Partial keep of 049 variable at 0 — still “meio-termo”; rejected by FR-004

## 2. How to revert

**Decision**: Restore the file from HEAD (`git checkout HEAD -- frontend/src/components/map/CampaignMap.css` or copy HEAD blob). Do not hand-edit piece-by-piece unless HEAD restore fails.

**Rationale**: Atomic restore guarantees 047+049+051 presentation code is gone together.

**Alternatives considered**: Manual CSS surgery — higher error risk

## 3. CHANGELOG

**Decision**: Remove only the uncommitted changelog sections for **0.6.8**, **0.6.9**, and **0.6.12** (047/049/051). Keep **0.6.10** (048) and **0.6.11** (050) entries that describe work outside this revert. Optionally add a short **0.6.13** note “reverted failed pin-align experiments” if a shipped narrative is desired; not required if those versions never left the working tree.

**Rationale**: FR-007 — do not erase 048/050 product notes.

## 4. Out of scope files

**Decision**: Leave `RouteDigitizer.css`, `RoutePlanner*`, backend route transport, and `specs/047–051` directories untouched by this feature’s implementation tasks.

**Rationale**: Spec Out of Scope / FR-007.

## 5. Acceptance

**Decision**: Desktop visual QA against print green target is the gate; CSS matching HEAD is the implementation gate; mobile pré-047 misalignment is accepted.
