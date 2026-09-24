# Quickstart: Cabeçalho e navegação (114)

## Prerequisites

- Backend + frontend locais (`uvicorn` :8000, `npm run dev`).
- Campanha `wfrp` (ou slug com nome conhecido) e conta com `canEdit` para testar o toggle.
- Referência visual: abrir protótipo `frontend-next` na vista de campanha (CampaignLayout) **ou** captura guardada dessa barra.

## Validate layout (desktop)

1. Abrir `/c/wfrp` (viewport ≥ ~900px).
2. Confirmar **esquerda**: marca → Home; nome da campanha abre menu com «Minhas campanhas» / «Descobrir outras».
3. Confirmar **centro**: quatro abas; activa com sublinhado/acento; Rota existe.
4. Confirmar **direita**: Modo edição (se membro) em pílula quando ligado; tema Auto/Claro/Escuro; menu utilizador.
5. Captura do header; comparar com protótipo (posição + forma do toggle).

## Validate mobile

1. Viewport ≤ ~800–860px.
2. Tabs do topo ausentes; barra inferior com as mesmas abas (Mapa omitido se regra `showMapNav` o exigir).
3. Activa reconhecível; switcher de campanha ainda no topo.

## Validate behaviour

1. Anónimo / sem `canEdit`: sem toggle de edição; abas e seletor ok.
2. Com `canEdit`: toggle liga/desliga e superfícies de edição comportam-se como antes.
3. Tema: mudar Auto/Claro/Escuro atualiza o tema e persiste após reload.
4. `/c/wfrp/rota` carrega sem 404 e mostra o planeador (contentor mínimo).
5. Alternar idioma pt-BR ↔ en: strings novas do chrome traduzem; nome da campanha não.

## Out of scope here

- Painel flutuante do Mapa / Relações (115–116).
- Redesenho visual interno do planeador de rotas.
