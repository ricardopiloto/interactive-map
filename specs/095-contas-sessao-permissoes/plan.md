# Implementation Plan: Contas de mestre, convite, sessão e permissões

**Branch**: `095-contas-sessao-permissoes` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/095-contas-sessao-permissoes/spec.md`

**Release**: sem bump obrigatório nesta fase (manter `0.19.1` + CHANGELOG `[Unreleased]`), salvo decisão explícita de release. Não corta `/opt/codex-*` (099).

## Summary

Introduzir contas de mestre no `control.db` (Usuario, Membro, Convite, Sessao), sessão por cookie (token opaco + hash), CLI de convite/reset/desactivar/atribuir-dono, e substituir Basic Auth por `require_membro` em todas as rotas admin sob `/api/c/{slug}/…`. Login rate-limit 5/15 min por conta e IP real; CSRF Origin + SameSite=Lax. Frontend: `/login`, `/convite/:token`, `/reset/:token`. Matriz: 100% rotas admin vs anónimo e não-membro. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: Python ≥ 3.12; TypeScript (React + Vite)  
**Primary Dependencies**: FastAPI, SQLModel, Alembic (já); **pwdlib[argon2]** (nova, justificada IV/FR-002); slowapi (já — key_func IP real)  
**Storage**: `control.db` + tabelas novas; `campanha.db` inalterado  
**Testing**: pytest — TDD auth/perms/Alembic; matriz **todas** as rotas admin; login lockout; convite/reset; FE smoke manual no quickstart  
**Target Platform**: backend + SPA; Caddy templates do **Campaign Codex** no repo; legado `/opt` intocado  
**Project Type**: web app (API + frontend + CLI operador)  
**Performance Goals**: login/admin no tempo local típico; lockout em memória ou tabela leve  
**Constraints**: Sem cadastro aberto; sem UI super-admin; um dono/campanha; email = login; sessão 12 h idle / 30 d; convite 72 h  
**Scale/Scope**: 1 revisão Alembic controlo; ~4 modelos; CLI 4 acções; router auth; FE 3–4 páginas; remoção basicauth nos Caddyfiles do repo  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Isolamento**: Matriz 100% rotas admin — anónimo + mestre outra campanha. **PASS** (planeado; FR-010)
- **II. Testes primeiro**: Auth, perms, Alembic controlo, matriz admin — testes a falhar antes. **PASS** (planeado)
- **III. Produção legada**: Zero `git pull` forçado em `/opt/codex-*`; só templates Campaign Codex no repo. **PASS**
- **IV. Simplicidade**: SQLite mantido; **pwdlib** justificada (Argon2). Sem SSO. **PASS**
- **V. i18n**: Login/convite/reset/pós-login pt-BR + en. **PASS**
- **VI. Migrações**: Revisão Alembic `alembic_control` para as 4 tabelas; batch. **PASS**

**Post-Phase 1**: Unchanged. Contratos cobrem auth API, CLI, membership, matriz, FE routes, Caddy. ACL uploads 096; home 098.

## Project Structure

### Documentation (this feature)

```text
specs/095-contas-sessao-permissoes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth-api.md
│   ├── cli-usuario.md
│   ├── require-membro.md
│   ├── admin-auth-matrix.md
│   └── frontend-auth-routes.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/pyproject.toml                 # pwdlib[argon2]
backend/alembic_control/versions/002_* # Usuario, Membro, Convite, Sessao
backend/app/models/usuario.py …        # modelos controlo
backend/app/services/auth_*.py         # password, session, invite, lockout
backend/app/deps/auth.py               # require_membro; remove verify_admin HTTPBasic
backend/app/routers/auth.py            # login/logout/convite/reset (prefix /api/auth)
backend/app/routers/admin/__init__.py  # Depends(require_membro)
backend/app/cli.py                     # usuario criar|reset|desactivar; campanha atribuir-dono
backend/app/services/rate_limit.py     # key_func IP real (CF-Connecting-IP / X-Forwarded-For confiado)
backend/app/main.py                    # CSRF Origin middleware (mutações)
backend/tests/test_auth_*.py           # + matriz admin completa
deploy/Caddyfile* + snippets           # remover basicauth GM do Campaign Codex
frontend/src/pages/LoginPage.tsx …
frontend/src/api/client.ts             # credentials: 'include'; sem Basic
frontend/src/locales/{pt-BR,en}/…
CHANGELOG.md / backend/README.md
```

**Structure Decision**: Auth no controlo; membership resolve campanha pelo slug do path (094) + linha Membro. Admin router só muda a Depends. FE usa cookie (credentials include), não Authorization Basic.

## Complexity Tracking

> None.
