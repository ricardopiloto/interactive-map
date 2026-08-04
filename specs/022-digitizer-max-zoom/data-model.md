# Data Model: 022-digitizer-max-zoom

**N/A** — esta feature não introduz nem altera entidades persistidas.

O zoom da digitalização é estado de viewport efêmero (`TransformWrapper` / `react-zoom-pan-pinch`). Waypoints, segmentos, polilinhas e `MapScale` (feature 021) permanecem inalterados.

### Invariantes (não-modelo)

| Invariante | Regra |
|------------|--------|
| Coordenadas % de nós/segmentos | Independentes do nível de zoom visual |
| Escala km ↔ pixel | Independente do `maxScale` da vista |
| Teto mapa jogador | Continua 4; digitalização 12 |
