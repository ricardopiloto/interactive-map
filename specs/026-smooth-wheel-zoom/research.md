# Research: 026-smooth-wheel-zoom

## 1. Por que o scroll salta tanto hoje

**Decision**: Tratar o problema como `wheel.step` demasiado alto face ao default da lib e ao modo `smooth`.

**Rationale**: Em `react-zoom-pan-pinch` v4, com `smooth: true` (default):

- Roda: `zoomStep = wheel.step * Math.abs(event.deltaY)` → escala **aditiva** (`scale + delta * zoomStep`)
- Botões: `zoomIn()`/`zoomOut()` usam step default **0.5** e fórmula **exponencial** (`scale * Math.exp(±step)`) ≈ fator **1.65×** por clique

Default da lib para `wheel.step` é **0.015**. O projeto usa **0.1** (mapa) e **0.2** (digitalização). Com `deltaY` típico de mouse (~100), isso vira `zoomStep` de **10** / **20** — um tick pode ir quase ao `maxScale` de imediato.

**Alternatives considered**: Culpar só o trackpad — rejeitado; o valor configurado no código é ~7–13× o default da lib.

## 2. Valor alvo de `wheel.step`

**Decision**: Usar **`wheel={{ step: 0.01 }}`** em **ambas** as vistas (mapa e Rede de rotas). Validar no quickstart; ajustar só dentro de **0.008–0.015** se a paridade tick≈clique falhar no hardware do utilizador.

**Rationale**:
- Próximo do default da lib (`0.015`) → corrige o salto
- Ligeiramente abaixo → aproxima a mudança por tick (com `deltaY≈100` → +1.0) à ordem de magnitude do botão (~+0.65 em scale 1)
- Mesmo valor nas duas vistas (clarificação A); digitalização já não precisa de `0.2` (clarificação B: ≤ ~15 s)

Estimativa digitalização 1→12 com step 0.01 e `deltaY≈100`: ~1.0 por tick → ~11 ticks — confortável dentro de 15 s.

**Alternatives considered**:
- `smooth: false` + `wheel.step: 0.5` para espelhar botões aditivos — muda também a fórmula dos botões (mesmo flag `setup.smooth`); risco de regressão na sensação dos +/−
- Passar `zoomIn(0.2)` e baixar roda ainda mais — fora do FR-005 (manter botões)
- Manter digitizer em 0.2 — contradiz suavidade (clarificação B)

## 3. Limites min/max e botões

**Decision**: Não alterar `minScale` / `maxScale` (mapa 0.5–4, digitalização 0.5–12). Não alterar chamadas `zoomIn()` / `zoomOut()` (step default 0.5).

**Rationale**: FR-003, FR-005, SC-004; Out of Scope da spec.

## 4. Constante partilhada

**Decision**: Duplicar `0.01` nos dois ficheiros **ou** extrair `WHEEL_ZOOM_STEP = 0.01` num módulo mínimo se o implementador preferir DRY. Preferência do plano: **literal nos dois call sites** (dois sítios, feature pequena).

**Rationale**: YAGNI; evita ficheiro novo só por uma constante.

## 5. Relação com 022-digitizer-max-zoom

**Decision**: Explicitamente **substituir** o `wheel.step: 0.2` da 022. O teto `maxScale={12}` mantém-se; o SC de “chegar rápido” da 022 fica subordinado ao SC-003 desta feature (≤ ~15 s).

**Rationale**: Clarificação B; suavidade priorizada.
