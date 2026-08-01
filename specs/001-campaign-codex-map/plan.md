# Implementation Plan: Codex da Campanha — Mapa Interativo

**Branch**: `001-campaign-codex-map` | **Date**: 2026-08-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification + amendment: *“Adeque a paleta de cores ao protótipo. Admin obrigatório com senha — não deixar a rota aberta.”*

## Summary

Manter o Codex (mapa, menu, CRUD GM) já implementado, com duas adequações obrigatórias:

1. **Visual Nocturne** — portar tokens de cor/tipografia de `prototype/nocturne.css` para a SPA (fundo `#161826`, surface `#232532`, texto `#e9e9ed`, accent blurple `#9184d9`), substituindo a paleta âmbar/marrom atual.
2. **Admin nunca aberto** — senha obrigatória em **todo** ambiente (incluindo localhost sem Caddy): HTTP Basic Auth **na API FastAPI** em `/api/admin/*` (fail closed sem credenciais configuradas) + desafio de credencial antes de usar a UI `/admin`; Caddy Basic Auth permanece como camada extra em produção.

## Technical Context

**Language/Version**: TypeScript (frontend, Node 22+), Python 3.12+ (backend)

**Primary Dependencies**: React 19, Vite 8, React Router, `react-zoom-pan-pinch`; FastAPI, SQLModel, Pydantic Settings, uvicorn, slowapi, python-multipart; `HTTPBasic` (Starlette/FastAPI) para admin

**Storage**: SQLite; uploads em `uploads/map|locals|portraits`

**Testing**: Validação manual via quickstart (auth 401 sem senha; UI com paleta Nocturne); opcional pytest para dependency Basic Auth

**Target Platform**: Self-hosted Linux (Docker) + browsers modernos; domínio `mapa.1nodado.com.br`

**Project Type**: Web application (SPA + API)

**Performance Goals**: Inalterados (SC-001–007)

**Constraints**:
- Paleta e tokens alinhados ao Nocturne do protótipo (fonte de verdade: `prototype/nocturne.css`)
- `/api/admin/*` **sempre** exige Basic Auth; sem `ADMIN_USER`/`ADMIN_PASSWORD` → admin indisponível (fail closed)
- UI `/admin` **não** opera sem credencial válida (gate antes do CRUD)
- Caddy continua protegendo `/admin*` e escritas em produção (defense in depth)
- Sem sync ao vivo; produção sem seed narrativo

**Scale/Scope**: Inalterado (1 campanha, 1 GM)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution ainda é placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Separação leitura pública vs escrita admin | PASS |
| Admin exige senha em todos os ambientes (não só Caddy) | PASS (amendment — ver research §2) |
| Paleta alinhada ao protótipo Nocturne | PASS (amendment — ver research §11) |
| Sem sync ao vivo / polling | PASS |
| Produção sem seed narrativo | PASS |
| Self-hosted Docker, non-root | PASS |

**Post-design re-check**: PASS — contratos exigem 401 sem Basic Auth; tokens CSS documentados; data-model inalterado.

## Project Structure

### Documentation (this feature)

```text
specs/001-campaign-codex-map/
├── plan.md              # This file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi-outline.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/
├── config.py            # ADMIN_USER, ADMIN_PASSWORD (obrigatórios para admin)
├── deps/auth.py         # HTTP Basic dependency (novo / a criar)
├── routers/admin/       # Depends(verify_admin) em todas as rotas
frontend/src/
├── styles/
│   ├── tokens.css       # tokens Nocturne (novo)
│   └── global.css       # consome tokens
├── pages/AdminPage.tsx  # gate de credencial antes do shell
├── api/client.ts        # Authorization: Basic … nas chamadas admin
prototype/nocturne.css   # referência visual (não runtime)
deploy/Caddyfile         # Basic Auth adicional em prod
```

**Structure Decision**: Sem novo pacote; alterações cirúrgicas em CSS tokens + auth middleware + AdminPage/api client.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Auth na API **e** na borda | Rota `/admin` não pode ficar aberta em localhost sem Caddy | Só Caddy — falha o requisito “senha obrigatória” em dev |
| Gate de credencial na UI admin | Evita shell GM vazio/usável após 401 em cascata | Só 401 na API — página admin ainda “abre” visualmente |

## Implementation notes (próximo `/speckit-tasks` ou implementação direta)

1. Extrair `:root` Nocturne → `frontend/src/styles/tokens.css`; trocar hex hardcoded em CSS de componentes por `var(--color-*)`.
2. Config `ADMIN_USER` / `ADMIN_PASSWORD`; dependency FastAPI; 401 sem header válido.
3. Admin UI: prompt/gate de usuário+senha → `sessionStorage` com token Basic → `adminApi` envia header; logout limpa token.
4. Atualizar `.env.example`, README, quickstart (cenário C sem “aberto em localhost”).
