# Data Model: Gênero como identidade

**Feature**: `111-genero-identidade-campanha`

## Campanha (control.db)

| Field | Type | Notes |
|-------|------|-------|
| … | (unchanged) | slug, nome, sistema, … |
| `genero` | `str` NOT NULL, max 16 | enum: `fantasia` \| `gotico` \| `scifi` \| `urbano` |
| `capa_arquivo` | `str` | unchanged |
| ~~`acento_id`~~ | removed | after backfill |

### Invariants

- `genero` set at create; never updated by product surfaces.
- `sistema` remains free text, immutable after create (existing rule).
- `genero` independent of `sistema` (suggestions only).

### Migration `005_genero` (Alembic control, `render_as_batch`)

1. Add `genero` nullable.
2. Backfill every row via `genero_from_legacy(sistema, acento_id)`.
3. Alter `genero` NOT NULL (server_default temporary only if SQLite requires — prefer explicit backfill then batch alter).
4. Drop `acento_id`.

### Rollback

- Re-add `acento_id` nullable; map reverse is lossy (only fantasia→latao, gotico→vinho heuristics) — document as best-effort; prefer restore from backup for production.

## Genre (catalog — not a DB table)

Closed set used by API validation + FE:

| id | Label key (i18n) | supportsLight | Suggested systems (UI only) |
|----|------------------|---------------|-----------------------------|
| fantasia | genre.fantasia.label | yes | WFRP 4e, D&D 5e, … |
| gotico | genre.gotico.label | no | WoD, … |
| scifi | genre.scifi.label | no | Starfinder, … |
| urbano | genre.urbano.label | no | CoC, … |

## Package manifest (export)

| Field | Required (new) | Notes |
|-------|----------------|-------|
| `genero` | yes | one of four ids |
| `acento_id` | no | ignored on write; still read for old zips |

### Import resolution

```text
if genero in GENRE_IDS → use
else → genero_from_legacy(manifest.sistema, manifest.acento_id)
if still invalid → reject package
```

## State transitions

```text
[create with genero] → Campanha(genero=G)
       │
       └── no transition: genero immutable
capa: empty ↔ set ↔ clear (PATCH capa only)
```
