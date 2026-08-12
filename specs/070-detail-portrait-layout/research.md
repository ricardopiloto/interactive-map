# Research: Detail Portrait Layout

**Feature**: `070-detail-portrait-layout`  
**Date**: 2026-08-11

## 1. Why the portrait breaks

**Decision**: Treat the root cause as **flex shrink** on `.relacoes-detail` (column + `overflow-y: auto` + absolute top/bottom). Children default to `flex-shrink: 1`, so a tall description compresses `.relacoes-detail__portrait`. Combined with `.image-slot img { height: 100% }`, the photo is forced into a flattened box.

**Rationale**: Matches the production report (long description → broken image area). Map NPC cards already use shrink-to-fit + `overflow: hidden` (057) and are out of scope.

**Alternatives considered**:
- Nested scroll only on the description — extra scrollbar; worse for short copy (FR-003).
- Sticky portrait — not requested; more motion than a layout fix.

## 2. Keep the image slot from shrinking

**Decision**: `flex-shrink: 0` on `.relacoes-detail__portrait` (and keep kicker/name/tags from being the shrink target). Panel continues to scroll as a whole (`overflow-y: auto` already on `.relacoes-detail`).

**Rationale**: FR-001 / FR-002 — stable image, full description via existing panel scroll. Short descriptions do not gain a second scrollbar (FR-003).

## 3. Image sizing (contain, not cover-fill)

**Decision**: Mirror the 057 NPC expanded portrait, capped at the current **220px** max-height:

- Slot: `width: 100%`, `height: auto`, `max-height: 220px`, `overflow: hidden`, `flex-shrink: 0`
- `img`: `width: 100%`, `height: auto`, `max-height: 220px`, `object-fit: contain`, `display: block`

**Rationale**: FR-005 — ficha shows the **full** image; disc cover (069) stays on the graph only. Avoid `height: 100%` inside a height-auto slot (undefined/squashed).

**Alternatives considered**:
- Fixed square slot — would letterbox every photo and change short-copy look.
- Raise/remove 220px cap — out of spec (“no new portrait size”).

## 4. Long unbreakable text

**Decision**: On `.relacoes-detail__desc` (and the panel if needed): `overflow-wrap: anywhere` (or `break-word`) and `min-width: 0` so flex/grid cannot expand the 300px sheet.

**Rationale**: FR-004 / SC-004.

## 5. Placeholder without photo

**Decision**: `flex-shrink: 0` is enough; do not invent a large empty min-height (would change short/empty fichas). Placeholder keeps its current dashed box height.

**Rationale**: FR-003 — no visual change when description is short.
