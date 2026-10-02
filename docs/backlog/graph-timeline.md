# PRD — Timeline por arcos e por descoberta

Sep 27, 2026 · @Ricardo

Este PRD define os requisitos de produto para dois novos modos de visualização de timeline no campaign-codex — por arcos narrativos e por ordem de descoberta — complementando o modo cronológico já existente.

## Contexto e problema

Hoje o campaign-codex oferece apenas uma timeline cronológica simples, ordenada por data de sessão. Isso cria dois problemas para o GM:

- Quando um arco narrativo é retomado depois de várias sessões de outros assuntos, suas partes ficam espalhadas e desconectadas visualmente na timeline — não há como ver o arco como um fio contínuo.
- Não existe uma forma de consultar quando um personagem, local, facção ou item foi descoberto pelo grupo pela primeira vez, nem quando ele reaparece depois de ficar ausente por muitas sessões.

## Objetivos

- Permitir que o usuário escolha como a timeline é apresentada, sem alterar a ordenação por data que já existe hoje.
- Tornar visível a continuidade de um arco narrativo mesmo quando suas sessões estão espalhadas no tempo.
- Dar visibilidade a quando entidades (personagens, locais, facções, itens) foram descobertas e quando reaparecem depois de ausências longas.
- Deixar a geração de arcos por IA como uma escolha explícita do usuário, nunca um processo automático rodando em segundo plano.

## Modos de visualização

| Modo | Ordenação | Pré-requisito |
| --- | --- | --- |
| Cronológica | Data da sessão | Nenhum (padrão atual) |
| Por arcos | Data da sessão, agrupada em raias por arco | Ao menos um arco definido (via IA ou manual) |
| Por descoberta | Data da primeira aparição da entidade | Nenhum |

Um seletor de modo (segmented control) fica visível no topo da timeline, com um texto de apoio explicando o que cada modo exige.

## Requisitos — visualização por arcos

- Cada arco é exibido como uma raia horizontal própria, com cor fixa e persistida.
- A posição horizontal de cada sessão continua ancorada na sua data real; o agrupamento por arco é apenas visual, não altera a ordenação subjacente.
- Entre duas sessões consecutivas do mesmo arco, exibir o tempo decorrido (dias, semanas ou meses), reaproveitando a granularidade de mês/ano já usada na timeline atual.
- Quando o intervalo entre duas sessões do mesmo arco for grande, o traço de conexão é exibido tracejado, para reforçar visualmente a descontinuidade.
- O usuário pode filtrar quais arcos aparecem na tela (chips por arco), para focar em 1-2 arcos de cada vez em campanhas com muitos arcos simultâneos.
- Sessões sem nenhum arco associado devem continuar visíveis (ex.: em uma raia neutra ou indicadas como "sem arco"), não podem desaparecer da timeline.

## Requisitos — visualização por descoberta

- Entidades (personagens, locais, facções, itens) são ordenadas pela data da sessão em que foram mencionadas ou apareceram pela primeira vez.
- Para cada entidade, exibir também as sessões em que ela reaparece após a primeira aparição — não só a primeira.
- Agrupar as entidades por tipo, com um filtro que permite restringir a lista a um tipo específico ou ver todos.
- Cada grupo de tipo pode usar um ícone visual simples (ex.: emoji) como identificador, aplicado com moderação — não deve virar o elemento principal da tela.

## Requisitos — criação de arco

- O usuário escolhe explicitamente, na criação de cada arco, entre gerar com IA ou criar manualmente. Não deve existir um motor de detecção de arcos rodando automaticamente em segundo plano.
- Se a opção "gerar com IA" for escolhida e os recursos de IA não estiverem habilitados para a campanha, exibir um aviso claro explicando isso e oferecendo o caminho para habilitar a IA ou seguir manualmente.
- Na criação manual, o usuário deve poder associar ao arco tanto localidades (já suportado hoje) quanto sessões (novo campo — hoje o modelo de arco só permite vincular localidades, o que é insuficiente para o modo por arcos funcionar).
- Um arco tem um título e uma cor, definida na criação.

## Fora de escopo

- Modelo de dados, schema e detalhes de implementação do motor de IA de detecção de arcos — cobertos no TR separado.
- Suporte a arcos que se sobrepõem visualmente na mesma raia (ex.: dois arcos disputando as mesmas sessões) fica para uma fase futura.
- Edição de arcos e reordenação de sessões dentro de um arco não estão detalhadas aqui.

## Perguntas em aberto

- [ ] Quantos arcos simultâneos são esperados em uma campanha típica, para calibrar o limite de raias exibidas sem filtro?
- [ ] Reaparições devem ser marcadas apenas quando houver um intervalo grande desde a última aparição, ou toda reaparição conta?
- [ ] O filtro de arcos deve ter algum limite (ex.: no máximo 2 arcos ativos por vez) ou é livre?
