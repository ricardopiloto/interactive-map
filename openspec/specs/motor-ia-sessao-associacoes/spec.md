# motor-ia-sessao-associacoes Specification

## Purpose

Permite que o mestre, numa campanha com IA habilitada, peça ao sistema para inferir locais e personagens presentes no resumo de uma sessão e pré-marcar essas associações no formulário, sempre sujeito a revisão manual antes de gravar a sessão.

## Requirements

### Requirement: Sugestão de locais e personagens a partir do resumo

Quando o mestre aciona a sugestão por IA no formulário de criação ou edição de sessão numa campanha com o módulo de IA ativo, o sistema SHALL enviar o texto do resumo e o catálogo de locais e personagens elegíveis da campanha ao provedor e SHALL devolver listas de identificadores de locais e personagens sugeridos. O mestre SHALL poder revisar as checkboxes e só persistir associações ao salvar a sessão pelo fluxo já existente.

#### Scenario: Sugestão com resumo preenchido

- **WHEN** o mestre clica no botão de sugestão por IA com um resumo não vazio e a campanha tem o módulo de IA ativo
- **THEN** o sistema apresenta locais e personagens sugeridos marcando as respetivas opções no formulário, sem gravar a sessão

#### Scenario: Resumo vazio

- **WHEN** o mestre tenta acionar a sugestão por IA sem texto útil no resumo
- **THEN** o sistema não chama o provedor e informa que o resumo é necessário

#### Scenario: Módulo de IA desligado

- **WHEN** o mestre abre o formulário de sessão numa campanha sem o módulo de IA ativo
- **THEN** o botão de sugestão por IA não está disponível e o formulário permanece apenas manual

### Requirement: Sugestão referencia apenas locais e personagens reais da campanha

Todo identificador de local ou personagem devolvido na sugestão SHALL corresponder a um registo existente na mesma campanha e elegível para inclusão no catálogo enviado ao provedor. O sistema SHALL descartar qualquer referência da IA a um id ou nome que não exista ou não seja elegível antes de atualizar o formulário.

#### Scenario: Id inexistente é descartado

- **WHEN** a resposta do provedor inclui um id de local ou personagem que não existe na campanha
- **THEN** esse id não é aplicado às checkboxes mostradas ao mestre

### Requirement: Sugestão nunca persiste automaticamente a sessão

Uma sugestão gerada por IA SHALL alterar apenas o rascunho do formulário (seleção de locais e personagens). O sistema NUNCA SHALL criar ou atualizar a sessão na base de dados sem a ação explícita de salvar do mestre.

#### Scenario: Mestre fecha o formulário sem salvar

- **WHEN** o mestre recebe uma sugestão e fecha o formulário sem salvar
- **THEN** nenhuma associação sugerida permanece persistida na sessão

#### Scenario: Mestre edita após sugerir

- **WHEN** o mestre recebe uma sugestão, desmarca um local sugerido e salva a sessão
- **THEN** a sessão gravada reflete apenas as checkboxes que o mestre deixou marcadas ao salvar

### Requirement: Falha do motor tratada sem estado quebrado

Se a chamada ao provedor falhar (módulo desligado, credencial ausente, indisponibilidade, erro ou resposta inutilizável), o sistema SHALL informar o mestre sobre a falha e SHALL NOT deixar o formulário num estado de carregamento indefinido nem remover seleções manuais já feitas pelo mestre.

#### Scenario: Provedor indisponível

- **WHEN** o mestre aciona a sugestão e o provedor de IA está indisponível ou retorna erro
- **THEN** o sistema informa o mestre sobre a falha e as checkboxes permanecem como estavam antes da tentativa

### Requirement: Prompt padrão de contexto para o provedor de IA

Toda chamada ao provedor de IA para sugerir associações de sessão SHALL incluir um prompt padrão fixo, definido previamente no produto (não editável pelo mestre), que explica a tarefa (identificar locais e personagens mencionados ou implícitos no resumo, usando apenas o catálogo fornecido) e o formato de resposta estruturado. Esse prompt SHALL ser enviado antes do resumo e do catálogo específicos da campanha.

#### Scenario: Prompt padrão presente em toda chamada

- **WHEN** o motor monta uma chamada ao provedor para sugerir associações de sessão
- **THEN** a chamada inclui o prompt padrão de contexto antes do resumo e do catálogo da campanha

### Requirement: Internacionalização da nova copy

Toda copy nova introduzida pelo fluxo de sugestão de locais e personagens por IA (botão, estados de carregamento, erro, resultado vazio) SHALL estar disponível em pt-BR e en.

#### Scenario: Strings novas traduzidas

- **WHEN** o utilizador troca o idioma da interface entre pt-BR e en
- **THEN** toda a copy nova do fluxo de sugestão de associações de sessão aparece traduzida no idioma selecionado
