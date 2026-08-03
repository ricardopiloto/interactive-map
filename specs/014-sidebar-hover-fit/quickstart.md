# Quickstart: Validar hover do menu e largura da busca

## Prerequisites

- Frontend + backend rodando; vários locais
- **Modo jogador** (fora do Modo GM) para lista de cartões + busca

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Abrir `http://localhost:5173`.

## Cenários

### A — Fundo sutil no cartão (SC-001, FR-001)

1. Aba Locais; passar o mouse sobre um cartão de local.
2. **Esperado**: fundo sutil no cartão; distinto do repouso.

### B — Pin hover intacto (SC-002, FR-003)

1. Com o mouse no cartão, olhar o mapa.
2. **Esperado**: pin correspondente ainda destacado como antes.

### C — Troca de item (FR-002)

1. Mover o mouse de X para Y.
2. **Esperado**: tint some de X e aparece em Y.

### D — Hover ≠ abrir detalhe (FR-004, SC-004)

1. Hover sem clicar.
2. **Esperado**: modal/detalhe não abre.

### E — Largura da busca (SC-003, FR-005)

1. Observar o campo “Buscar local…”.
2. **Esperado**: não extravasa o menu; margens alinhadas; sem scroll horizontal por causa do input.

### F — Busca funcional (FR-006)

1. Digitar parte do nome de um local.
2. **Esperado**: lista filtra como antes.

### G — Mobile overlay (opcional)

1. Viewport estreita; abrir menu overlay; checar busca contida.

## Referências

- [spec.md](./spec.md)
- [contracts/ui-sidebar-hover-fit.md](./contracts/ui-sidebar-hover-fit.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
