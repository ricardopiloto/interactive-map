# Quickstart: Banco de controle e SQLite por campanha

**Feature**: `093-controle-alembic-sqlite`  
**Purpose**: Validar CLI, isolamento A/B, legado+carimbo e suíte 092 ([spec.md](./spec.md), [contracts/](./contracts/)).

## Prerequisites

- 092 implementada (`uv run pytest` no backend).
- `uv` + Python ≥ 3.12.
- Variáveis: `DATA_DIR` (dev), `CAMPAIGN_SLUG`, `ADMIN_USER` / `ADMIN_PASSWORD` para HTTP.

## Comandos

```bash
cd backend
uv sync
# Criar duas campanhas
uv run python -m app.cli campanha criar --slug mesa-a --nome "Mesa A" --sistema wfrp4e
uv run python -m app.cli campanha criar --slug mesa-b --nome "Mesa B" --sistema wod
uv run python -m app.cli campanha listar

# HTTP (uma campanha)
export CAMPAIGN_SLUG=mesa-a
uv run uvicorn app.main:app --reload --port 8000
```

## Scenarios

### 1. Criar + listar (US1–US2)

1. Criar com slug válido → pasta sob `data/campanhas/<uuid>/` + linha no controle.
2. Criar `api` ou slug duplicado → recusa, sem órfão.
3. Listar → ambas as mesas.

### 2. Isolamento A/B (US3)

1. Com slug A, criar um local (admin API ou session helper).
2. Resolver B → local ausente.
3. Grupo id=1 distinto em A e B → cada um o seu.
4. Alternar A→B→A no mesmo processo → sem mistura.

### 3. Legado (US4)

1. Criar campanha; copiar fixture legado sobre `campanha.db`.
2. Abrir (resolve) → contagens/ids intactos; revisão = head.
3. Reabrir → sem re-ponte destrutiva.
4. Campanha nova sem cópia → head sem ponte.

### 4. HTTP fail-closed

1. Sem `CAMPAIGN_SLUG` → pedidos que usam sessão falham com código de ausente.
2. Slug inactivo (marcado no teste) → `CAMPANHA_INACTIVA`.

### 5. Regressão 092

```bash
cd backend && uv run pytest
```

Expectativa: 0 falhas (SC-006) + novos testes 093 a passar.

## Não validar nesta feature

- `/c/{slug}` HTTP, contas, cota enforced, cópia WFRP/WoD de produção.
