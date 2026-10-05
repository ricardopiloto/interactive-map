# Spec Delta

## MODIFIED Requirements

### Requirement: Proposta de arco a partir das sessões da campanha
Quando o mestre escolher criação de arco por IA numa campanha com o módulo de IA habilitado, o sistema SHALL analisar apenas as sessões da campanha que ainda não pertencem a um arco e SHALL propor um ou mais arcos candidatos, cada um com título, resumo e as sessões e locais sugeridos. O resumo de cada proposta SHALL ser produzido somente a partir dessas sessões sem arco e das associações delas. Sessões que já pertencem a um arco SHALL NOT entrar no material resumido pelo provedor. Se não houver sessões sem arco suficientes para propor um arco, o sistema SHALL informar o mestre e oferecer a criação manual, sem chamar o provedor.

#### Scenario: Proposta gerada com sucesso
- **WHEN** o mestre escolhe criação por IA numa campanha com o módulo habilitado e sessões sem arco suficientes
- **THEN** o sistema apresenta uma ou mais propostas de arco, cada uma com título, resumo e sessões/locais sugeridos, e o resumo não depende de sessões que já pertencem a um arco

#### Scenario: Sessões insuficientes para propor um arco
- **WHEN** o mestre escolhe criação por IA numa campanha sem sessões sem arco suficientes para uma proposta útil
- **THEN** o sistema informa o mestre sobre a limitação e oferece a criação manual, sem apresentar uma proposta vazia ou inválida e sem chamar o provedor

#### Scenario: Sessão já associada a um arco fica fora do resumo
- **WHEN** a campanha tem sessões sem arco suficientes e também sessões que já pertencem a um arco
- **THEN** o material enviado ao provedor contém as sessões sem arco e omite as sessões que já têm arco, inclusive os locais e personagens citados apenas por causa dessas sessões ocupadas

### Requirement: Prompt padrão de contexto para o provedor de IA
Toda chamada ao provedor de IA para gerar uma proposta de arco SHALL incluir um prompt padrão fixo, definido previamente no produto (não gerado dinamicamente nem editável pelo mestre), que explica ao provedor a tarefa (resumir apenas as sessões da campanha que ainda não pertencem a um arco, para sugerir a criação de novos arcos narrativos, podendo concluir que nenhum arco deve ser sugerido) e as regras obrigatórias de uso apenas de dados fornecidos, respeito à regra de uma sessão por arco e formato de resposta estruturado. Este prompt padrão SHALL ser enviado antes do contexto específico da campanha em toda chamada, independentemente da campanha solicitante. Esse contexto SHALL conter somente sessões sem arco associado e as associações dessas sessões.

#### Scenario: Prompt padrão presente em toda chamada
- **WHEN** o motor monta uma chamada ao provedor de IA para gerar uma proposta de arco, para qualquer campanha
- **THEN** a chamada inclui o prompt padrão de contexto antes dos dados específicos da campanha, e esses dados não incluem sessões que já pertencem a um arco

#### Scenario: Prompt padrão não é alterado por campanha
- **WHEN** duas campanhas diferentes solicitam uma proposta de arco
- **THEN** ambas as chamadas usam o mesmo texto de prompt padrão, diferindo apenas nos dados específicos de cada campanha
