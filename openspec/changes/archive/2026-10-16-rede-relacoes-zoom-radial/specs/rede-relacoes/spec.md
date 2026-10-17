# Spec Delta

## Purpose

Garante que a tela de Rede de Relações (`frontend-v2/`) permaneça navegável e legível com qualquer volume real de Personagens e Vínculos de uma campanha, através de zoom/pan reais e de um layout que separa visualmente Personagens Jogadores (PJ) de NPCs.

## ADDED Requirements

### Requirement: Zoom e pan reais no grafo de Relações
A tela de Rede de Relações SHALL oferecer zoom por roda do mouse, pan por arrastar a tela vazia, e pinça (pinch) em dispositivos de toque. Um controle "Ajustar à tela" SHALL calcular a escala a partir do conteúdo real do grafo (bounding box de todos os nós), não resetar pra um valor fixo.

Cada incremento usual da roda do mouse SHALL produzir uma mudança gradual de escala, sem saltar diretamente entre apenas dois níveis úteis. Em condições normais, um incremento SHALL alterar a escala em no máximo 15%, permitindo vários passos sucessivos de aproximação ou afastamento; os limites mínimo e máximo ainda SHALL ser respeitados.

#### Scenario: Roda do mouse amplia ou reduz o grafo
- **WHEN** a pessoa usa a roda do mouse sobre a área do grafo
- **THEN** a escala do grafo muda continuamente, centrada no ponteiro

#### Scenario: Vários passos de zoom
- **WHEN** a pessoa gira a roda em incrementos sucessivos a partir de uma escala intermediária
- **THEN** cada incremento muda a escala gradualmente, em no máximo 15%, e há mais de dois níveis úteis entre o enquadramento geral e uma visão ampliada dos nós

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
Sem Personagem selecionado, o layout do grafo SHALL posicionar todo Personagem com `tipo = "pj"` num anel interno, centralizado na área do grafo, e todo Personagem com `tipo = "npc"` num anel externo ao redor do anel de PJs. Quando não existir nenhum PJ, ou nenhum NPC, o layout SHALL degradar graciosamente pra um único anel com o grupo que existe, sem erro. O layout SHALL continuar determinístico — o mesmo conjunto de ids e tipos SHALL sempre produzir exatamente os mesmos pontos.

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

### Requirement: Seleção reorganiza o grafo por vínculo direto
Quando um Personagem visível é selecionado, o grafo SHALL colocá-lo no centro do layout e centralizá-lo na viewport. Personagens visíveis com vínculo direto com ele SHALL ocupar um anel interno; todos os demais Personagens visíveis SHALL ocupar um anel externo. A direção e o tipo PJ/NPC não alteram a condição de vizinho direto. Apenas vínculos disponíveis ao usuário e aceitos pelo filtro de tipo ativo SHALL contar para essa classificação. Cada Personagem SHALL aparecer uma única vez, mesmo que tenha vários vínculos com o selecionado. Os anéis SHALL ser determinísticos, acomodar grupos vazios e preservar a separação das caixas dos nós.

#### Scenario: Seleção com vizinhos e demais Personagens
- **WHEN** a pessoa seleciona um Personagem que tem vínculos diretos com parte do elenco visível
- **THEN** o selecionado fica no centro da visão, seus vizinhos diretos formam o anel interno e os demais formam um anel externo sem sobreposição de caixas

#### Scenario: Seleção sem vizinhos visíveis
- **WHEN** a pessoa seleciona um Personagem sem vínculos diretos disponíveis no filtro atual
- **THEN** ele permanece no centro e todos os outros Personagens visíveis formam apenas o anel externo

#### Scenario: Mudança de filtro ou de seleção
- **WHEN** a pessoa muda o filtro de tipo, seleciona outro Personagem ou remove a seleção
- **THEN** o layout é recalculado conforme os vínculos atualmente disponíveis; sem seleção, volta ao layout PJ/NPC e o enquadramento geral

#### Scenario: Arrasto e seleção
- **WHEN** a pessoa arrasta um nó sem selecioná-lo
- **THEN** a seleção e o foco da viewport não mudam por causa do arrasto
