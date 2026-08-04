# UI Contract: Tamanho e alinhamento dos pins

**Feature**: 030-pin-size-offset  
**Surface**: Mapa de campanha (`CampaignMap`) — pins de local + marcador do grupo  
**Fora de escopo**: Nós/segmentos da Rede de rotas; redução obrigatória das miniaturas da legenda

## Posicionamento (todos os viewports)

| Marcador | Âncora visual no ponto `(x,y)` |
|----------|--------------------------------|
| Pin de local | **Ponta** do pin (teardrop) centrada no ponto do mapa |
| Grupo (bandeira / brasão) | Âncora inferior / centro da forma alinhada ao ponto (sem desvio lateral notório) |

- `left` / `top` percentuais no DOM continuam a representar as coordenadas normalizadas.
- Zoom/pan não devem introduzir desvio lateral novo.
- Estados selecionado / hovered (scale) mantêm a âncora no ponto.

## Tamanhos

| Viewport | Regra |
|----------|--------|
| Desktop / largura ≥ 800px | Tamanho atual (baseline): pin local ~24×24px; party nas dimensões atuais |
| Móvel / largura &lt; 800px | Pins locais ~15–25% menores (~19–20px se baseline 24px); party na **mesma proporção** |

Legenda: pode permanecer no tamanho atual (FR-008).

## Interação

- Toque/clique no pin móvel continua a selecionar o local (alvo útil).
- Sem mudanças de API ou de payload de Local/Grupo.

## Referência visual de aceite

Ver [quickstart.md](../quickstart.md) e SC-001–SC-004 em [spec.md](../spec.md).
