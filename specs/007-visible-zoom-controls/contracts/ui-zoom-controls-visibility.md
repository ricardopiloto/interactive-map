# UI Contract: Visibilidade dos controles de zoom

Escopo: `.campaign-map__controls` (+ botão GM “Mapa” se presente) e convivência com `.campaign-map__legend` em `CampaignMap`.

## Must

| Situação | Comportamento |
|----------|----------------|
| Desktop fullscreen / maximizado | +, −, 1:1 (e Mapa em GM) 100% dentro da área visível do mapa |
| Mobile com barra inferior | Idem; não cobertos pela barra |
| Pan / zoom do conteúdo | Controles permanecem fixos no chrome da viewport do mapa |
| Funções | +, −, 1:1 (e upload Mapa) continuam operacionais |

## Must not

- Cortar qualquer botão do grupo pela borda da janela ou por overflow do layout
- Fazer os controles viajarem com o pan do stage
- Remover ou desativar zoom / 1:1 para “resolver” o layout
- Exigir scroll da página da app para alcançar os botões

## Acceptance check

Fullscreen desktop: retângulo de cada botão ⊆ retângulo da área do mapa na tela. Mobile: idem, acima da barra inferior. Após pan extremo, posição dos botões na tela inalterada.
