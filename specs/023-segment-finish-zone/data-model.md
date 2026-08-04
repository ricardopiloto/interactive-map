# Data Model: 023-segment-finish-zone

**N/A** — esta feature não introduz nem altera entidades persistidas.

Waypoints, segmentos e escala (021) permanecem iguais. Apenas constantes de interação no cliente (raios de snap em coordenadas normalizadas).

### Invariantes (não-modelo)

| Invariante | Regra |
|------------|--------|
| Geometria gravada | Independente dos raios de snap |
| Zoom visual | Não altera raios (coords de mapa 0–1) |
| Origem vs destino | Raios distintos só no hit-test do rascunho |
