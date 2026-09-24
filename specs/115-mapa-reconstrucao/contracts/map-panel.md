# Contract: Map floating panel (115)

**Feature**: `115-mapa-reconstrucao`  
**Surface**: `/c/:slug` (Map page only)

## Shell

| Viewport | Geometry | Behaviour |
|----------|----------|-----------|
| ≥ ~861px | Absolute card, left of map stage; ~12px inset; ~372px wide; `radius-lg`; border + shadow | Always shows head + scroll body |
| ≤ ~860px | Bottom sheet; collapsed ~132px; expanded ~74dvh; top radii; grabber | `data-expanded`; expand on search focus / selection |

## Head

| Mode | Content |
|------|---------|
| List | Pill search + chips Tudo / Locais / Personagens |
| Detail | «Voltar» (and optional title) |

## Body

| Mode | Content |
|------|---------|
| List | Compact rows: locais (dot + nome + arco meta) and/or personagens (avatar + nome); empty state i18n |
| Detail local | Nome, arco/meta, markdown, linked NPCs; Edit Mode: edit + delete |
| Detail npc | Nome, meta, link back to related locais if useful; no PinModal |

## Selection sync

- Pin click → select local + expand sheet.
- List click → select + focus map pin when local.
- Voltar → clear selection; map may clear highlight.
- MUST NOT mount pin-anchored popover (`PinModal`).

## Permissions

- Hidden content: whatever APIs already return for current Edit Mode.
- Edit/delete/FAB: only when Edit Mode enabled (`canEdit` path unchanged).
