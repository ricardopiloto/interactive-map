# UI Contract: Foco do pin a partir do menu

Escopo: clique na lista de locais do `SideMenu` → transform do `CampaignMap`.

## Must

| Situação | Comportamento |
|----------|----------------|
| Clique em local na aba Locais (seleção permitida) | Seleciona local **e** anima pan+zoom para o pin no `FOCUS_SCALE` fixo |
| Clique no mesmo local de novo | Reaplica animação de foco (nonce) |
| Clique em outro local | Foca o novo pin no mesmo `FOCUS_SCALE` |
| Clique no pin diretamente no mapa | Seleciona; **não** exige o mesmo gesto de foco do menu |
| Hover no nome do local | Só destaque visual; **sem** pan/zoom |
| GM em placement | Sem seleção e sem foco (mesmo guard) |
| Pin/DOM/transform indisponível | No-op; UI não quebra |

## Must not

- Alterar zoom/pan apenas por hover
- Ir ao `maxScale` por padrão neste gesto
- Mudar API/dados do local
- Focar NPCs/arcos nesta feature

## Constantes sugeridas

- `FOCUS_SCALE = 2`
- `FOCUS_ANIM_MS ≈ 400`
- Pin DOM: `id="map-pin-{id}"`

## Acceptance check

1. Afastar o mapa; clicar local no menu → pin perto do centro; escala ~2.  
2. Zoom manual a 3.5; clicar outro local no menu → volta para ~2 e centra.  
3. Hover vários nomes → mapa não se move.  
4. Jogador: modal abre + mapa foca.
