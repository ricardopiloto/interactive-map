# Data Model: Crônica de sessões

**Feature**: `112-cronica-sessoes`

## Sessao (`sessao`)

| Field | Type | Rules |
|-------|------|-------|
| `id` | int PK | |
| `numero` | int | NOT NULL, **UNIQUE** in this DB |
| `titulo` | str | required, max ~200 |
| `data_rotulo` | str \| null | free label (like `Local.data_sessao`), max ~100 |
| `resumo` | str | Markdown, default `""`, large text |
| `visivel_para_todos` | bool | default `true` |

### Invariants

- `numero` unique → conflict `NUMERO_DUPLICADO`
- Suggested next = `MAX(numero)+1` or `1`
- Sort public/admin lists by `numero DESC` (stable secondary: `id DESC`)

## SessaoLocalLink (`sessao_local`)

| Field | Type |
|-------|------|
| `sessao_id` | FK → sessao.id, PK |
| `local_id` | FK → local.id, PK |

## SessaoNpcLink (`sessao_npc`)

| Field | Type |
|-------|------|
| `sessao_id` | FK → sessao.id, PK |
| `npc_id` | FK → npc.id, PK |

(NPC table = unified PJ|NPC.)

## Relationships

```text
Sessao *—*— Local
Sessao *—*— NPC
```

On delete Sessao: cascade remove link rows.  
On delete Local/NPC: remove link rows (or DB ON DELETE CASCADE).

## Visibility state

```text
visivel_para_todos=true  → public list + admin
visivel_para_todos=false → admin only
```

## Out of model

- `Local.data_sessao` unchanged; no sync to Sessao.
