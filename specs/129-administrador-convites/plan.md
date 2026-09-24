# Implementation Plan: Administrador da aplicação e convites de mestres

**Branch**: `129-administrador-convites` | **Date**: 2026-09-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/129-administrador-convites/spec.md`

## Summary

Introduzir um papel de administrador (`Usuario.is_admin`, booleano, sem constraint de unicidade) e uma tela autenticada, visível só a administradores, pra criar convites de novos mestres sem depender da CLI. Bootstrap do primeiro administrador continua exclusivamente por CLI (`usuario promover-admin`/`rebaixar-admin`, novos comandos que reaproveitam o padrão já existente de `atribuir-dono`). O endpoint novo (`POST /api/admin/convites`) reaproveita `create_usuario_with_invite` sem duplicar lógica, atrás de uma guarda nova (`require_admin`, no mesmo espírito de `require_dono`, mas sem escopo de campanha). Nenhuma restrição nova em criação/compartilhamento de campanha — esse fluxo continua usando só `require_session_user`.

## Technical Context

**Language/Version**: Python 3.12 (FastAPI/SQLModel) + TypeScript/React 19

**Primary Dependencies**: Nenhuma nova — reaproveita Alembic, `pwdlib`, `create_usuario_with_invite`, `react-i18next`

**Storage**: SQLite `control.db`, coluna nova em `usuario` via revisão Alembic (`alembic_control`)

**Testing**: pytest — matriz de rotas admin (anónimo/mestre-sem-papel recusados), CLI de promoção/rebaixamento, criação de convite via UI equivalente ao fluxo de CLI

**Target Platform**: Backend FastAPI + frontend web

**Project Type**: Web application (backend + frontend)

**Performance Goals**: N/A — uma escrita pontual por convite emitido, sem escala relevante

**Constraints**: Não introduzir infraestrutura de e-mail (fora de escopo, confirmado no TR); não travar `is_admin` num único administrador via schema (decisão de produto, não de banco); não alterar o contrato de `create_usuario_with_invite`/formato de convite existente

**Scale/Scope**: Uma coluna nova, dois comandos de CLI, um endpoint, uma tela, um item de menu condicional

## Constitution Check

- **I. Isolamento**: PASS / N/A. `Usuario`/`Convite` vivem em `control.db`, fora do isolamento por campanha; o endpoint novo não lê nem escreve dado de campanha.
- **II. Testes primeiro**: GATE — autenticação/permissões MUST ter teste a falhar antes da implementação. A rota `/api/admin/convites` entra na mesma matriz de testes admin (anónimo, mestre sem `is_admin`, administrador válido) exigida desde a spec 095. Escrever esses três casos antes do endpoint.
- **III. Produção legada**: PASS / N/A. Sem exigência de mudança em `/opt`.
- **IV. Simplicidade**: PASS. Reaproveita `create_usuario_with_invite`; nenhuma dependência nova; SQLite/Alembic mantidos.
- **V. i18n**: GATE — toda copy nova da tela de convites MUST existir em pt-BR e en antes de fechar a feature.
- **VI. Migrações**: GATE — `is_admin` entra por revisão Alembic nova em `alembic_control` (próxima após `005_genero.py`), não por `ALTER` ad hoc.

Nenhuma violação sem justificativa — todos os gates são cumpríveis com o padrão já existente no código.

## Project Structure

### Documentation (this feature)

```text
specs/129-administrador-convites/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cli-promover-admin.md
│   └── post-admin-convites.md
└── tasks.md                    # Created by speckit-tasks, not this phase
```

### Source Code (repository root)

```text
backend/
├── alembic_control/versions/006_usuario_is_admin.py   # NOVO — coluna is_admin, default false
├── app/
│   ├── models/usuario.py                              # Usuario ganha is_admin: bool = Field(default=False)
│   ├── deps/auth.py                                    # NOVO require_admin (session + is_admin), ao lado de require_dono
│   ├── services/auth_admin.py                          # NOVO promote_admin()/demote_admin(); create_usuario_with_invite reaproveitada sem mudança
│   ├── routers/
│   │   ├── administrador.py                            # NOVO router, prefix /api/admin, dependencies=[Depends(require_admin)]
│   │   ├── auth.py                                      # me() passa a incluir is_admin na resposta
│   │   └── admin/__init__.py                            # não muda — continua só campaign-scoped
│   ├── main.py                                          # app.include_router(administrador.router)
│   └── cli.py                                            # NOVO subcomandos usuario promover-admin / rebaixar-admin
└── tests/
    ├── test_admin_convites_route_matrix.py             # NOVO — anónimo/sem-papel/admin
    └── test_cli_promover_admin.py                       # NOVO

frontend/
├── src/
│   ├── pages/AdminConvitesPage.tsx                     # NOVO — tela de emissão de convite
│   ├── App.tsx                                          # rota nova /admin/convites
│   ├── api/client.ts                                    # authApi.me() passa a tipar is_admin; novo adminConvitesApi.criar()
│   ├── components/layout/UserMenu.tsx                    # item de menu condicional a is_admin
│   └── locales/{pt-BR,en}/comum.json                     # chaves novas da tela
```

**Structure Decision**: Backend ganha um router novo e independente do pacote `admin/` existente (que é exclusivamente por campanha, prefixo `/api/c/{slug}/admin` — não serve pra um recurso de escopo de aplicação). `require_admin` fica em `deps/auth.py`, ao lado de `require_dono`, seguindo exatamente o mesmo padrão (sessão + checagem de atributo), só que sem depender de `slug`/`Membro`. Frontend ganha uma tela e uma rota novas, sem tocar no fluxo de criação de campanha existente.

## Complexity Tracking

Nenhuma violação de constituição. Nenhuma dependência nova.
