# UI Contract: PinModal ao lado do pin

Escopo: posicionamento do painel de detalhe do jogador relativo ao pin no mapa.

## Must

| Situação | Comportamento |
|----------|----------------|
| Abrir detalhe (menu ou pin) com `#map-pin-{id}` visível | Painel ancorado ao lado do pin; preferência **direita** (oposto ao menu esquerdo) |
| Não cabe à direita | Flip à esquerda (ou ajuste) mantendo pin fora do retângulo do painel |
| Backdrop | Dim existente; clique fecha; mapa sem pan/zoom |
| Viewport estreita / sem espaço lateral | Fallback centrado; detalhe legível e fechável |
| Pin DOM ausente | Fallback centrado; sem erro bloqueante |
| Após animação de foco do menu (~400 ms) | Posição recalculada para acompanhar o pin |
| Modo GM | Sem este painel (inalterado) |

## Must not

- Cobrir o centro do pin com o painel quando “ao lado” for viável
- Remover ou clarear o dim do backdrop nesta feature
- Permitir pan/zoom no mapa com o detalhe aberto
- Alterar API/dados do local
- Mudar fluxo GM

## Constantes sugeridas

- Gap pin↔painel: `12–16px`
- Breakpoint fallback: ~`640px` (ou “não cabe lateralmente”)
- Recalc delay pós-foco: alinhar a `FOCUS_ANIM_MS` (400) de 012
- Âncora DOM: `id="map-pin-{id}"`

## Acceptance check

1. Desktop jogador: clicar local no menu → pin centrado (012) + painel à direita do pin; pin visível.
2. Pin perto da borda direita → painel flip à esquerda; pin ainda visível.
3. Abrir pelo pin no mapa → mesmo princípio.
4. Com detalhe aberto: tentar pan → sem efeito; fechar → pan ok; dim presente.
5. Viewport estreita → detalhe centrado/legível; fechar ok.
