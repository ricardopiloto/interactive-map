# Research: 035-fix-digitizer-node-offset

## 1. Não é o mesmo CSS da 030 nos nós

**Decision**: Não tratar como “reaplicar 034 ao digitizer”. `.route-digitizer__wp` já está centrado (`14×14`, `margin: -7px 0 0 -7px`) — **não** usa `--pin-size` / `transform-origin: 100% 100%` da 030. A atribuição “offset da 030” no relatório do utilizador significa o **mesmo sintoma** (marcador ao lado do ponto esperado), noutra superfície.

**Rationale**: Grep/CSS actual; 034 só tocou `CampaignMap.css`.

**Alternatives considered**:
- Copiar margins de pin campanha (-12/-22) para nós → errado (círculo ≠ pin losango; pioraria o centro)

## 2. Causa provável: espaço stage ≠ imagem visível

**Decision**: Investigar e corrigir o layout do palco digitizer:

| | Campanha (`CampaignMap`) | Digitizer |
|--|--------------------------|-----------|
| Stage | `inline-block`, tamanho guiado pela imagem | `width: min(100%,1200px)` + `aspect-ratio: 6800/4403` + `margin: 0 auto` |
| Imagem | `width: 100%` no stage | `object-fit: cover` no stage |

Se a arte do mapa **não** tiver exactamente 6800∶4403, `cover` **corta** a imagem; `left/top %` e cliques usam a caixa do stage completo → nós e cliques desalinhados da arte (desvio lateral/vertical sistemático).

**Rationale**: Explica desalinhamento vs mapa de fundo; independente da 030; afecta Traçar segmento e Colocar nó (mesmos marcadores/cliques).

**Alternatives considered**:
- TransformWrapper bug → possível secundário; validar após fix de cover
- Dados `x/y` errados → rejeitado pela FR-004 / assumption (cliques usam a mesma fórmula que o display)

## 3. Estratégia de correção

**Decision** (ordem de preferência):

1. **Preferido**: Fazer o stage do digitizer seguir a imagem como na campanha — remover `object-fit: cover` forçado e/ou aspect-ratio rígido que não corresponda à imagem; stage = caixa da imagem (`display: inline-block` / width 100% da imagem sem crop).
2. **Alternativa**: Manter caixa fixa mas usar `object-fit: contain` **e** calcular cliques/`left`/`top` na **content box** da imagem (letterbox), não na caixa exterior.
3. Confirmar que SVG `viewBox="0 0 100 100"` + polylines e botões `%` partilham o mesmo pai (já o stage); após (1) ou (2) permanecem coerentes.

Validar no quickstart: colocar nó no cruzamento → marcador no cruzamento; traçar segmento; zoom.

**Rationale**: Um referencial = FR-001–005.

## 4. Fora de âmbito

**Decision**: Não alterar `CampaignMap` / CSS pós-034; não migrar waypoints; não reactivar 030.

## 5. Hit-test / snap

**Decision**: Manter `nearestWaypoint` em coords normalizadas 0–1; após o referencial correcto, ORIGIN_SNAP / FINISH_SNAP continuam válidos. Botão do nó já `stopPropagation` — OK.
