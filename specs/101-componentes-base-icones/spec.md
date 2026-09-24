# Feature Specification: Componentes base e ícones

**Feature Branch**: `101-componentes-base-icones`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Componentes base e ícones. Adotar @tabler/icons-react (traço; confirmar licença e peso do bundle na spec). Criar: Button (primário preenchido, secundário, fantasma, perigo; no máximo um primário por tela), IconButton, Input/Select/Textarea, Tabs com sublinhado, Chip, Card, DropdownMenu (três pontos), Tooltip, Toast, EmptyState, Skeleton, Dialog e Drawer acessíveis (Esc, foco preso e devolvido, aria-modal, bloqueio de scroll) e ConfirmDialog. Substituir os 10 usos de window.confirm/alert. Alvos de toque com 40px (44px em toque). Textos PT-BR e EN. Fora de escopo: redesenhar telas. Depende de: UX-1. Critério-chave: nenhum window.confirm/alert no código; todo diálogo fecha com Esc e devolve o foco."

**Depends on**: [100-fundacoes-sistema-visual](../100-fundacoes-sistema-visual/spec.md) (UX-1); RFC de redesenho ([docs/v2/rfc-ux-redesign.md](../../docs/v2/rfc-ux-redesign.md) fase UX-2); constituição v1.0.0 (III, IV, V)

**Phase**: UX-2 (frente de redesenho UI/UX). Bloqueia UX-3+. Não redesenha layouts de ecrã (mapa, relações, home) — só introduz primitivos e substitui confirmações/alertas nativos.

## Clarifications

### Session 2026-09-20

- Q: Como implementar Dialog / Drawer / ConfirmDialog (focus trap, Esc, scroll lock)? → A: Implementação própria sobre tokens UX-1 (sem lib de overlay)
- Q: Como relacionar os novos componentes com o CSS legado (`.btn`, `.dialog`, …)? → A: Novos componentes React; adoptar nos call sites de confirm/alert; CSS legado pode coexistir até outras fases
- Q: Como expor o Toast aos call sites que hoje usam `window.alert`? → A: API imperativa global (`toast.success` / `toast.error`) com Provider na raiz da app
- Q: Como aplicar a regra de alvos 40 px vs 44 px? → A: 44 px quando `pointer: coarse` (toque); 40 px nos outros ponteiros
- Q: O Drawer (e primitivos sem call site imediato) nesta fase devem? → A: Existir + demo no styleguide; uso em produto só se um call site de confirm/alert precisar; formulários → UX-8

### Resolved in specify

- **Licença Tabler**: `@tabler/icons-react` é **MIT** (registo npm / descrição do pacote). Adopção permitida sob essa licença.
- **Peso no bundle**: MUST usar imports por ícone (não barrel completo). O plano/implementação MUST registar o delta aproximado do bundle (antes/depois ou tamanho dos ícones usados). Sem tecto numérico rígido nesta fase além de «tree-shakeável e documentado».

## Constitution

- Isolamento (I): N/A para dados entre campanhas — sem rotas novas de conteúdo de mesa.
- Testes primeiro (II): ausência de `window.confirm`/`window.alert` e o comportamento Esc + devolução de foco dos diálogos MUST ser verificáveis (teste automatizado e/ou checklist de aceitação documentada no plano). Substituição dos 10 call sites MUST ser coberta.
- Produção legada (III): MUST NOT exigir alteração de `/opt/codex-*`.
- Simplicidade (IV): uma biblioteca de ícones (`@tabler/icons-react`, licença MIT confirmada); importação por ícone (tree-shaking); MUST documentar o impacto aproximado no bundle na implementação. Dialog/Drawer/ConfirmDialog = implementação própria sobre tokens UX-1 (sem lib de overlay). Sem segundo design system.
- i18n (V): toda a copy nova dos componentes (confirmações, vazios, toasts genéricos, `aria-label` de botões só-ícone) MUST ter chaves pt-BR e en. Conteúdo do mestre MUST NOT ser traduzido.
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirmações e alertas deixam de ser nativos do browser (Priority: P1)

Um mestre apaga um personagem, local, arco, vínculo, nó/segmento, ou vê um erro de upload. Em vez da caixa nativa do browser (`confirm`/`alert`), vê um diálogo ou toast da aplicação, com texto em pt-BR ou en, que pode cancelar ou confirmar. Fechar com Esc (onde há diálogo) devolve o foco ao controlo que abriu a acção.

**Why this priority**: Critério-chave — zero `window.confirm`/`alert`; base de segurança de UX para exclusões.

**Independent Test**: Os 10 call sites actuais (listas admin, relações, digitalizador, upload de imagem/mapa) usam ConfirmDialog ou Toast; pesquisa no código-fonte da app de produto não encontra `window.confirm` nem `window.alert`. Diálogo de confirmação: Esc fecha e o foco volta.

**Acceptance Scenarios**:

1. **Given** um fluxo que hoje pede confirmação nativa (ex. excluir), **When** o mestre inicia a exclusão, **Then** vê ConfirmDialog da app (não a caixa do browser) com acções claras; cancelar não executa a exclusão.
2. **Given** um fluxo que hoje usa `alert` para erro (ex. upload), **When** ocorre o erro, **Then** a mensagem aparece via Toast (ou padrão equivalente da app), não via `window.alert`.
3. **Given** ConfirmDialog ou Dialog aberto, **When** o utilizador pressiona Esc, **Then** o diálogo fecha e o foco volta ao elemento que o abriu.
4. **Given** a árvore de código da interface de produto, **When** se procura `window.confirm` e `window.alert`, **Then** há **zero** ocorrências (excepto talvez ficheiros de teste/docs explicitamente excluídos).

---

### User Story 2 - Primitivos de UI partilhados e acessíveis (Priority: P1)

Quem constrói ecrãs (e as fases UX seguintes) dispõe de um conjunto estável: Button (primário preenchido, secundário, fantasma, perigo), IconButton, campos de texto (Input/Select/Textarea), Tabs com sublinhado, Chip, Card, menu de três pontos, Tooltip, Toast, EmptyState, Skeleton, Dialog, Drawer e ConfirmDialog. Diálogos e drawers: Esc, foco preso enquanto abertos, foco devolvido ao fechar, `aria-modal`, scroll do fundo bloqueado. No máximo **um** botão primário visível por ecrã/vista. Alvos de toque ≥ 40 px (44 px em contexto de toque).

**Why this priority**: Desbloqueia UX-3+ sem redesenhar layouts agora; evita reinventar padrões por ecrã.

**Independent Test**: Cada primitivo existe e é usável (styleguide de desenvolvimento e/ou exemplos mínimos); Dialog/Drawer/ConfirmDialog cumprem Esc + focus trap + restore; revisão de uma tela de referência mostra no máximo um primário.

**Acceptance Scenarios**:

1. **Given** o conjunto de componentes listado, **When** um programador os importa na app, **Then** estão disponíveis e usam os tokens da UX-1 (sem hexadecimais novos de UI fora dos tokens).
2. **Given** Dialog, Drawer ou ConfirmDialog aberto, **When** o utilizador interage com teclado, **Then**: Esc fecha; o foco não «escapa» para o fundo; ao fechar, o foco regressa ao originador; o contentor expõe `aria-modal` (ou equivalente ARIA correcto); o scroll da página de fundo não se move.
3. **Given** uma vista/ecrã que usa Button, **When** se conta botões com variante primária visíveis em simultâneo, **Then** há no máximo um.
4. **Given** controlos clicáveis dos novos componentes, **When** medidos, **Then** a área útil de toque é ≥ 40 px por omissão e ≥ 44 px sob `pointer: coarse`.

---

### User Story 3 - Ícones Tabler consistentes e copy i18n (Priority: P2)

A interface usa ícones de traço Tabler (16 e 20 px). Ícones decorativos são ignorados por leitores de ecrã; botões só com ícone têm nome acessível. Textos novos dos componentes existem em pt-BR e en.

**Why this priority**: Completa a base visual; i18n é obrigatório (V) mas secundário ao critério-chave dos diálogos.

**Independent Test**: Ícones importados de `@tabler/icons-react`; amostra de IconButton com `aria-label` traduzível; chaves pt-BR/en para confirmações/toasts/vazios introduzidos.

**Acceptance Scenarios**:

1. **Given** um botão só com ícone, **When** um leitor de ecrã o anuncia, **Then** há nome acessível (não só o glifo).
2. **Given** um ícone puramente decorativo junto a texto, **When** se inspecciona a acessibilidade, **Then** está marcado para ser ignorado por tecnologias assistivas.
3. **Given** UI em pt-BR ou en, **When** o utilizador vê ConfirmDialog / Toast / EmptyState introduzidos por esta fase, **Then** a copy de interface está nesse idioma.

---

### Edge Cases

- Vários diálogos: MUST NOT empilhar confirmações nativas; se a app abrir um segundo Dialog, o comportamento MUST ser definido no plano (bloquear o segundo ou substituir) — default: um modal de confirmação de cada vez.
- Foco: se o originador foi removido do DOM ao fechar, o foco MUST ir para um destino sensato (ex. contentor da lista).
- Toque vs rato: 44 px com `pointer: coarse`; 40 px nos demais ponteiros.
- Telas ainda não migradas para os novos botões: esta fase MUST substituir os 10 `confirm`/`alert` com ConfirmDialog/Toast (e Button nos diálogos tocados); CSS legado MAY permanecer noutros ecrãs até UX-3+. MUST NOT redesenhar layouts completos (mapas, colunas, grafos).
- `/opt/codex-*` intocado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST adoptar `@tabler/icons-react` (estilo traço). Licença: **MIT** (confirmada). Imports MUST ser por ícone. O impacto no bundle MUST ser documentado na implementação (CHANGELOG ou nota de plano).
- **FR-002**: MUST fornecer os componentes: Button (variantes primário preenchido, secundário, fantasma, perigo), IconButton, Input, Select, Textarea, Tabs (indicador sublinhado), Chip, Card, DropdownMenu (padrão «três pontos»), Tooltip, Toast, EmptyState, Skeleton, Dialog, Drawer, ConfirmDialog. Drawer e demais primitivos sem call site imediato MUST existir e ser demonstráveis no `/__styleguide`; MUST NOT migrar formulários de produto para Drawer nesta fase (UX-8).
- **FR-003**: Em qualquer vista, MUST haver no máximo **um** Button primário visível em simultâneo (princípio do RFC).
- **FR-004**: Dialog, Drawer e ConfirmDialog MUST: fechar com Esc; prender o foco enquanto abertos; devolver o foco ao originador (ou fallback); expor estado modal acessível (`aria-modal` ou equivalente); bloquear scroll do fundo. MUST ser implementação própria (sem biblioteca de overlay); MAY usar um helper interno mínimo de focus-trap escrito no repo.
- **FR-005**: MUST eliminar todos os usos de `window.confirm` e `window.alert` no código de produto da interface (os 10 call sites conhecidos: relações×2, NPC/local/arco admin, ImageUploadField, ImageSlot, RouteDigitizer×2, CampaignMap — e quaisquer outros encontrados). Confirmações → ConfirmDialog; alertas de erro → Toast via API imperativa global (`toast.success` / `toast.error`) com Provider na raiz.
- **FR-006**: Alvos de toque dos controlos novos MUST ter mínimo **40 px**; **44 px** quando `@media (pointer: coarse)`.
- **FR-007**: Copy nova dos componentes MUST ter chaves pt-BR e en.
- **FR-008**: Componentes MUST consumir tokens da UX-1 (sem introduzir hexadecimais de UI fora dos tokens).
- **FR-009**: MUST NOT redesenhar layouts de ecrãs completos (mapa, relações, home/painel, rotas) nesta fase — apenas primitivos + substituição de confirm/alert e adopção pontual onde necessário. CSS legado (`.btn`, `.dialog`, …) MAY coexistir; os call sites de confirm/alert MUST passar a usar os novos componentes React.
- **FR-010**: MUST NOT exigir alterações em `/opt/codex-*`.

### Out of Scope

- Redesenho visual/estrutural de Mapa, Relações, planeador, home/painel (UX-3–UX-8).
- Seletor de tema e barra unificada (UX-3).
- Acento por campanha (UX-9).
- Auditoria a11y completa além dos requisitos de diálogo/foco/alvos desta fase (UX-10).
- Novos fluxos de negócio ou APIs.

### Key Entities

- **ConfirmDialog**: pedido de confirmação modal com cancelar/confirmar (e variante perigo quando destrutivo).
- **Toast**: feedback não bloqueante (erro/sucesso).
- **Dialog / Drawer**: contentores modais/laterais acessíveis.
- **Button / IconButton**: acções; primário único por vista.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pesquisa no código de produto da interface encontra **0** ocorrências de `window.confirm` e **0** de `window.alert`.
- **SC-002**: Em 100% dos fluxos de confirmação migrados, Esc fecha o diálogo e o foco regressa ao originador (ou fallback documentado), verificável em teste manual ou automatizado.
- **SC-003**: Os componentes listados em FR-002 existem e são utilizáveis a partir da app (e, se o guia de estilos da UX-1 existir, neles referidos ou demonstrados).
- **SC-004**: Uma revisão de ecrãs migrados nesta fase não encontra **dois** botões primários visíveis na mesma vista.
- **SC-005**: Copy nova de confirmações/toasts/vazios desta fase está disponível em pt-BR e en.

## Assumptions

- UX-1 (tokens, temas, Inter local, regra anti-hex) está disponível antes ou em paralelo estável o suficiente para os componentes consumirem tokens.
- Os «10 usos» do prompt correspondem aos call sites actuais listados; se a implementação encontrar mais, MUST migrá-los também (SC-001).
- Toast é o substituto padrão de `alert` via API imperativa (`toast.*`) + Provider na raiz; ConfirmDialog o de `confirm`.
- Drawer e primitivos sem call site: demo no styleguide; formulários em Drawer = UX-8.
- Alvos: 40 px default; 44 px com `pointer: coarse`.
- Tamanhos de ícone 16 e 20 px conforme RFC.
- CHANGELOG `[Unreleased]`; sem bump SemVer salvo decisão no plano; sem `/opt`.

## Notes

- Referência: [docs/v2/rfc-ux-redesign.md](../../docs/v2/rfc-ux-redesign.md) §6; prompt UX-2 em [docs/v2/ux-redesign-speckit-prompts.md](../../docs/v2/ux-redesign-speckit-prompts.md).
- Call sites conhecidos (2026-09-20): `RelacoesPage` (2), `NpcAdminList`, `LocalAdminList`, `ArcoAdminList`, `ImageUploadField`, `ImageSlot`, `RouteDigitizerView` (2), `CampaignMap`.
- Próximo: `/speckit-plan`.
