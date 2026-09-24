# Feature Specification: Login em modal com retorno ao contexto

**Feature Branch**: `126-login-modal-rota`
**Backlog**: [BKLG-008](../../docs/v2/backlog.md#bklg-008-design--login-em-modal-flutuante-em-vez-de-pagina-separada)
**Created**: 2026-09-23
**Status**: Draft

**Input**: User description: "Abrir o login como modal sobre a tela atual quando a pessoa inicia a autenticação dentro do produto, preservando o acesso direto à rota de login e o retorno à tela/contexto de origem após entrar. Convite e redefinição de senha continuam páginas próprias."

**Decision source**: [TR Login em modal](../../docs/v2/tr-login-modal.md), que recomenda rota-modal com localização de fundo e inventaria os nove pontos de entrada.

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; não são adicionadas rotas de dados de campanha. A sessão de autenticação mantém as regras existentes.
- Testes primeiro: escrever testes de sessão e de redirecionamento/retorno antes de alterar os fluxos de autenticação.
- Produção legada: não exigir mudanças nas instâncias `/opt`.
- Simplicidade: reutilizar roteamento e diálogo já disponíveis, sem nova dependência.
- i18n: toda copy nova em pt-BR e en; copy existente de login mantém suas traduções.
- Migrações: N/A; sem alteração de schema.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar sem perder a tela atual (Priority: P1)

Como visitante, quero abrir o login sobre a tela em que estou para autenticar-me e continuar no mesmo contexto sem navegar de volta manualmente.

**Why this priority**: O pedido central é reduzir a interrupção e preservar a intenção da pessoa ao encontrar uma ação protegida.

**Independent Test**: Em uma tela pública, abrir login, autenticar com sessão de teste e verificar que o modal fecha e a tela de origem permanece disponível.

**Acceptance Scenarios**:

1. **Given** uma pessoa não autenticada em uma tela do produto, **When** escolhe Entrar, **Then** o formulário aparece como modal e a tela de fundo continua visível.
2. **Given** o login modal aberto, **When** as credenciais são aceitas, **Then** a pessoa chega ao contexto de fundo ou ao destino interno explícito da ação que abriu o login, mantendo a sessão autenticada.
3. **Given** credenciais inválidas, **When** a pessoa envia o formulário, **Then** o modal continua aberto, informa o erro em linguagem clara e preserva os dados não sensíveis preenchidos.

### User Story 2 - Acessar login por URL direta (Priority: P1)

Como pessoa que recebeu um link ou salvou a página de login, quero abrir a rota diretamente e autenticar-me sem depender de uma tela anterior.

**Why this priority**: Links, favoritos e atualização da página precisam continuar funcionando como antes.

**Independent Test**: Abrir `/login` diretamente e atualizar o navegador; confirmar formulário em página cheia e autenticação normal.

**Acceptance Scenarios**:

1. **Given** acesso direto a `/login`, **When** a página termina de carregar, **Then** login aparece como página completa.
2. **Given** uma página de login aberta diretamente, **When** autentica com sucesso, **Then** o fluxo segue o destino padrão atual sem exigir localização de fundo.

### User Story 3 - Fechar ou cancelar o modal (Priority: P2)

Como visitante, quero fechar o login modal e continuar usando a tela de origem, para decidir quando autenticar.

**Why this priority**: O overlay só é útil se permitir retornar ao conteúdo que permaneceu por baixo.

**Independent Test**: Abrir e fechar pelo botão, Escape e navegação de voltar, quando suportados pelo padrão de diálogo, verificando que a rota de origem reaparece.

**Acceptance Scenarios**:

1. **Given** o login aberto como modal, **When** a pessoa fecha pelo controle de fechar ou Escape, **Then** retorna à tela anterior sem autenticação.
2. **Given** uma rota protegida que exige login, **When** o login modal é fechado, **Then** a pessoa permanece sem acesso à ação protegida e recebe novamente uma forma clara de autenticar.

### Edge Cases

- Sessão expira enquanto a pessoa está em uma tela protegida; autenticar deve manter o contexto e não repetir um redirecionamento em ciclo.
- Atualizar a página com o modal aberto pode remover o estado de fundo; nesse caso, a rota de login deve continuar utilizável como página cheia.
- Navegar diretamente a um URL legado com `next` não pode produzir redirecionamento aberto para domínio externo.
- Erros de rede preservam o modal e permitem nova tentativa.
- Convite e redefinição de senha acessados por links externos continuam em páginas próprias, sem modal de fundo.
- Fluxos de logout e conta não devem abrir um overlay que permita reutilizar uma sessão encerrada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A ação de login iniciada de dentro do produto MUST abrir o formulário em modal sobre a tela atual.
- **FR-002**: A tela de fundo MUST permanecer disponível durante o modal; após autenticação, o fluxo MUST retornar ao contexto de fundo ou ao destino interno explícito da ação de origem.
- **FR-003**: A rota `/login` MUST continuar acessível diretamente, por favorito, link e refresh, exibindo o formulário como página cheia quando não existe tela de fundo.
- **FR-004**: Os nove pontos internos de navegação para login identificados no TR e na auditoria do código MUST ser classificados: ações de entrada, CTAs e guards abrem o modal; logout e conclusão de redefinição de senha continuam como transições de página cheia.
- **FR-005**: Fechar o modal MUST retornar ao contexto anterior sem autenticar; não pode conceder acesso à ação protegida.
- **FR-006**: O formulário MUST manter os estados de validação, erro de credenciais, carregamento e falha de rede existentes.
- **FR-007**: Login modal MUST ser acessível por teclado, anunciar seu propósito e manter o foco dentro do diálogo até fechar.
- **FR-008**: Convite e redefinição de senha MUST permanecer páginas independentes apropriadas para links externos.
- **FR-009**: O fluxo MUST evitar navegação de página inteira quando login é aberto a partir de dentro da aplicação.
- **FR-010**: Toda copy nova MUST existir em pt-BR e en.
- **FR-011**: Fechar login aberto por uma rota protegida MUST evitar reabrir o modal em ciclo e levar a pessoa a um destino seguro sem conceder acesso à rota protegida.

### Key Entities

- **Contexto de origem**: Rota e estado de navegação preservados sob o login modal.
- **Sessão do usuário**: Estado autenticado resultante do fluxo de login existente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Todos os pontos internos de entrada são classificados; os sete fluxos de entrada/guard/CTA abrem modal sem recarregar, e logout/reset concluído permanecem páginas completas.
- **SC-002**: Login iniciado de tela pública ou protegida retorna ao contexto de origem após autenticação válida.
- **SC-003**: Acesso direto e atualização em `/login` continuam oferecendo login em página cheia.
- **SC-004**: Convite e redefinição continuam acessíveis como páginas completas por seus links.
- **SC-005**: Todos os critérios de teclado e foco do diálogo passam nos testes de acessibilidade aplicáveis.

## Assumptions

- O padrão de rota-modal com localização de fundo recomendado pelo TR será seguido; não haverá provedor global separado nem formulários duplicados.
- A verificação de autenticação permanece nos pontos existentes; centralizar guards não é requisito desta feature.
- Os nove pontos de entrada e arquivos impactados devem ser extraídos do inventário do TR durante o planejamento/tarefas.
- Em ações com destino interno explícito (`next`), o login bem-sucedido preserva esse destino; nos demais casos retorna à localização de fundo. Logout e sucesso de redefinição não preservam uma tela autenticada atrás do login.
- O componente `AdminGateDialog` é órfão e não deve ser tratado como precedente em uso.
