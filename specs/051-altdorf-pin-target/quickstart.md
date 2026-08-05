# Quickstart: Align Altdorf Pin to Map Target

**Feature**: `051-altdorf-pin-target`  
**Date**: 2026-08-05

Validação manual. Ver [contracts/ui-altdorf-pin-target.md](./contracts/ui-altdorf-pin-target.md), [research.md](./research.md) e o print de referência (ponto verde sobre Altdorf).

## Prerequisites

- Frontend a correr; mapa da campanha com imagem e local **Altdorf**
- DevTools (ou dispositivo) com largura **&lt; 800px** (`map-page--mobile`)
- Print anexo: verde = alvo; vermelho actual = demasiado à esquerda

## Scenarios

### A — Altdorf vs print (SC-001, SC-007)

1. Abrir o mapa em viewport móvel; centrar/aproximar Altdorf.

**Expect**: Âncora do pin Visitado sobre a arte da cidade (ponto verde), **não** sobre Altdorf Flats.

### B — Outros pins (SC-003)

1. Spot-check ≥ 2 outros locais conhecidos na arte.

**Expect**: Sem o mesmo desvio sistemático à esquerda face às respectivas cidades/marcas.

### C — Grupo (SC-004)

1. Com pin do grupo visível no mesmo viewport.

**Expect**: Grupo alinhado ao ponto do mapa (mesmo sistema que os locais); sem desvio sistemático partilhado.

### D — Zoom/pan (SC-002)

1. Zoom in/out e pan em torno de Altdorf.

**Expect**: Alinhamento ao ponto da cidade mantém-se.

### E — Desktop (SC-005)

1. Largura ≥ 800px; Altdorf + 1 outro pin.

**Expect**: Sem pioria face ao alinhamento pré-correcção (desktop já aceite).

### F — Sem 047 (SC-006)

1. Inspeccionar CSS móvel dos pins.

**Expect**: Sem `--mobile-marker-nudge-x` negativo / translate deliberado à esquerda da 047.

### G — Regressão

1. Rede / digitizer; overlay Calcular rota.

**Expect**: Sem mudanças exigidas por esta feature.

### H — Fallback FR-007 (só se A falhar após fix de apresentação)

1. Se outros pins alinharem mas Altdorf ainda falhar o verde: reposicionar Altdorf no GM e gravar.

**Expect**: Usar só como reserva; não como substituto do fix de stage/imagem.

## Optional CSS sanity

No móvel, confirmar que a caixa do `.campaign-map__stage` e a imagem pintada partilham a mesma largura/altura efectiva (sem crop lateral óbvio da arte dentro do stage).
