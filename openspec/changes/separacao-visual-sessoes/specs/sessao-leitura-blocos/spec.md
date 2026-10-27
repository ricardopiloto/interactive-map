# Spec Delta

## Purpose

Faz a leitura de uma sessão distinguir, para o mestre, o material privado de preparo (Notas de Preparo e Fios Narrativos) do texto público (Resumo), mantendo para jogadores apenas o Resumo, sem vazar nada do material privado.

## ADDED Requirements

### Requirement: Blocos separados na leitura da sessão para o mestre

Na leitura de uma sessão, o mestre com o Modo GM ligado SHALL ver três blocos visualmente separados e rotulados, nesta ordem: Notas de Preparo, Fios Narrativos e Resumo. Os blocos de Notas de Preparo e de Fios Narrativos SHALL exibir a indicação de que são só para o mestre. O bloco de Fios Narrativos SHALL aparecer somente para o mestre dono da campanha; o de Notas de Preparo, para quem já o vê hoje (quem edita, com o Modo GM ligado). Um bloco sem conteúdo SHALL permanecer visível com uma mensagem de vazio.

#### Scenario: Mestre dono vê os três blocos

- **WHEN** o mestre dono, com o Modo GM ligado, abre a leitura de uma sessão
- **THEN** vê, nesta ordem, os blocos rotulados Notas de Preparo, Fios Narrativos e Resumo, e os dois primeiros trazem a indicação "só para o mestre"

#### Scenario: Bloco vazio permanece visível

- **WHEN** a sessão não tem notas de preparo, não tem fios ou não tem resumo
- **THEN** o bloco correspondente continua na leitura do mestre com uma mensagem de vazio, sem alterar a ordem dos demais

#### Scenario: Editor que não é dono

- **WHEN** um editor que não é o mestre dono, com o Modo GM ligado, abre a leitura de uma sessão
- **THEN** vê os blocos de Notas de Preparo e de Resumo, e não vê o bloco de Fios Narrativos

#### Scenario: Modo GM desligado

- **WHEN** o mestre dono abre a leitura de uma sessão com o Modo GM desligado
- **THEN** a leitura é igual à de um jogador: só o Resumo, sem blocos nem rótulos, e a página não exibe a lista "Fios em aberto"

### Requirement: Fios da sessão no bloco de Fios Narrativos

O bloco de Fios Narrativos SHALL listar os fios cuja sessão de origem é a sessão em leitura, com os abertos antes dos resolvidos e o estado de cada um distinguível. O bloco SHALL ser somente leitura e SHALL oferecer um link para a lista completa de fios em aberto da página de Sessões. Fios de outras sessões e fios sem sessão de origem NÃO SHALL aparecer nesse bloco. Uma falha ao carregar os fios SHALL mostrar um aviso dentro do bloco, sem impedir a leitura do restante da sessão.

#### Scenario: Só os fios da sessão

- **WHEN** a campanha tem fios criados na sessão 3, na sessão 5 e sem sessão de origem, e o mestre dono lê a sessão 3
- **THEN** o bloco lista apenas os fios da sessão 3

#### Scenario: Abertos antes dos resolvidos

- **WHEN** a sessão tem um fio resolvido e um fio em aberto
- **THEN** o fio em aberto aparece antes, e o resolvido aparece com o estado distinguível

#### Scenario: Ir para a lista completa

- **WHEN** o mestre dono ativa o link do bloco de Fios Narrativos
- **THEN** a página leva à seção "Fios em aberto" com a lista completa da campanha

#### Scenario: Troca de sessão

- **WHEN** o mestre dono passa de uma sessão para outra enquanto os fios da primeira ainda carregam
- **THEN** o bloco nunca mostra os fios da sessão anterior na sessão atual

#### Scenario: Falha ao carregar os fios

- **WHEN** a consulta dos fios da sessão falha
- **THEN** o bloco mostra um aviso de erro e o Resumo e as Notas de Preparo continuam visíveis

### Requirement: Bloco de fios e lista completa sincronizados

O bloco de Fios Narrativos da sessão e a lista completa "Fios em aberto" da página SHALL refletir o mesmo estado: após criar, editar, resolver, reabrir, remover ou reordenar um fio, ou aceitar fios propostos pela IA, o bloco SHALL se atualizar sem exigir que o mestre troque de sessão ou recarregue a página.

#### Scenario: Resolver um fio na lista completa
- **WHEN** o mestre dono resolve, na lista "Fios em aberto", um fio que pertence à sessão em leitura
- **THEN** o bloco de Fios Narrativos da sessão passa a mostrá-lo como resolvido

#### Scenario: Remover um fio na lista completa
- **WHEN** o mestre dono remove, na lista "Fios em aberto", um fio que pertence à sessão em leitura
- **THEN** o fio desaparece do bloco de Fios Narrativos da sessão

### Requirement: Resumo e leitura pública sem material privado

O Resumo SHALL conter e exibir apenas o texto do resumo da sessão: nunca o conteúdo, o rótulo ou a contagem de fios narrativos ou de notas de preparo. Para jogadores e visitantes, a leitura da sessão SHALL continuar exibindo apenas o Resumo, sem blocos, selos ou rótulos novos. As respostas públicas de sessões NÃO SHALL conter notas de preparo nem qualquer dado de fios narrativos, independentemente de a sessão ser visível e de ter fios ou notas.

#### Scenario: Jogador lê a sessão

- **WHEN** um jogador abre a leitura de uma sessão visível que tem notas de preparo e fios de origem
- **THEN** vê somente o Resumo, e nenhum texto, rótulo ou contagem de notas ou de fios aparece na página

#### Scenario: Resposta pública de sessões

- **WHEN** a listagem ou o detalhe público de uma sessão visível com notas de preparo e fios de origem é consultado
- **THEN** a resposta não contém notas de preparo nem dados de fios

#### Scenario: Resumo não herda material privado

- **WHEN** o mestre dono lê uma sessão com notas e fios
- **THEN** o bloco de Resumo contém apenas o texto do resumo, sem trechos das notas nem dos fios

### Requirement: Filtro de fios por sessão de origem

A listagem administrativa de fios SHALL aceitar um filtro opcional por sessão de origem, combinável com o filtro de estado, e SHALL continuar restrita ao mestre dono. Sem o filtro, o comportamento atual SHALL ser mantido.

#### Scenario: Filtrar por sessão de origem

- **WHEN** o mestre dono lista os fios informando uma sessão de origem
- **THEN** a resposta contém apenas os fios dessa sessão, na ordem da lista

#### Scenario: Sem filtro

- **WHEN** o mestre dono lista os fios sem informar sessão de origem
- **THEN** a resposta é a mesma de antes, com todos os fios da campanha

#### Scenario: Quem não é dono

- **WHEN** um jogador ou um dono de outra campanha usa o filtro
- **THEN** o pedido é negado como nas demais rotas de fios

### Requirement: Textos e layout em pt-BR, en e mobile

Os rótulos, selos, mensagens de vazio e de erro e o link dos blocos SHALL existir em pt-BR e en, com o mesmo conjunto de chaves. Em telas estreitas, os blocos SHALL se empilhar sem rolagem horizontal.

#### Scenario: Troca de idioma

- **WHEN** o mestre alterna o idioma da interface
- **THEN** os rótulos, selos e mensagens dos blocos aparecem no idioma escolhido

#### Scenario: Tela estreita

- **WHEN** a leitura da sessão é aberta num celular
- **THEN** os blocos aparecem empilhados e legíveis, sem rolagem horizontal
