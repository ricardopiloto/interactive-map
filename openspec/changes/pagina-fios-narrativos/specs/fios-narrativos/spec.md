# Spec Delta

## MODIFIED Requirements

### Requirement: Lista de fios narrativos só do mestre

O sistema SHALL manter, por campanha, uma lista de fios narrativos. Cada fio SHALL ter título, descrição, estado (em aberto ou resolvido), origem (manual ou IA), sessão de origem opcional e posição na lista. A sessão de origem SHALL indicar a sessão em cujo editor o fio foi aceito (ou, na falta dela, a sessão que a IA citou) e é a referência usada pelo bloco de Fios Narrativos da leitura da sessão. A lista SHALL ser visível e editável somente pelo mestre dono da campanha, e NUNCA SHALL aparecer em respostas ou telas públicas, nem para jogadores. A lista SHALL ser exibida ao mestre dono na página «Fios» da campanha, somente com o Modo GM ligado, e NÃO SHALL ser exibida na página de Sessões.

#### Scenario: Mestre vê a lista
- **WHEN** o mestre dono, com o Modo GM ligado, abre a página «Fios»
- **THEN** vê a lista de fios da campanha, com os em aberto em destaque e os resolvidos distinguíveis

#### Scenario: Modo GM desligado esconde a lista
- **WHEN** o mestre dono abre a página «Fios» com o Modo GM desligado
- **THEN** a lista de fios não é exibida, como para qualquer outro visitante

#### Scenario: Jogador não vê a lista
- **WHEN** um jogador ou visitante consulta a campanha
- **THEN** nenhuma informação de fios narrativos é exposta

#### Scenario: Isolamento entre campanhas
- **WHEN** o mestre é dono de duas campanhas
- **THEN** cada campanha mostra apenas os seus próprios fios

#### Scenario: Página de Sessões sem a lista
- **WHEN** o mestre dono, com o Modo GM ligado, abre a página de Sessões
- **THEN** a página mostra só a lista de sessões e a leitura da sessão, sem a lista de fios
