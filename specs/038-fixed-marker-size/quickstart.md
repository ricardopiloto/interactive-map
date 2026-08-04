# Quickstart: Marcadores menores com tamanho fixo no zoom

**Feature**: `038-fixed-marker-size`  
**Date**: 2026-08-04

Validação manual. Ver [contracts/ui-fixed-marker-size.md](./contracts/ui-fixed-marker-size.md) e [data-model.md](./data-model.md).

## Prerequisites

- Frontend (+ backend) a correr
- Mapa com vários pins; Rede de rotas com nós (GM)
- Opcional: DevTools para medir `getBoundingClientRect().width` de um pin

## Scenarios

### A — Pins mais pequenos (zoom 1)

1. Abrir mapa em zoom por omissão.
2. Comparar mentalmente / medir um pin.

**Expect**: Pin claramente menor (~18px vs ~24px); mapa mais visível à volta.

### B — Tamanho fixo no zoom (mapa)

1. Escolher um pin; anotar largura no ecrã (DevTools ou régua visual).
2. Zoom in até perto do máximo; zoom out até perto do mínimo.

**Expect**: Largura aparente quase igual (±10%); ponta/centro ainda no sítio do mapa.

### C — Selecção / hover

1. Hover e seleccionar um pin.

**Expect**: Aumenta de forma perceptível face ao base novo; ao desmarcar, volta ao base compacto; zoom não “infla” o base.

### D — Grupo

1. Observar pin do grupo em vários zooms.

**Expect**: Mais pequeno; tamanho de ecrã estável.

### E — Digitizer / Rede

1. Abrir Rede de rotas; observar nós.
2. Zoom in/out.

**Expect**: Nós menores; tamanho de ecrã estável; snap/clique ainda funciona; segmentos OK.

### F — Usabilidade

1. Clicar 5 pins distintos em secretária.

**Expect**: ≥4/5 à primeira (SC-004).

## Regression

- Coordenadas / BD inalteradas.
- Linhas de rota no mapa continuam a desenhar-se.
- Menu lateral / Calcular rota inalterados.
