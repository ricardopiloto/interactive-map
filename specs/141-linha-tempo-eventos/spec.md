# Feature Specification: Linha do Tempo vertical da campanha

**Feature Branch**: `141-linha-tempo-eventos`  
**Backlog**: [BKLG-030](../../docs/v2/backlog.md#bklg-030-produto--linha-do-tempo-vertical-da-campanha-novo-menu-ao-lado-de-sessões)  
**Brainstorm**: [sessão 2026-09-24](../../docs/brainstorming/brainstorming-session-2026-09-24-1154.md)  
**Created**: 2026-09-24  
**Status**: Draft

**Input**: User description: "Crie uma spec com base no item BKLG-030 no docs/v2/backlog.md — Linha do Tempo vertical da campanha (novo menu ao lado de Sessões), entidade Evento, ordenação por ano, visibilidade e protótipo de tela fechados no BP."

## Constitution *(constraints; not implementation)*

- Isolamento: Eventos e suas associações MUST permanecer na campanha atual; novas rotas MUST entrar na matriz de isolamento (autenticado e anónimo).
- Testes primeiro: autenticação, permissões, migração e CRUD de Evento MUST ter testes a falhar antes da implementação correspondente.
- Produção legada: não exigir mudanças nas instâncias `/opt` antes do corte.
- Simplicidade: reutilizar padrões já usados em Sessão/Local/NPC (visibilidade, navegação cruzada, redação de referências ocultas); justificar qualquer dependência nova.
- i18n: toda copy nova da interface MUST existir em pt-BR e en; título, descrição e rótulo de era escritos pelo mestre não são traduzidos.
- Migrações: introdução da entidade Evento MUST usar revisão Alembic reversível (ou documentar rollback).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar a linha do tempo da campanha (Priority: P1)

Como mestre ou jogador, quero abrir um item de menu «Linha do Tempo» (ao lado de Sessões) e ver os acontecimentos da mesa numa coluna vertical scrollável, do mais antigo ao mais recente, para compreender a cronologia da campanha num só lugar.

**Why this priority**: É o valor central do pedido — a timeline como superfície de leitura da história da mesa.

**Independent Test**: Com eventos já cadastrados (via API ou seed de teste), abrir a rota da Linha do Tempo e verificar ordem, cards e conteúdo permitido pela visibilidade.

**Acceptance Scenarios**:

1. **Given** uma campanha com vários eventos visíveis ao papel do utilizador, **When** abre «Linha do Tempo», **Then** vê uma coluna vertical scrollável com um marcador/card por evento, ordenados do ano mais antigo no topo ao mais recente embaixo.
2. **Given** um evento com título, ano, rótulo de era opcional e descrição, **When** o utilizador expande o card, **Then** vê esses campos e, quando existirem, chips/nomes de locais e personagens vinculados.
3. **Given** uma campanha sem eventos visíveis para o papel atual, **When** abre a Linha do Tempo, **Then** vê um estado vazio compreensível (sem erro).

---

### User Story 2 - Documentar eventos como mestre (Priority: P1)

Como mestre, quero criar, editar e remover eventos da timeline (botão «+ Novo Evento» sempre disponível), para manter a documentação viva da campanha sem depender de views automáticas sobre Sessões ou Locais.

**Why this priority**: Sem escrita pelo mestre a timeline não existe; o BP define Evento como entidade cadastrada manualmente.

**Independent Test**: Como mestre autenticado, criar um evento com campos mínimos, editá-lo, associar locais/personagens/sessão opcional e removê-lo; confirmar persistência após recarregar.

**Acceptance Scenarios**:

1. **Given** um mestre na Linha do Tempo, **When** cria um evento com título e ano obrigatórios, **Then** o evento aparece na ordem correcta e permanece após sair e voltar.
2. **Given** um evento existente, **When** o mestre edita título, ano, rótulo de era, descrição, locais, personagens, sessão opcional ou visibilidade, **Then** a timeline reflecte os novos valores.
3. **Given** um evento existente, **When** o mestre solicita exclusão e confirma, **Then** o evento deixa de aparecer; cancelar a confirmação não altera dados.
4. **Given** um jogador na mesma campanha, **When** abre a Linha do Tempo, **Then** não vê botão de criar nem acções de edição/exclusão.

---

### User Story 3 - Visibilidade e navegação cruzada (Priority: P2)

Como jogador, quero ver só eventos permitidos e, dentro de um evento visível, referências a locais/personagens que ainda não conheço redigidas (sem esconder o evento inteiro); quero clicar num local ou personagem permitido e ir ao perfil dele, como já faço em Relações/Mapa.

**Why this priority**: Fecha o contrato mestre/jogador e transforma a timeline em hub de navegação, alinhado ao BP.

**Independent Test**: Configurar eventos e entidades ocultas; verificar redação e navegação como mestre e como jogador.

**Acceptance Scenarios**:

1. **Given** um evento com `visível para todos` desligado, **When** um jogador abre a timeline, **Then** não vê esse evento; o mestre continua a vê-lo e a editá-lo.
2. **Given** um evento visível que referencia um local ou personagem oculto ao jogador, **When** o jogador abre o card, **Then** o evento permanece visível e a referência oculta é redigida (não revela nome/retrato); o mestre vê as referências completas.
3. **Given** um evento com local ou personagem que o utilizador pode aceder, **When** clica no chip/nome, **Then** navega para o perfil/contexto desse local ou personagem no produto (padrão já usado em Relações/Mapa).

### Edge Cases

- Dois eventos com o mesmo `ano`: a ordem entre eles permanece estável e previsível (desempate documentado nas Assumptions).
- Evento sem locais, sem personagens e sem sessão: continua válido e exibível.
- Rótulo de era vazio: só o ano (e demais campos) é mostrado; a ordenação não depende do rótulo.
- Título vazio ou ano em falta: criação/edição é rejeitada com erro compreensível.
- Falha de rede ao guardar: o mestre é informado; a lista anterior permanece válida até sucesso.
- Dados de outra campanha não aparecem nem são alteráveis por identificadores ou rotas desta feature.
- Exportação/importação de pacote de campanha: fora de escopo desta versão (ver Assumptions); não bloquear a timeline in-app.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O produto MUST expor um item de navegação «Linha do Tempo» na campanha, ao lado de Sessões, acessível a mestre e jogador autorizados da mesa.
- **FR-002**: A Linha do Tempo MUST apresentar os eventos da campanha numa coluna vertical scrollável, ordenados automaticamente do mais antigo para o mais recente com base no ano do evento (sem configuração separada de calendário ou «data de início» da campanha).
- **FR-003**: Cada evento MUST poder ter: título (obrigatório), ano (obrigatório, usado na ordenação), rótulo de era (opcional, só exibição), descrição (texto livre), zero ou mais locais existentes, zero ou mais personagens existentes, uma sessão existente opcional, e flag de visibilidade para todos no mesmo padrão de Sessão/Local/NPC.
- **FR-004**: O mestre autorizado MUST poder criar, consultar, editar e excluir eventos da campanha actual a partir da Linha do Tempo; jogadores MUST ter somente leitura.
- **FR-005**: Eventos não visíveis para todos MUST ser omitidos da vista do jogador; o mestre MUST continuar a vê-los e gerenciá-los.
- **FR-006**: Referências a locais ou personagens que o jogador não pode ver MUST ser redigidas dentro de um evento ainda visível, sem ocultar o evento inteiro (padrão alinhado a Relações).
- **FR-007**: Clicar num local ou personagem permitido num card MUST navegar para o perfil/contexto correspondente já existente no produto.
- **FR-008**: Esta versão MUST NOT exigir tipo/categoria de evento nem motor de calendário de ficção; extensão futura fica fora de escopo.
- **FR-009**: Toda copy nova da interface MUST estar disponível em pt-BR e en.
- **FR-010**: Novas superfícies HTTP MUST ser cobertas pela matriz de isolamento entre campanhas.

### Key Entities

- **Evento**: Acontecimento narrativo cadastrado pelo mestre na campanha; tem título, ano, rótulo de era opcional, descrição, visibilidade para todos e vínculos opcionais com Locais, Personagens e uma Sessão.
- **Local**: Lugar já existente na campanha que pode ser citado por um ou mais eventos.
- **Personagem**: PJ/NPC já existente que pode ser citado por um ou mais eventos.
- **Sessão**: Entrada da crônica já existente; um evento pode apontar para no máximo uma sessão.
- **Campanha**: Limite de propriedade, autorização e isolamento dos eventos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um utilizador autorizado abre a Linha do Tempo e, com pelo menos três eventos de anos distintos, vê a ordem cronológica correcta (mais antigo no topo) em menos de 10 segundos após a página estar utilizável.
- **SC-002**: Um mestre consegue criar um evento mínimo (título + ano) e vê-lo na timeline após recarregar a página, em um fluxo contínuo sem sair da campanha.
- **SC-003**: Em todos os casos de teste de visibilidade, jogador não descobre eventos ocultos nem nomes de locais/personagens ocultos referidos em eventos visíveis; mestre mantém visão completa.
- **SC-004**: 100% das strings novas da interface estão disponíveis em pt-BR e en.
- **SC-005**: Testes de autorização e isolamento passam para pedidos autenticados, anónimos e entre campanhas nas novas rotas.

## Assumptions

- As decisões do BP (entidade nova Evento, sem calendário/início separado, sem tipo de evento na v1, redação de referências ocultas, menu ao lado de Sessões) são a fonte de verdade desta spec; o pedido original de «início definido pelo mestre» foi explicitamente descartado na sessão.
- Personagens vinculados são os já modelados como PJ/NPC no Codex (não uma entidade nova).
- Desempate quando dois eventos partilham o mesmo ano: ordem estável por identificador crescente (mais antigo criado primeiro aparece primeiro entre iguais), salvo decisão contrária no plan.
- Cards expansíveis: título/ano (e era se houver) visíveis no resumo; descrição e listas de vínculos no estado expandido — detalhe de UI fino fica no plan/prototipo, sem mudar o conteúdo obrigatório.
- Exportação e importação ZIP de campanha **não** incluem Evento nesta versão; uma extensão futura deve alinhá-los ao pacote se a paridade de backup for necessária.
- A navegação cruzada reutiliza destinos já existentes (perfil de personagem / local no Mapa ou painéis equivalentes); não cria um terceiro tipo de ficha só para a timeline.
