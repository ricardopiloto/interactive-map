# Tasks

## 1. Gestão na Linha do Tempo

- [x] 1.1 Extrair de `MapPage` o fluxo de lista, formulário e escolha manual/IA para um componente montado na Linha do Tempo. O botão fica no `CodexHeader`, ao lado de "Novo", só quando o modo de edição está ligado, e a lista ocupa a área principal até voltar, com o seletor de modos ainda visível. Verificar com `npm run build` em `frontend/` e no browser: com o modo de edição ligado o mestre vê o controlo nos três modos da página e abre a lista sem ir ao mapa; com o modo desligado o controlo some; um jogador não o vê.

## 2. Saída do mapa

- [x] 2.1 Retirar de `MapPage` o item "Gerenciar arcos", o painel `arcoManagerOpen` e os diálogos que passaram para o componente novo. O menu de ferramentas do mapa mantém as outras ações. Verificar no browser que o menu do mapa já não oferece gerir arcos e que criar um personagem e mover o grupo continuam acessíveis. Não deixar arcos de teste gravados.
