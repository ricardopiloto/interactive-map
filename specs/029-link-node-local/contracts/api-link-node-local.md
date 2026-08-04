# API Contract: Vínculo nó ↔ Local

**Feature**: 029-link-node-local

## PUT `/api/admin/waypoints/{id}` (existente, comportamento estendido)

Body (parcial): `{ "local_id": <int|null>, ... }`

| Caso | Efeito |
|------|--------|
| `local_id` = L livre | `waypoint.local_id = L`; `local.x/y ← waypoint` |
| `local_id` = null | limpa vínculo; Local não move |
| `local_id` já noutro nó | **422** “Local já vinculado…” |

## POST/PUT `/api/admin/locais` (estendido)

Novo campo opcional:

| Campo | Tipo | Notas |
|-------|------|--------|
| waypoint_id | int \| null \| omit | Nó a associar; null = sem nó |

| Caso | Efeito |
|------|--------|
| `waypoint_id` = W livre (ou já deste Local) | sync vínculo; Local coords ← W |
| `waypoint_id` = null (update) | desvincula nó deste Local |
| W já ligado a outro Local | **422** |

## GET Local (read)

Incluir `waypoint_id: int | null` (lookup do Waypoint com `local_id == local.id`) para hidratar o form.

## Auth

Admin Basic Auth (inalterado).
