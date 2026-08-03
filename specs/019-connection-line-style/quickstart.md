# Quickstart: Validar estilo das linhas de conexão

## Prerequisites

- Frontend (+ backend com locais que tenham `saida_ids`)
- Pelo menos um local A com saídas para B (idealmente também C)
- Preferível: um dos pins com cor visitada `#e5484d` para contraste linha vs pin

## Setup

```bash
cd frontend && npm run dev
# backend se necessário: cd backend && uv run uvicorn app.main:app --reload --port 8000
```

Abrir `http://localhost:5173`.

## Cenários

### A — Cor família visitado, mais clara (SC-001, FR-001)

1. Selecionar/abrir o local A com saídas.
2. **Esperado**: linhas **não** roxas; vermelho claro da família visitado, mais claro que um pin visitado sólido.

### B — Opacidade moderada (SC-003, FR-003)

1. Com linhas visíveis sobre o mapa-base.
2. **Esperado**: terreno sob o traço ainda distinguível; rota legível de relance (~55–65% de opacidade).

### C — Sombra suave (SC-002, FR-002)

1. Zoom médio; observar as linhas.
2. **Esperado**: sombra discreta ao longo do traço; sem glow exagerado nem ofuscar pins vizinhos.

### D — Visibilidade 017 (SC-004, FR-004)

1. Deselecionar o local / fechar o pin.
2. **Esperado**: nenhuma linha permanece.
3. Re-selecionar → linhas voltam com o novo estilo.

### E — Distinção vs pin visitado (US2)

1. Selecionar um local com pin vermelho visitado e saídas.
2. **Esperado**: linha claramente mais clara/transparente que o preenchimento do pin.

## Referências

- [spec.md](./spec.md)
- [contracts/ui-connection-line-style.md](./contracts/ui-connection-line-style.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
