# Feature Specification: Acessibilidade e qualidade

**Feature Branch**: `109-acessibilidade-qualidade`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Acessibilidade e qualidade. Navegação por teclado no mapa e no grafo, aria-live nas atualizações, gestão de foco, movimento reduzido. Alvos de toque ≥ 44px em celular. Testes de regressão visual (Playwright, nos dois temas e em largura de celular) e verificação de acessibilidade automatizada (axe) no CI. Revisão final de contraste e de desempenho (fontes, deslocamento de layout). Depende de: todas as UX. Critério-chave: zero violações críticas no axe nas telas principais; capturas de referência aprovadas para mapa, relações, rota, painel e página inicial."

**Depends on**: todas as fases UX — [100](../100-fundacoes-sistema-visual/spec.md), [101](../101-componentes-base-icones/spec.md), [102](../102-estrutura-navegacao/spec.md), [103](../103-mapa/spec.md), [104](../104-listas-edicao-mapa/spec.md), [105](../105-rede-relacoes/spec.md), [106](../106-planejador-rotas/spec.md), [107](../107-formularios-edicao/spec.md), [108](../108-tema-identidade-campanha/spec.md); RFC ([docs/v2/rfc-ux-redesign.md](../../docs/v2/rfc-ux-redesign.md) fase UX-10); constituição v1.0.0 (II, III, IV, V). Corre **antes** do corte [099](../099-migracao-legado-corte/spec.md).

**Phase**: UX-10. **Gate final** de acessibilidade e qualidade do redesenho: teclado e foco no mapa e no grafo, anúncios `aria-live`, `prefers-reduced-motion`, alvos de toque ≥ 44 px em telemóvel, regressão visual (dois temas + largura móvel), verificação automatizada de acessibilidade (axe) no CI, e revisão final de contraste e desempenho (fontes, deslocamento de layout). **MUST NOT** redesenhar produtos das fases anteriores — só fecha débitos de a11y/qualidade e institui as redes de segurança.

## Clarifications

### Session 2026-09-21

- Q: O que falha o CI no axe? → A: Só `critical`; `serious` reportado sem bloquear.
- Q: Quantos locales no CI (axe + visual)? → A: pt-BR e en obrigatórios no CI.
- Q: Teclado no mapa com muitos pinos? → A: Controlos + lista/menu; pinos do mapa não entram todos na ordem Tab.
- Q: Como o CI autentica o painel? → A: Fixture de utilizador + sessão injectada no Playwright.
- Q: Matriz mínima de capturas visuais? → A: Desktop claro, desktop escuro, mobile claro (3/tela/locale); mobile escuro fora do CI obrigatório.

## Constitution

- Isolamento (I): N/A para novas rotas de conteúdo; se houver fixtures de teste por slug, MUST NOT enfraquecer a matriz existente.
- Testes primeiro (II): suites de axe e capturas de referência MUST falhar no CI se o critério-chave for violado; contraste final reutiliza/estende o script da UX-1.
- Produção legada (III): MUST NOT tocar `/opt/codex-*`; esta fase precede 099.
- Simplicidade (IV): reutilizar componentes acessíveis da UX-2; sem segunda biblioteca de a11y paralela sem justificação.
- i18n (V): anúncios e rótulos de teclado novos MUST ter pt-BR e en.
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Teclado, foco e anúncios no mapa e no grafo (Priority: P1)

Um utilizador de teclado (ou leitor de ecrã) consegue **navegar** o **mapa** e o **grafo de relações**: focável, ordem previsível, estados de selecção anunciáveis. Actualizações importantes da interface (ex. resultado de rota, toast, mudança de selecção relevante) usam regiões **`aria-live`** adequadas. Abrir/fechar drawers, diálogos e painéis **gere o foco** (prende, devolve). Com **movimento reduzido** (`prefers-reduced-motion`), animações não essenciais desligam-se (já iniciado na UX-1 — esta fase **verifica e completa** lacunas).

**Why this priority**: Fecha a11y interactiva das superfícies centrais (mapa, relações) antes do corte.

**Independent Test**: Tab/setas (conforme desenho) no mapa e no grafo; leitor anuncia mudanças live; Esc em drawer devolve foco; com reduced-motion, sem animações decorativas obrigatórias.

**Acceptance Scenarios**:

1. **Given** o mapa da campanha, **When** se navega só por teclado, **Then** controlos essenciais (zoom, ir ao grupo, abrir lista/painel relevante) e pinos/itens focáveis têm caminho de teclado utilizável; o foco é visível.
2. **Given** o grafo de relações, **When** se navega por teclado, **Then** os nós (e controlos essenciais) são alcançáveis; selecção é perceptível sem só cor.
3. **Given** uma actualização relevante (ex. cálculo de rota concluído, erro, toast), **When** ocorre, **Then** é anunciada via **`aria-live`** (ou equivalente acessível) sem roubar o foco indevidamente.
4. **Given** Drawer/Dialog aberto (UX-2/UX-8), **When** fecha com Esc ou acção, **Then** o foco **volta** ao disparador.
5. **Given** `prefers-reduced-motion: reduce`, **When** se usam mapa, grafo, planejador e chrome, **Then** movimentos decorativos estão reduzidos/desligados.

---

### User Story 2 - Alvos de toque em telemóvel (Priority: P1)

Em largura de **telemóvel**, controlos interactivos principais (chrome, listas, planejador, botões do mapa) têm **alvo de toque ≥ 44 px** (eixo menor), alinhado à UX-2 (40 px desktop / 44 px toque).

**Why this priority**: Débito do RFC (botões ~30 px); usabilidade móvel.

**Independent Test**: Viewport móvel; medir botões/icon buttons/tabs principais ≥ 44 px; sem sobreposição que impeça o toque.

**Acceptance Scenarios**:

1. **Given** viewport de telemóvel, **When** se medem os alvos principais do chrome, mapa, relações, rota, painel e home, **Then** cada um cumpre **≥ 44 px**.
2. **Given** o mesmo viewport, **When** o utilizador toca controlos adjacentes, **Then** não activa o vizinho por alvo demasiado pequeno.

---

### User Story 3 - Regressão visual e axe no CI (Priority: P1)

Existem **capturas de referência** aprovadas para **mapa**, **relações**, **rota** (planejador), **painel** e **página inicial**, em **tema claro e escuro** e em **largura de telemóvel** (além de desktop). Uma verificação automatizada de acessibilidade (**axe**) corre no **CI** sobre as **telas principais** e falha se houver **violações críticas**. A regressão visual (Playwright ou equivalente acordado no plano) falha se as capturas divergirem além do limiar aceite.

**Why this priority**: Critério-chave da fase; rede de segurança antes de 099.

**Independent Test**: CI verde com baselines; introduzir violação crítica axe → CI vermelho; alterar UI de uma tela principal → teste visual falha até reaprovação consciente.

**Acceptance Scenarios**:

1. **Given** as cinco superfícies (mapa, relações, rota, painel, home), **When** corre a suite visual, **Then** existem capturas de referência **aprovadas** para cada uma × locale (pt-BR e en), cobrindo **desktop claro, desktop escuro e telemóvel claro**.
2. **Given** as telas principais no CI, **When** corre axe, **Then** há **zero violações críticas**.
3. **Given** uma regressão visual não intencional numa dessas telas, **When** o CI corre, **Then** o job falha até a baseline ser actualizada de propósito.
4. **Given** pt-BR e en, **When** se validam as telas principais no CI, **Then** a cobertura de a11y/visual **MUST** incluir **ambos** os locales.

---

### User Story 4 - Revisão final de contraste e desempenho (Priority: P2)

Revisão **final** de **contraste** (texto AA, componentes 3:1, linhas/acentos das fases UX) nos dois temas, incluindo acentos da paleta UX-9. Revisão de **desempenho** percebido: fontes locais sem FOIT longo evitável, **deslocamento de layout** (CLS) nas telas principais dentro de limiar aceitável documentado no plano.

**Why this priority**: Fecha qualidade visual/perf; secundário às redes de a11y/CI.

**Independent Test**: Script de contraste passa; checklist de fontes (Inter local); amostragem CLS/layout shift nas cinco telas sem saltos graves ao carregar.

**Acceptance Scenarios**:

1. **Given** temas claro e escuro (e acentos da paleta UX-9 amostrados), **When** corre a revisão/script de contraste, **Then** não há falhas AA/3:1 nos pares cobertos pelo gate da UX-1 + extensões desta fase.
2. **Given** carregamento das telas principais, **When** se observa tipografia, **Then** as fontes do produto carregam localmente (sem dependência de Google Fonts) sem flash prolongado de texto ilegível.
3. **Given** carregamento de home, painel, mapa, relações e rota, **When** se observa o layout, **Then** não há deslocamentos grandes e repetíveis de chrome/conteúdo principal (limiar no plano).

---

### Edge Cases

- Mapa com muitos pinos: teclado MUST usar controlos + lista/menu; MUST NOT exigir Tab por centenas de pinos.
- Grafo grande: mesma regra — agrupamento/lista ou atalhos; foco não “preso” sem saída.
- Toast empilhados: aria-live MUST NOT spammar; prioridade polite/assertive conforme severidade.
- Reduced-motion: feedback essencial (foco, estado seleccionado) MUST permanecer sem depender só de animação.
- CI flaky visual: limiar/anti-aliasing documentado; actualização de baseline MUST ser revisão explícita.
- `/opt/codex-*` intocado; MUST NOT bloquear 099 por requisitos de deploy legado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Mapa e grafo de relações MUST oferecer **navegação por teclado** utilizável para controlos e selecção essenciais, com **indicador de foco** visível. No mapa, a selecção de locais MUST ser alcançável via **lista/menu** (e controlos); MUST NOT exigir Tab por todos os pinos do mapa.
- **FR-002**: Actualizações relevantes da UI MUST usar regiões **`aria-live`** (ou padrão acessível equivalente) onde o utilizador precisa de ser notificado sem foco manual.
- **FR-003**: Gestão de foco MUST fechar o ciclo em Dialog/Drawer/menus: abrir move o foco para dentro; fechar **devolve** o foco.
- **FR-004**: Com `prefers-reduced-motion: reduce`, movimentos não essenciais MUST estar desligados ou reduzidos em todas as superfícies UX.
- **FR-005**: Em viewport de telemóvel, alvos de toque interactivos principais MUST ter **≥ 44 px** no eixo menor.
- **FR-006**: MUST existir suite de **regressão visual** (Playwright) cobrindo **mapa, relações, rota, painel e página inicial**, com capturas de referência **aprovadas** (critério-chave). Matriz mínima por tela e locale: **desktop claro**, **desktop escuro**, **telemóvel claro**. Telemóvel escuro MUST NOT ser obrigatório no CI nesta fase.
- **FR-007**: MUST existir verificação **axe** automatizada no **CI** sobre as **telas principais**, com **zero violações `critical`** (critério-chave). Violações `serious` MUST ser reportadas; MUST NOT falhar o CI só por `serious`.
- **FR-008**: MUST completar **revisão final de contraste** (extensão do gate UX-1, incl. amostragem UX-9) nos dois temas.
- **FR-009**: MUST rever **desempenho** de fontes e **deslocamento de layout** nas telas principais; limiares e método no plano.
- **FR-010**: MUST NOT redesenhar funcionalidade das UX-1…UX-9 além do necessário para a11y/qualidade. MUST NOT tocar `/opt/codex-*`.
- **FR-011**: Suite visual/axe do painel (e ecrãs autenticados necessários) MUST usar **fixture de utilizador** com **sessão injectada** no Playwright; MUST NOT depender de bypass de auth em produção nem deixar o painel só em checklist manual.

### Out of Scope

- Novas features de produto (novos campos, novos fluxos de campanha).
- Certificação WCAG formal por auditor externo.
- Corte de produção legado (099).
- Testes visuais de *todas* as páginas admin obscuras — foco nas cinco telas nomeadas (+ chrome partilhado).

### Key Entities

- **Tela principal**: home, painel, mapa, relações, rota (planejador).
- **Captura de referência**: baseline visual aprovada por tema e viewport.
- **Violação crítica axe**: achado de severidade crítica (ou equivalente configurado) que falha o CI.
- **Região live**: anúncio acessível de mudança de estado.
- **Alvo de toque**: área mínima clicável/tocável de um controlo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **Zero** violações **críticas** do axe nas telas principais no CI (critério-chave).
- **SC-002**: Capturas de referência **aprovadas** e estáveis no CI para **mapa, relações, rota, painel e página inicial**, cobrindo **desktop claro, desktop escuro e telemóvel claro** em **pt-BR e en** (critério-chave).
- **SC-003**: Em telemóvel, **100%** dos controlos principais amostrados têm alvo ≥ 44 px.
- **SC-004**: Percurso só-teclado consegue: abrir mapa e seleccionar um local *ou* equivalente via lista; abrir relações e seleccionar um nó; sem armadilha de foco.
- **SC-005**: Com reduced-motion activo, checklist das cinco telas confirma ausência de animações decorativas obrigatórias.
- **SC-006**: Revisão final de contraste passa nos dois temas (e amostra de acentos UX-9); fontes locais sem dependência externa proibida; sem CLS grave repetível nas cinco telas (limiar do plano).

## Assumptions

- «Telas principais» = home (`/`), painel do mestre, mapa da campanha, rede de relações, planejador de rotas (e chrome partilhado).
- UX-1…UX-9 estão implementadas (ou quase) antes desta fase; UX-10 **não** substitui o trabalho de a11y já exigido nelas — **fecha gaps** e **institui CI**.
- Playwright + axe são as ferramentas nomeadas no prompt; o plano pode fixar versões e pasta de baselines.
- «Violação crítica» = severity `critical` do axe; só `critical` bloqueia o CI; `serious` é reportado.
- Um locale no CI **não** basta: **pt-BR e en** MUST ambos correr no CI (axe + visual) nesta fase.
- Interacção fina do mapa (pan com teclado) é **P2**; o MVP de teclado do mapa é controlos + lista/menu.
- Autenticação de testes: fixture de utilizador + sessão injectada no Playwright para painel (e ecrãs autenticados necessários).
- Esta fase é o último gate UX antes de 099.
