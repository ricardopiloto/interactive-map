# Quickstart: Validar deseleção de pin no modo GM

## Prerequisites

- Frontend e backend rodando (dev)
- Credenciais GM válidas
- Pelo menos um local no mapa

## Setup

```bash
# terminal 1 — backend
cd backend && uv run uvicorn app.main:app --reload --port 8000

# terminal 2 — frontend
cd frontend && npm run dev
```

Abrir `http://localhost:5173`. Entrar em **Modo GM**.

## Cenários

### A — Clique fora deseleciona (SC-001, SC-002, FR-001, FR-003)

1. Clicar em um pin de local; confirmar destaque (`--selected`).
2. Clicar na área vazia do mapa (fora de pins, controles e legenda).
3. **Esperado**: nenhum pin permanece selecionado.

### B — Trocar de pin (FR-002)

1. Selecionar pin A; depois clicar no pin B.
2. **Esperado**: B fica selecionado (A deixa de estar).

### C — Placement tem prioridade (SC-003, FR-006)

1. Com ou sem pin selecionado, iniciar **adicionar local** (ou reposicionar / mover grupo).
2. Clicar no mapa.
3. **Esperado**: fluxo de posicionamento avança; não é só “limpar seleção”.

### D — Formulário admin intacto (FR-005)

1. Em Locais (GM), abrir **editar** um local (formulário/dialog).
2. Selecionar um pin no mapa; clicar fora no mapa para deselecionar.
3. **Esperado**: formulário de edição permanece aberto; destaque do pin some.

### E — Pan/zoom (SC-004, FR-007)

1. Selecionar um pin; pan e zoom no mapa sem clicar “solto” na área vazia.
2. **Esperado**: seleção permanece durante a navegação.

### F — Grupo e chrome (FR-008)

1. Com pin selecionado, clicar no ícone do grupo, nos botões de zoom e na legenda.
2. **Esperado**: seleção **não** limpa por esses cliques (só área vazia do mapa).

### G — Modo jogador (FR-009)

1. Sair do Modo GM; abrir um local (ficha); fechar a ficha.
2. **Esperado**: seleção limpa ao fechar; não é obrigatório haver clique-fora no mapa para jogador.

## Referências

- [spec.md](./spec.md)
- [contracts/ui-gm-pin-deselect.md](./contracts/ui-gm-pin-deselect.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
