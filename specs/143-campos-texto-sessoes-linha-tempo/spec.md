# Feature Specification: Campos de texto padronizados em Sessões e Linha do Tempo

**Feature Branch**: `143-campos-texto-sessoes-linha-tempo`
**Backlog**: [BKLG-033](../../docs/v2/backlog.md#bklg-033-design--campos-de-texto-de-sessões-e-linha-do-tempo-divergem-do-padrão-visual)
**Created**: 2026-09-24
**Status**: Draft

**Input**: User description: "Alinhar os campos de texto em Sessões e Linha do Tempo ao padrão visual da aplicação, pois as caixas estão divergentes do padrão visual. Os campos devem seguir o mesmo modelo visual dos campos de texto da criação de um novo Codex."

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; a mudança afeta somente a apresentação de formulários existentes.
- Produção legada: não exige mudanças nas instâncias legadas.
- Interface PT-BR e EN: não introduzir texto novo; manter rótulos e mensagens existentes nos dois idiomas.
- Simplicidade: reaproveitar o padrão de campos já existente na aplicação, sem adicionar dependências ou criar outro padrão visual.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preencher campos de texto de uma Sessão (Priority: P1)

Como mestre, quero que os campos de texto ao criar ou editar uma Sessão tenham a mesma aparência dos campos padrão da aplicação, para reconhecer facilmente onde inserir e revisar informações.

**Why this priority**: Sessões é uma das duas telas citadas e contém campos de texto básicos e de conteúdo longo que o mestre usa diretamente.

**Independent Test**: Abrir o formulário de nova Sessão e o de edição; comparar os campos de título, rótulo da data e resumo com o padrão de campos de outros formulários, verificando aparência normal, foco e edição.

**Acceptance Scenarios**:

1. **Given** o formulário de Sessão aberto e os campos equivalentes da criação de Novo Codex, **When** o mestre compara título e rótulo da data, **Then** os campos de Sessão seguem o mesmo modelo visual dos campos de Novo Codex.
2. **Given** o campo de resumo no formulário de Sessão, **When** o mestre alterna entre escrever e visualizar a prévia, **Then** a experiência Markdown existente é preservada e a área de escrita segue o mesmo modelo visual dos campos de Novo Codex.
3. **Given** qualquer campo textual de uma Sessão, **When** o mestre foca e digita nele, **Then** foco, leitura e edição permanecem claros e consistentes com os demais campos do produto.

### User Story 2 - Preencher campos de texto de um evento da Linha do Tempo (Priority: P1)

Como mestre, quero que os campos de texto ao criar ou editar um evento tenham a mesma aparência dos campos padrão da aplicação, para manter consistência com Sessões e com o restante do produto.

**Why this priority**: A Linha do Tempo repete o problema visual em campos equivalentes e tem também o campo de rótulo de era.

**Independent Test**: Abrir o formulário de novo evento e o de edição; comparar título, rótulo de era e descrição ao padrão de campo da aplicação, verificando foco, digitação e prévia Markdown.

**Acceptance Scenarios**:

1. **Given** o formulário de evento aberto e os campos equivalentes da criação de Novo Codex, **When** o mestre compara título e rótulo de era, **Then** os campos do evento seguem o mesmo modelo visual dos campos de Novo Codex.
2. **Given** o campo de descrição do evento, **When** o mestre alterna entre escrever e visualizar a prévia, **Then** a experiência Markdown existente é preservada e a área de escrita segue o mesmo modelo visual dos campos de Novo Codex.
3. **Given** campos textuais de Sessões e Linha do Tempo abertos em sequência, **When** o mestre compara os campos equivalentes, **Then** eles usam a mesma linguagem visual e estados de foco.

### Edge Cases

- Textos longos devem continuar acessíveis e editáveis sem serem cortados ou sobrepor outros controles.
- Valores já preenchidos em formulários de edição devem permanecer legíveis e selecionáveis.
- A aparência de foco deve continuar perceptível em temas claro e escuro.
- Campos numéricos, seletores, checkboxes e prévias de Markdown não devem ser alterados por engano como parte do escopo de campos textuais.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Os campos de texto de uma linha para título e rótulos de data/era nos formulários de Sessões e Linha do Tempo MUST seguir o mesmo modelo visual dos campos de texto da criação de Novo Codex.
- **FR-002**: Os campos de escrita de resumo e descrição MUST manter a experiência de edição e prévia Markdown existente e seguir o mesmo modelo visual dos campos de texto da criação de Novo Codex.
- **FR-003**: Campos equivalentes nas três telas MUST ter aparência consistente quanto a altura, espaçamento interno, borda, raio, fundo, tipografia e estado de foco.
- **FR-004**: Os campos MUST permanecer utilizáveis em temas claro e escuro, com texto, bordas e indicação de foco legíveis.
- **FR-005**: A alteração MUST preservar rótulos, validação, valores, salvamento e edição dos formulários existentes.
- **FR-006**: Campos numéricos, seletores, checkboxes, organização dos formulários e conteúdo apresentado nas telas MUST permanecer fora do escopo desta mudança.
- **FR-007**: A alteração MUST usar os campos de texto da criação de Novo Codex como referência visual concreta, sem redesenhar as telas nem alterar o layout dos formulários.

### Key Entities *(include if data involved)*

Não há entidades novas nem alteração de dados. Os campos pertencem aos dados já existentes de Sessão e Evento da Linha do Tempo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos campos textuais abrangidos em Sessões e Linha do Tempo correspondem ao modelo visual dos campos de texto da criação de Novo Codex.
- **SC-002**: 100% dos campos de resumo/descrição mantêm escrita e prévia Markdown e apresentam o modelo visual de Novo Codex no modo de escrita, sem perda de conteúdo ou comportamento.
- **SC-003**: Os campos abrangidos permanecem legíveis nos temas claro e escuro, incluindo seus estados de foco.
- **SC-004**: Nenhum campo numérico, seletor ou checkbox muda de aparência ou comportamento por consequência desta alteração.
- **SC-005**: A criação e edição de Sessões e eventos continuam salvando os mesmos valores que antes da mudança.

## Assumptions

- “Campos de texto” inclui título, rótulos livres de data/era e áreas de resumo/descrição; campos numéricos como número da Sessão e ano do Evento não estão incluídos.
- A referência visual é o controle de texto usado na criação de Novo Codex: altura mínima de 44 px, padding de 10 px por 12 px, borda sutil, raio médio, fundo de superfície secundária, tipografia herdada e contorno de foco de 2 px com deslocamento de 2 px; cores continuam usando tokens para suportar os temas.
- A área de escrita Markdown de resumo/descrição deve adotar esse mesmo tratamento visual sem alterar as abas, a prévia ou a formatação existentes.
- Não são necessárias mudanças de API, modelo de dados, permissões ou tradução de conteúdo escrito pelo mestre.
