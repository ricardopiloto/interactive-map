# Contract: caracterização pública

Comportamento **actual** a pinar (FR-004). Sem mudança de API.

Envelope de erro: `{"detail": {"erro": "<CODIGO>"}}` (+ `detalhes` opcional).

## Listagens e detalhe

| Pedido | Auth | Expectativa no código actual |
|--------|------|------------------------------|
| `GET /api/locais` | nenhuma | 200, lista (vazia ou seed) |
| `GET /api/locais/{id}` | nenhuma | 200 se existe; 404 se não |
| `GET /api/npcs` | nenhuma | 200; sem personagens `visivel_para_todos=false` |
| `GET /api/npcs/{id}` | nenhuma | 200 se visível; 404 `NPC_NAO_ENCONTRADO` se oculto ou inexistente |
| `GET /api/personagens` | nenhuma | 200; idem filtro de visibilidade |
| `GET /api/personagens/{id}` | nenhuma | 200 se visível; 404 `PERSONAGEM_NAO_ENCONTRADO` se oculto ou inexistente |
| `GET /api/vinculos` | nenhuma | 200; só públicos com ambos extremos visíveis ao jogador |
| `GET /api/arcos` | nenhuma | 200, lista |
| `GET /api/arcos/{id}` | nenhuma | 200 se existe |
| `GET /api/grupo` | nenhuma | 200; cria default `(0.5, 0.5, bandeira)` se a tabela está vazia |
| `GET /api/config` | nenhuma | 200 `{ sistema, modulos_ativos, has_map_image }` |

`has_map_image`: `false` se a pasta temp `uploads/map/` não tem `campaign-map.{webp,jpg,jpeg,png,gif}`.

## Fora desta malha

`GET /api/waypoints` público, `GET /api/health`, OpenAPI, CRUD admin, uploads.
