# Spec Delta

## Purpose

Garante que a tela de Rede de Relações (`frontend-v2/`) permaneça navegável e legível com qualquer volume real de Personagens e Vínculos de uma campanha, através de zoom/pan reais e de um layout que separa visualmente Personagens Jogadores (PJ) de NPCs.

## ADDED Requirements

### Requirement: Zoom e pan reais no grafo de Relações
A tela de Rede de Relações SHALL oferecer zoom por roda do mouse, pan por arrastar a tela vazia, e pinça (pinch) em dispositivos de toque. Um controle "Ajustar à tela" SHALL calcular a escala a partir do conteúdo real do grafo (bounding box de todos os nós), não resetar pra um valor fixo.

#### Scenario: Roda do mouse amplia ou reduz o grafo
- **WHEN** a pessoa usa a roda do mouse sobre a área do grafo
- **THEN** a escala do grafo muda continuamente, centrada no ponteiro

#### Scenario: Arrastar a área vazia move a visão
- **WHEN** a pessoa clica e arrasta uma área do grafo sem nenhum nó embaixo do ponteiro
- **THEN** a visão do grafo se desloca (pan), sem mover nenhum Personagem

#### Scenario: Ajustar à tela mostra o grafo inteiro
- **WHEN** a pessoa aciona "Ajustar à tela" com um grafo de qualquer tamanho (pequeno ou grande o bastante pra não caber na tela na escala atual)
- **THEN** a escala e a posição da visão mudam pra que todo o grafo fique visível, sem cortar nenhum nó

### Requirement: Arrastar um nó tem precedência sobre o pan da viewport
Iniciar um arrasto diretamente sobre um nó SHALL mover só aquele nó (reposicionamento de sessão, como já funciona hoje), e SHALL NOT mover ou escalar a viewport do grafo ao mesmo tempo.

#### Scenario: Arrastar um nó não move a tela
- **WHEN** a pessoa clica e arrasta um nó específico
- **THEN** só aquele nó muda de posição; a escala e o deslocamento (pan) da viewport permanecem exatamente como estavam antes do arrasto

### Requirement: Layout radial com PJ no anel interno e NPC no anel externo
O layout do grafo SHALL posicionar todo Personagem com `tipo = "pj"` num anel interno, centralizado na área do grafo, e todo Personagem com `tipo = "npc"` num anel externo ao redor do anel de PJs. Quando não existir nenhum PJ, ou nenhum NPC, o layout SHALL degradar graciosamente pra um único anel com o grupo que existe, sem erro. O layout SHALL continuar determinístico — o mesmo conjunto de ids e tipos SHALL sempre produzir exatamente os mesmos pontos.

#### Scenario: Campanha com PJ e NPC
- **WHEN** a campanha tem pelo menos um PJ e pelo menos um NPC
- **THEN** todos os PJ aparecem num anel mais próximo do centro do grafo, e todos os NPC aparecem num anel mais externo, ao redor dos PJ

#### Scenario: Campanha só com NPC
- **WHEN** a campanha não tem nenhum Personagem com `tipo = "pj"`
- **THEN** os NPC são posicionados num único anel, sem erro e sem anel interno vazio

#### Scenario: Mesmo elenco sempre no mesmo layout
- **WHEN** a página é recarregada com o mesmo conjunto de Personagens e tipos
- **THEN** cada Personagem aparece exatamente na mesma posição da visita anterior

### Requirement: Nenhuma caixa de nó se sobrepõe, em nenhum dos dois anéis
Nenhum par de nós do anel interno SHALL se sobrepor entre si; nenhum par de nós do anel externo SHALL se sobrepor entre si; e nenhum nó do anel externo SHALL se sobrepor a nenhum nó do anel interno — pra qualquer quantidade de PJ e NPC, incluindo elencos grandes (dezenas de Personagens).

#### Scenario: Elenco grande não sobrepõe
- **WHEN** a campanha tem um elenco grande (dezenas de PJ e NPC)
- **THEN** nenhuma caixa de nó, em nenhum dos dois anéis, se sobrepõe a outra
