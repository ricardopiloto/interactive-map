# Data Model: 008-smooth-wheel-zoom

Nenhuma alteração de persistência, schemas ou APIs.

## Métricas de calibração (runtime / UI)

| Campo | Descrição |
|-------|-----------|
| `imageWidth` / `imageHeight` | Dimensões naturais da imagem do mapa |
| `viewportWidth` / `viewportHeight` | Tamanho da área visível do mapa (px) |
| `coverage` | `max(imageWidth/viewportWidth, imageHeight/viewportHeight)` |
| `wheelStep` | Passo passado a `wheel.step` (ajuste fino) |
| `buttonStep` | Passo passado a `zoomIn`/`zoomOut` (maior que `wheelStep`) |

## Regras

1. Se imagem ou viewport ainda não medidos → usar fallback conservador (ex. `wheelStep` default reduzido vs. 0.1 legado; `buttonStep` = fator × wheel).
2. `wheelStep` ∈ `[WHEEL_MIN, WHEEL_MAX]`; `buttonStep` > `wheelStep`.
3. `minScale` / `maxScale` permanecem 0.5 / 4 salvo afinação documentada no implement.

## Transições

1. Imagem `onLoad` → atualizar dimensões → recalcular steps.
2. Resize da viewport → recalcular `coverage` e steps.
3. Troca de `mapUrl` → resetar medições e recalcular após novo load.
