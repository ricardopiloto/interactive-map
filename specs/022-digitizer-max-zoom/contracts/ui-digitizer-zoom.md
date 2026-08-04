# UI Contract: Zoom na digitalização de rotas

**Feature**: 022-digitizer-max-zoom  
**Componente**: `RouteDigitizerView` (`frontend/src/components/gm/RouteDigitizerView.tsx`)  
**Referência mapa normal**: `CampaignMap` — `maxScale={4}` (não alterar)

## Viewport

| Prop / comportamento | Valor esperado |
|----------------------|----------------|
| `minScale` | Inalterado (hoje `0.5`) |
| `maxScale` | `12` (~3× o teto do mapa normal = 4) |
| Controles | Roda do mouse e/ou pinça; **sem** novos botões +/− / reset |
| `wheel.step` | Ajustado se necessário para SC-002 (alvo sugerido `0.2`; validar no quickstart) |
| Modos (Criar nó / Criar segmento / Escala) | Mesmo `TransformWrapper` → mesmo teto |

## Invariantes

1. Aproximar ao máximo **não** altera escala da campanha nem coordenadas gravadas.
2. Em `maxScale`, pan e cliques (nós, pontos de polilinha, escala) continuam possíveis.
3. `CampaignMap` permanece com `maxScale={4}`.
4. Afastar até `minScale` ainda permite visão geral da rede.

## Fora de contrato

- API HTTP, seed, planner de rotas
- Overlay de rotas no mapa do jogador
- Lupa flutuante ou UI de zoom dedicada
