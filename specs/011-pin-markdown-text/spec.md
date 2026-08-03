# Feature Specification: Texto do pin em Markdown

**Feature Branch**: `011-pin-markdown-text`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Nova funcionalidade, o texto dos pins pode ser markdown também, então podemos ter texto livre ou ter texto em markdown."

## Clarifications

### Session 2026-08-03

- Q: O formulário GM deve ter preview da descrição Markdown? → A: Sem preview nesta entrega — só indicação de suporte no campo + renderização na leitura do pin.
- Q: Imagens embutidas no Markdown da descrição? → A: Sem imagens — não carregar/exibir `![...](url)`; texto e estrutura Markdown (ênfase, listas, etc.) permanecem.
- Q: Como tratar links no Markdown? → A: Links http/https permitidos (abrir em nova aba); bloquear esquemas inseguros (ex.: `javascript:`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogador lê descrição formatada no pin (Priority: P1)

Como jogador, ao abrir o detalhe de um local no mapa, quero ver a descrição com formatação Markdown quando o mestre a tiver usado (títulos, negrito, listas, links), e continuar lendo texto simples normalmente quando não houver Markdown — para o conteúdo da campanha ficar mais legível sem exigir que tudo seja Markdown.

**Why this priority**: É o valor visível da feature para o público principal (jogadores); sem renderização na leitura, Markdown no armazenamento não entrega benefício.

**Independent Test**: Abrir um local cuja descrição contenha Markdown conhecido e outro só com texto puro; comparar formatação vs texto corrido. Não depende do editor GM além de haver conteúdo já salvo.

**Acceptance Scenarios**:

1. **Given** um local com descrição em texto puro (sem sintaxe Markdown), **When** o jogador abre o detalhe do pin, **Then** o texto aparece legível como texto simples, sem artefatos estranhos de formatação.
2. **Given** um local com descrição contendo Markdown suportado (ex.: negrito, itálico, lista, link), **When** o jogador abre o detalhe do pin, **Then** a formatação correspondente é exibida de forma clara.
3. **Given** um local com descrição misturando texto corrido e trechos Markdown, **When** o jogador abre o detalhe, **Then** o conteúdo renderizado reflete ambos de forma coerente.

---

### User Story 2 - GM escreve texto livre ou Markdown (Priority: P1)

Como mestre (GM), ao criar ou editar um local, quero poder digitar a descrição como texto livre ou com sintaxe Markdown no mesmo campo, sem mudar de “modo”, para enriquecer notas de locais quando fizer sentido e manter textos simples quando não fizer.

**Why this priority**: Sem capacidade de entrada, a feature depende só de dados manuais fora da UI; o GM é quem produz o conteúdo.

**Independent Test**: Em Modo GM, editar a descrição de um local com Markdown, salvar, reabrir o detalhe (ou sair do GM e abrir como jogador) e verificar a renderização.

**Acceptance Scenarios**:

1. **Given** o GM está criando ou editando um local, **When** ele preenche a descrição só com texto livre e salva, **Then** o conteúdo é persistido e exibido corretamente na leitura.
2. **Given** o GM está editando um local, **When** ele inclui Markdown suportado na descrição e salva, **Then** na leitura o Markdown é renderizado (US1).
3. **Given** o GM está no formulário de local, **When** ele visualiza o campo de descrição, **Then** fica claro que Markdown é opcionalmente aceito (indicação discreta no rótulo ou ajuda curta), sem obrigar o uso e **sem** painel ou botão de pré-visualização nesta entrega.

---

### User Story 3 - Conteúdo malicioso ou inválido não quebra a leitura (Priority: P2)

Como jogador ou GM, quero que descrições com Markdown incompleto, caracteres especiais ou tentativas de conteúdo perigoso não quebrem a tela nem executem comportamento inseguro, para a campanha permanecer utilizável e segura.

**Why this priority**: Protege a experiência e a segurança; complementa P1 sem ser o núcleo da entrega.

**Independent Test**: Abrir locais com Markdown quebrado (ex.: marcação não fechada) e com tentativas óbvias de HTML/script embutido; a UI permanece estável e sem execução de script.

**Acceptance Scenarios**:

1. **Given** uma descrição com Markdown incompleto ou inválido, **When** o detalhe do pin é aberto, **Then** o usuário ainda vê o conteúdo de forma utilizável (sem tela em branco / erro bloqueante).
2. **Given** uma descrição que tenta incluir HTML ou scripts inseguros, **When** o detalhe é aberto, **Then** esse conteúdo não é executado como código; a leitura permanece segura.

---

### Edge Cases

- Descrição vazia: comportamento atual (mensagem ou área vazia amigável) permanece.
- Descrições longas: formatação não impede rolagem/leitura no detalhe do pin.
- Links no Markdown: apenas `http`/`https` são clicáveis e abrem em nova aba; esquemas inseguros (ex.: `javascript:`) não são acionáveis como navegação.
- Imagens embutidas via Markdown (`![alt](url)`): **não** são renderizadas nesta entrega (não carregar recurso remoto); a página não quebra se a sintaxe aparecer no texto.
- Campos de NPC/arco: **fora do escopo** desta feature (somente texto associado ao pin/local).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que a descrição do local (texto do pin) seja armazenada e editada como texto livre, incluindo opcionalmente sintaxe Markdown no mesmo campo.
- **FR-002**: Na leitura do detalhe do pin (jogador), o sistema MUST renderizar Markdown suportado de forma legível.
- **FR-003**: Descrições sem Markdown MUST continuar legíveis como texto simples (sem exigir que o GM “ative” um modo Markdown).
- **FR-004**: O formulário GM de local MUST aceitar e persistir o texto da descrição (livre ou com Markdown) sem perda do conteúdo digitado.
- **FR-005**: O formulário GM MUST indicar de forma breve que a descrição pode usar Markdown.
- **FR-006**: Nesta entrega, o formulário GM MUST NOT incluir preview ao vivo nem botão dedicado de pré-visualização da descrição; a verificação visual ocorre na leitura do pin.
- **FR-007**: A renderização MUST NOT executar scripts ou HTML perigoso presente na descrição.
- **FR-008**: Markdown inválido ou incompleto MUST NOT impedir a abertura do detalhe do pin.
- **FR-009**: Esta feature aplica-se à descrição do **local** (conteúdo do pin); textos de NPC e arco ficam inalterados nesta entrega.
- **FR-010**: A leitura do pin MUST NOT renderizar nem carregar imagens referenciadas por sintaxe Markdown de imagem; ênfase, listas, títulos simples e links de texto permanecem no subconjunto suportado.
- **FR-011**: Links Markdown clicáveis MUST usar apenas esquemas `http` ou `https`, abrir em nova aba (ou equivalente explícito), e MUST NOT ativar esquemas inseguros (ex.: `javascript:`).

### Key Entities

- **Descrição do local**: Texto associado a um pin/local da campanha; pode ser prosa simples ou incluir Markdown; persistido com o restante dos dados do local.
- **Leitura do pin**: Vista de detalhe aberta ao selecionar o local no mapa (jogador), onde a descrição é apresentada já interpretada quando houver Markdown.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos casos de teste com Markdown suportado (negrito, lista, link), a leitura do pin mostra a formatação esperada em até 2 segundos após abrir o detalhe.
- **SC-002**: Em 100% dos casos com apenas texto puro, a leitura permanece equivalente em clareza à experiência anterior (sem “lixo” de sintaxe forçada).
- **SC-003**: O GM consegue salvar uma descrição com Markdown e vê-la refletida na leitura em um único ciclo editar → salvar → abrir pin, sem passos extras de “converter formato”.
- **SC-004**: Tentativas de conteúdo inseguro na descrição não resultam em execução de script na página de leitura (verificação manual de segurança), incluindo links com esquemas bloqueados.
- **SC-005**: Descrições com sintaxe de imagem Markdown não provocam carregamento de recurso de imagem na leitura do pin.
- **SC-006**: Um link Markdown `https://…` na descrição é clicável e abre fora do fluxo interno da SPA (nova aba ou equivalente).

## Assumptions

- O “texto dos pins” refere-se à **descrição do local** exibida no detalhe do pin, não ao nome do pin nem a NPC/arco.
- Não há interruptor “modo texto / modo Markdown”: um único campo; Markdown é opcional.
- Subconjunto Markdown orientado a notas de campanha: ênfase, listas, títulos simples e links `http`/`https`; **imagens Markdown não são renderizadas**; HTML cru não é requisito; esquemas de link inseguros são bloqueados.
- O GM continua sendo quem edita; jogadores só leem (salvo mudanças futuras de permissão).
- Locais já existentes com texto puro continuam válidos sem migração de dados.
- Preview ao vivo no formulário GM está **fora de escopo** nesta entrega; basta indicação de suporte + renderização na leitura.
