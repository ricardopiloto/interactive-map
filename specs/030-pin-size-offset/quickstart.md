# Quickstart: Validar tamanho e alinhamento dos pins

## Prerequisites

- App a correr (`npm run dev` + backend se necessário)
- Mapa com ≥ 3 pins de local e posição do grupo visível
- DevTools: poder alternar viewport desktop (≥ 800px) e móvel (&lt; 800px)

## Setup

```bash
cd frontend && npm run dev
# backend :8000 conforme README se necessário
```

Abrir a app; opcionalmente Modo GM para reposicionar um Local.

## Cenários

### A — Alinhamento desktop (SC-001, SC-004)

1. Viewport ≥ 800px de largura.
2. Observar a ponta de vários pins vs o ponto esperado no mapa (ou vs o ponto clicado ao reposicionar um Local no GM).
3. **Esperado**: sem desvio lateral óbvio; após reposicionar, o pin assenta no clique.

### B — Alinhamento móvel (SC-001)

1. Viewport &lt; 800px (ou device mode telemóvel).
2. Repetir observação dos mesmos pins + grupo.
3. **Esperado**: alinhamento igualmente correto (não só no desktop).

### C — Tamanho móvel (SC-002, FR-003/004)

1. Comparar screenshot ou lado a lado: desktop vs móvel.
2. **Esperado**: pins ~15–25% menores no móvel; grupo proporcionalmente menor; ainda reconhecíveis.

### D — Toque (SC-003)

1. No viewport móvel, tocar 5 pins distintos.
2. **Esperado**: ≥ 4/5 abrem/selecionam o pin certo à primeira.

### E — Zoom e ênfase (FR-006)

1. Zoom +/−; selecionar e (no desktop) hover um pin.
2. **Esperado**: âncora estável; scale de seleção/hover sem “deslize” lateral.

### F — Fora de escopo intacto

1. Abrir Rede de rotas: nós inalterados por esta feature.
2. Legenda: miniaturas legíveis (não é obrigatório terem encolhido).

## Referências

- [spec.md](./spec.md)
- [contracts/ui-pin-size-offset.md](./contracts/ui-pin-size-offset.md)
- [research.md](./research.md)
