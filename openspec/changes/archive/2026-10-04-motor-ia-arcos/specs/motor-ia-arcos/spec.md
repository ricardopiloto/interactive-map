# Spec Delta

## Purpose

Permite que, quando o mestre escolher a criação de arco por IA numa campanha com o módulo habilitado, o sistema analise as sessões da campanha e proponha um ou mais arcos candidatos para revisão do mestre, sem nunca persistir automaticamente nem inventar dados que não existem na campanha.

## ADDED Requirements

### Requirement: Proposta de arco a partir das sessões da campanha
Quando o mestre escolher criação de arco por IA numa campanha com o módulo de IA habilitado, o sistema SHALL analisar as sessões da campanha e propor um ou mais arcos candidatos, cada um com título, resumo e as sessões e locais sugeridos. Se não houver sessões suficientes para propor um arco, o sistema SHALL informar o mestre e oferecer a criação manual.

#### Scenario: Proposta gerada com sucesso
- **WHEN** o mestre escolhe criação por IA numa campanha com o módulo habilitado e sessões suficientes
- **THEN** o sistema apresenta uma ou mais propostas de arco, cada uma com título, resumo e sessões/locais sugeridos

#### Scenario: Sessões insuficientes para propor um arco
- **WHEN** o mestre escolhe criação por IA numa campanha sem sessões suficientes para uma proposta útil
- **THEN** o sistema informa o mestre sobre a limitação e oferece a criação manual, sem apresentar uma proposta vazia ou inválida

### Requirement: Proposta referencia apenas dados reais da campanha
Toda sessão ou local incluído numa proposta de arco SHALL corresponder a um registo existente na mesma campanha. O sistema SHALL descartar ou corrigir qualquer referência da IA a uma sessão, local ou outro dado que não exista na campanha antes de apresentar a proposta ao mestre.

#### Scenario: Referência inexistente é descartada
- **WHEN** a resposta do provedor de IA referencia uma sessão ou local que não existe na campanha
- **THEN** o sistema não apresenta essa referência inexistente na proposta mostrada ao mestre

### Requirement: Proposta nunca é persistida automaticamente
Uma proposta de arco gerada por IA SHALL ser apresentada ao mestre como rascunho editável e NUNCA SHALL ser salva como um `Arco` real sem ação explícita do mestre. Aceitar uma proposta SHALL seguir o mesmo fluxo de validação já definido para a criação manual de arco.

#### Scenario: Mestre aceita a proposta
- **WHEN** o mestre revisa uma proposta de arco e confirma a criação
- **THEN** o arco é criado seguindo as mesmas regras de validação da criação manual, podendo o mestre ter editado título, resumo, sessões ou locais antes de confirmar

#### Scenario: Mestre descarta a proposta
- **WHEN** o mestre descarta uma proposta de arco sem confirmar
- **THEN** nenhum arco é criado e nenhum dado da proposta permanece persistido

### Requirement: Proposta respeita a regra de uma sessão por arco
Uma proposta de arco SHALL respeitar a mesma regra já definida em `linha-tempo-por-arcos`: uma sessão pertence a no máximo um arco, exceto a exceção de sessão de transição. O motor SHALL não sugerir uma sessão já associada a outro arco como parte de um arco diferente, fora dessa exceção.

#### Scenario: Sessão já associada a outro arco não é sugerida indevidamente
- **WHEN** o motor monta uma proposta de arco a partir das sessões da campanha
- **THEN** nenhuma sessão já associada a outro arco aparece na proposta como pertencente a um arco diferente, exceto quando a própria proposta a identifica explicitamente como sessão de transição

### Requirement: Prompt padrão de contexto para o provedor de IA
Toda chamada ao provedor de IA para gerar uma proposta de arco SHALL incluir um prompt padrão fixo, definido previamente no produto (não gerado dinamicamente nem editável pelo mestre), que explica ao provedor a tarefa (resumir sessões da campanha para sugerir a criação de novos arcos narrativos, podendo concluir que nenhum arco deve ser sugerido) e as regras obrigatórias de uso apenas de dados fornecidos, respeito à regra de uma sessão por arco e formato de resposta estruturado. Este prompt padrão SHALL ser enviado antes do contexto específico da campanha (sessões, resumos e associações) em toda chamada, independentemente da campanha solicitante.

#### Scenario: Prompt padrão presente em toda chamada
- **WHEN** o motor monta uma chamada ao provedor de IA para gerar uma proposta de arco, para qualquer campanha
- **THEN** a chamada inclui o prompt padrão de contexto antes dos dados específicos da campanha

#### Scenario: Prompt padrão não é alterado por campanha
- **WHEN** duas campanhas diferentes solicitam uma proposta de arco
- **THEN** ambas as chamadas usam o mesmo texto de prompt padrão, diferindo apenas nos dados específicos de cada campanha

### Requirement: Falha do motor tratada sem estado quebrado
Se a chamada ao provedor de IA falhar (indisponibilidade, erro, ou resposta inutilizável), o sistema SHALL informar o mestre sobre a falha e oferecer a criação manual, sem apresentar uma proposta parcial, corrompida ou um estado de carregamento indefinido.

#### Scenario: Provedor de IA indisponível ao gerar proposta
- **WHEN** o motor tenta gerar uma proposta e o provedor de IA está indisponível ou retorna erro
- **THEN** o sistema informa o mestre sobre a falha e oferece a criação manual

### Requirement: Internacionalização da nova copy
Toda copy nova introduzida pelo fluxo de proposta de arco por IA (mensagens de estado, erro e revisão) SHALL estar disponível em pt-BR e en.

#### Scenario: Strings novas traduzidas
- **WHEN** o utilizador troca o idioma da interface entre pt-BR e en
- **THEN** toda a copy nova do fluxo de proposta de arco por IA aparece traduzida no idioma selecionado
