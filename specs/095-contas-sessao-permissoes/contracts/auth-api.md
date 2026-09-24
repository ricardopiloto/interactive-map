# Contract: API de autenticação

**Feature**: `095-contas-sessao-permissoes`

## Endpoints (`/api/auth`)

### POST `/api/auth/login`

Body: `{ "email": string, "password": string }`  
Sucesso: 204 ou 200 + `{ "email" }`; Set-Cookie `codex_session`.  
Erros: `CREDENCIAIS_INVALIDAS`, `LOGIN_BLOQUEADO`, `CONTA_INACTIVA` (códigos mapeáveis; não enumerar em excesso se política for opaca — preferir mensagem genérica + código estável).

### POST `/api/auth/logout`

Requer cookie; invalida sessão; limpa cookie. 204.

### POST `/api/auth/convite/aceitar`

Body: `{ "token": string, "password": string }`  
Consome convite `activar`; define senha; `activo=true`; opcionalmente cria sessão.

### POST `/api/auth/reset/confirmar`

Body: `{ "token": string, "password": string }`  
Consome `reset`; nova senha; revoga sessões.

### GET `/api/auth/me`

Com sessão: `{ "email", "id" }`. Sem: 401.

## Cookie

`codex_session`: HttpOnly; SameSite=Lax; Secure se não-DEBUG; Path=/.

## CSRF (mutações)

POST/PUT/PATCH/DELETE (auth e admin): `Origin` (ou Referer) MUST corresponder a origem permitida (`CORS_ORIGINS`).

## Admin session

`GET /api/c/{slug}/admin/session` — requer membro; resposta `{ "email": "…" }` (não user Basic).
