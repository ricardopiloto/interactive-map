# Data Model: Relationship Network

**Feature**: `066-relationship-network`  
**Date**: 2026-08-11

## Entities

### Personagem (evolves table `npc`)

| Field | Type | Rules |
|-------|------|--------|
| `id` | int PK | Existing |
| `nome` | str ≤200 | Required; indexed |
| `tipo` | enum `pj` \| `npc` | Required; default `npc` for migration |
| `papel` | str ≤200 nullable | e.g. “Caçadora de Recompensas” |
| `descricao` | str ≤10000 | Default `""` |
| `faccao` | str ≤200 nullable | |
| `status` | enum | Reuse NPCStatus: `vivo` \| `morto` \| `desaparecido` \| `desconhecido` |
| `retrato_url` | str ≤500 nullable | Shared map + Relações |

**Relationships**:
- M2M `locais` via `local_npc` (unchanged link table; FK still to `npc.id`)
- 1:N `vinculos` as either endpoint (logical; delete cascades)

**Validation**:
- `tipo=pj` may have empty `local_ids` (no map pin required)
- DELETE: remove row + all Vinculos touching id + unlink from locais (link rows go with FK/cascade)

### Vínculo (new table `vinculo`)

| Field | Type | Rules |
|-------|------|--------|
| `id` | int PK | |
| `personagem_a_id` | FK → npc.id | `a < b` (canonical) |
| `personagem_b_id` | FK → npc.id | |
| `tipo` | enum | `aliado` \| `amizade` \| `inimizade` \| `romance` \| `familia` \| `conhecido` |
| `nota` | str ≤500 | Short table note; default `""` |
| `publico` | bool | Default **false**; player-visible when true |

**Constraints**:
- Unique `(personagem_a_id, personagem_b_id)`
- `personagem_a_id != personagem_b_id`
- On write, reorder ids so `a = min`, `b = max`

**Visibility**:
- Public API: `publico == true` only
- Admin API: all rows

### Vista do grafo (client-only)

Not persisted. Session state: selection, filters (tipos), isolate flag, zoom/pan, dragged node offsets (cleared on reload).

## State / lifecycle

```text
Personagem: created → updated → deleted (hard; cascade vínculos + local_npc links)
Vínculo: created (publico=false) → updated (tipo/nota/publico) → deleted
```

## Migration notes

1. `_migrate_sqlite`: `ALTER TABLE npc ADD COLUMN tipo` / `papel` if missing; backfill `tipo='npc'`.
2. `create_all` creates `vinculo`.
3. Seed: PJs + NPCs + vínculos with mixed `publico`.

## Compatibility

- Read DTOs may still expose `local_ids` for map.
- Frontend renames type `NPC` → `Personagem` (or `Personagem` with `tipo`); map filters `tipo === 'npc'` where needed.
