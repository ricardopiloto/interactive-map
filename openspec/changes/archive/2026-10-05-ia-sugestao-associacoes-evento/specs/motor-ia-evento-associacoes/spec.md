# Spec Delta

## Purpose

Permite que o mestre, numa campanha com IA habilitada, peça ao sistema para inferir locais e personagens presentes na descrição de um evento e pré-marcar essas associações no formulário, sempre sujeito a revisão manual antes de gravar o evento.

## ADDED Requirements

### Requirement: Sugestão de locais e personagens a partir da descrição

Quando o mestre aciona a sugestão por IA no formulário de criação ou edição de evento numa campanha com o módulo de IA ativo, o sistema SHALL enviar o texto da descrição e o catálogo de locais e personagens elegíveis da campanha ao provedor e SHALL devolver listas de identificadores de locais e personagens sugeridos. O mestre SHALL poder revisar as checkboxes e só persistir associações ao salvar o evento pelo fluxo já existente. As ids sugeridas SHALL ser unidas às já marcadas no rascunho, sem apagar uma seleção manual anterior.

#### Scenario: Sugestão com descrição preenchida

- **WHEN** o mestre clica no botão de sugestão por IA com uma descrição não vazia e a campanha tem o módulo de IA ativo
- **THEN** o sistema apresenta locais e personagens sugeridos marcando as respetivas opções no formulário, sem gravar o evento

#### Scenario: Descrição vazia

- **WHEN** o mestre tenta acionar a sugestão por IA sem texto útil na descrição
- **THEN** o sistema não chama o provedor e informa que a descrição é necessária

#### Scenario: Módulo de IA desligado

- **WHEN** o mestre abre o formulário de evento numa campanha sem o módulo de IA ativo
- **THEN** o botão de sugestão por IA não está disponível e o formulário permanece apenas manual

#### Scenario: Seleção manual é preservada

- **WHEN** o mestre já marcou um local no rascunho e a sugestão devolve outro local
- **THEN** os dois locais ficam marcados e o mestre pode desmarcar qualquer um antes de salvar

### Requirement: Sugestão referencia apenas locais e personagens reais da campanha

Todo identificador de local ou personagem devolvido na sugestão SHALL corresponder a um registo existente na mesma campanha e elegível para inclusão no catálogo enviado ao provedor. O sistema SHALL descartar qualquer referência da IA a um id ou nome que não exista ou não seja elegível antes de atualizar o formulário.

#### Scenario: Id inexistente é descartado

- **WHEN** a resposta do provedor inclui um id de local ou personagem que não existe na campanha
- **THEN** esse id não é aplicado às checkboxes mostradas ao mestre

### Requirement: Sugestão nunca persiste automaticamente o evento

Uma sugestão gerada por IA SHALL alterar apenas o rascunho do formulário (seleção de locais e personagens). O sistema NUNCA SHALL criar ou atualizar o evento na base de dados sem a ação explícita de salvar do mestre.

#### Scenario: Mestre fecha o formulário sem salvar

- **WHEN** o mestre recebe uma sugestão e fecha o formulário sem salvar
- **THEN** nenhuma associação sugerida permanece persistida no evento

#### Scenario: Mestre edita após sugerir

- **WHEN** o mestre recebe uma sugestão, desmarca um local sugerido e salva o evento
- **THEN** o evento gravado reflete apenas as checkboxes que o mestre deixou marcadas ao salvar

### Requirement: Falha do motor tratada sem estado quebrado

Se a chamada ao provedor falhar (módulo desligado, credencial ausente, indisponibilidade, erro ou resposta inutilizável), o sistema SHALL informar o mestre sobre a falha e SHALL NOT deixar o formulário num estado de carregamento indefinido nem remover seleções manuais já feitas pelo mestre.

#### Scenario: Provedor indisponível

- **WHEN** o mestre aciona a sugestão e o provedor de IA está indisponível ou retorna erro
- **THEN** o sistema informa o mestre sobre a falha e as checkboxes permanecem como estavam antes da tentativa

### Requirement: Prompt padrão de contexto para o provedor de IA

Toda chamada ao provedor de IA para sugerir associações de evento SHALL incluir um prompt padrão fixo, definido previamente no produto (não editável pelo mestre), que explica a tarefa (identificar locais e personagens mencionados ou implícitos na descrição, usando apenas o catálogo fornecido) e o formato de resposta estruturado. Esse prompt SHALL ser enviado antes da descrição e do catálogo específicos da campanha.

#### Scenario: Prompt padrão presente em toda chamada

- **WHEN** o motor monta uma chamada ao provedor para sugerir associações de evento
- **THEN** a chamada inclui o prompt padrão de contexto antes da descrição e do catálogo da campanha

### Requirement: Internacionalização da nova copy

Toda copy nova introduzida pelo fluxo de sugestão de locais e personagens por IA no formulário de evento (botão, estados de carregamento, erro, resultado vazio) SHALL estar disponível em pt-BR e en.

#### Scenario: Strings novas traduzidas

- **WHEN** o utilizador troca o idioma da interface entre pt-BR e en
- **THEN** toda a copy nova do fluxo de sugestão de associações de evento aparece traduzida no idioma selecionado
