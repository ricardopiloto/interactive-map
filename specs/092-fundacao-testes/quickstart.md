# Quickstart: Fundação de testes do backend

**Feature**: `092-fundacao-testes`  
**Purpose**: Validar o comando único e a malha de caracterização ([spec.md](./spec.md), [contracts/](./contracts/)).

## Prerequisites

- Python ≥ 3.12, `uv` no PATH
- Trabalhar em `backend/` (o `.env` local pode existir; a suíte **não** deve escrever em `data/mapa.db` nem nos `uploads/` habituais)

## Comando

```bash
cd backend
uv sync --group dev
uv run pytest
```

Correr **duas vezes seguidas**. Expectativa: exit 0, 0 falhas nas duas (SC-001).

## Scenarios

### 1. Comando documentado (US1)

1. Abrir `backend/README.md`.
2. **Expect**: instrução para `uv run pytest` e uma linha a dizer que a suíte usa SQLite/uploads temporários.

### 2. Isolamento de ficheiros (US1 / SC-005)

1. Nota o mtime/tamanho de `backend/data/mapa.db` (se existir) e de `backend/uploads/`.
2. `uv run pytest`.
3. **Expect**: esses ficheiros inalterados.

### 3. Leituras públicas (US2)

Coberto automaticamente por `tests/test_public_reads.py`. Manual opcional: com a API de dev no ar, os mesmos paths de [characterization-public.md](./contracts/characterization-public.md) devem coincidir com o que os testes pinam.

### 4. Portão GM (US3)

Coberto por `tests/test_admin_auth.py`. Sem credencial → 401 em todas as GET admin listadas; com o par de teste → não 401.

### 5. Visibilidade (US4)

Coberto por `tests/test_visibility.py`. Oculto ausente no público; presente no admin.

### 6. Plano de rotas (US2 / clarify C)

Coberto por `tests/test_routes_plan.py`: um caso com segmento ( `rotas` ≥ 1 ) e um sem (`rotas` = []).

## Não validar nesta feature

- UI, Vitest, Playwright
- `POST /api/admin/uploads`
- Rotas `/c/{slug}` ou segundo SQLite de campanha
