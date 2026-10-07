# Spec Delta

## MODIFIED Requirements

### Requirement: Gestão de arcos pelo mestre
O sistema SHALL permitir que um mestre autorizado crie e edite arcos com título, cor persistida, resumo opcional e associações com locais e sessões existentes. Ao abrir a criação de um arco, seja manual ou a partir de uma proposta de IA, o sistema SHALL preencher a cor com uma escolha aleatória de uma paleta fixa, excluindo as cores já gravadas noutros arcos da mesma campanha. O mestre SHALL poder alterar essa cor antes de guardar e ao editar. Editar um arco existente SHALL NOT substituir a cor gravada por uma nova escolha aleatória. Se todas as cores da paleta já estiverem em uso, a criação SHALL continuar e a cor sugerida SHALL ser uma cor da paleta, mesmo que já esteja gravada noutro arco. Essa gestão SHALL estar na Linha do Tempo, no cabeçalho da página, visível quando o modo de edição está ligado, em qualquer dos modos da página. O menu de ferramentas do mapa SHALL NOT oferecer esta ação. Apenas o mestre autorizado SHALL poder gerir arcos e associações; jogadores SHALL ter somente leitura, de acordo com as regras de visibilidade já aplicadas à Linha do Tempo e às sessões, e SHALL NOT ver o controlo de gestão.

Quando uma sessão tem um Capítulo de preparação vinculado (capability `capitulo-prep`), a sua associação a um arco deixa de poder ser editada diretamente por esta gestão: o arco dessa sessão é derivado automaticamente do Capítulo vinculado. Para associar essa sessão a outro arco, o mestre SHALL alterar o arco do Capítulo, ou remover o vínculo entre a sessão e o Capítulo primeiro. Sessões sem Capítulo vinculado continuam a aceitar a associação direta a um arco exatamente como hoje.

#### Scenario: Mestre cria um arco com cor e associações
- **WHEN** um mestre autorizado abre a criação de um arco, confirma ou altera a cor sugerida e associa sessões e locais existentes
- **THEN** o arco fica disponível no modo "Por arcos" com essa cor e mantém essas associações após recarregar a página

#### Scenario: Nova cor evita as já usadas
- **WHEN** a campanha já tem arcos com cor gravada e ainda há cores da paleta por usar, e o mestre abre a criação de outro arco
- **THEN** a cor sugerida é uma das que ainda não estão gravadas nesses arcos

#### Scenario: Editar não volta a sortear a cor
- **WHEN** o mestre abre a edição de um arco que já tem cor gravada
- **THEN** o formulário mostra essa cor, sem a substituir por outra escolha aleatória

#### Scenario: Mestre abre a gestão na Linha do Tempo
- **WHEN** um mestre autorizado está na Linha do Tempo com o modo de edição ligado
- **THEN** vê o controlo para gerir arcos e, ao abri-lo, pode listar, criar e editar arcos sem ir ao mapa

#### Scenario: Modo de edição desligado
- **WHEN** um mestre autorizado está na Linha do Tempo com o modo de edição desligado
- **THEN** o controlo de gestão de arcos não aparece

#### Scenario: Mestre associa uma sessão existente a um arco
- **WHEN** o mestre associa a um arco uma sessão ainda sem arco e sem Capítulo vinculado
- **THEN** a sessão passa a aparecer associada a esse arco

#### Scenario: Jogador sem ações de escrita
- **WHEN** um jogador abre a Linha do Tempo ou a administração dos arcos de uma campanha
- **THEN** o sistema não oferece ações de criação ou edição de arcos

#### Scenario: O mapa já não oferece a gestão
- **WHEN** um mestre autorizado abre o menu de ferramentas do mapa
- **THEN** esse menu não contém a ação de gerir arcos

#### Scenario: Sessão com capítulo vinculado não aceita associação manual de arco
- **WHEN** o mestre tenta associar diretamente, por esta gestão, uma sessão que tem um Capítulo vinculado a um arco diferente do arco desse Capítulo
- **THEN** o sistema rejeita a alteração e orienta o mestre a editar o arco pelo Capítulo ou a remover o vínculo primeiro
