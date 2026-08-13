# API Contract: Personagem visibility

**Feature**: `084-personagem-visibility`  
**Date**: 2026-08-13

## Field

```json
"visivel_para_todos": true
```

Present on `PersonagemRead` / `NPCRead` (and create/update payloads where applicable).

| Value | Meaning |
|-------|---------|
| `true` (default) | Visible to players |
| `false` | GM-only |

## Public endpoints (unauthenticated / player)

| Endpoint | Behavior |
|----------|----------|
| `GET /api/personagens` | Omit rows with `visivel_para_todos == false` |
| `GET /api/personagens/{id}` | `404 PERSONAGEM_NAO_ENCONTRADO` if hidden |
| `GET /api/npcs` | Same filter |
| `GET /api/npcs/{id}` | `404` if hidden |
| `GET /api/vinculos` | Existing `player_visible` **and** both endpoints visible |
| `GET /api/locais` (and get-by-id) | `npc_ids` filtered to visible NPCs only |

Hidden characters MUST NOT appear in any public JSON field (no names, ids, or counts that reveal them).

## Admin endpoints (GM)

| Endpoint | Behavior |
|----------|----------|
| `GET/POST/PUT` admin personagens (and legacy admin NPCs if still used) | Full list; include `visivel_para_todos`; persist on write |
| Admin locais | Full `npc_ids` including hidden |
| Admin vinculos | Unchanged listing of all edges; may reference hidden personagens |

## Compatibility

- Clients that omit `visivel_para_todos` on create → server default `true`.
- Old DBs without column → migration sets `true` for all rows.
