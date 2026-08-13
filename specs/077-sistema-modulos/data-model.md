# Data Model: Sistema & Módulos de Mecânica

**Feature**: `077-sistema-modulos`  
**Date**: 2026-08-13

## Instance configuration (runtime, not persisted in DB)

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `sistema` | string | `.env` `SISTEMA` | Default `wfrp4e`; fixed per deploy |
| `modulos_ativos` | list[string] | Resolved from env + defaults | See [research.md](./research.md) §1 |
| `has_map_image` | bool | Filesystem scan | `uploads/map/campaign-map.*` exists |

## NPC / Personagem (table `npc`)

Universal fields **unchanged**: `id`, `nome`, `tipo`, `papel`, `descricao`, `faccao`, `status`, `retrato_url`, locais M:N.

| Field | Type | Notes |
|-------|------|--------|
| `extensoes_mecanica` | JSON object | Default `{}`; stored as TEXT in SQLite |

### Module key: `fadiga`

| Key | Type | Validation (when module active) |
|-----|------|----------------------------------|
| `fadiga` | integer | `0 ≤ fadiga ≤ 6` (WFRP sheet band; align with travel peak semantics) |

Only persisted when `"fadiga" ∈ modulos_ativos` at write time.

### Legacy (migration only)

| Column | Action |
|--------|--------|
| `fadiga` (if exists in prod) | Copy → `extensoes_mecanica.fadiga` in deploy 1; drop in deploy 2 |

## API DTOs

### `PersonagemRead` / Create / Update

Add optional `extensoes_mecanica: dict[str, Any]` — filtered subset on read; sanitized on write.

### `InstanceConfigRead`

| Field | Type |
|-------|------|
| `sistema` | string |
| `modulos_ativos` | list[string] |
| `has_map_image` | bool |

## Validation rules

1. Unknown keys in `extensoes_mecanica` → dropped on write (inactive modules).
2. Active module keys → validate via module schema; invalid type/range → **422** (only for *active* keys).
3. Empty object `{}` valid when no extensions set.

## State transitions

- **Enable module** (sysadmin changes `.env`, restart): UI shows widget on next load; existing JSON keys for that module appear if present in DB.
- **Disable module**: UI hides widget; reads omit keys; writes strip keys — data may remain in DB but is not exposed (optional: purge on write merge — prefer strip-on-write for active set only).

## Entities explicitly NOT gated by `SISTEMA`

`Local`, `Arco`, `Waypoint`, `RouteSegment`, `MapScale`, `Vinculo`, `GrupoPosicao`, route plan / overnight / travel fadiga fields.
