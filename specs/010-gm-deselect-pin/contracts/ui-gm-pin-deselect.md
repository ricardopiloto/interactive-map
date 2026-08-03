# UI Contract: Deseleção de pin (modo GM)

Escopo: clique na área do mapa em `CampaignMap` orquestrado por `MapPage` quando há seleção de local.

## Must

| Situação | Comportamento |
|----------|----------------|
| GM + `placementMode === 'none'` + pin selecionado + clique/toque na área vazia do stage | Limpar `selectedLocalId` (destaque some; ficha ligada à seleção fecha se aberta) |
| GM + clique em outro pin de local | Selecionar o pin clicado (`stopPropagation` no pin) |
| GM + `placementMode !== 'none'` + clique no stage | Tratar como posicionamento; **não** usar o ramo só-deseleção |
| GM + formulário admin (`localDraft`) aberto + deselect por clique fora | Preservar `localDraft` |
| Clique em controles de zoom / botão Mapa / legenda / menu | Não deselecionar via esta regra |

## Must not

- Cancelar `localDraft` / diálogos admin de CRUD ao limpar seleção do mapa
- Deselecionar apenas porque o usuário deu pan ou zoom
- Tratar clique no ícone do grupo como “área vazia” que limpa seleção (bloquear bubbling)
- Exigir o mesmo gesto de clique-fora para modo jogador (jogador continua fechando a ficha)

## Callback sugerido (implementação)

- `CampaignMap`: prop opcional `onClearSelection?: () => void` (ou nome equivalente), chamada no stage quando `!placing` e o clique não veio de pin/grupo.
- `MapPage`: passar `() => setSelectedLocalId(null)` quando `isGm`.

## Acceptance check

Modo GM: selecionar pin → destaque visível → clique vazio no mapa → **0** pins com `--selected`. Abrir editar local (form) + selecionar outro pin → clique vazio → form **ainda** aberto; destaque limpo. Ativar add-pin → clique no mapa → fluxo de posição, não “só limpar”.
