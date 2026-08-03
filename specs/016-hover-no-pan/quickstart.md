# Quickstart: Validar hover sem pan/zoom da vista

## Prerequisites

- Frontend + backend; ≥3 locais
- Modo jogador; mapa com zoom/pan não trivial (afastar e panar)

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Abrir `http://localhost:5173`.

## Cenários

### A — Hover não move a vista (SC-001, FR-002)

1. Ajustar pan/zoom para uma posição memorável (ex.: canto + zoom médio).
2. Na aba Locais, passar o mouse por ≥3 locais.
3. **Esperado**: pins destacam; a vista do mapa **não** pan/zoom.

### B — Leave (FR-003)

1. Sair o mouse da lista.
2. **Esperado**: destaque some; vista igual à de A.

### C — Após um clique-foco, hover não re-foca (hipótese do bug)

1. Clicar um local no menu (mapa foca).
2. Panar/zoom manualmente para outra posição.
3. Hover outros locais na lista.
4. **Esperado**: vista **não** volta sozinha ao pin clicado; só destaque.

### D — Clique ainda foca (SC-003, FR-004)

1. Clicar um local no menu (ou pin no mapa).
2. **Esperado**: pan/zoom de foco ocorre normalmente.

### E — Cartão do menu (FR-005)

1. Hover no cartão → fundo sutil; vista fixa.

## Referências

- [spec.md](./spec.md)
- [contracts/ui-hover-no-pan.md](./contracts/ui-hover-no-pan.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
