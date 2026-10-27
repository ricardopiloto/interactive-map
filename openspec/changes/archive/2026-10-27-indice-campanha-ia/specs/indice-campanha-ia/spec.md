# Spec Delta

## Purpose

Mantém, por campanha, um índice de busca do conteúdo narrativo que a IA consulta para montar o contexto sem precisar ler a campanha inteira, e dá ao mestre controle e visibilidade sobre esse índice.

## ADDED Requirements

### Requirement: Índice de busca por campanha

O sistema SHALL manter, no banco de cada campanha, um índice de busca do texto de sessões (título, resumo e notas de preparo), arcos, eventos, personagens (nome, papel, facção e descrição), locais e itens. O texto SHALL ser dividido em trechos curtos, cortando em limites de parágrafo, e cada trecho SHALL guardar o tipo e o id do registro de origem, a posição e se o registro é visível aos jogadores. As notas mecânicas de personagem e os fios narrativos NÃO SHALL ser indexados. A busca SHALL ignorar acentos e diferença de maiúsculas e minúsculas. O índice é dado derivado: o texto de origem permanece a única fonte de verdade.

#### Scenario: Trechos de uma sessão longa

- **WHEN** uma sessão tem notas de preparo com vários parágrafos longos
- **THEN** o índice guarda a sessão em vários trechos curtos, cada um ligado à sessão de origem

#### Scenario: Acentos e caixa

- **WHEN** a busca usa "emboscada" e o texto indexado tem "Emboscada" ou "emboscáda"
- **THEN** o trecho é encontrado

#### Scenario: Notas mecânicas fora do índice

- **WHEN** um personagem tem notas mecânicas preenchidas
- **THEN** nenhum trecho do índice contém esse texto

### Requirement: Atualização automática do índice

O índice SHALL ser atualizado automaticamente quando um registro indexado é criado, alterado ou removido, na mesma transação da gravação do registro, de modo que índice e dados não divirjam num commit. Uma falha ao atualizar o índice NÃO SHALL impedir nem desfazer a gravação do registro; nesse caso o índice SHALL ser marcado como desatualizado, e a falha SHALL ser registrada em log sem conteúdo narrativo. Importações de campanha SHALL resultar em índice reconstruído ou marcado para reconstrução.

#### Scenario: Sessão criada

- **WHEN** o mestre cria uma sessão com resumo
- **THEN** os trechos dessa sessão passam a existir no índice quando a gravação termina

#### Scenario: Registro alterado

- **WHEN** o mestre altera o resumo de uma sessão
- **THEN** os trechos antigos da sessão são substituídos pelos novos, sem trechos duplicados

#### Scenario: Registro removido

- **WHEN** o mestre remove um local
- **THEN** os trechos desse local deixam de existir no índice

#### Scenario: Falha no índice não bloqueia a gravação

- **WHEN** a atualização do índice falha durante a gravação de uma sessão
- **THEN** a sessão é gravada normalmente e o índice fica marcado como desatualizado

### Requirement: Criação e reconstrução do índice

O sistema SHALL criar a estrutura do índice por migração, sem alterar dados existentes. Uma campanha sem índice populado ou com índice desatualizado SHALL ter o índice reconstruído integralmente a partir dos dados, automaticamente na primeira chamada de IA que dependa dele, e a pedido do mestre dono. A reconstrução SHALL ser idempotente: reconstruir duas vezes dá o mesmo conteúdo, e dois pedidos simultâneos para a mesma campanha NÃO SHALL duplicar trechos.

#### Scenario: Campanha existente na primeira chamada de IA

- **WHEN** a IA é acionada numa campanha criada antes do índice, com muitas sessões
- **THEN** o índice é construído a partir dos dados existentes antes de montar o contexto, e a chamada segue normalmente

#### Scenario: Campanha sem a estrutura do índice

- **WHEN** a IA é acionada numa campanha cujo banco não tem as tabelas do índice (por exemplo, vinda do formato legado)
- **THEN** a estrutura é criada, o índice é construído e a chamada segue normalmente

#### Scenario: Reconstrução idempotente

- **WHEN** o índice é reconstruído duas vezes seguidas sem alteração dos dados
- **THEN** o conteúdo do índice é o mesmo nas duas vezes

#### Scenario: Reconstruções simultâneas

- **WHEN** duas reconstruções da mesma campanha são pedidas ao mesmo tempo
- **THEN** o índice final não tem trechos duplicados

### Requirement: Recuperação por relevância

Dado um pedido de IA, o sistema SHALL buscar no índice os trechos mais relevantes ao texto atual do campo, à instrução do mestre e ao título ou número do registro-alvo, ordenados por relevância e limitados a uma quantidade configurável, com desempate determinístico. Os termos da busca SHALL ser extraídos do texto do pedido (sem palavras muito curtas ou comuns) e tratados sempre como termos literais, de modo que o texto digitado nunca seja interpretado como operador ou sintaxe de consulta. Sem termos úteis, a recuperação SHALL devolver vazio sem erro.

#### Scenario: Termo raro de sessão antiga

- **WHEN** a instrução do mestre cita o nome de um personagem que só aparece numa sessão antiga
- **THEN** os trechos dessa sessão antiga entram entre os trechos recuperados

#### Scenario: Variação de plural

- **WHEN** a instrução usa «emboscada» e o texto antigo tem «emboscadas»
- **THEN** o trecho é encontrado

#### Scenario: Texto com sintaxe de consulta

- **WHEN** a instrução contém aspas, `OR`, `NEAR(` ou `*`
- **THEN** a busca trata tudo como texto literal, sem erro e sem alterar o significado da consulta

#### Scenario: Pedido sem termos úteis

- **WHEN** o texto atual e a instrução estão vazios
- **THEN** nenhum trecho é recuperado e a chamada segue só com os recentes e o catálogo

### Requirement: Índice indisponível ou falho não interrompe a IA

Se o índice estiver indisponível (por exemplo, o SQLite sem suporte ao índice de busca), desatualizado e não reconstruível, ou falhar na consulta, a assistência de IA SHALL voltar ao comportamento de leitura completa com o teto de contexto, sem erro para o mestre. Cada chamada SHALL registrar em log apenas contagens (trechos recuperados, tamanho, se usou o índice ou o recuo), nunca o conteúdo.

#### Scenario: Suporte ausente

- **WHEN** o ambiente não oferece o índice de busca
- **THEN** a migração não falha, o estado do índice é «indisponível» e a IA continua funcionando com a leitura completa

#### Scenario: Falha na consulta

- **WHEN** a consulta ao índice falha durante uma chamada de IA
- **THEN** a chamada usa a leitura completa com teto e o mestre recebe a sugestão normalmente

### Requirement: Estado e ação de reindexar para o mestre dono

O mestre dono, com a IA ativa na campanha, SHALL poder consultar o estado do índice (disponível, em dia ou desatualizado, quantidade de registros e trechos indexados, data da última atualização) e acionar a reindexação, nas configurações da campanha ao lado do interruptor de IA. As rotas SHALL exigir o mestre dono e o módulo de IA ativo, e a reindexação SHALL respeitar um limite de pedidos por minuto. A reindexação SHALL informar o novo estado ao concluir e mostrar mensagem clara em caso de falha.

#### Scenario: Ver o estado

- **WHEN** o mestre dono abre as configurações de uma campanha com IA ativa
- **THEN** vê o estado do índice, as quantidades e a data da última atualização

#### Scenario: Reindexar

- **WHEN** o mestre aciona Reindexar
- **THEN** o índice é reconstruído, o estado passa a «em dia» e as quantidades são atualizadas

#### Scenario: Sem permissão ou IA desligada

- **WHEN** um jogador, outro usuário ou o dono de outra campanha chama as rotas, ou a IA está desligada na campanha
- **THEN** o pedido é negado como nas demais rotas de IA

### Requirement: Índice privado e fora do pacote exportado

O índice SHALL ser acessível somente ao backend e às rotas do mestre dono, NUNCA SHALL aparecer em respostas ou telas públicas e NÃO SHALL fazer parte do pacote de exportação da campanha. Importar um pacote SHALL reconstruir o índice da campanha importada. A visibilidade de cada trecho SHALL acompanhar a do registro de origem, e o conteúdo oculto SHALL seguir as mesmas regras de envio à IA que valem hoje (somente ao mestre dono, da própria campanha, com o marcador de oculto).

#### Scenario: Exportar e importar

- **WHEN** a campanha é exportada e importada em outra instância
- **THEN** o pacote não contém o índice e a campanha importada tem o índice reconstruído

#### Scenario: Conteúdo oculto no índice

- **WHEN** a recuperação devolve um trecho de um registro oculto
- **THEN** o trecho segue as regras de conteúdo oculto da IA, com o marcador de oculto, e a sinalização de uso de conteúdo oculto é mantida

#### Scenario: Visitante e jogador

- **WHEN** um jogador ou visitante consulta qualquer rota pública
- **THEN** nenhuma informação do índice é exposta

### Requirement: Textos do índice em pt-BR e en

Todo texto novo da interface do índice (título, estados, quantidades, ação Reindexar, mensagens de sucesso e de erro) SHALL existir em pt-BR e en, com o mesmo conjunto de chaves.

#### Scenario: Troca de idioma

- **WHEN** o mestre alterna o idioma da interface
- **THEN** a seção do índice e suas mensagens aparecem no idioma escolhido
