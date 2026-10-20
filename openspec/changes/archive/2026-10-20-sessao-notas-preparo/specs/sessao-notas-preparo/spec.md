# Spec Delta

## Purpose

Permite que o mestre prepare uma sessão futura registrando notas privadas antes de ela ser jogada, reaproveitando o controle de visibilidade já existente da Sessão em vez de um estado de ciclo de vida novo, e preserva essas notas depois de jogada para comparação com o que de fato aconteceu.

## ADDED Requirements

### Requirement: Notas de preparo opcionais numa Sessão
O sistema SHALL permitir armazenar um texto de preparo livre, opcional, associado a uma Sessão, independente do valor de `resumo` ou `visivel_para_todos` dessa Sessão.

#### Scenario: Mestre preenche notas de preparo numa sessão sem resumo
- **WHEN** o mestre cria ou edita uma Sessão sem `resumo` preenchido e escreve texto no campo de notas de preparo
- **THEN** o texto é salvo e permanece associado a essa Sessão

#### Scenario: Sessão sem notas de preparo
- **WHEN** uma Sessão é criada sem informar notas de preparo
- **THEN** o sistema trata o campo como vazio, sem exigir preenchimento e sem erro

### Requirement: Notas de preparo nunca expostas a um jogador
O sistema SHALL NOT incluir as notas de preparo de nenhuma Sessão em nenhuma resposta servida em contexto de jogador, independente do valor de `visivel_para_todos` dessa Sessão.

#### Scenario: Listagem pública de Sessões
- **WHEN** um jogador consulta a lista pública de Sessões de uma campanha
- **THEN** nenhuma Sessão retornada contém as notas de preparo, mesmo para Sessões visíveis a todos

#### Scenario: Sessão oculta ainda tem o resumo público escondido e as notas nunca aparecem
- **WHEN** uma Sessão tem `visivel_para_todos=false` e notas de preparo preenchidas
- **THEN** a Sessão inteira não aparece na listagem pública, e mesmo que aparecesse as notas de preparo nunca estariam na resposta pública

### Requirement: Notas de preparo preservadas após a sessão ser jogada
O sistema SHALL NOT remover ou sobrescrever as notas de preparo de uma Sessão quando o `resumo` dessa Sessão for preenchido ou atualizado.

#### Scenario: Mestre preenche o resumo depois de jogar
- **WHEN** uma Sessão tem notas de preparo preenchidas e o mestre edita a Sessão pra preencher o `resumo` pela primeira vez
- **THEN** as notas de preparo continuam acessíveis, sem alteração, junto do resumo novo

### Requirement: Indicação de notas de preparo na Linha do Tempo
Quando uma Sessão com `visivel_para_todos=false` tiver notas de preparo preenchidas, a Linha do Tempo SHALL indicar ao mestre que essa sessão oculta tem notas de preparo registradas.

#### Scenario: Mestre visualiza a Linha do Tempo com uma próxima sessão em preparo
- **WHEN** o mestre está na Linha do Tempo e existe uma Sessão oculta (`visivel_para_todos=false`) com notas de preparo preenchidas
- **THEN** a Linha do Tempo exibe, pro mestre, uma indicação de que essa sessão tem notas de preparo

#### Scenario: Jogador não vê a indicação
- **WHEN** um jogador (não-mestre) visualiza a Linha do Tempo
- **THEN** nenhuma indicação de notas de preparo é exibida, pois a sessão oculta nem aparece pra ele
