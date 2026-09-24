# Data Model: Marcador do grupo

No persisted entity or schema change is introduced. The feature uses the existing per-campaign marker record.

## GroupPosition (existing)

One logical row per campaign database.

| Field | Type | Validation / behavior |
|---|---|---|
| `id` | integer | Logical singleton uses ID 1 |
| `x` | float | Normalized horizontal position in inclusive range `[0,1]`; defaults to 0.5 |
| `y` | float | Normalized vertical position in inclusive range `[0,1]`; defaults to 0.5 |
| `formato` | enum | `bandeira` or `brasao`; defaults to `bandeira` |
| `atualizado_em` | datetime | Updated by a successful write |

The record is isolated by campaign database, selected through the slug in the request context. There is no shared group record between campaigns.

## Map interaction state (transient)

| State | Meaning |
|---|---|
| `idle` | No group placement operation is active |
| `moving` | Owner selected Move Group; next valid map click is a candidate position |
| `saving` | Candidate coordinates are being persisted; saved marker remains authoritative until success |
| `save-error` | Request failed; persisted marker is unchanged and user can retry or cancel |

Cancel from `moving` returns to `idle` with no write. Success from `saving` replaces the visible persisted position and returns to `idle`. Format change preserves x/y; recentering the camera does not mutate this entity.

## Authorization

- Public read can retrieve the marker for the selected campaign.
- Only the campaign owner/master may update position or format.
- Anonymous users and users who are not campaign members cannot write; campaign members without owner role are denied.

Prototype interaction state is local mock data only and does not represent persisted application state.
