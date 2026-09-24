# Feature Specification: Seletor de tema compacto

**Feature Branch**: `127-seletor-tema-icone`  
**Backlog**: [BKLG-009](../../docs/v2/backlog.md#bklg-009-design--botao-de-tema-so-com-icone-tres-estados)  
**Created**: 2026-09-23  
**Status**: Draft

**Input**: User description: "Alinhar o botão de tema do produto ao padrão do protótipo: gatilho compacto somente com ícone, mantendo as três opções Automático, Claro e Escuro claramente identificáveis no menu."

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; preferência visual, sem dados de campanha.
- Testes primeiro: validar ciclo das três opções e preferência persistida antes de substituir a apresentação do controle.
- Produção legada: não exigir mudanças nas instâncias `/opt`.
- Simplicidade: reutilizar seletor, estado de tema e ícones existentes, sem dependência nova.
- i18n: nomes das opções e nome acessível do gatilho MUST existir em pt-BR e en.
- Migrações: N/A; sem alteração de schema.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identificar o estado atual do tema (Priority: P1)

Como pessoa usuária, quero alternar a aparência da interface usando um controle compacto e acessível, sem ocupar espaço com um rótulo sempre visível.

**Why this priority**: O controle atual ocupa mais espaço que o padrão aprovado e diverge do protótipo.

**Independent Test**: Conferir o seletor fechado em desktop e mobile, alternando cada preferência e verificando que o ícone comunica o tema efetivo e que tecnologia assistiva identifica a ação.

**Acceptance Scenarios**:

1. **Given** o seletor fechado, **When** a pessoa olha o controle, **Then** vê somente o ícone do tema efetivo, sem texto ou seta decorativa.
2. **Given** uma preferência configurada, **When** tecnologia assistiva alcança o gatilho, **Then** recebe um nome acessível claro que informa a função e/ou estado do tema.

### User Story 2 - Escolher entre automático, claro e escuro (Priority: P1)

Como pessoa usuária, quero selecionar uma das três preferências para que a interface tenha a aparência desejada em diferentes ambientes.

**Why this priority**: As três opções têm semânticas distintas; reduzir o gatilho não pode remover a escolha nem tornar seu estado ambíguo.

**Independent Test**: Abrir o menu, selecionar cada opção e validar aparência, estado selecionado, persistência e traduções.

**Acceptance Scenarios**:

1. **Given** o menu aberto, **When** a pessoa consulta as opções, **Then** vê Automático, Claro e Escuro com indicação da escolha ativa.
2. **Given** preferência Automático, **When** a preferência do sistema muda entre claro e escuro, **Then** a interface acompanha o sistema e o gatilho mostra o ícone correspondente ao tema efetivo.
3. **Given** preferência Claro ou Escuro, **When** muda a preferência do sistema, **Then** a aparência escolhida manualmente permanece estável.

### Edge Cases

- Ausência de preferência salva usa Automático como padrão.
- Preferência salva inválida ou antiga cai para um estado válido sem quebrar a interface.
- O menu pode ser operado por teclado e fecha conforme o padrão existente ao selecionar ou perder foco.
- O ícone não pode ser o único nome acessível do controle.
- Layout mobile mantém alvo de toque suficiente mesmo sem rótulo visual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O gatilho fechado do seletor MUST mostrar somente o ícone representativo do tema efetivo, sem texto ou seta decorativa.
- **FR-002**: O gatilho MUST ter nome acessível que comunique que controla o tema e, quando aplicável, seu estado/preferência atual.
- **FR-003**: O menu MUST manter as opções Automático, Claro e Escuro com rótulos textuais e indicação da opção selecionada.
- **FR-004**: Automático MUST acompanhar a preferência atual do sistema operacional; Claro e Escuro MUST permanecerem fixos até outra escolha.
- **FR-005**: A preferência escolhida MUST persistir conforme o comportamento atual do produto.
- **FR-006**: O controle MUST permanecer operável por teclado e utilizável em desktop e mobile.
- **FR-007**: Os rótulos e nomes acessíveis MUST existir em pt-BR e en.
- **FR-008**: O produto MUST corresponder ao padrão de gatilho compacto do `frontend-next`, preservando a interação já suportada para as três opções.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O gatilho fechado não apresenta rótulo textual nem seta decorativa em qualquer locale ou viewport suportado.
- **SC-002**: As três opções continuam disponíveis, distinguíveis e selecionáveis em 100% dos testes de interação.
- **SC-003**: A opção Automático acompanha mudanças do tema do sistema; escolhas Claro e Escuro não são alteradas por elas.
- **SC-004**: Leitores de tela identificam claramente o propósito do controle e sua operação por teclado funciona.
- **SC-005**: Todas as opções e nomes acessíveis aparecem corretamente em pt-BR e en.

## Assumptions

- O modelo atual de três estados e persistência é preservado; esta spec altera a apresentação do gatilho e clarifica acessibilidade, não a semântica da preferência.
- O ícone representa o tema efetivamente aplicado, enquanto o menu indica a preferência selecionada (Automático, Claro ou Escuro).
- Ícones, traduções e infraestrutura de tema existentes serão reutilizados.
