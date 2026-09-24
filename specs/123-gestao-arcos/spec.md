# Feature Specification: Gestão de arcos narrativos

**Feature Branch**: `123-gestao-arcos`  
**Backlog**: [BKLG-001](../../docs/backlog/backlog.md#bklg-001-gap--gestao-de-arcos-nao-foi-desenhada-no-frontend-next)  
**Created**: 2026-09-23  
**Status**: Draft

**Input**: User description: "Especificar a gestão de Arcos que existe no produto mas não foi desenhada no frontend-next: criar, editar, apagar, reordenar, controlar visibilidade para todos e atribuir Locais a um arco, com uma experiência de mestre coerente no Mapa."

## Constitution *(constraints; not implementation)*

- Isolamento: operações de arcos e locais MUST permanecer dentro da campanha atual; verificar acesso autorizado e anónimo na matriz de isolamento.
- Testes primeiro: escrever testes de isolamento e de permissões antes de alterar comportamento ou dados.
- Produção legada: não exigir mudanças nas instâncias `/opt` antes do corte.
- Simplicidade: reutilizar o modelo, contratos e componentes existentes; justificar qualquer dependência ou alteração de schema.
- i18n: toda copy nova MUST existir em pt-BR e en; texto escrito pelo mestre não é traduzido.
- Migrações: se discovery comprovar alteração de schema, usar revisão Alembic reversível ou documentar rollback.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Organizar arcos da campanha (Priority: P1)

Como mestre, quero criar, editar e ordenar arcos narrativos para organizar os Locais da campanha na sequência em que os jogadores devem explorá-los.

**Why this priority**: O produto já tem criação parcial e operações de API para Arcos, mas não oferece o fluxo visual completo de gestão; o protótipo também só os apresenta como opções de associação.

**Independent Test**: Um mestre autorizado gerencia vários arcos pela interface do Mapa e confere que nomes, resumos e ordem permanecem após sair e voltar.

**Acceptance Scenarios**:

1. **Given** uma campanha sem arcos, **When** o mestre cria um arco com nome e resumo, **Then** o arco aparece na lista de gestão e pode receber Locais.
2. **Given** um arco existente, **When** o mestre altera seus dados ou posição, **Then** lista e Mapa refletem os valores e a nova ordem.
3. **Given** um arco com Locais atribuídos, **When** o mestre solicita sua exclusão, **Then** recebe confirmação que informa o efeito sobre os Locais e pode cancelar sem alterações.

### User Story 2 - Controlar acesso e associação de Locais (Priority: P1)

Como mestre, quero decidir se cada arco é visível a todos e quais Locais pertencem a ele, para controlar a organização narrativa sem expor conteúdo oculto.

**Why this priority**: Visibilidade e associação definem o efeito narrativo dos arcos e devem funcionar em conjunto com a gestão.

**Independent Test**: Atribuir Locais a arcos visíveis e ocultos, alternar visibilidade e verificar o resultado nas vistas do mestre e do jogador.

**Acceptance Scenarios**:

1. **Given** um arco visível para todos, **When** um jogador abre a campanha, **Then** vê o arco e os Locais que já pode acessar.
2. **Given** um arco oculto, **When** um jogador abre a campanha, **Then** não recebe nome, resumo, ordem ou associação que revele esse arco; o mestre continua vendo e gerenciando-o.
3. **Given** um Local editável pelo mestre, **When** ele o associa, remove ou reassocia a um arco, **Then** a mudança aparece na gestão do arco e na edição do Local.

### User Story 3 - Acessar a gestão pelo Mapa (Priority: P2)

Como mestre, quero encontrar as ações de arco no menu de gestão do Mapa, para administrar a narrativa sem sair do contexto da campanha.

**Why this priority**: O ponto de entrada deve tornar descoberta uma capacidade hoje escondida no fluxo do Mapa e fechar o gap de design do protótipo.

**Independent Test**: Entrar como mestre no Mapa, abrir as ações de gestão e chegar à lista/formulário de arcos; confirmar que jogador não vê controles de edição.

**Acceptance Scenarios**:

1. **Given** um mestre no Mapa, **When** abre o menu de gestão, **Then** encontra uma ação identificável para gerenciar arcos.
2. **Given** um jogador no mesmo Mapa, **When** navega pela interface, **Then** não vê ações de criação, alteração, ordenação ou exclusão de arcos.

### Edge Cases

- Um arco sem Locais continua visível e editável pelo mestre.
- A exclusão de um arco com Locais informa que os Locais serão mantidos sem associação a arco; o mestre confirma explicitamente antes de prosseguir.
- Nomes repetidos, nome vazio e resumo vazio seguem as regras existentes de validação e limites apresentados ao mestre.
- Falha de rede não descarta alterações locais sem informar o mestre; a ordem anterior continua válida.
- Uma campanha sem arcos apresenta estado vazio com ação de criação somente para o mestre.
- Dados de outra campanha não aparecem nem podem ser modificados por rotas, identificadores ou ações da gestão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A interface MUST permitir ao mestre autorizado criar, consultar, editar, ordenar e excluir arcos da campanha atual.
- **FR-002**: Cada arco MUST ter nome, resumo, posição de exibição e estado de visibilidade para todos, respeitando o contrato vigente.
- **FR-003**: O mestre MUST poder associar e desassociar Locais a um arco ao editar o Local e compreender a associação na gestão de arcos.
- **FR-004**: A exclusão de arco com Locais MUST informar o efeito e exigir confirmação antes de aplicar a ação.
- **FR-005**: Jogadores MUST ver somente arcos e Locais permitidos pelas regras atuais de visibilidade; conteúdo de arco oculto não pode vazar em listas, contagens ou detalhes.
- **FR-006**: A gestão MUST ser acessível a partir das ações do mestre no Mapa e não pode apresentar ações de escrita a jogadores.
- **FR-007**: O fluxo MUST apresentar estados vazio, carregando, sucesso e erro compreensíveis, sem perder a ordem persistida quando uma operação falhar.
- **FR-008**: Toda copy nova da interface MUST estar disponível em pt-BR e en.
- **FR-009**: O desenho novo deve ser representado no `frontend-next` e a experiência do produto deve acompanhar esse desenho sem alterar o escopo de Sessões.

### Key Entities

- **Arco**: Agrupamento narrativo ordenado de Locais, com nome, resumo e visibilidade para todos, pertencente a uma única campanha.
- **Local**: Lugar da campanha que pode pertencer a um arco ou permanecer sem associação.
- **Campanha**: Limite de propriedade e autorização dos arcos e Locais.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um mestre consegue criar, alterar, reordenar e remover um arco em uma campanha de teste sem sair do Mapa.
- **SC-002**: Em todos os casos de teste, jogador não consegue descobrir dados de arcos ocultos e mestre mantém acesso de gestão.
- **SC-003**: Uma alteração de associação de Local é refletida de forma consistente na gestão e na edição do Local.
- **SC-004**: 100% das strings novas estão disponíveis em pt-BR e en.
- **SC-005**: Os testes de autorização e isolamento passam para chamadas autorizadas, anónimas e entre campanhas.

## Assumptions

- O produto já possui operações e campos para gestão de arcos; a feature fecha primeiro o gap de desenho e paridade, preservando contratos existentes sempre que possível.
- Arcos pertencem a uma única campanha; não há compartilhamento entre campanhas.
- A exclusão não apaga os Locais associados; conforme o comportamento atual do contrato, eles ficam sem associação ao arco excluído.
- A API e o modelo já suportam as operações centrais; a lacuna principal está na experiência visual completa de gestão e no seu desenho em `frontend-next`.
- Sessões/Crônica são um conceito separado e não fazem parte desta feature.
