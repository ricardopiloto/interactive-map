# Contract: Minhas campanhas, criar, visibilidade

**Feature**: 098  
**Auth**: cookie sessão (095); CSRF em mutações

## `GET /api/campanhas/minhas`

| Caso | Status |
|------|--------|
| Anónimo | 401 |
| Sessão | 200 |

```json
{
  "campanhas": [
    {
      "slug": "mesa-a",
      "nome": "A",
      "sistema": "wfrp4e",
      "visibilidade": "listada",
      "bytes_usados": 1000,
      "cota_bytes": 10737418240,
      "aviso_cota": false
    }
  ]
}
```

Filtro: `activa` ∧ `Membro.papel == "dono"` para o user. Omitir co-mestre e mesas de outros donos. `aviso_cota = bytes_usados >= 0.9 * cota_bytes`.

---

## `POST /api/campanhas`

Body JSON:

```json
{
  "nome": "Nova",
  "slug": "nova-mesa",
  "sistema": "wfrp4e",
  "visibilidade": "listada"
}
```

`visibilidade` opcional → default `listada`.

| Caso | Status | Código |
|------|--------|--------|
| Anónimo | 401 | |
| OK | 201 | `{ slug, id, nome, sistema, visibilidade }` |
| Slug inválido/reservado/ocupado | 400/409 | `SLUG_INVALIDO` / `SLUG_RESERVADO` / `SLUG_DUPLICADO` |
| Sistema desconhecido | 400 | `SISTEMA_INVALIDO` |

Efeito: sítio novo + dono = user. Módulos = defaults 093.

---

## `PATCH /api/campanhas/{slug}/visibilidade`

Body: `{ "visibilidade": "listada" | "so_link" }`

| Caso | Status |
|------|--------|
| Anónimo | 401 |
| Não-dono / não-membro | 403 |
| OK | 200 `{ slug, visibilidade }` |

---

## UI (não API)

- Export: `GET /api/c/{slug}/admin/export` (097, dono)
- Import: `POST /api/campanhas/import` (097) → refresh minhas
