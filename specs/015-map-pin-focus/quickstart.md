# Quickstart: Validar foco ao clicar no pin

## Prerequisites

- Frontend + backend; mapa com ≥2 locais
- **Modo jogador** para cenários A–E; Modo GM para F

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Abrir `http://localhost:5173`.

## Cenários

### A — Clique no pin foca (SC-001, SC-002, FR-001, FR-002)

1. Afastar/panar o mapa para longe de um pin.
2. Clicar o pin no mapa.
3. **Esperado**: animação; pin visível na área útil; zoom no nível moderado (como o menu); detalhe abre.

### B — Mesmo pin de novo (FR-003)

1. Com detalhe aberto, panar para longe.
2. Clicar o mesmo pin de novo.
3. **Esperado**: mapa refoca o pin.

### C — Troca de pin (US1)

1. Clicar pin X; depois pin Y.
2. **Esperado**: mapa foca Y.

### D — Paridade com menu (SC-002, US2)

1. Focar via menu; notar zoom.
2. Focar outro via clique no mapa.
3. **Esperado**: mesmo nível moderado de zoom.

### E — Hover sem foco (FR-005)

1. Hover nos nomes no menu sem clicar.
2. **Esperado**: destaque do pin; sem pan/zoom de foco.

### F — GM sem foco obrigatório (FR-001 / FR-006)

1. Entrar no Modo GM; clicar um pin.
2. **Esperado**: seleção GM como hoje; sem exigir a animação de foco desta feature.

### G — Modal ao lado (013)

1. Após A, confirmar que o pin permanece visível e o painel ao lado é legível.

## Referências

- [spec.md](./spec.md)
- [contracts/ui-map-pin-focus.md](./contracts/ui-map-pin-focus.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
