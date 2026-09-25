# Contract: Console de administração global

Todos os endpoints abaixo usam `/api/admin` e a dependência global `require_admin`. Usuário anônimo recebe `401 AUTENTICACAO_NECESSARIA`; usuário autenticado não-admin recebe `403 NAO_ADMINISTRADOR`. Nenhuma resposta inclui narrativa de campanha, senha, hash, sessão ou token armazenado.

## Users

### `GET /api/admin/usuarios`

Query params opcionais: `email` (substring case-insensitive), `estado` (`ativa`, `pendente`, `inativa`).

Response `200`:

```json
{
  "usuarios": [
    {
      "id": 12,
      "email": "mestre@example.org",
      "estado": "ativa",
      "is_admin": false,
      "criado_em": "2026-09-24T15:00:00Z",
      "mesas_proprietarias": [
        {"id": 8, "slug": "mesa-exemplo", "nome": "Mesa Exemplo", "activa": true}
      ]
    }
  ]
}
```

### `POST /api/admin/convites` (existing contract)

Request `{"email":"novo@example.org"}`; success `201 {"email":"novo@example.org","link":"https://.../convite/<one-use-token>"}`. Duplicate email: `409 EMAIL_DUPLICADO`. Invalid email: `400 EMAIL_INVALIDO`. Raw token exists only in the returned link; persistence stores only its hash.

### `POST /api/admin/usuarios/{id}/reset`

Starts the existing reset flow for an active account. Success `201 {"email":"...","link":"https://.../reset/<one-use-token>"}`. Pending, inactive, or missing accounts return a mapped error and no link. Admin never sets or reads a password.

### `PATCH /api/admin/usuarios/{id}/estado`

Request `{"activo":false}` deactivates and revokes sessions; `{"activo":true}` reactivates without restoring old sessions. Success `200` returns the sanitized updated account view. Reject deactivation of the final active admin or an account owning campaigns with `409` and a stable error code.

### `DELETE /api/admin/usuarios/{id}`

Hard deletion after explicit UI confirmation. Success `204`; before mutation, reject if the user owns any campaign or is the last active admin (`409`). When eligible, remove only the account's invite/session/member/login-lockout records and user row in one control-DB transaction. Never remove campaign content.

## Campaigns

### `GET /api/admin/campanhas`

Query params opcionais: `q` (substring across name, slug, and owner email) and `estado` (`ativa`, `inativa`).

Response `200`:

```json
{
  "campanhas": [
    {
      "id": 8,
      "nome": "Mesa Exemplo",
      "slug": "mesa-exemplo",
      "sistema": "wfrp4e",
      "proprietario": {"id": 12, "email": "mestre@example.org"},
      "activa": true,
      "visibilidade": "listada",
      "criado_em": "2026-09-24T15:00:00Z",
      "modificado_em": null,
      "ultima_alteracao_em": "2026-09-24T15:00:00Z"
    }
  ]
}
```

For legacy campaigns without trusted creation or modification times, both dates and `ultima_alteracao_em` are `null`; clients render “data indisponível”.

### `PATCH /api/admin/campanhas/{id}/estado`

Request `{"activa":false}` blocks new access while retaining data; `true` reactivates. Success `200` returns the updated campaign projection. Visibility is unchanged.

### `PATCH /api/admin/campanhas/{id}/proprietario`

Request `{"email":"novo-proprietario@example.org"}`. Target account must exist and be active. Replace the ownership relationship atomically; success `200` returns the updated owner summary. Reject invalid/missing/inactive target without changing the old owner.

### `DELETE /api/admin/campanhas/{id}`

Requires explicit confirmation naming campaign and slug. Success `204`; removes only that campaign's control registry row, membership rows, and validated campaign storage tree. The frontend states that the action is permanent. Missing campaign: `404`; path/operation conflict: mapped `409`/`500` without reporting success.

## Authorization and data-safety matrix

| Requester | List | Invite/reset | State/transfer | Delete |
|---|---:|---:|---:|---:|
| Anonymous | 401 | 401 | 401 | 401 |
| Authenticated non-admin | 403 | 403 | 403 | 403 |
| Application admin | 200 | 201 / mapped errors | 200 / mapped errors | 204 / guarded errors |

Campaign list responses are metadata-only. Tests must prove a targeted campaign delete leaves sibling campaign registry rows and storage trees intact, and user deletion does not remove campaign data for other members.
