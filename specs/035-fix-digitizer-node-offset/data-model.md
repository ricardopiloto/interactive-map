# Data Model: 035-fix-digitizer-node-offset

Sem entidades novas. Modelo de **referencial de apresentação**.

## Waypoint (persistido — inalterado)

| Campo | Notas |
|-------|--------|
| `x`, `y` | Normalizados 0–1 no espaço do mapa; **não** reescritos por esta feature |

## Digitizer coordinate frame (UI)

| Elemento | Deve coincidir |
|----------|----------------|
| Caixa usada em `getBoundingClientRect` no clique | Caixa usada para `left`/`top` % dos nós |
| Endpoints SVG dos segmentos | Mesmas `(x,y)` dos nós |
| Área visível da imagem do mapa | Mesmo referencial (sem crop que desloque a arte vs %) |

### Estados inválidos (bug actual suspeito)

- Stage com aspect fixo + imagem `cover` → arte deslocada/cropada vs 0–1 do stage.

### Estado alvo

- Um único rectângulo de conteúdo mapa: clique, nó, linha e pixels da arte alinhados.

## Transitions

N/A (sem máquina de estados de domínio). Modos `place-wp` / `draw-seg` / `idle` partilham os mesmos marcadores e o mesmo frame.
