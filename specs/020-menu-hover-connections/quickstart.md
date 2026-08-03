# Quickstart: Validar hover do menu com conexões

## Prerequisites

- Frontend + backend com locais e `saida_ids` (ex. A→B, A→C; B→outro se possível)
- Dev servers habituais

## Setup

```bash
cd frontend && npm run dev
# backend: cd backend && uv run uvicorn app.main:app --reload --port 8000
```

Abrir `http://localhost:5173`. Garantir que **nenhum** pin está aberto no início dos cenários A–B.

## Cenários

### A — Hover sem seleção (SC-001, FR-001)

1. Aba Locais; passar o mouse sobre A (com ≥2 saídas).
2. **Esperado**: linhas de saída de A; pin A destacado; pan/zoom **não** mudam.
3. Mover hover para outro local D com saídas.
4. **Esperado**: linhas passam a ser de D.
5. Mouse leave da lista.
6. **Esperado**: nenhuma linha.

### B — Sem saídas (FR-005)

1. Hover em local sem `saida_ids`.
2. **Esperado**: pin destaca; sem linhas.

### C — Seleção manda (SC-003, FR-002)

1. Abrir/selecionar A (linhas de A).
2. Hover em B na lista.
3. **Esperado**: pin B destaca; linhas **continuam** de A.
4. Leave → linhas de A; fechar A → sem linhas; hover B → linhas de B.

### D — Lista GM (FR-008 / clarificação)

1. Modo GM; lista de locais; sem seleção no mapa (fechar pin/form se aberto).
2. Hover em um local com saídas.
3. **Esperado**: mesmas linhas que no menu jogador.

### E — Sem pan/zoom (SC-004, FR-004)

1. Fixar vista; percorrer ≥5 itens com hover.
2. **Esperado**: só destaque + linhas (sem seleção); vista estável; clique ainda seleciona.

## Referências

- [spec.md](./spec.md)
- [contracts/ui-menu-hover-connections.md](./contracts/ui-menu-hover-connections.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
