# Research: Home e painel do mestre

**Feature**: `098-home-painel-mestre`  
**Date**: 2026-09-20

## 1. Catálogo público vs painel

**Decision**: Duas APIs distintas.

| Endpoint | Auth | Filtro | Campos |
|----------|------|--------|--------|
| `GET /api/campanhas/catalogo` | anónimo | `activa` ∧ `visibilidade=listada` | `slug`, `nome`, `sistema` |
| `GET /api/campanhas/minhas` | sessão | `activa` ∧ `Membro.papel=dono` do user | + `visibilidade`, `bytes_usados`, `cota_bytes`, `aviso_cota` (≥90%) |

**Rationale**: FR-002/004; cota nunca na home (FR-009).

**Alternatives considered**: Um endpoint com query `?mine=1` — risco de misturar superfícies. Listar tudo no controlo e filtrar no FE — vaza `so_link` (I).

## 2. Criar campanha HTTP

**Decision**: Extrair a lógica de `_create_campanha` (CLI) para serviço reutilizável; `POST /api/campanhas` com sessão → cria sítio + `assign_owner` ao user. Body: `nome`, `slug`, `sistema`, `visibilidade` opcional (default `listada`).

**Rationale**: FR-006; clarificação Q4; evita duplicar mkdir/schema.

**Alternatives considered**: Só CLI — rejeitado pela spec. Proxy para CLI subprocess — frágil.

## 3. Alterar visibilidade

**Decision**: `PATCH /api/campanhas/{slug}/visibilidade` com `require_dono` (097). Body `{ "visibilidade": "listada"|"so_link" }`. Não altera nome/slug/sistema.

**Rationale**: FR-007; reutiliza `require_dono`.

**Alternatives considered**: PATCH genérico da campanha — abre campos fora de escopo.

## 4. Rotas frontend

**Decision**:

| Path | Componente |
|------|------------|
| `/` | `HomePage` (catálogo) |
| `/painel` | `PainelPage` (auth gate → login?next=/painel) |
| `/relacoes` | redirect → `/` |
| `/c/:slug` | inalterado (094) |
| Login sem `next` | → `/painel` (não `/conta`) |

Header: link Home; se sessão → Painel + Logout; senão Entrar. Mestre em `/` continua a ver catálogo público.

**Rationale**: FR-001/003/005; Assumptions; clarificação Q2 (criar fica no painel).

**Alternatives considered**: `/conta` como painel — spec reserva `/painel`. Substituir `/` pelo inventário se logado — rejeitado (edge case).

## 5. Export / import na UI

**Decision**: Cliente chama APIs 097 existentes (`GET …/admin/export`, `POST /api/campanhas/import`). Download via blob; import via `<input type=file>` + refresh da lista minhas. Sem reimplementar zip.

**Rationale**: FR-008; Constituição IV.

## 6. Visual e i18n

**Decision**: Páginas com classes Nocturne existentes (`auth-page` / tokens CSS globais); vazios + formulário empilhados em viewport estreito. Chaves novas em `comum.json` pt-BR/en.

**Rationale**: US5; FR-010; V.

**Alternatives considered**: Design system novo — fora de escopo.

## 7. Schema

**Decision**: Sem migração Alembic. Campos já em `Campanha` / `Membro`.

**Rationale**: Assumptions; VI N/A.

## Resolvidos

Clarificações 2026-09-20 fecham dono-only, pós-criar, inactivas, default `listada`. Sem NEEDS CLARIFICATION.
