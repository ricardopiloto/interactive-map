# Research: 008-smooth-wheel-zoom

## 1. Causa do zoom “brusco”

**Decision**: Tratar `wheel={{ step: 0.1 }}` em `CampaignMap` (`TransformWrapper`) como o passo atual excessivo na faixa `minScale=0.5` … `maxScale=4` (um tick = +0.1 de escala absoluta, ~2–3%+ da faixa útil por tick e sensação de salto).

**Rationale**: Valor fixo alto; não depende do mapa.

**Alternatives considered**: Culpar só animação/`smooth` → o pedido é magnitude do step, não timing.

## 2. Métrica de cobertura relativa (clarificação C)

**Decision**: Definir cobertura relativa após a imagem carregar e a viewport existir:

```text
coverage = max(imageWidth / viewportWidth, imageHeight / viewportHeight)
```

usando dimensões **naturais** da imagem (`naturalWidth`/`naturalHeight`) e o retângulo do viewport do mapa (`.campaign-map` ou `.campaign-map__viewport` `clientWidth`/`clientHeight`). Em `scale === 1` isso aproxima “quanto a imagem ultrapassa a área visível”. Recalcular em `load` da imagem e em `ResizeObserver` da viewport.

**Rationale**: Alinha FR-003 / clarificação C sem exigir preset do usuário.

**Alternatives considered**:
- Só pixels do arquivo → ignora viewport (rejeitado na clarificação)
- Só bounding box CSS da `<img>` → muda com object-fit/layout; natural÷viewport é mais estável para “tamanho do mapa”

## 3. Função passo a partir da cobertura

**Decision**: Mapear `coverage` → `wheelStep` com clamp:

- Base alvo ~`0.03`–`0.05` para cobertura típica (~1–1.5)
- `wheelStep = clamp(k / coverage, WHEEL_MIN, WHEEL_MAX)` (ex.: `k ≈ 0.05`, `WHEEL_MIN ≈ 0.02`, `WHEEL_MAX ≈ 0.06`)
- Cobertura alta (imagem >> viewport) → step menor (mais fino)
- Cobertura baixa → step sobe até `WHEEL_MAX` (não grudento)
- Afinação final no quickstart para cair em SC-003 (~3–15 ticks na faixa intermediária)

**Rationale**: Simples, monotônico, atende “fluido mas não lento”.

**Alternatives considered**:
- Step multiplicativo por escala atual (`step * scale`) → complementar opcional; não substitui calibração por cobertura
- Step fixo único menor (ex. 0.03) → falha FR-003 / clarificação C

## 4. Botões +/− (clarificação B)

**Decision**: `buttonStep = clamp(wheelStep * BUTTON_FACTOR, …)` com `BUTTON_FACTOR` ≥ 2 (ex. 2.5–3), e chamar `zoomIn(buttonStep)` / `zoomOut(buttonStep)` em `MapControls`. `resetTransform()` inalterado para 1:1.

**Rationale**: FR-007 / SC-005; API da lib já aceita `step` opcional em `zoomIn`/`zoomOut`.

**Alternatives considered**: Mesmo step da roda → rejeitado na clarificação B.

## 5. Atualização dinâmica do `TransformWrapper`

**Decision**: Guardar `wheelStep`/`buttonStep` em state; passar `wheel={{ step: wheelStep }}` ao wrapper. A lib chama `instance.update(props)` no effect — steps novos aplicam sem remount. Evitar `key={wheelStep}` que resetaria o zoom do usuário.

**Rationale**: Preserva posição/escala ao recalcular após resize.

**Alternatives considered**: Remount via key → UX ruim (perde pan/zoom).

## 6. Foco do zoom (deferred clarify)

**Decision**: Manter default da biblioteca (zoom em direção ao ponteiro / comportamento atual do wheel). Fora do escopo de mudança explícita nesta feature.

**Rationale**: Deferred no clarify; não bloqueia SC de fluidez.

**Alternatives considered**: Forçar centro da viewport → mudança de UX não pedida.
