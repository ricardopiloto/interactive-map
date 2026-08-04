# UI Contract: Zoom suave com a roda

**Feature**: 026-smooth-wheel-zoom  
**Surfaces**: `CampaignMap`, `RouteDigitizerView`

## Props de zoom (antes → depois)

| Vista | Prop | Antes | Depois |
|-------|------|-------|--------|
| Mapa da campanha | `wheel.step` | `0.1` | `0.01` (tunable 0.008–0.015) |
| Rede de rotas | `wheel.step` | `0.2` | `0.01` (mesmo intervalo) |
| Ambas | `minScale` / `maxScale` | 0.5 / 4 e 0.5 / 12 | **inalterados** |
| Ambas | Botões +/− (`zoomIn`/`zoomOut`) | step default `0.5` | **inalterados** |

## Comportamento esperado

1. **Um tick de roda ≈ um clique +/−** — mesma ordem de magnitude de mudança de zoom (não idêntico byte-a-byte: fórmulas aditiva vs exponencial na lib).
2. Um tick isolado **não** leva do zoom inicial quase ao máximo.
3. Scroll contínuo: mapa 1→`maxScale` em **≤ 8 s**; Rede de rotas 1→12 em **≤ ~15 s**.
4. Pan, seleção de pins e desenho de segmentos inalterados.

## Invariantes

- Sem mudança de API, seed ou CSS de pins.
- Sem novos controlos de zoom.
- Sem preferência persistida de sensibilidade.
