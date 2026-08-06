# Data Model: Fix NPC Portrait Expand Sizing

**Feature**: `057-fix-npc-portrait-expand` | **Date**: 2026-08-05

No persisted entities. UI layout concepts only.

## Entities

### ExpandedPortraitLayout

| Rule | Value |
|------|--------|
| Width | 100% of NPC card body content width |
| Height | Auto from image aspect (shrink-to-fit) |
| Max height | `50vh` |
| Fit | Full image visible (contain); no aggressive cover crop |
| Empty portrait | No image block (current behavior) |

### CollapsedThumbnailLayout

| Rule | Value |
|------|--------|
| Size | Unchanged compact circle (~40×40) |
| Fit | Cover/circle crop OK |

## State

```text
NPC collapsed → thumbnail only
NPC expanded + retrato_url → ExpandedPortraitLayout
NPC expanded + no url → text/meta only
```

## Validation

- Box height MUST NOT stay at max when scaled image is shorter.
- Page MUST NOT gain horizontal scroll from portrait alone.
