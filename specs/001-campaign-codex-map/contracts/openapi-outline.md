# API Contract Outline: Codex da Campanha

Base URL (dev): `http://localhost:8000`  
Base URL (prod): `https://mapa.1nodado.com.br`

Auth:
- **Public GET** (`/api/locais`, `/api/npcs`, `/api/arcos`, `/api/grupo`, `/api/health`, `/uploads/*`): sem credenciais.
- **Todas as rotas `/api/admin/*`**: HTTP Basic Auth **obrigatório na API** (header `Authorization: Basic …`). Sem credenciais ou credenciais inválidas → **401**. Sem `ADMIN_USER`/`ADMIN_PASSWORD` configurados → admin **indisponível** (fail closed; 503 ou 401 com challenge).
- **UI `/admin`**: não deve expor o shell de edição até credencial válida; em produção, Caddy também exige Basic Auth em `/admin*` (defense in depth).
- **Dev sem Caddy**: admin **não** fica aberto — a API rejeita e a SPA exige senha.

Content-Type: `application/json` (exceto upload multipart).

### `GET /api/admin/session` (opcional / recomendado)

Probe leve para validar credenciais antes do shell.

**Headers**: `Authorization: Basic …`  
**Response 200**: `{ "user": "gm" }`  
**Response 401**: challenge Basic Auth

---

## Health

### `GET /api/health`

**Response 200**

```json
{ "status": "ok" }
```

---

## Public read

### `GET /api/locais?q=`

Query `q` opcional (filtro por nome, case-insensitive).

**Response 200**: `Local[]`

```json
{
  "id": 1,
  "nome": "string",
  "descricao": "string",
  "x": 0.32,
  "y": 0.58,
  "imagem_url": "/uploads/locals/….webp",
  "data_sessao": "Sessão 3",
  "arco_id": 1,
  "npc_ids": [1, 3]
}
```

`data_sessao`: string | null (rótulo livre).

### `GET /api/locais/{id}` → `Local` | 404

### `GET /api/npcs?q=` → `NPC[]`

```json
{
  "id": 1,
  "nome": "string",
  "descricao": "string",
  "faccao": "string|null",
  "status": "vivo|morto|desaparecido|desconhecido|null",
  "retrato_url": "string|null",
  "local_ids": [1, 2]
}
```

### `GET /api/npcs/{id}` → `NPC` | 404

### `GET /api/arcos` → `Arco[]` (ordenado por `ordem`, `id`)

```json
{ "id": 1, "titulo": "string", "resumo": "string", "ordem": 1 }
```

### `GET /api/arcos/{id}` → `Arco` | 404

### `GET /api/grupo` → `GrupoPosicao`

```json
{ "x": 0.5, "y": 0.5, "atualizado_em": "2026-08-01T12:00:00Z" }
```

### `GET /uploads/{category}/{filename}`

Categorias: `map` | `locals` | `portraits`. Público.

---

## Admin write (`/api/admin`)

Rate limit sugerido: 30/min (escrita), 20/min (upload).

### Locais

| Method | Path | Body | Success |
|--------|------|------|---------|
| POST | `/api/admin/locais` | `LocalCreate` | 201 `Local` |
| PUT | `/api/admin/locais/{id}` | `LocalUpdate` (parcial) | 200 `Local` |
| DELETE | `/api/admin/locais/{id}` | — | 204 |

`LocalCreate` / campos de update:

```json
{
  "nome": "string",
  "descricao": "string",
  "x": 0.0,
  "y": 0.0,
  "imagem_url": "string|null",
  "data_sessao": "string|null",
  "arco_id": 1,
  "npc_ids": [1, 2]
}
```

Reposicionamento: GM envia novos `x`/`y` após modo clique no mapa (mesmo contrato PUT).

### NPCs

| Method | Path | Success |
|--------|------|---------|
| POST | `/api/admin/npcs` | 201 `NPC` |
| PUT | `/api/admin/npcs/{id}` | 200 `NPC` |
| DELETE | `/api/admin/npcs/{id}` | 204 |

### Arcos

| Method | Path | Success |
|--------|------|---------|
| POST | `/api/admin/arcos` | 201 `Arco` |
| PUT | `/api/admin/arcos/{id}` | 200 `Arco` |
| DELETE | `/api/admin/arcos/{id}` | 204 |

### Grupo

| Method | Path | Body | Success |
|--------|------|------|---------|
| PUT | `/api/admin/grupo` | `{ "x": 0.0, "y": 0.0 }` | 200 `GrupoPosicao` |

### Uploads

### `POST /api/admin/uploads`

`multipart/form-data`: `category` (`map`|`portraits`|`locals`), `file`.

**Response 200**

```json
{ "url": "/uploads/locals/<uuid>.webp" }
```

Erros: 400 tipo/categoria inválidos; 413 arquivo grande.

---

## Frontend routes (UI contract)

| Path | Audience | Behavior |
|------|----------|----------|
| `/` | Público | Mapa + menu Locais/NPCs/História; sem controles de edição |
| `/admin` | GM (Basic Auth borda) | CRUD + mapa com modos posicionar/reposicionar/mover grupo |
| `*` | — | Redirect → `/` |

Sem dialog de senha na SPA.

---

## Error shape

FastAPI default / HTTPException:

```json
{ "detail": "string | object" }
```

Códigos: 400 validação de negócio, 404 not found, 413 upload, 422 Pydantic, 429 rate limit.
