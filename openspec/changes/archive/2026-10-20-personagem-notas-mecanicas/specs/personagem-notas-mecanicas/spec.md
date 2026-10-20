# Spec Delta

## Purpose

Permite que o mestre registre uma nota mecânica livre (PV, perícia, condição) em qualquer Personagem, PJ ou NPC, mantendo-a sempre restrita ao mestre e disponível tanto na edição quanto na consulta rápida durante o jogo.

## ADDED Requirements

### Requirement: Nota mecânica opcional em qualquer Personagem
O sistema SHALL permitir armazenar um texto mecânico livre, opcional, associado a um Personagem, independente de `tipo` ser PJ ou NPC. O campo SHALL aceitar texto vazio ou ausente como valor válido.

#### Scenario: Mestre salva nota mecânica num NPC
- **WHEN** o mestre edita um Personagem com `tipo=npc` e preenche o texto da nota mecânica
- **THEN** o texto é salvo e permanece associado a esse Personagem

#### Scenario: Mestre salva nota mecânica num PJ
- **WHEN** o mestre edita um Personagem com `tipo=pj` e preenche o texto da nota mecânica
- **THEN** o texto é salvo e permanece associado a esse Personagem, do mesmo jeito que para um NPC

#### Scenario: Personagem sem nota mecânica preenchida
- **WHEN** um Personagem é criado sem informar nota mecânica
- **THEN** o sistema trata o campo como vazio, sem exigir preenchimento e sem erro

### Requirement: Nota mecânica nunca exposta a um jogador
O sistema SHALL NOT incluir a nota mecânica de nenhum Personagem em nenhuma resposta servida em contexto de jogador, independente do valor de `visivel_para_todos` desse Personagem.

#### Scenario: Listagem pública de Personagens
- **WHEN** um jogador consulta a lista pública de Personagens de uma campanha
- **THEN** nenhum Personagem retornado contém a nota mecânica, mesmo para Personagens visíveis a todos

#### Scenario: Detalhe público de um Personagem
- **WHEN** um jogador consulta o detalhe de um Personagem específico pela API pública
- **THEN** a resposta não contém a nota mecânica desse Personagem

### Requirement: Nota mecânica visível ao mestre fora do formulário de edição
O sistema SHALL exibir a nota mecânica ao mestre também no painel de consulta rápida do Personagem (o painel aberto ao selecionar um Personagem), não apenas dentro do formulário de edição.

#### Scenario: Mestre seleciona um Personagem com nota mecânica preenchida
- **WHEN** o mestre seleciona, fora do modo de edição, um Personagem que tem nota mecânica preenchida
- **THEN** o painel de consulta exibe o texto da nota mecânica

#### Scenario: Mestre seleciona um Personagem sem nota mecânica
- **WHEN** o mestre seleciona, fora do modo de edição, um Personagem sem nota mecânica preenchida
- **THEN** o painel de consulta não exibe uma seção vazia de nota mecânica
