# Spec Delta

## Purpose

Dá ao mestre quatro geradores de apoio pra improviso de sessão (nome, rumor, clima, item), sorteando de conteúdo fixo que respeita a ambientação da campanha, sem depender de dado específico de uma campanha nem expor nenhuma informação a jogadores.

## ADDED Requirements

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
