# Feature Specification: Casca visual de login, convite, reset e conta

**Feature Branch**: `121-casca-auth`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "Casca visual de login, convite, reset e conta. Mesmo cartão centrado do LoginPage do protótipo (fundo com gradiente, campos em pílula, botão primário largo) nas quatro rotas reais — sem fundir convite/reset num toggle. Critério-chave: as quatro páginas batem visualmente com o cartão do protótipo; nenhuma rota, token ou fluxo de autenticação muda."

**Depends on**: Spec 110 (tokens / pílula / gradientes de género); Spec 114 (chrome global quando aplicável — estas páginas podem ser full-bleed sem cabeçalho de campanha).

**Phase**: Paridade estrutural com o protótipo — superfícies de autenticação e conta.

## Constitution *(constraints; not implementation)*

- Isolation (I): Sem rotas HTTP novas; UI sobre auth já existente. Matriz isolamento **N/A**.
- Testes primeiro (II): UI de polimento — quickstart/capturas MAY; sem schema/auth novo.
- Produção legada (III): Só produto Codex; MUST NOT tocar `/opt`.
- Simplicidade (IV): Uma casca partilhada para as quatro páginas; MUST NOT inventar um segundo sistema de formulários de auth.
- i18n (V): Copy já existente permanece; strings novas (ex.: link «sou jogador») MUST ter pt-BR e en.
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Casca partilhada nas quatro rotas (Priority: P1) 🎯 MVP

Um visitante abre **`/login`**, **`/convite/:token`**, **`/reset/:token`** ou **`/conta`** e vê o **mesmo tipo de casca**: ecrã a ocupar a altura da viewport, **fundo com gradiente** do género padrão (ou tokens equivalentes), **cartão centrado** (~380px), título + texto de apoio, **campos em forma de pílula**, **botão primário largo** (bloco). O aspecto alinha-se ao cartão do LoginPage do protótipo. As quatro **continuam rotas separadas** — o toggle «entrar ↔ convite» do mock **não** substitui `/convite/:token` nem `/reset/:token`.

**Why this priority**: Critério-chave visual; uma casca, quatro fluxos intactos.

**Independent Test**: Abrir cada rota; capturar o cartão vs. protótipo; confirmar URLs e tokens intactos.

**Acceptance Scenarios**:

1. **Given** `/login`, **When** a página carrega, **Then** o formulário de entrada está num cartão centrado sobre fundo em gradiente, com campos em pílula e botão primário largo.
2. **Given** `/convite/:token` com token válido na URL, **When** a página carrega, **Then** usa a **mesma** casca visual; o fluxo continua a aceitar o token da rota (sem toggle dentro do login).
3. **Given** `/reset/:token`, **When** a página carrega, **Then** mesma casca; confirmação de reset permanece nesta rota.
4. **Given** `/conta`, **When** a página carrega, **Then** mesma casca (cartão centrado / campos pílula / botão largo), preservando as acções de conta já existentes.

---

### User Story 2 - Fluxos e erros preservados (Priority: P1)

Login, aceitar convite, confirmar reset e gestão de conta **comportam-se como hoje** face à API: mesmos campos necessários, mesmos redirects (`next`, painel, login), mesmas mensagens de erro i18n. Nenhuma autenticação é mockada. Ligações auxiliares (ex.: «sou jogador» → explorar/home pública) MAY aparecer no cartão do login alinhadas ao protótipo, sem alterar o sucesso/falha do submit.

**Why this priority**: Critério-chave «nenhum fluxo muda».

**Independent Test**: Login com sucesso e falha; convite e reset com token; conta logout/acções; comparar com comportamento pré-feature.

**Acceptance Scenarios**:

1. **Given** credenciais válidas em `/login`, **When** submete, **Then** autentica e redirecciona como hoje (`next` ou painel).
2. **Given** credenciais inválidas, **When** submete, **Then** mostra o erro i18n existente (casca nova, mesma mensagem).
3. **Given** `/convite/:token` ou `/reset/:token`, **When** completa o formulário com sucesso ou erro, **Then** o resultado (navegação / erro) é o mesmo de antes da casca.
4. **Given** `/conta`, **When** executa as acções já disponíveis, **Then** o comportamento de dados não muda — só a apresentação.

---

### User Story 3 - Sem fusão de rotas (Priority: P2)

O produto **MUST NOT** fundir convite e reset num único ecrã de login com alternância visual como no protótipo. Cada fluxo permanece endereçável pela URL real. Opcionalmente, o login pode **ligar** (link) para fluxos conhecidos (ex.: explorar) sem incorporar o formulário de convite.

**Why this priority**: Evita regressão de deep-links de e-mail (tokens na URL).

**Independent Test**: Confirmar que `/convite/…` e `/reset/…` existem e não dependem de estado de toggle no login.

**Acceptance Scenarios**:

1. **Given** um link de e-mail para `/convite/:token`, **When** o utilizador o abre, **Then** a página de convite responde nessa URL (não redirecciona para um login com toggle).
2. **Given** `/login`, **When** o utilizador inspecciona a UI, **Then** não há modo que substitua a rota de reset/convite por um toggle obrigatório.

---

### Edge Cases

- Viewport estreita: cartão com margem; campos utilizáveis; sem overflow horizontal crítico.
- Tema claro/escuro e género padrão: gradiente de fundo permanece legível (contraste do cartão vs. fundo).
- Token em falta ou inválido: erros actuais da API/UI; casca não os esconde.
- Teclado / gestores de palavras-passe: `autocomplete` e tipos de input existentes MUST permanecer.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: As páginas `/login`, `/convite/:token`, `/reset/:token` e `/conta` MUST partilhar a casca visual de cartão centrado alinhada ao LoginPage do protótipo (fundo em gradiente, cartão ~380px, campos pílula, botão primário em bloco/largo).
- **FR-002**: MUST NOT fundir convite e reset num toggle dentro do login; as quatro rotas MUST permanecer.
- **FR-003**: Lógica de autenticação, tokens, redirects e erros MUST permanecer; só a apresentação muda.
- **FR-004**: Campos de formulário MUST usar forma de pílula (tokens de raio já alinhados à spec 110).
- **FR-005**: Strings novas de UI (se houver) MUST existir em pt-BR e en.
- **FR-006**: MUST NOT alterar contratos de API de auth nem schema.

### Key Entities

- **Casca de autenticação**: Contentor visual partilhado (página + cartão) aplicado às quatro rotas.
- **Fluxo de auth**: Login, convite, reset, conta — inalterados em comportamento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Capturas das quatro páginas alinhadas ao cartão do LoginPage do protótipo (centrado, gradiente, pílula, botão largo) — sem diferença a olho nu (claro/escuro).
- **SC-002**: 0 mudanças de comportamento em login/convite/reset/conta face à API e redirects actuais (revisão manual dos quatro fluxos felizes + um erro cada).
- **SC-003**: Deep-links `/convite/:token` e `/reset/:token` continuam a funcionar sem exigir toggle no login.
- **SC-004**: 100% das strings novas (se existirem) correctas em pt-BR e en.

## Assumptions

- O «género padrão» do fundo segue o mecanismo já usado no produto (ex.: fantasia / tokens de mapa-gradiente) — não exige escolher género no login.
- `auth-page` / `auth-card` actuais em CSS global são a base a elevar à paridade do protótipo (ou equivalente partilhado), não quatro CSS completamente divergentes.
- Link «sou jogador» no protótipo MAY mapear para `/explorar` (se 119 existir) ou `/` / catálogo público disponível no branch.
- ContaPage pode ter mais campos que o login; a casca (fundo + cartão + pílula + botão largo) aplica-se igualmente.
