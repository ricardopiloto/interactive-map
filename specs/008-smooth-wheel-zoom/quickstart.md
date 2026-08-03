# Quickstart: Validar zoom fluido na rolagem

## Prerequisites

- Frontend (e backend se o mapa depender de `/uploads`) rodando
- Mouse com roda ou trackpad; mapa visível

## Setup

```bash
cd frontend && npm run dev
```

Abrir `http://localhost:5173`.

## Cenários

### A — Rolagem mais suave que o legado (SC-001, SC-002, FR-001)

1. Com o mapa na escala inicial, dar **um** tick de rolagem.
2. **Esperado**: zoom muda de forma perceptível mas **sem** salto extremo; um tick **não** chega perto do zoom máximo.

### B — Faixa intermediária em poucos ticks (SC-003, FR-002)

1. Rolar até um nível de detalhe local e voltar à visão geral (ou o inverso).
2. Contar ticks aproximados na faixa útil.
3. **Esperado**: sensação na ordem de ~3–15 ticks (não 1–2 bruscos nem dezenas lentos).

### C — Botões vs rolagem (SC-005, FR-007)

1. Na mesma faixa de zoom, comparar 1 tick de roda vs 1 clique em **+**.
2. **Esperado**: o clique aproxima **mais** que um único tick.

### D — 1:1 e limites (FR-004, FR-005)

1. Usar +/− e **1:1**; rolar até min/max.
2. **Esperado**: 1:1 restaura escala inicial; nos limites, ticks extras não quebram a UI.

### E — Cobertura relativa (FR-003 / clarificação C)

1. Comparar (a) janela larga vs (b) janela estreita / DevTools resize, ou mapas com tamanhos muito diferentes se disponíveis.
2. **Esperado**: em ambos os casos a rolagem permanece controlável (mais fina quando a imagem “ultrapassa” mais a viewport).

### F — Resize sem reset agressivo

1. Dar zoom/pan; redimensionar a janela.
2. **Esperado**: não perder completamente a vista (sem remount destrutivo); sensibilidade pode recalibrar.

## Referências

- [spec.md](./spec.md)
- [contracts/ui-wheel-zoom-steps.md](./contracts/ui-wheel-zoom-steps.md)
- [research.md](./research.md)
