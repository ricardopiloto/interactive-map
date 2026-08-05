# Quickstart: Revert Pin Alignment Fixes

**Feature**: `052-revert-pin-align-fixes`  
**Date**: 2026-08-05

Validação manual. Ver [contracts/ui-revert-pin-align-fixes.md](./contracts/ui-revert-pin-align-fixes.md) e o print (ponto verde = alvo do pin vermelho no **desktop**).

## Prerequisites

- Frontend a correr; mapa com Altdorf
- Viewport **desktop** (largura ≥ 800px)
- Print de referência (verde vs vermelho)

## Scenarios

### A — Altdorf no verde (SC-001)

1. Abrir mapa em desktop; localizar Altdorf.

**Expect**: Âncora do pin Visitado sobre o ponto verde (cidade), não a posição errada do print.

### B — Outros pins (SC-002)

1. Spot-check ≥ 2 outros locais.

**Expect**: Alinhamento coerente com a arte (baseline pré-047).

### C — Zoom/pan (SC-003)

1. Zoom in/out e pan.

**Expect**: Alinhamento mantém-se.

### D — Behaviours 047/049/051 ausentes (SC-004)

1. Inspeccionar `CampaignMap.css` (ou comportamento).

**Expect**: Sem nudge móvel esquerdo activo; stage/imagem como HEAD (cover + min-height), não o shrink-wrap da 051.

### E — Regressão fora de âmbito (SC-005)

1. Abrir Rede/digitizer; Calcular rota se 050 estiver presente.

**Expect**: Sem regressão causada por esta reversão (não desfazer 048/050).

### F — Móvel (informativo)

1. Viewport &lt; 800px.

**Expect**: Pode voltar o desalinhamento móvel pré-047 — **aceitável**; não é falha desta feature.

## Implementation check (dev)

```bash
# Working tree CampaignMap.css should match HEAD for presentation rules
git diff HEAD -- frontend/src/components/map/CampaignMap.css
# Expect: empty (or only unrelated noise) after restore
```
