# Spec Delta

## MODIFIED Requirements

### Requirement: Fios da sessão no bloco de Fios Narrativos

O bloco de Fios Narrativos SHALL listar os fios cuja sessão de origem é a sessão em leitura, com os abertos antes dos resolvidos e o estado de cada um distinguível. O bloco SHALL ser somente leitura e SHALL oferecer um link para a página «Fios» da campanha, com a lista completa. Fios de outras sessões e fios sem sessão de origem NÃO SHALL aparecer nesse bloco. Uma falha ao carregar os fios SHALL mostrar um aviso dentro do bloco, sem impedir a leitura do restante da sessão.

#### Scenario: Só os fios da sessão

- **WHEN** a campanha tem fios criados na sessão 3, na sessão 5 e sem sessão de origem, e o mestre dono lê a sessão 3
- **THEN** o bloco lista apenas os fios da sessão 3

#### Scenario: Abertos antes dos resolvidos

- **WHEN** a sessão tem um fio resolvido e um fio em aberto
- **THEN** o fio em aberto aparece antes, e o resolvido aparece com o estado distinguível

#### Scenario: Ir para a lista completa

- **WHEN** o mestre dono ativa o link do bloco de Fios Narrativos
- **THEN** abre a página «Fios» da campanha, com a lista completa

#### Scenario: Troca de sessão

- **WHEN** o mestre dono passa de uma sessão para outra enquanto os fios da primeira ainda carregam
- **THEN** o bloco nunca mostra os fios da sessão anterior na sessão atual

#### Scenario: Falha ao carregar os fios

- **WHEN** a consulta dos fios da sessão falha
- **THEN** o bloco mostra um aviso de erro e o Resumo e as Notas de Preparo continuam visíveis

### Requirement: Bloco de fios e lista completa sincronizados

O bloco de Fios Narrativos da sessão e a página «Fios» SHALL refletir o mesmo estado dos fios: após criar, editar, resolver, reabrir, remover ou reordenar um fio na página «Fios», o bloco SHALL mostrar o estado atualizado quando a sessão é aberta ou reaberta, e, após aceitar fios propostos pela IA no editor da sessão, o bloco SHALL se atualizar sem exigir que o mestre troque de sessão ou recarregue a página.

#### Scenario: Resolver um fio na lista completa
- **WHEN** o mestre dono resolve, na página «Fios», um fio que pertence a uma sessão e depois abre a leitura dessa sessão
- **THEN** o bloco de Fios Narrativos da sessão mostra o fio como resolvido

#### Scenario: Remover um fio na lista completa
- **WHEN** o mestre dono remove, na página «Fios», um fio que pertence a uma sessão e depois abre a leitura dessa sessão
- **THEN** o fio não aparece no bloco de Fios Narrativos da sessão

#### Scenario: Aceitar fios propostos pela IA
- **WHEN** o mestre dono aceita fios propostos pela IA no editor de uma sessão
- **THEN** o bloco de Fios Narrativos da sessão passa a mostrá-los sem recarregar a página
