# API Contract Delta: 003-align-prototype-ui

Base: [001 openapi-outline](../../001-campaign-codex-map/contracts/openapi-outline.md). Abaixo só o que muda ou precisa ser garantido nesta feature.

## Auth (obrigatório se ainda não implementado)

Todas as rotas `/api/admin/*` exigem `Authorization: Basic …`.

- Credenciais inválidas / ausentes → **401**
- `ADMIN_USER` / `ADMIN_PASSWORD` não configurados → admin **fail closed** (401/503)
- Público (`GET /api/*`, `/uploads/*`) sem auth

### `GET /api/admin/session` (recomendado)

Probe para o dialog “Acesso do Mestre” antes de entrar em Modo GM.

**200**: `{ "user": "<ADMIN_USER>" }`  
**401**: challenge

## Grupo — leitura pública

### `GET /api/grupo`

**Response 200**

```json
{
  "x": 0.66,
  "y": 0.27,
  "formato": "bandeira",
  "atualizado_em": "2026-08-01T00:00:00Z"
}
```

`formato`: `"bandeira"` | `"brasao"` (default efetivo `"bandeira"`).

## Grupo — escrita admin

### `PUT /api/admin/grupo`

**Headers**: Basic Auth  
**Body** (parcial permitido se implementado; senão enviar x, y e formato juntos):

```json
{
  "x": 0.5,
  "y": 0.5,
  "formato": "brasao"
}
```

**Response 200**: mesmo shape de `GET /api/grupo`  
**422**: `formato` inválido  
**401**: sem auth

## Uploads

Inalterado: `POST /api/admin/uploads` (multipart) para `map` | `local` | `portrait`.  
A UI passa a disparar upload de mapa a partir do **slot no fundo do mapa** (Modo GM), não de um painel exclusivo.

## Locais / NPCs / Arcos

Contratos CRUD inalterados; apenas a UI (slots/dialogs) muda.
