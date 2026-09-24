# Data Model: Revelação progressiva (Local e Arco)

**Feature**: `113-revelacao-progressiva`

## Local (`local`)

| Field | Change |
|-------|--------|
| `visivel_para_todos` | **NEW** `bool`, NOT NULL, default `true` |

Unchanged: nome, descricao, x/y, imagem_url, data_sessao, arco_id, cor_pin, links N:N NPC.

### Visibility

```text
true  → public map/list/search/detail + admin
false → admin / Edit Mode only
```

Hiding a Local does **not** auto-hide linked NPCs or Arco.

## Arco (`arco`)

| Field | Change |
|-------|--------|
| `visivel_para_todos` | **NEW** `bool`, NOT NULL, default `true` |

### Visibility

Same semantics as Local/NPC.

Hiding an Arco does **not** hide its Locals. Public Local with hidden arco → present as **no arco** (`arco_id` absent/null in public read).

## NPC (unchanged schema)

Public `local_ids` MUST exclude locais where `visivel_para_todos=false`.

## Sessao (unchanged schema)

Public chips `locais[]` MUST omit hidden locais (parity with hidden NPC chips).

## LocalConexaoLink

No schema change. Public `saida_ids` computed set MUST exclude hidden destination locais.

## Migration notes

- Revision after `002_sessao`.
- Backfill: all existing rows `true`.
- Rollback: drop columns (acceptable for bool flags).
