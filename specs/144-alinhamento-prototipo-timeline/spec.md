# Feature Specification: Alinhamento da Linha do Tempo ao protótipo

**Feature Branch**: `144-alinhamento-prototipo-timeline`  
**Created**: 2026-09-24  
**Status**: Draft  
**Input**: User description: "Olhando para a spec 141-linha-tempo-eventos e para o protótipo tmp/timeline.html, crie uma nova spec para adequar a funcionalidade ao que foi desenhado no prototipo, respeitando a identidade visual atual da aplicação."

## Constitution *(constraints; not implementation)*

- A spec 141 continua definindo a entidade Evento, permissões, visibilidade, isolamento por campanha e navegação para entidades relacionadas; esta spec detalha o comportamento de apresentação e edição segundo o protótipo.
- Nenhuma informação de campanha pode vazar para outra campanha; esta spec não solicita novas rotas nem mudança de dados.
- Copy nova da interface deve existir em pt-BR e en; conteúdo escrito pelo mestre não deve ser traduzido.
- Usar a identidade visual e os componentes existentes no produto. O protótipo orienta estrutura e comportamento, não substitui os tokens, padrões de navegação ou componentes visuais atuais.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar a cronologia como jogador (Priority: P1)

Como jogador, quero encontrar os acontecimentos visíveis já apresentados em cards completos e em ordem cronológica, para relembrar a história da campanha sem ações extras para revelar os detalhes.

**Why this priority**: A visão do jogador é a superfície de leitura principal do protótipo e deve tornar o conteúdo conhecido imediatamente acessível.

**Independent Test**: Abrir a Linha do Tempo como jogador em uma campanha com eventos visíveis e ocultos; verificar conteúdo, ordenação, associações e orientação de visibilidade.

**Acceptance Scenarios**:

1. **Given** eventos visíveis com título, ano, descrição e associações permitidas, **When** o jogador abre a Linha do Tempo, **Then** cada card exibe diretamente ano, era quando preenchida, título, descrição e associações acessíveis, sem controle para expandir ou recolher.
2. **Given** um evento visível vinculado a uma sessão também visível ao jogador, **When** o jogador consulta o card, **Then** a sessão vinculada é apresentada como metadado do evento.
3. **Given** a lista de eventos do jogador, **When** ela termina, **Then** uma orientação informa que eventos ausentes podem ainda não ter sido revelados pelo mestre.
4. **Given** um evento oculto ou uma associação inacessível, **When** o jogador consulta a timeline, **Then** o evento oculto não aparece e a associação inacessível não revela nome ou retrato, conforme o contrato da spec 141.

### User Story 2 - Consultar e administrar a cronologia como mestre (Priority: P1)

Como mestre, quero reconhecer o contexto da minha visão, localizar eventos ocultos e abrir detalhes de cada evento quando necessário, mantendo ações de gestão disponíveis, para administrar a cronologia da campanha.

**Why this priority**: A visão do mestre precisa comunicar sua finalidade e preservar o acesso a eventos e ações de gestão sem sobrecarregar a lista.

**Independent Test**: Abrir a Linha do Tempo como mestre, expandir e recolher cards, e iniciar criação, edição e exclusão; confirmar campos e ações previstos na spec 141.

**Acceptance Scenarios**:

1. **Given** um mestre na Linha do Tempo, **When** a página é exibida, **Then** o cabeçalho informa que a visão permite cadastrar e acompanhar acontecimentos e apresenta a ação para criar evento.
2. **Given** um evento na lista do mestre, **When** o mestre expande ou recolhe seu card, **Then** título, ano, era e indicador de ocultação permanecem identificáveis e a descrição, associações e sessão vinculada ficam disponíveis no detalhe expandido.
3. **Given** um evento oculto para jogadores, **When** o mestre consulta a lista, **Then** o card apresenta um indicador de que o evento está oculto.
4. **Given** um mestre autorizado, **When** cria ou edita um evento, **Then** pode informar título, ano, era opcional, descrição, locais, personagens, sessão opcional e visibilidade, e salvar ou cancelar usando os controles existentes do produto.
5. **Given** um mestre autorizado, **When** solicita a exclusão de um evento, **Then** pode confirmar ou cancelar a ação; jogadores não recebem controles de criação, edição ou exclusão.

### User Story 3 - Usar a Linha do Tempo integrada ao produto (Priority: P2)

Como usuário da campanha, quero que a Linha do Tempo mantenha os padrões de navegação e identidade visual do produto, para reconhecer a mesma aplicação ao alternar entre suas áreas.

**Why this priority**: A referência funcional do protótipo deve integrar-se ao produto sem criar uma experiência visual desconectada.

**Independent Test**: Comparar a página e o formulário da Linha do Tempo com páginas existentes em tema claro e escuro, verificando cabeçalho, tipografia, cores, campos, botões, diálogo e responsividade.

**Acceptance Scenarios**:

1. **Given** um jogador na Linha do Tempo, **When** abre a página, **Then** o subtítulo contextualiza a visão como recordação da história já vivida pelo grupo.
2. **Given** um card com local ou personagem acessível, **When** o usuário seleciona uma associação, **Then** navega para o destino já existente desse local ou personagem.
3. **Given** a Linha do Tempo em qualquer tema suportado, **When** página, cards e formulário são exibidos, **Then** usam os tokens e componentes atuais da aplicação, sem adotar estilos, fontes ou cores específicos do protótipo.

### Edge Cases

- Se não houver eventos disponíveis para o papel atual, manter o estado vazio existente e não exibir a orientação de eventos não revelados como se houvesse itens na lista.
- Se título, descrição ou associações opcionais estiverem ausentes, o card continua legível e omite apenas os elementos vazios.
- Se um evento não tiver sessão vinculada, omitir o metadado de sessão.
- Se eventos compartilharem o mesmo ano, preservar o desempate estável definido na spec 141.
- Em telas estreitas, manter a leitura dos cards, associações e ações sem exigir rolagem horizontal.
- Alterações no formulário não podem apagar silenciosamente dados previamente salvos que não sejam exibidos nesta experiência.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A Linha do Tempo MUST apresentar um subtítulo localizado de acordo com o papel: mestre (cadastro e acompanhamento dos acontecimentos) ou jogador (recordação da história vivida pelo grupo).
- **FR-002**: Para jogadores, cada evento visível MUST apresentar seus detalhes sem interação de expansão: ano, era opcional, título, descrição quando existente e associações que o jogador pode acessar.
- **FR-003**: Para mestres, cada evento MUST permitir expandir e recolher os detalhes; o resumo MUST identificar ano, era opcional, título e, para eventos não visíveis aos jogadores, seu estado de ocultação.
- **FR-004**: O detalhe expandido do mestre MUST apresentar descrição, associações e metadado da sessão vinculada quando disponíveis.
- **FR-005**: Os cards MUST continuar ordenados do evento mais antigo para o mais recente pelo ano, respeitando o desempate estável definido na spec 141.
- **FR-006**: A visão do jogador MUST apresentar, após a lista com eventos, uma mensagem localizada informando que um evento ausente pode ainda não ter sido revelado pelo mestre.
- **FR-007**: A visão do mestre MUST manter criação, edição e exclusão de eventos e a visão do jogador MUST permanecer somente para leitura, de acordo com permissões e campos definidos na spec 141.
- **FR-008**: O formulário de evento MUST oferecer título, ano, rótulo de era opcional, descrição, seleção de locais e personagens, sessão opcional e controle de visibilidade para jogadores, sem introduzir campos de domínio novos nesta adequação.
- **FR-009**: A visualização de sessão vinculada MUST identificar a sessão associada sem substituir nem alterar seu conteúdo.
- **FR-010**: Para jogadores, a sessão vinculada MUST ser apresentada somente quando essa sessão também estiver visível; referências a sessões ocultas MUST ser omitidas sem revelar seu título ou número.
- **FR-011**: Eventos ocultos e associações protegidas MUST continuar obedecendo às regras de visibilidade e redação estabelecidas na spec 141.
- **FR-012**: A navegação por associações acessíveis MUST continuar levando aos destinos existentes de locais e personagens.
- **FR-013**: Página, cards e formulário MUST seguir a identidade visual, os componentes, os tokens de tema, a responsividade e os padrões de acessibilidade já utilizados pela aplicação; o protótipo MUST ser tratado como referência de estrutura e comportamento.
- **FR-014**: Toda nova copy MUST estar disponível em pt-BR e en.

### Key Entities *(include if data involved)*

- **Evento**: Acontecimento já definido na spec 141, com ano, era opcional, descrição, associações, sessão opcional e visibilidade. Esta adequação não introduz nova entidade.
- **Sessão, Local e Personagem**: Entidades existentes associadas a um evento e apresentadas conforme disponibilidade e permissões do usuário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos cenários de jogador com eventos visíveis e detalhes preenchidos, descrição e associações acessíveis estão disponíveis sem expandir cards.
- **SC-002**: Em 100% dos cenários de mestre, o usuário consegue expandir e recolher detalhes e identificar eventos ocultos sem perder acesso às ações permitidas.
- **SC-003**: Em 100% dos eventos vinculados a uma sessão, a sessão é identificável no detalhe do mestre; eventos sem sessão não exibem metadado vazio.
- **SC-004**: Nenhum cenário de validação revela evento oculto, dados de associação protegidos ou metadados de sessão oculta ao jogador.
- **SC-005**: Todas as strings novas estão disponíveis em pt-BR e en e a página permanece legível nos temas e larguras suportados pela aplicação.

## Assumptions

- A spec 141 permanece como contrato funcional e de privacidade para dados, permissões, ordenação, exclusão, associação e navegação; esta spec a complementa somente onde o protótipo apresenta uma experiência diferente.
- O protótipo define diferenças de comportamento entre papéis: cards expansíveis para mestre e sempre detalhados para jogador; não define uma nova identidade visual para o produto.
- O formulário continua usando os controles existentes da aplicação para criar e editar. A apresentação pode adaptar-se aos padrões atuais de diálogo ou painel, preservando o fluxo de campos do protótipo.
- O protótipo não apresenta mês. A timeline e o formulário desta adequação usam ano e era como informação temporal visível; valores de mês previamente persistidos devem ser preservados até que uma decisão de domínio separada trate sua remoção.
- Integração com exportação/importação permanece fora do escopo, conforme spec 141.
