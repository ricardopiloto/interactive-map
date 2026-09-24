# Research: Contas de mestre, convite, sessão e permissões

**Feature**: `095-contas-sessao-permissoes`  
**Date**: 2026-09-20

## 1. Hashing de senha

**Decision**: Dependência `pwdlib[argon2]` (PedidoHash / Argon2id defaults da lib). Guardar só o hash em `Usuario.senha_hash`.

**Rationale**: FR-002 + input do utilizador; Argon2 é o actual recomendado OWASP; pwdlib é fino e cabe em IV com justificação.

**Alternatives considered**: `passlib` (mais pesado/legado); `argon2-cffi` directo — ok mas pwdlib já envolve API estável pedida.

## 2. Sessão e cookie

**Decision**:

- Token opaco 32+ bytes (`secrets.token_urlsafe`); persistir **SHA-256** (ou hash dedicado) em `Sessao.token_hash`, nunca o token em claro.
- Cookie: nome `codex_session`; `HttpOnly`; `SameSite=Lax`; `Secure` quando `DEBUG=false` (ou flag `COOKIE_SECURE`); `Path=/`.
- TTL: actualizar `ultimo_acesso` a cada pedido autenticado; expirar se idle > 12 h **ou** `criado_em` > 30 d.
- Logout / reset senha / desactivar: apagar ou marcar `Sessao` inválida (todas as do utilizador no reset/desactivar).

**Rationale**: Spec FR-003/007; brief §8.

**Alternatives considered**: JWT sem tabela — rejeitado (revogação ao reset mais frágil). Token em claro na BD — rejeitado.

## 3. CSRF

**Decision**: Para `POST|PUT|PATCH|DELETE` (e upload): exigir `Origin` (ou `Referer` se Origin ausente) cujo host esteja em `CORS_ORIGINS` / lista de origens permitidas. Pedidos same-site de browsers modernos com SameSite=Lax + Origin check. Excepção: health e GETs.

**Rationale**: Spec FR-004; brief risco CSRF.

**Alternatives considered**: Double-submit CSRF token — mais FE; desnecessário com Origin + Lax no MVP.

## 4. `require_membro` vs Basic Auth

**Decision**: Remover `HTTPBasic` / `verify_admin`. Novo Depends:

1. Ler cookie → resolver `Sessao` válida → `Usuario` activo.
2. Resolver `Campanha` pelo `{slug}` do path (já 094).
3. Exigir `Membro` activo `(usuario_id, campanha_id)`.
4. Falhas: `AUTENTICACAO_NECESSARIA` (401) vs `PERMISSAO_NEGADA` / `NAO_MEMBRO` (403) — anónimo 401; autenticado não-membro 403.

Aplicar como `dependencies=[Depends(require_membro)]` no router admin (incl. upload e `/session`).

**Rationale**: FR-008/009; clarificação membership.

**Alternatives considered**: Manter Basic Auth em paralelo — rejeitado (spec remove). Papéis dono vs co-mestre com permissões distintas — fora de escopo UI; qualquer membro = admin.

## 5. Modelo de dono

**Decision**: Papel `dono` com **unicidade por campanha**. `campanha atribuir-dono --email … --slug …`: upsert Membro dono para o email; apagar o Membro do dono anterior (se outro utilizador).

**Rationale**: Clarificação Q3.

## 6. Convite e reset

**Decision**: Tabela `Convite` com `tipo` ∈ {`activar`, `reset`}, `token_hash`, `expira_em` (now+72h), `consumido_em` nullable, `usuario_id`. CLI imprime URL absoluta base configurável (`PUBLIC_BASE_URL` ou omissão `http://localhost:5173`) + path `/convite/{token}` ou `/reset/{token}`. Token raw só na URL; BD guarda hash. Consumir: definir senha → activar utilizador (activar) ou só actualizar hash (reset) + invalidar sessões + marcar consumido.

**Rationale**: FR-005/006; rotas FE clarificadas.

**Alternatives considered**: Enviar email SMTP — fora de escopo (CLI imprime link para o operador).

## 7. Login lockout e IP real

**Decision**:

- Contadores: tabela leve `LoginTentativa` ou campos em cache de processo **mais** persistência mínima em controlo (preferir tabela `login_bloqueio` / registos de falha com janela 15 min) para sobreviver reload.
- Política: 5 falhas → bloqueio 15 min por **email normalizado** e por **IP**; durante bloqueio, login falha mesmo com senha correcta (`LOGIN_BLOQUEADO`).
- `Limiter` / key_func: se `TRUSTED_PROXY=true` (ou sempre atrás de Caddy no deploy), usar `CF-Connecting-IP` se presente, senão primeiro hop de `X-Forwarded-For` **só** se o peer imediato for trusted; caso contrário `request.client.host`. Documentar no README.

**Rationale**: Clarificação Q2; brief risco proxy IP.

**Alternatives considered**: Só slowapi in-memory — frágil com multi-worker; tabela é mais correcta para SQLite single-instance.

## 8. Rotas API de auth

**Decision**: Prefixo `/api/auth` (fora de `/api/c/{slug}`):

| Método | Path | Auth |
|--------|------|------|
| POST | `/api/auth/login` | público |
| POST | `/api/auth/logout` | sessão |
| POST | `/api/auth/convite/aceitar` | token no body |
| POST | `/api/auth/reset/confirmar` | token no body |
| GET | `/api/auth/me` | sessão (opcional para UI) |

Admin `/api/c/{slug}/admin/session` passa a devolver email/id do membro (não user Basic).

**Rationale**: Separar auth global do tenancy por slug.

## 9. Frontend

**Decision**: Páginas `/login`, `/convite/:token`, `/reset/:token`, e pós-login mínima (`/login` state ou `/sessao`). `fetch` com `credentials: 'include'`. Remover `codex_admin_basic` / `Authorization: Basic`. Gate GM: se 401 em admin → navigate `/login?next=…`. `next` só paths relativos começados por `/` sem `//`.

**Rationale**: Clarificações Q4–Q5.

## 10. Caddy / deploy no repo

**Decision**: Remover blocos `basicauth` dos ficheiros Campaign Codex em `deploy/Caddyfile`, `Caddyfile.local`, `snippets/caddy.site.tpl` (e notas no README). **Não** alterar pastas `/opt/codex-*`. `ADMIN_USER`/`ADMIN_PASSWORD` deixam de ser portão; podem permanecer no `.env.example` como deprecated/removidos.

**Rationale**: FR-012; constituição III.

## 11. Matriz de testes admin

**Decision**: Teste que introspecta `app.routes` (ou lista canónica gerada) para todos os paths sob `/api/c/{slug}/admin`, e para cada um: GET/método seguro sem cookie → não 2xx autenticado; com sessão de mestre da campanha B no slug A → 403; com membro A → não 401 (200 ou 422 de validação aceitável em POSTs sem body).

**Rationale**: FR-010; SC-001.
