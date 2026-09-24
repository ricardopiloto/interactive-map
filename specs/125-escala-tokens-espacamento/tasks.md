---
description: "Tarefas para alinhar tokens de espaçamento e revisar seus consumidores"
---

# Tasks: Escala consistente de espaçamento

**Input**: Design documents from `/specs/125-escala-tokens-espacamento/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/spacing-scale.md`, `quickstart.md`

**Tests**: Sem testes de segurança/dados. Registrar e revisar as capturas atuais antes de mudar tokens, ampliar a matriz visual existente e validar os layouts afetados em desktop e mobile.

**Organization**: Tarefas agrupadas pelas histórias. A auditoria dos consumidores é pré-requisito para a alteração da escala; não adicionar ferramentas ou dependências.

## Phase 1: Setup

**Purpose**: Frontend, tokens e infraestrutura Playwright já existem; não há tarefas de setup ou instalação.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Registrar baseline e classificar consumidores antes de alterar qualquer valor de token.

- [ ] T001 [P] Registrar capturas visuais atuais das páginas Home e consumidores representativos em Explore, Sessões, Novo Codex, UI kit e controles de rotas usando a matriz existente em `frontend/e2e/quality.spec.ts`
- [X] T002 Inventariar referências de `--space-1..8` e fallbacks CSS, classificar todas as referências aos níveis 5–8 por propriedade/intenção/token-alvo e documentar exceções em `specs/125-escala-tokens-espacamento/spacing-consumer-audit.md`

---

## Phase 3: User Story 1 - Manter espaçamento visual previsível (Priority: P1) 🎯

**Goal**: A escala canônica de produção é contínua, estritamente crescente e idêntica à referência do protótipo.

**Independent Test**: Consultar os sete tokens de produção e confirmar os valores 4, 8, 12, 16, 24, 32 e 48px, sem `--space-8` nem lacunas.

### Implementation for User Story 1

- [X] T003 [US1] Atualizar `--space-1..7` para 4/8/12/16/24/32/48px e remover a definição de `--space-8` em `frontend/src/styles/tokens.css`
- [X] T004 [US1] Conferir que os níveis de espaçamento definidos em `frontend-next/src/styles/tokens.css` permanecem a referência equivalente e documentar divergências encontradas em `specs/125-escala-tokens-espacamento/spacing-consumer-audit.md`

**Checkpoint**: Tokens de produção representam a escala canônica completa, em ordem, sem nível adicional.

---

## Phase 4: User Story 2 - Atualizar estilos sem regressões espalhadas (Priority: P1)

**Goal**: Consumidores preservam sua intenção visual após a mudança; referências removidas e fallbacks contraditórios são corrigidos deliberadamente.

**Independent Test**: Revisar o inventário completo, confirmar que cada referência afetada tem token-alvo ou exceção justificada, e comparar Home, Explore e Sessões em desktop/mobile sem cortes, sobreposições ou mudanças involuntárias de hierarquia.

### Implementation for User Story 2

- [X] T005 [P] [US2] Remapear usos de `--space-5`/`--space-6` e corrigir fallbacks conforme intenção auditada em `frontend/src/pages/HomePage.css` e `frontend/src/pages/ExplorarPage.css`
- [X] T006 [P] [US2] Substituir o uso removido de `--space-8` pelo nível semântico que preserva a intenção de 32px e corrigir fallbacks auditados em `frontend/src/pages/SessoesPage.css`
- [X] T007 [P] [US2] Remapear usos de níveis afetados e corrigir fallbacks contraditórios conforme inventário em `frontend/src/pages/NovoCodexPage.css`, `frontend/src/pages/StyleGuidePage.css`, `frontend/src/styles/global.css`, `frontend/src/components/ui/ui.css`, `frontend/src/components/gm/RouteDigitizer.css` e `frontend/src/components/routes/RoutePlanner.css`
- [X] T008 [US2] Estender a matriz visual Playwright existente para incluir Explore e Sessões nas variantes pt-BR/en, desktop light/dark e mobile light, reutilizando captura e helper de acessibilidade em `frontend/e2e/quality.spec.ts`

**Checkpoint**: Não há consumidores de tokens indefinidos; fallbacks seguem os valores canônicos e as páginas/componentes revisados mantêm sua intenção visual.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validar o inventário completo, qualidade visual e build do frontend.

- [X] T009 Conferir por busca que nenhuma referência a `--space-8` permanece e que todas as referências de espaçamento usam token definido ou exceção registrada em `specs/125-escala-tokens-espacamento/spacing-consumer-audit.md`
- [ ] T010 Executar a matriz visual e de acessibilidade para Home, Explore, Sessões e componentes representativos, revisar diferenças em desktop/mobile e atualizar baselines intencionalmente em `frontend/e2e/quality.spec.ts`
- [ ] T011 Executar build do frontend e percorrer os itens de inspeção responsiva e fallbacks descritos em `specs/125-escala-tokens-espacamento/quickstart.md`

### Execution Notes

- A tentativa Playwright baseline subiu API e frontend, mas falhou antes de executar casos: o Playwright 1.63 requer Chromium build 1243, ausente no cache; só o build 1228 está instalado. O pedido para baixar a versão compatível foi rejeitado na aprovação. Os snapshots Home existentes servem de baseline; as capturas novas de Explore/Sessões e a inspeção visual final ficam pendentes.
- `npx playwright test --list --grep 'quality gate'` encontrou 84 casos na matriz expandida; a execução dos casos continua bloqueada pela ausência do binário Chromium 1243.
- A checagem estática confirmou que `frontend-next/src/styles/tokens.css` já define `4/8/12/16/24/32/48px`. O inventário atualizado encontrou 20 referências CSS a níveis 5–8 e 22 fallbacks CSS; detalhes e exceções estão em `spacing-consumer-audit.md`.
- O build de produção do frontend passou. T011 continua pendente até percorrer manualmente os cenários responsivos e fallbacks do quickstart.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Nenhuma dependência ou infraestrutura nova.
- **Foundational (Phase 2)**: T001/T002 devem concluir antes da mudança de tokens e consumidores para que baseline e decisões de remapeamento sejam registrados.
- **User Stories (Phases 3–4)**: US1 e US2 são P1 e formam uma entrega conjunta. T003 depende da auditoria T002; os remapeamentos de US2 devem acompanhar a alteração do token para evitar regressões intermediárias no resultado entregue.
- **Polish (Phase 5)**: Depende da escala e dos consumidores atualizados.

### User Story Dependencies

- **US1 (P1)**: Depende do inventário T002; atualiza os tokens canônicos.
- **US2 (P1)**: Depende do inventário T002 e coordena com T003. Os grupos de CSS T005, T006 e T007 podem ser trabalhados em paralelo; T008 também pode ser preparado em paralelo após baseline.

### Parallel Opportunities

- T001 e parte da coleta de referências de T002 podem ser realizadas em paralelo, preservando as capturas antes de qualquer alteração.
- Após T002, T005, T006 e T007 tratam arquivos distintos e podem ser remapeados em paralelo.
- T008 pode ser implementado em paralelo com os ajustes CSS; comparar/atualizar snapshots finais somente depois que a escala e consumidores estiverem alinhados.

## Parallel Example: User Story 2

```text
T005 Home e Explore
T006 Sessões e antigo consumidor de space-8
T007 Novo Codex, UI kit, digitizer e route planner
```

## Implementation Strategy

### MVP First

As duas histórias P1 compõem o MVP: a escala sozinha mudaria dimensões de consumidores em produção. Primeiro capture o baseline e classifique usos; depois alinhe tokens e remapeie consumidores como uma mudança coordenada; por fim compare páginas e componentes afetados.

### Incremental Delivery

1. Criar baseline e inventário rastreável antes das mudanças.
2. Alinhar tokens e consumidores em grupos de arquivos revisáveis, aplicando as decisões do inventário.
3. Cobrir Explore e Sessões na matriz existente e revisar capturas/baselines.
4. Confirmar build, escala final e ausência de referências/fallbacks inválidos.
