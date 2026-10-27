# Spec Delta

## MODIFIED Requirements

### Requirement: Fios da sessão no bloco de Fios Narrativos

O bloco de Fios Narrativos SHALL listar os fios cuja sessão de origem é a sessão em leitura, com os abertos antes dos resolvidos e o estado de cada um distinguível. O mestre dono SHALL poder, no próprio bloco, marcar um fio da sessão como resolvido e reabrir um fio resolvido, sem sair da leitura da sessão; a mudança SHALL ser gravada ao acionar a ação e o bloco SHALL refletir o novo estado imediatamente, reordenando os fios (abertos antes dos resolvidos). As demais edições (título, descrição, ordem e remoção) NÃO SHALL ser oferecidas no bloco. O bloco SHALL oferecer um link para a página «Fios» da campanha, com a lista completa. Fios de outras sessões e fios sem sessão de origem NÃO SHALL aparecer nesse bloco. Uma falha ao carregar os fios SHALL mostrar um aviso dentro do bloco, sem impedir a leitura do restante da sessão, e uma falha ao gravar a mudança de estado SHALL mostrar um aviso dentro do bloco, mantendo o fio no estado anterior.

#### Scenario: Só os fios da sessão

- **WHEN** a campanha tem fios criados na sessão 3, na sessão 5 e sem sessão de origem, e o mestre dono lê a sessão 3
- **THEN** o bloco lista apenas os fios da sessão 3

#### Scenario: Abertos antes dos resolvidos

- **WHEN** a sessão tem um fio resolvido e um fio em aberto
- **THEN** o fio em aberto aparece antes, e o resolvido aparece com o estado distinguível

#### Scenario: Resolver um fio no bloco

- **WHEN** o mestre dono aciona «Resolver» num fio em aberto do bloco
- **THEN** o fio passa a resolvido, desce para depois dos abertos, e o estado fica gravado, sem sair da leitura da sessão

#### Scenario: Reabrir um fio no bloco

- **WHEN** o mestre dono aciona «Reabrir» num fio resolvido do bloco
- **THEN** o fio volta a em aberto e sobe para junto dos abertos, com o estado gravado

#### Scenario: Falha ao gravar o estado

- **WHEN** a gravação da mudança de estado falha
- **THEN** o bloco mostra um aviso de erro e o fio permanece no estado anterior

#### Scenario: Ir para a lista completa

- **WHEN** o mestre dono ativa o link do bloco de Fios Narrativos
- **THEN** abre a página «Fios» da campanha, com a lista completa

#### Scenario: Troca de sessão

- **WHEN** o mestre dono passa de uma sessão para outra enquanto os fios da primeira ainda carregam
- **THEN** o bloco nunca mostra os fios da sessão anterior na sessão atual

#### Scenario: Falha ao carregar os fios

- **WHEN** a consulta dos fios da sessão falha
- **THEN** o bloco mostra um aviso de erro e o Resumo e as Notas de Preparo continuam visíveis
