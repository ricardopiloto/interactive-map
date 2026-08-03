# UI Contract: Gatilhos de upload do mapa

Escopo: superfície do mapa em `CampaignMap` / orquestração em `MapPage` quando `mapEditable` (modo GM).

## Must

| Situação | Comportamento |
|----------|----------------|
| GM + mapa visível + clique/toque genérico no stage | **Não** abrir seletor de arquivo |
| GM + placement ativo + clique no stage | Aplicar posição; **não** abrir seletor de arquivo |
| GM + mapa visível + controle explícito “Substituir mapa” (ou equivalente) | Abrir seletor; upload `category=map`; atualizar imagem exibida |
| GM + mapa ausente/falha | Permitir carregar mapa (slot/placeholder ou mesmo controle) |
| Modo jogador | Nenhum seletor de arquivo de mapa |

## Must not

- Usar o clique na imagem carregada do mapa como atalho de “trocar arquivo”
- Alterar comportamento de `ImageSlot` em portraits/locais (clique-para-trocar permanece lá)
- Exigir mudança de endpoint ou schema de upload

## Acceptance check

Com mapa carregado em modo GM: 10 cliques ociosos no mapa + 1 fluxo de add-pin → **0** diálogos de arquivo. Em seguida, um clique no controle “Substituir mapa” → **1** diálogo.
