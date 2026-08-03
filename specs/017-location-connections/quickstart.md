# Quickstart: Validar conexões entre locais

## Prerequisites

- Backend + frontend rodando; ≥3 locais no mapa (ex. Altdorf + 2 destinos)
- Credenciais GM (`ADMIN_USER` / `ADMIN_PASSWORD`)

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Abrir `http://localhost:5173`.

## Cenários

### A — Sem foco, sem linhas (FR-005, SC-004)

1. Garantir que nenhum pin está selecionado (fechar modal se aberto).
2. **Esperado**: nenhuma linha de conexão no mapa.

### B — Foco mostra só saídas da origem (SC-001, SC-005)

1. Como GM, editar local A → marcar destinos B e C em **Saídas** → salvar.
2. Recarregar (ou refresh dos dados); como jogador, abrir o pin de A.
3. **Esperado**: linhas A–B e A–C; sem setas; ao fechar o pin, linhas somem.
4. Abrir o pin de B (sem saída cadastrada para C).
5. **Esperado**: não aparece a linha A–B (só saídas de B, se houver).

### C — Formulário GM (SC-003)

1. Modo GM → editar A → desmarcar C → salvar → recarregar → abrir A.
2. **Esperado**: só linha A–B.
3. Tentar marcar o próprio A como destino (se a UI impedir, ok; se a API rejeitar auto-id, ok).

### D — Exclusão de destino (FR-010)

1. Com A→B cadastrado, excluir local B.
2. Abrir A.
3. **Esperado**: mapa ok; sem linha fantasma para B; app sem erro.

### E — Hub + interação (US3)

1. Dar a A ≥5 saídas; abrir A; zoom/pan; clicar outro pin.
2. **Esperado**: linhas acompanham o mapa; cliques nos pins funcionam; placement GM (se testado) não é bloqueado pelas linhas.

## Referências

- [spec.md](./spec.md)
- [data-model.md](./data-model.md)
- [contracts/api-local-saidas.md](./contracts/api-local-saidas.md)
- [contracts/ui-map-connection-lines.md](./contracts/ui-map-connection-lines.md)
- [research.md](./research.md)
