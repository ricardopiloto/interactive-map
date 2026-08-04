# UI Contract: Revert pin presentation (030)

**Feature**: 034-revert-pin-offset  
**Surface**: Campaign map pins + group marker; Speckit status for 030

## Product (active UI)

| Element | MUST |
|---------|------|
| Local pin | Pré-030 box + margins (`-12px` / `-22px`) + rotate; no tip `transform-origin` da 030 |
| Group bandeira/brasão | Pré-030 sizes/margins |
| Mobile &lt; 800px | **No** dedicated pin/party size shrink from 030 |
| Reposition click point vs pin | No lateral offset attributable to 030 anchor |

## Docs (030)

| Artifact | MUST |
|----------|------|
| `specs/030-pin-size-offset/` | Remains on disk |
| `spec.md` Status | `Deferred / Staged` with short note pointing to 034 |

## Non-goals

- Git staging/commit as acceptance (clarification A)
- Redesigning a new tip-accurate anchor
- Deleting 030 specs
- Changing MapPage / LocalForm / displayLocais

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001–003, SC-001–002 | CSS pré-030 |
| FR-005, SC-003 | Status Deferred |
| FR-006–007, SC-004 | 032/033 intact |
| FR-004 | No coord changes |
