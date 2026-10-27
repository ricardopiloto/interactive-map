# Spec Delta

## MODIFIED Requirements

### Requirement: Lista de fios narrativos só do mestre

O sistema SHALL manter, por campanha, uma lista de fios narrativos. Cada fio SHALL ter título, descrição, estado (em aberto ou resolvido), origem (manual ou IA), sessão de origem opcional e posição na lista. A sessão de origem SHALL indicar a sessão em cujo editor o fio foi aceito (ou, na falta dela, a sessão que a IA citou) e é a referência usada pelo bloco de Fios Narrativos da leitura da sessão. A lista SHALL ser visível e editável somente pelo mestre dono da campanha, e NUNCA SHALL aparecer em respostas ou telas públicas, nem para jogadores. Na página de Sessões, a lista SHALL ser exibida ao mestre dono somente com o Modo GM ligado.

#### Scenario: Mestre vê a lista
- **WHEN** o mestre dono, com o Modo GM ligado, abre a página de Sessões
- **THEN** vê a lista de fios da campanha, com os em aberto em destaque e os resolvidos distinguíveis

#### Scenario: Modo GM desligado esconde a lista
- **WHEN** o mestre dono abre a página de Sessões com o Modo GM desligado
- **THEN** a lista de fios não é exibida, como para qualquer outro visitante

#### Scenario: Jogador não vê a lista
- **WHEN** um jogador ou visitante consulta a campanha
- **THEN** nenhuma informação de fios narrativos é exposta

#### Scenario: Isolamento entre campanhas
- **WHEN** o mestre é dono de duas campanhas
- **THEN** cada campanha mostra apenas os seus próprios fios

### Requirement: Revisão item a item antes de entrar na lista

A proposta da IA SHALL ser apresentada como itens individuais, cada um com título e descrição editáveis. O mestre SHALL poder aceitar ou descartar cada item; somente os aceitos SHALL entrar na lista, com origem IA. A sessão de origem dos itens aceitos SHALL ser a sessão cujo editor está aberto, quando essa sessão já foi salva; quando o editor ainda não tem sessão salva, SHALL ser a sessão que a IA indicar, se houver. Os itens aceitos SHALL ser gravados de forma atômica: ou entram todos, ou nenhum.

#### Scenario: Aceitar parte da proposta

- **WHEN** a IA propõe cinco fios e o mestre aceita dois, editando o título de um
- **THEN** apenas esses dois entram na lista, o editado com o título corrigido

#### Scenario: Origem é a sessão do editor

- **WHEN** o mestre aceita fios propostos a partir do editor da sessão 28 já salva, e a IA citou a sessão 3 num dos itens
- **THEN** todos os fios aceitos ficam com a sessão 28 como sessão de origem e aparecem no bloco «Fios Narrativos» da sessão 28

#### Scenario: Editor sem sessão salva

- **WHEN** o mestre aceita fios propostos a partir do editor de uma sessão ainda não salva, e a IA citou a sessão 3 num dos itens
- **THEN** esse fio fica com a sessão 3 como sessão de origem e os demais ficam sem sessão de origem

#### Scenario: Falha ao gravar os aceitos

- **WHEN** a gravação dos itens aceitos falha
- **THEN** nenhum deles entra na lista e o mestre vê uma mensagem clara, podendo tentar de novo

#### Scenario: Descartar tudo

- **WHEN** o mestre descarta todos os itens
- **THEN** a lista permanece inalterada
