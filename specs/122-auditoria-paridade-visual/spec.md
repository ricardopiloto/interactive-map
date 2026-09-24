# Feature Specification: Auditoria final de paridade visual com frontend-next

**Feature Branch**: `122-auditoria-paridade-visual`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "Auditoria final de paridade visual com frontend-next. Estender a suíte de regressão visual (spec 109) a TODA tela com equivalente no protótipo; capturas lado a lado para revisão humana (não pixel-a-pixel automático contra o protótipo); grep hex fora de tokens = 0 (exceto cor de pino do mestre); grep classes nocturne = 0; axe sem critical. Depende de 114–120 e 117."

**Depends on**: Specs **114**, **115**, **116**, **117**, **118**, **119**, **120** (e de facto a casca auth **121** se existir no ramo — páginas Login/Convite/Reset/Conta). Spec **109** (suíte Playwright + axe + capturas) como base a **estender**, não a redesenhar do zero.

**Phase**: Gate final de paridade estrutural/visual com o protótipo.

## Constitution *(constraints; not implementation)*

- Isolation (I): Sem rotas HTTP novas. Matriz isolamento **N/A**.
- Testes primeiro (II): Extensão da suíte visual/axe e scripts de grep MUST poder falhar o CI/gate quando o critério-chave for violado.
- Produção legada (III): Só produto Codex; MUST NOT tocar `/opt`.
- Simplicidade (IV): Reutilizar Playwright/axe da 109; MUST NOT introduzir ferramenta de diff pixel-a-pixel frágil contra o protótipo como gate automático.
- i18n (V): Cobertura visual/axe MUST incluir pt-BR e en onde a 109 já o exige; copy nova de harness MUST ter chaves se aplicável.
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cobertura completa da suíte (Priority: P1) 🎯 MVP

A suíte de qualidade visual/a11y (herdada da spec 109) passa a cobrir **todas** as telas do produto que têm equivalente em `frontend-next` páginas: marketing (Landing), Explorar, Painel, assistente Novo Codex, Login / Convite / Reset / Conta, layout de campanha + Mapa, Relações, Rota (incluindo entrada ao digitalizador de rede quando aplicável), Sessões. Para cada uma, existem **capturas** do app real (temas/viewports alinhados à matriz já usada) e, para revisão humana, **pares lado a lado** com uma captura de referência do protótipo correspondente — **não** como asserção pixel-a-pixel automática contra o protótipo.

**Why this priority**: Critério-chave «nenhuma tela diverge a olho nu» precisa de cobertura e material de revisão.

**Independent Test**: Correr a suíte; listar artefactos de captura por tela; abrir o pacote lado a lado e confirmar que cada ecrã da lista está presente.

**Acceptance Scenarios**:

1. **Given** a suíte estendida, **When** corre no ambiente de teste, **Then** produz capturas do app real para **cada** superfície listada (Landing/home, Explorar, Painel, Novo Codex, Login, Convite, Reset, Conta, Mapa, Relações, Rota+digitalizador, Sessões).
2. **Given** essas capturas, **When** um revisor abre o pacote de auditoria, **Then** cada superfície tem referência visual do protótipo correspondente para comparação **humana** lado a lado.
3. **Given** a matriz de tema/viewport da 109 (desktop claro/escuro, móvel claro, locales exigidos), **When** a suíte corre, **Then** as novas telas entram nessa matriz (ou documentam excepção justificada só para ecrãs autenticados/token).

---

### User Story 2 - Gates de higiene visual (Priority: P1)

Corre um **grep final** no código-fonte de produção: (a) literais **hexadecimais de cor** fora de `frontend/src/styles/tokens.css` → **zero**, excepto a **cor de pino escolhida pelo mestre** (e outros casos explicitamente inventariados como dado de conteúdo, não de design system); (b) classes do sistema **nocturne** (`.btn*`, `.seg*`, `.input` legado, `.card` legado, `.tag*`, `.dialog*` legado, etc.) → **zero** fora do kit (e o ficheiro nocturne permanece ausente). Estes gates falham a auditoria se violados.

**Why this priority**: Critério-chave objectivo e repetível.

**Independent Test**: Correr os greps; introduzir um `#abcdef` solto ou uma `btn-primary` → gate falha; reverter → passa.

**Acceptance Scenarios**:

1. **Given** o repositório limpo pós-117+, **When** corre o grep de hex fora de tokens, **Then** zero hits excepto excepções documentadas (cor de pino do mestre / dados de conteúdo).
2. **Given** o mesmo repositório, **When** corre o grep de classes nocturne, **Then** zero resultados no sentido da spec 117 (fora do kit; ficheiro ausente).
3. **Given** um hex de UI ou classe nocturne reintroduzido por engano, **When** o gate corre, **Then** falha até correcção.

---

### User Story 3 - Axe sem critical + veredicto humano (Priority: P1)

A verificação **axe** nas telas cobertas continua a exigir **zero violações críticas**. Um revisor humano, com o pacote lado a lado, confirma que **nenhuma** tela do app real diverge do protótipo correspondente **a olho nu** (estrutura, casca, tokens) — diferenças aceitáveis: conteúdo real vs. mock, i18n, dados de campanha.

**Why this priority**: Fecha o critério-chave qualitativo + a11y.

**Independent Test**: Suite axe verde (critical); checklist de revisão humana assinada / registada no quickstart da feature.

**Acceptance Scenarios**:

1. **Given** as telas cobertas, **When** corre axe, **Then** há zero violações `critical`.
2. **Given** o pacote de capturas lado a lado, **When** a revisão humana termina, **Then** cada superfície da lista está marcada como «paridade OK» ou com desvio documentado e corrigido antes do fecho.
3. **Given** um desvio óbvio de casca (ex.: coluna flush onde o protótipo tem painel flutuante), **When** o revisor assinala, **Then** a auditoria **não** fecha até correcção na spec de origem ou nesta.

---

### Edge Cases

- Protótipo tem **AdminConsole** / NotFound: fora da lista obrigatória do pedido salvo se o produto tiver rota equivalente estável — MUST NOT bloquear a auditoria se não houver paridade de produto.
- Rotas com **token** (convite/reset): capturas com fixture/token de teste; MUST NOT expor segredos em artefactos públicos.
- Digitalizador de rotas: captura com digitalizador aberto (GM) além da página Rota em repouso.
- Diff automático app↔protótipo pixel-a-pixel: **fora de escopo** como gate (frágil); baselines Playwright **dentro** do app real (como na 109) MAY continuar.
- Conteúdo dinâmico (nomes de campanha, mapa real): revisão ignora pixels de conteúdo; foca casca/layout/tokens.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST estender a suíte visual/a11y da spec 109 para cobrir todas as superfícies listadas com equivalente no protótipo (Landing, Explore, Painel, NovoCodexWizard, Login, Convite, Reset, Conta, CampaignLayout+Mapa, Relações, Rota+RouteDigitizer, Sessões).
- **FR-002**: MUST produzir capturas do app real e material **lado a lado** com referência do protótipo para **revisão humana**.
- **FR-003**: MUST NOT usar comparação pixel-a-pixel automática app↔protótipo como critério de falha do CI.
- **FR-004**: MUST existir gate de grep: hex de cor fora de `tokens.css` = 0, excepto cor de pino (e excepções de conteúdo documentadas).
- **FR-005**: MUST existir gate de grep: classes nocturne = 0 (critério alinhado à 117); ficheiro `nocturne.css` ausente.
- **FR-006**: MUST manter axe com **zero** violações `critical` nas telas cobertas.
- **FR-007**: MUST NOT alterar contratos de API nem redesenhar produto — só auditoria, extensão de testes/artefactos e correcções mínimas se um gate falhar por regressão óbvia introduzida sem spec.

### Key Entities

- **Superfície auditada**: Par (rota produto ↔ página protótipo).
- **Pacote lado a lado**: Conjunto de capturas app + protótipo para revisão humana.
- **Gate de higiene**: Script/check de hex e de classes nocturne.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das superfícies listadas têm captura do app real + referência do protótipo no pacote de auditoria.
- **SC-002**: Revisão humana conclui que **nenhuma** dessas telas diverge do protótipo correspondente a olho nu na casca (ou o desvio está corrigido).
- **SC-003**: Grep de hex fora de tokens = **0** (excepto excepções documentadas de conteúdo/pino).
- **SC-004**: Grep de classes nocturne = **0**; `nocturne.css` ausente.
- **SC-005**: Axe nas telas cobertas = **0** violações críticas.

## Assumptions

- Spec 109 já entregou Playwright + axe + matriz desktop claro/escuro + móvel claro e locales pt-BR/en; esta feature **alarga** a lista de ecrãs e acrescenta o pacote de revisão humana + greps.
- Mapeamento de rotas produto (pós-119/120/121): `/`, `/explorar`, `/painel`, `/painel/novo`, `/login`, `/convite/:token`, `/reset/:token`, `/conta`, `/c/:slug`, `/c/:slug/relacoes`, `/c/:slug/rota`, `/c/:slug/sessoes`.
- Protótipo corre em porto separado só para gerar referências; não precisa de backend.
- «Cor de pino do mestre» = valor escolhido pelo utilizador em dados de local, não hardcode de UI do design system.
- Admin do protótipo (`/admin`) fora do critério-chave deste pedido.
