# Data Model: Administração de usuários e mesas

## AccountAdminView (response projection)

Represents only account metadata needed by the global admin console. It is not a persisted table.

| Field | Type | Source / rule |
|---|---|---|
| `id` | integer | `Usuario.id`; stable mutation selector |
| `email` | string | normalized `Usuario.email` |
| `estado` | `ativa \| pendente \| inativa` | pending if `senha_hash` is null; otherwise active/inactive from `activo` |
| `is_admin` | boolean | `Usuario.is_admin`; read-only in this console |
| `criado_em` | datetime | `Usuario.criado_em` |
| `mesas_proprietarias` | array of `OwnedCampaignSummary` | `Membro.papel == 'dono'`; each item has id, slug, name, and active state |

Never return `senha_hash`, session/token values, invite hashes, login-lockout keys, or campaign narrative.

## CampaignAdminView (response projection)

Represents registry metadata only; campaign content remains in its per-campaign SQLite database.

| Field | Type | Source / rule |
|---|---|---|
| `id` | integer | `Campanha.id`; stable mutation selector |
| `nome` | string | `Campanha.nome` |
| `slug` | string | `Campanha.slug` |
| `sistema` | string | `Campanha.sistema` |
| `proprietario` | nullable summary | owner `Membro` joined to `Usuario`; email and ID only |
| `activa` | boolean | operational availability; separate from visibility |
| `visibilidade` | `listada \| so_link` | existing discovery/access attribute, not the operational state |
| `criado_em` | nullable datetime | newly recorded for campaigns created after migration; unknown for legacy rows |
| `modificado_em` | nullable datetime | effective latest content/configuration write, computed as max of control-registry and per-campaign state timestamps |
| `ultima_alteracao_em` | nullable datetime | `modificado_em ?? criado_em`; null when both are unknown |

Response omits `caminho`, uploads, narrative content, module internals, password/session material, and storage secrets.

## Persisted Entities and Relationships

- `Usuario` lives in `control.db`; `Membro` associates it with a `Campanha` and uses `papel='dono'` to identify ownership.
- `Convite` and `Sessao` refer to `Usuario`; deletion explicitly removes rows because migration FKs have no `ON DELETE CASCADE`.
- `LoginBloqueio` is keyed by email/IP text rather than a user FK; eligible user deletion removes the normalized email lock row.
- `Campanha` is the registry row in `control.db`; its `caminho` identifies one separate campaign DB/uploads tree under the configured campaigns root.
- `Campanha.criado_em` and `Campanha.modificado_em` in `control.db` are nullable to preserve honest data for legacy campaigns. New campaigns set `criado_em`; settings writes set the control `modificado_em`.
- Each `campanha.db` gets a singleton `campaign_state` row with nullable `modificado_em`. Campaign ORM writes update it in the same transaction, so rollback preserves the prior value. The admin projection computes the latest known content/settings timestamp without loading narrative entities.

## State Transitions

### Account

```text
pending (senha_hash=NULL, activo=false) --accept invite--> active
active --deactivate + revoke all sessions--> inactive
inactive --reactivate--> active (new login required)
active --reset invite--> active (password updated by account holder; prior sessions revoked)
active/inactive/pending --delete--> absent (only when no owned campaigns and last-admin guard passes)
```

The final active administrator cannot be deactivated or deleted. An account that owns any campaign must transfer each ownership to an active user or remove those campaigns before deactivation/deletion.

### Campaign

```text
active <--> inactive (reversible operational state; content retained)
active/inactive --explicit confirmed delete--> absent + associated storage removed
```

Visibility is independent: `listada` or `so_link` can coexist with either operational state. Permanent deletion is ID-targeted, path-confined, and idempotently retryable.
