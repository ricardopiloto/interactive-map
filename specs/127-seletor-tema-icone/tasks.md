---
description: "Tarefas para o seletor de tema compacto e acessível"
---

# Tasks: Seletor de tema compacto

**Input**: Design documents from `/specs/127-seletor-tema-icone/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/theme-selector.md`, `quickstart.md`

**Tests**: Adicionar primeiro testes de interação para aparência compacta, três preferências, persistência e mudanças do tema do sistema; a suíte Playwright/axe existente é suficiente.

**Organization**: Tarefas por história. Alterar apenas o seletor dedicado ao cabeçalho de campanha; Home/Painel mantêm as preferências no `UserMenu`.

## Phase 1: Setup

**Purpose**: O seletor, infraestrutura de preferência, ícones, traduções e Playwright já existem; não há setup ou dependências novas.

---

## Phase 2: Foundational

**Purpose**: Sem pré-requisitos compartilhados; as interações E2E devem ser definidas antes da alteração visual ou de teclado.

---

## Phase 3: User Story 1 - Identificar o estado atual do tema (Priority: P1) 🎯 MVP

**Goal**: O gatilho fechado mostra somente Sol/Lua conforme tema efetivo, mantém alvo de toque adequado e continua acessível.

**Independent Test**: Em desktop e mobile, confirmar que o gatilho não mostra texto nem chevron, possui nome acessível e alterna Sol/Lua quando o sistema muda sob Automático.

### Tests for User Story 1

- [X] T001 [P] [US1] Criar teste Playwright para gatilho somente com ícone em desktop/mobile, nome acessível, tamanho do alvo e atualização Sol/Lua em modo Automático quando `prefers-color-scheme` muda em `frontend/e2e/theme-selector-trigger.spec.ts`

### Implementation for User Story 1

- [X] T002 [US1] Remover label visível e chevron em todos os breakpoints, manter o ícone e alvo de pelo menos 32px e preservar estilos de foco em `frontend/src/components/layout/ThemeSelector.css`
- [X] T003 [US1] Derivar o ícone do modo efetivo claro/escuro e subscrever mudanças de `prefers-color-scheme` quando a preferência for Automático, mantendo preferência explícita estável em `frontend/src/components/layout/ThemeSelector.tsx` e `frontend/src/theme/themePreference.ts`

**Checkpoint**: Gatilho compacto tem nome acessível e ícone sincronizado com o tema efetivamente aplicado.

---

## Phase 4: User Story 2 - Escolher entre automático, claro e escuro (Priority: P1)

**Goal**: Menu preserva três opções traduzidas, preferência selecionada, persistência, semântica acessível e operação por teclado.

**Independent Test**: Abrir menu em pt-BR e en, escolher Automático/Claro/Escuro e recarregar; validar tema e opção selecionada, navegação por setas, Enter/Espaço, Escape, clique externo e retorno de foco.

### Tests for User Story 2

- [X] T004 [P] [US2] Criar teste Playwright para as três opções, marcação selecionada, persistência `codex.theme`, modo automático e modos explícitos, rótulos pt-BR/en e navegação por teclado/foco em `frontend/e2e/theme-selector-menu.spec.ts`

### Implementation for User Story 2

- [X] T005 [US2] Implementar abertura e fechamento por teclado, navegação por setas entre opções, ativação, Escape, clique externo e retorno de foco ao gatilho, preservando menuitemradio/aria-checked em `frontend/src/components/layout/ThemeSelector.tsx`
- [X] T006 [US2] Confirmar que nomes acessíveis e rótulos Automático/Claro/Escuro permanecem localizados em pt-BR e en, adicionando chaves apenas se algum novo nome dinâmico for necessário em `frontend/src/locales/pt-BR/comum.json` e `frontend/src/locales/en/comum.json`

**Checkpoint**: Três preferências seguem selecionáveis e persistentes; menu é compreensível por tecnologia assistiva e totalmente operável por teclado.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verificar regressões do cabeçalho, acessibilidade e build.

- [ ] T007 Executar testes Playwright do seletor em `frontend/e2e/theme-selector-trigger.spec.ts` e `frontend/e2e/theme-selector-menu.spec.ts` e checks axe para menu aberto/fechado nas duas localidades — escrito e listado (10 cenários); execução bloqueada porque o Chromium 1243 exigido pelo Playwright não está instalado.
- [ ] T008 Validar build e capturas do cabeçalho da campanha em desktop/mobile, além de confirmar que Home/Painel continuam oferecendo temas via `UserMenu`, conforme `specs/127-seletor-tema-icone/quickstart.md` — build passou; uso do `UserMenu` confirmado no código. Capturas desktop/mobile pendentes pelo mesmo bloqueio de Chromium.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Nenhuma instalação ou infraestrutura necessária.
- **Foundational (Phase 2)**: Sem tarefas bloqueantes compartilhadas.
- **User Stories (Phases 3–4)**: Ambas são P1 e compõem a entrega completa. US1 atualiza aparência e modo efetivo; US2 preserva interação e preferência. Os testes de ambas devem ser escritos antes de substituir o controle atual.
- **Polish (Phase 5)**: Depende da implementação das duas histórias.

### User Story Dependencies

- **US1 (P1)**: Independente e candidata ao MVP visual; T001 deve anteceder a mudança de CSS/componente.
- **US2 (P1)**: Reusa o mesmo componente; T004 deve anteceder a implementação do comportamento de teclado. Preferência e persistência são existentes e não devem mudar.

### Parallel Opportunities

- T001 e T004 podem ser desenvolvidos em paralelo em arquivos E2E separados.
- T002 e a preparação de T004 usam arquivos distintos e podem avançar em paralelo.
- T005 e T006 alteram arquivos distintos, mas a verificação de acessibilidade final depende de ambos.

## Parallel Example: User Stories 1 and 2

```text
T001 comportamento visual e ícone efetivo (`theme-selector-trigger.spec.ts`)
T004 opções, persistência e teclado (`theme-selector-menu.spec.ts`)
Após os testes estarem definidos:
T002 gatilho compacto em CSS
T005 interações de menu em React
```

## Implementation Strategy

### MVP First

As duas histórias P1 formam o MVP: trocar o gatilho sem a interação completa prejudicaria a usabilidade. Primeiro definir os testes, então manter ícone/estado efetivo e menu de três opções como uma única entrega acessível.

### Incremental Delivery

1. Cobrir o estado fechado, nome acessível e reação do modo Automático.
2. Aplicar o gatilho compacto e sincronizar o ícone ao tema efetivo.
3. Cobrir e manter seleção, persistência e navegação por teclado.
4. Rodar axe/build e revisar desktop/mobile; não alterar os controles do `UserMenu`.
