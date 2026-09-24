# Contract: prefixo API por campanha

**Feature**: `094-roteamento-campanha`

## Paths

| Antes | Depois |
|-------|--------|
| `GET /api/config` | `GET /api/c/{slug}/config` |
| `GET /api/locais` … | `GET /api/c/{slug}/locais` … |
| `GET /api/admin/session` | `GET /api/c/{slug}/admin/session` |
| `GET/POST/… /api/admin/*` | `GET/POST/… /api/c/{slug}/admin/*` |
| `GET /api/health` | **inalterado** `GET /api/health` |

Todos os recursos de conteúdo públicos e admin da app actual MUST existir sob o prefixo com slug (mesmos subpaths relativos).

## Sessão

- `Depends(get_session)` resolve com o `{slug}` do path (093 `resolve_campaign_session`).
- Basic Auth em **todo** o router admin sob `/api/c/{slug}/admin` (inalterado o mecanismo `verify_admin`).

## Erros

| Condição | HTTP | Código |
|----------|------|--------|
| Slug inexistente | 404 | `CAMPANHA_NAO_ENCONTRADA` |
| Slug inactivo | 404 | `CAMPANHA_NAO_ENCONTRADA` (mesmo) |
| Path conteúdo sem slug (ex. `/api/locais`) | 404 | (framework; sem body de campanha) |
| Admin sem credencial | 401 | (comportamento 092) |

Não usar `CAMPAIGN_SLUG_AUSENTE` nem `CAMPANHA_INACTIVA` nesta superfície.

## Config

`GET /api/c/{slug}/config` reflecte **só** a Campanha desse slug (sistema, módulos, mapa) — não `.env` `SISTEMA` / `MODULOS_ATIVOS` como fonte.
