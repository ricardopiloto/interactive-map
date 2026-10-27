# fios-narrativos Specification

## Purpose

Dá ao mestre dono uma lista única, persistente e editável dos fios narrativos em aberto da campanha, que a IA ajuda a popular a partir de todas as sessões já escritas e que passa a servir de contexto para o rascunho das próximas sessões.

## Requirements

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

### Requirement: Edição manual da lista

O mestre dono SHALL poder adicionar um fio manualmente, editar título e descrição, reordenar, remover, marcar como resolvido e reabrir. Cada alteração SHALL ser gravada ao salvar, e remover uma sessão NÃO SHALL remover os fios que apontam para ela (a referência à sessão de origem apenas se perde).

#### Scenario: Adicionar fio manual

- **WHEN** o mestre cria um fio informando título e descrição
- **THEN** o fio aparece em aberto na lista com origem manual

#### Scenario: Resolver e reabrir

- **WHEN** o mestre marca um fio como resolvido e depois o reabre
- **THEN** o fio muda de estado nas duas ações e mantém seu conteúdo

#### Scenario: Sessão de origem removida

- **WHEN** uma sessão que originou um fio é removida
- **THEN** o fio permanece na lista, e o sistema limpa explicitamente a referência, que passa a ficar sem sessão de origem

### Requirement: IA propõe fios a partir de todas as sessões

Com o módulo de IA ativo, o mestre dono SHALL poder pedir à IA que proponha fios, a partir do editor de uma sessão ainda não visível para jogadores. A IA SHALL considerar todas as sessões já escritas da campanha; para cada sessão SHALL usar o resumo e, quando a sessão não tiver resumo, as notas de preparo e o título. A IA SHALL considerar também arcos, eventos, personagens e locais e os fios que já existem na lista, e SHALL propor apenas fios novos. A proposta NUNCA SHALL ser gravada sem aceitação do mestre.

#### Scenario: Sessão sem resumo entra no contexto

- **WHEN** existe uma sessão escrita sem resumo, com notas de preparo
- **THEN** o contexto enviado à IA inclui o título e as notas de preparo dessa sessão

#### Scenario: Não repete fios existentes

- **WHEN** a lista já contém um fio em aberto sobre um tema
- **THEN** a IA recebe esse fio como contexto e a proposta não o repete

#### Scenario: Muitas sessões

- **WHEN** as sessões não cabem inteiras no limite de contexto
- **THEN** o sistema reduz o espaço de cada sessão de forma uniforme antes de omitir alguma, e se ainda assim omitir, informa ao mestre quantas sessões ficaram de fora

#### Scenario: Sessão visível

- **WHEN** a sessão em edição está visível para jogadores
- **THEN** a ação de propor fios não está disponível

#### Scenario: Pouco conteúdo

- **WHEN** a campanha não tem sessões nem arcos suficientes
- **THEN** o sistema informa que há pouco contexto e não grava nada

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

### Requirement: Fios em aberto alimentam o rascunho da sessão

O rascunho da sessão gerado pela IA SHALL receber os fios em aberto da lista como contexto, atrás da instrução do mestre e do texto já escrito, e à frente do histórico geral. Fios resolvidos NÃO SHALL ser enviados como pendências.

#### Scenario: Rascunho considera os fios

- **WHEN** o mestre pede o rascunho de uma sessão e existem fios em aberto
- **THEN** os fios em aberto fazem parte do contexto enviado e podem ser retomados no rascunho

#### Scenario: Fio resolvido fora do rascunho

- **WHEN** um fio está marcado como resolvido
- **THEN** ele não é enviado como pendência ao rascunho

### Requirement: Falhas, limites e privacidade da proposta

A proposta de fios SHALL seguir as regras de IA do projeto: SHALL exigir mestre dono e módulo de IA ativo, SHALL respeitar o limite de pedidos por minuto, SHALL falhar de forma explícita sem alterar a lista, e SHALL registrar em log apenas contagens, nunca o conteúdo. Como a lista é só do mestre, a proposta MAY usar conteúdo oculto da própria campanha.

#### Scenario: Falha do provedor

- **WHEN** o provedor de IA falha ou expira
- **THEN** o mestre vê uma mensagem clara e a lista permanece como estava

#### Scenario: Jogador tenta propor

- **WHEN** quem não é mestre dono tenta propor fios
- **THEN** o pedido é negado sem chamar o provedor

### Requirement: Fios na exportação e no backup da campanha

Os fios narrativos SHALL fazer parte do pacote de exportação e importação da campanha e do backup, sem se tornarem visíveis a jogadores após a importação.

#### Scenario: Exportar e importar

- **WHEN** a campanha é exportada e importada
- **THEN** os fios voltam com título, descrição, estado, origem, ordem e sessão de origem, e continuam só do mestre

#### Scenario: Pacote de versão anterior

- **WHEN** o mestre importa um pacote exportado antes da existência dos fios
- **THEN** a importação é aceita e a campanha fica com a lista de fios vazia

#### Scenario: Sessão de origem fora do pacote

- **WHEN** um fio do pacote aponta para uma sessão que não está no pacote
- **THEN** o pacote é recusado com erro explícito, sem importação parcial

### Requirement: Textos em pt-BR e en

Todo texto novo da lista e da revisão de propostas SHALL existir em pt-BR e en, com o mesmo conjunto de chaves.

#### Scenario: Troca de idioma

- **WHEN** o mestre alterna o idioma da interface
- **THEN** a lista, os botões e as mensagens de fios aparecem no idioma escolhido
