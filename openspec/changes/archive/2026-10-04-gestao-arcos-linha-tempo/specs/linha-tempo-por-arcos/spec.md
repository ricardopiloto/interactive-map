# Spec Delta

## MODIFIED Requirements

### Requirement: Gestão de arcos pelo mestre
O sistema SHALL permitir que um mestre autorizado crie e edite arcos com título, cor persistida, resumo opcional e associações com locais e sessões existentes. Essa gestão SHALL estar na Linha do Tempo, no cabeçalho da página, visível quando o modo de edição está ligado, em qualquer dos modos da página. O menu de ferramentas do mapa SHALL NOT oferecer esta ação. Apenas o mestre autorizado SHALL poder gerir arcos e associações; jogadores SHALL ter somente leitura, de acordo com as regras de visibilidade já aplicadas à Linha do Tempo e às sessões, e SHALL NOT ver o controlo de gestão.

#### Scenario: Mestre cria um arco com cor e associações
- **WHEN** um mestre autorizado informa título, cor e associa sessões e locais existentes na criação de um arco
- **THEN** o arco fica disponível no modo "Por arcos" e mantém essas associações após recarregar a página

#### Scenario: Mestre abre a gestão na Linha do Tempo
- **WHEN** um mestre autorizado está na Linha do Tempo com o modo de edição ligado
- **THEN** vê o controlo para gerir arcos e, ao abri-lo, pode listar, criar e editar arcos sem ir ao mapa

#### Scenario: Modo de edição desligado
- **WHEN** um mestre autorizado está na Linha do Tempo com o modo de edição desligado
- **THEN** o controlo de gestão de arcos não aparece

#### Scenario: Mestre associa uma sessão existente a um arco
- **WHEN** o mestre associa uma sessão ainda sem arco a um arco existente
- **THEN** a sessão passa a aparecer na raia correspondente a esse arco

#### Scenario: Jogador sem ações de escrita
- **WHEN** um jogador abre a Linha do Tempo ou a administração dos arcos de uma campanha
- **THEN** o sistema não oferece ações de criação ou edição de arcos

#### Scenario: O mapa já não oferece a gestão
- **WHEN** um mestre autorizado abre o menu de ferramentas do mapa
- **THEN** esse menu não contém a ação de gerir arcos
