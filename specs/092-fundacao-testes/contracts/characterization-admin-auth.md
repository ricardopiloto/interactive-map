# Contract: portão admin (Basic Auth)

Prefixo `/api/admin` com `Depends(verify_admin)`. Credenciais da suíte injectadas em `settings`.

Códigos: `AUTENTICACAO_NECESSARIA` (sem header), `CREDENCIAIS_INVALIDAS` (par errado), ambos HTTP 401 + `WWW-Authenticate: Basic`.

## GET de listagem / sessão (clarificação B)

Cada path, **sem** `Authorization` → 401. Com `auth=(user, password)` válidos → **não** 401 (200 no código actual).

| Path |
|------|
| `GET /api/admin/locais` |
| `GET /api/admin/npcs` |
| `GET /api/admin/personagens` |
| `GET /api/admin/vinculos` |
| `GET /api/admin/waypoints` |
| `GET /api/admin/route-segments` |
| `GET /api/admin/map-scale` |
| `GET /api/admin/session` → `{ "user": "<ADMIN_USER>" }` |

## Superfícies admin sem GET

Não inventar listagens. Pin só o portão nas rotas que existem:

| Pedido | Sem credencial | Com credencial válida (corpo vazio/inválido) |
|--------|----------------|-----------------------------------------------|
| `POST /api/admin/arcos` | 401 | não 401 (tipicamente 422) |
| `PUT /api/admin/grupo` | 401 | não 401 (tipicamente 422) |

## Explicitamente fora

`POST /api/admin/uploads` e restantes verbos de criar/editar/apagar (exceto os dois acima, só para o portão).
