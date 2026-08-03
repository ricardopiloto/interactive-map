# Quickstart: Validar modal ao lado do pin

## Prerequisites

- Frontend + backend rodando; mapa com pelo menos dois locais
- Estar **fora** do Modo GM (painel de detalhe do jogador)
- Feature 012 (foco pelo menu) já disponível

## Setup

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Abrir `http://localhost:5173`.

## Cenários

### A — Menu: painel ao lado (SC-001, SC-002, FR-001, FR-004)

1. Em desktop, na aba Locais, clicar um local longe das bordas.
2. **Esperado**: mapa foca o pin; painel abre preferencialmente à **direita** do pin; marcador do pin **não** fica sob o painel; backdrop dimido.

### B — Flip perto da borda (FR-004)

1. Focar/selecionar um local cujo pin fique perto da borda direita após o zoom.
2. **Esperado**: painel cabe na viewport (flip/ajuste); pin continua visível fora do painel.

### C — Clique no pin no mapa (FR-003, SC-004)

1. Fechar o detalhe; clicar um pin no mapa.
2. **Esperado**: painel ao lado (mesmo princípio); pin visível.

### D — Mapa bloqueado + fechar (FR-006, FR-007)

1. Com detalhe aberto, tentar arrastar/zoom no mapa.
2. **Esperado**: sem pan/zoom; dim presente.
3. Fechar (botão ou clique no backdrop).
4. **Esperado**: pan/zoom voltam.

### E — Troca de local (US1)

1. Com detalhe aberto, clicar outro local no menu.
2. **Esperado**: painel acompanha o novo pin (visível ao lado).

### F — Viewport estreita (FR-005)

1. Reduzir a janela (~mobile) ou DevTools device mode.
2. Abrir um local.
3. **Esperado**: detalhe legível e fechável (fallback centrado se “ao lado” não couber).

### G — GM inalterado (FR-008)

1. Entrar no Modo GM; selecionar local.
2. **Esperado**: sem PinModal de jogador; fluxo GM como antes.

## Referências

- [spec.md](./spec.md)
- [contracts/ui-pin-modal-beside.md](./contracts/ui-pin-modal-beside.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
