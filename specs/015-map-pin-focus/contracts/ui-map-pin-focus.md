# UI Contract: Foco ao clicar no pin no mapa

Escopo: clique no pin no `CampaignMap` (modo jogador) → mesmo foco que o menu.

## Must

| Situação | Comportamento |
|----------|----------------|
| Jogador clica pin no mapa | Seleciona + abre detalhe (como hoje) **e** anima foco `FOCUS_SCALE` |
| Clique de novo no mesmo pin | Novo nonce → reaplica animação de foco |
| Clique em outro pin | Foca o novo pin no mesmo `FOCUS_SCALE` |
| Clique no menu (Locais) | Continua focando (012) com o mesmo `FOCUS_SCALE` |
| Hover no menu | Sem pan/zoom de foco |
| Modo GM | Clique no pin **não** exige `focusRequest` desta feature |
| Pin/transform ausente | No-op; UI não quebra |

## Must not

- Focar só pelo menu e deixar clique no mapa sem foco (regressão do bug)
- Alterar `FOCUS_SCALE` / duração de forma divergente entre menu e mapa
- Exigir foco no GM
- Mudar API/dados

## Constantes

- Reutilizar `FOCUS_SCALE = 2`, `FOCUS_ANIM_MS ≈ 400`, `id="map-pin-{id}"`

## Acceptance check

1. Afastar mapa; clicar pin → pin na vista; zoom ~2; modal ao lado utilizável.
2. Panar para longe; clicar o mesmo pin de novo → refoca.
3. Menu vs mapa → mesmo nível de zoom.
4. GM: clicar pin → sem requisito de foco desta feature.
5. Hover menu → sem foco.
