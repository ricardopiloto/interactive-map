# Quickstart: Validar foco do pin pelo menu

## Prerequisites

- Frontend + backend rodando; mapa com pelo menos dois locais
- Opcional: Modo GM para testar placement

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Abrir `http://localhost:5173`.

## Cenários

### A — Centrar + zoom moderado (SC-001, SC-002, FR-001, FR-002)

1. Afastar (zoom out) e panar o mapa para longe de um local.
2. Na aba Locais, clicar o nome desse local.
3. **Esperado**: animação; pin na região central; zoom claramente maior que o afastado, não no máximo.

### B — Zoom fixo mesmo se já aproximado (FR-002)

1. Zoom manual bem alto; clicar outro local no menu.
2. **Esperado**: zoom estabiliza no mesmo nível moderado de A (não permanece no máximo).

### C — Troca de local (FR-003)

1. Focar local X; depois clicar Y na lista.
2. **Esperado**: mapa foca Y.

### D — Hover sem foco (FR-005, SC-004)

1. Passar o mouse pelos nomes sem clicar.
2. **Esperado**: destaque do pin; mapa não pan/zoom por hover.

### E — Jogador: modal + foco (FR-004, SC-004)

1. Fora do Modo GM, clicar local no menu.
2. **Esperado**: modal abre **e** mapa foca o pin.

### F — GM placement (US2)

1. Entrar em adicionar/reposicionar/mover grupo.
2. Clicar local no menu.
3. **Esperado**: sem seleção/foco que interrompa o placement (mesmo guard de hoje).

### G — Clique no pin no mapa

1. Clicar um pin no mapa (não pelo menu).
2. **Esperado**: seleção/modal conforme modo; sem requisito de forçar o zoom de foco do menu.

## Referências

- [spec.md](./spec.md)
- [contracts/ui-menu-focus-pin.md](./contracts/ui-menu-focus-pin.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
