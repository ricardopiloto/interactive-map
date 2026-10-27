# geradores-apoio-mestre Specification

## Purpose

Dá ao mestre quatro geradores de apoio pra improviso de sessão (nome, rumor, clima, item), sorteando de conteúdo fixo que respeita a ambientação da campanha, sem depender de dado específico de uma campanha nem expor nenhuma informação a jogadores.

## Requirements

### Requirement: Quatro geradores de conteúdo de apoio
O sistema SHALL oferecer quatro geradores independentes — nome de PNG, rumor/gancho, condição de clima/ambiente, e item/loot genérico — cada um retornando um resultado sorteado ao ser acionado.

#### Scenario: Mestre aciona o gerador de nomes
- **WHEN** o mestre aciona o gerador de nomes de PNG
- **THEN** o sistema retorna um nome sorteado da tabela correspondente

#### Scenario: Mestre aciona o gerador de rumores
- **WHEN** o mestre aciona o gerador de rumores/ganchos
- **THEN** o sistema retorna um rumor sorteado da tabela correspondente

#### Scenario: Mestre aciona o gerador de clima
- **WHEN** o mestre aciona o gerador de clima/ambiente
- **THEN** o sistema retorna uma condição de clima sorteada da tabela correspondente

#### Scenario: Mestre aciona o gerador de itens
- **WHEN** o mestre aciona o gerador de itens/loot
- **THEN** o sistema retorna um item sorteado da tabela correspondente

### Requirement: Conteúdo sorteado respeita a ambientação da campanha
Para cada gerador, o sistema SHALL sortear de um conjunto de conteúdo específico da ambientação da campanha (`Campanha.sistema`), usando um conjunto de conteúdo genérico de fallback quando o valor de `sistema` da campanha não tiver um conjunto próprio.

#### Scenario: Campanha WFRP sorteia conteúdo de fantasia
- **WHEN** o mestre de uma campanha com `sistema="wfrp4e"` aciona qualquer um dos quatro geradores
- **THEN** o resultado sorteado vem do conjunto de conteúdo associado a `wfrp4e`

#### Scenario: Campanha WoD sorteia conteúdo vampírico/moderno
- **WHEN** o mestre de uma campanha com `sistema="wod"` aciona qualquer um dos quatro geradores
- **THEN** o resultado sorteado vem do conjunto de conteúdo associado a `wod`, diferente do conjunto usado por `wfrp4e`

#### Scenario: Campanha com sistema sem conteúdo próprio usa o fallback
- **WHEN** o mestre de uma campanha com `sistema` diferente de `wfrp4e` e `wod` aciona qualquer um dos quatro geradores
- **THEN** o resultado sorteado vem do conjunto de conteúdo genérico de fallback, sem erro

### Requirement: Geradores visíveis apenas ao mestre
O sistema SHALL restringir o acesso aos quatro geradores ao mestre da campanha; um jogador SHALL NOT conseguir acionar nem visualizar os geradores.

#### Scenario: Jogador não vê a tela de geradores
- **WHEN** um jogador (sem permissão de mestre) navega pela campanha
- **THEN** nenhum ponto de acesso aos geradores é exibido, e uma tentativa direta de acionar um gerador pela API é rejeitada

### Requirement: Enviar resultado sorteado para as notas de preparo de uma sessão
O sistema SHALL permitir ao mestre enviar o resultado de um gerador para as notas de preparo de uma sessão em preparo, acrescentando-o ao fim de `notas_preparo` sem alterar o texto já existente nem nenhum outro campo da sessão. As sessões oferecidas como destino SHALL ser apenas as ocultas aos jogadores (`visivel_para_todos=false`).

#### Scenario: Resultado é acrescentado ao fim das notas
- **WHEN** o mestre envia um resultado sorteado para uma sessão oculta que já tem notas de preparo
- **THEN** o texto é acrescentado numa nova linha de lista, rotulada com o nome do gerador, e as notas anteriores permanecem intactas

#### Scenario: Sessão oculta sem notas
- **WHEN** o mestre envia um resultado para uma sessão oculta com `notas_preparo` vazio
- **THEN** as notas passam a conter apenas o item enviado, sem linhas em branco iniciais

#### Scenario: Não existe sessão em preparo
- **WHEN** o mestre aciona o atalho e nenhuma sessão está oculta
- **THEN** o sistema não escreve em nenhuma sessão e orienta o mestre a usar «Preparar próxima sessão» em Sessões

#### Scenario: Sessões visíveis não são destino
- **WHEN** o mestre abre a lista de destinos do atalho
- **THEN** nenhuma sessão com `visivel_para_todos=true` é oferecida

#### Scenario: Notas ficam sempre privadas
- **WHEN** um resultado é acrescentado às notas de preparo de uma sessão
- **THEN** o texto continua ausente de qualquer resposta servida em contexto de jogador
