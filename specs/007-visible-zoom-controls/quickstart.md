# Quickstart: Validar controles de zoom sempre visíveis

## Prerequisites

- Frontend rodando (`npm run dev`); backend se o mapa/imagem depender dele
- Preferível: DevTools para simular mobile + F11 / tela cheia no desktop

## Setup

```bash
cd frontend && npm run dev
```

Abrir `http://localhost:5173`.

## Cenários

### A — Desktop tela cheia (SC-001, SC-003, FR-001)

1. Entrar em tela cheia do navegador (F11 ou equivalente).
2. Observar o canto dos controles de zoom.
3. **Esperado**: +, − e 1:1 totalmente visíveis; sequência aproximar → afastar → 1:1 funciona sem redimensionar a janela.

### B — Desktop maximizado / resize (FR-001)

1. Maximizar a janela e variar a altura.
2. **Esperado**: controles permanecem dentro da área do mapa.

### C — Mobile + barra inferior (SC-002, FR-002)

1. DevTools → viewport mobile (ou dispositivo) com a barra de abas inferior visível.
2. **Esperado**: controles não cobertos pela barra nem cortados; toque em +, −, 1:1 funciona.

### D — Pan não move controles (SC-004, FR-005)

1. Arrastar o mapa para longe.
2. **Esperado**: botões de zoom permanecem no mesmo lugar na janela do mapa.

### E — Modo GM (FR-004)

1. Entrar em Modo GM (mapa carregado).
2. **Esperado**: botão **Mapa** (substituir) no grupo de controles também totalmente visível.

### F — Legenda

1. Confirmar que a legenda Local/Grupo continua legível e que os controles não a cobrem por completo de forma a impedir leitura.

## Referências

- [spec.md](./spec.md)
- [contracts/ui-zoom-controls-visibility.md](./contracts/ui-zoom-controls-visibility.md)
- [research.md](./research.md)
