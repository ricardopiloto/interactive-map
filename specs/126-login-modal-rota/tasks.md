---
description: "Tarefas para login em modal com retorno seguro ao contexto"
---

# Tasks: Login em modal com retorno ao contexto

**Input**: Design documents from `/specs/126-login-modal-rota/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/login-modal.md`, `quickstart.md`

**Tests**: Escrever primeiro cobertura E2E dos fluxos de sessão, login modal/página, redirecionamento seguro, cancelamento e exceções de logout/reset, antes de migrar os pontos de entrada. Usar apenas a conta de teste existente.

**Organization**: Tarefas por história. A mesma `LoginPage` e o padrão de background-location do React Router atendem às duas apresentações; convite e redefinição permanecem páginas próprias.

## Phase 1: Setup

**Purpose**: Roteador, diálogo, cliente de autenticação e infraestrutura Playwright já existem; sem dependências ou setup adicionais.

---

## Phase 2: Foundational

**Purpose**: Não há infraestrutura bloqueante. As tarefas E2E das histórias são escritas antes das mudanças correspondentes nos fluxos de autenticação.

---

## Phase 3: User Story 1 - Entrar sem perder a tela atual (Priority: P1) 🎯 MVP

**Goal**: Entradas internas abrem o login em modal sem recarregar a aplicação e, após sucesso, restauram o contexto ou o destino interno explícito.

**Independent Test**: Em Home e em uma rota protegida, abrir login, confirmar que o fundo continua visível e não houve reload; autenticar e verificar destino seguro. Erro de credenciais/rede mantém modal e formulário.

### Tests for User Story 1

- [X] T001 [P] [US1] Criar cenários E2E para as entradas internas de Home, UserMenu, legacy AdminRedirect e guards de Painel/Novo Codex/Conta, cobrindo fundo visível, navegação SPA, sucesso, erro e destino interno seguro em `frontend/e2e/login-modal.spec.ts`

### Implementation for User Story 1

- [X] T002 [US1] Implementar renderização de rota-modal com background location e rota de login full-page como fallback quando não houver fundo válido em `frontend/src/App.tsx`
- [X] T003 [US1] Fazer `LoginPage` usar uma única forma para login modal/página, separar fundo de `postLoginTarget`, validar destino interno e manter estado de formulário/erro em `frontend/src/pages/AuthPages.tsx`
- [X] T004 [US1] Migrar os CTAs de entrada para a navegação de rota-modal mantendo seus destinos internos em `frontend/src/pages/HomePage.tsx`
- [X] T005 [US1] Trocar navegação por `window.location.href` por navegação SPA para abrir login modal e retornar ao contexto atual em `frontend/src/components/layout/UserMenu.tsx`
- [X] T006 [US1] Abrir login pelo padrão de rota-modal nos guards e preservar a retomada do destino protegido após autenticação em `frontend/src/pages/PainelPage.tsx` e `frontend/src/pages/NovoCodexPage.tsx`
- [X] T007 [US1] Manter a entrada AdminRedirect e a sessão expirada de Conta como entradas modais que retomam destinos válidos após autenticação em `frontend/src/App.tsx` e `frontend/src/pages/AuthPages.tsx`

**Checkpoint**: Os sete fluxos internos abrem uma única experiência modal sem reload e o login válido retorna ao destino apropriado.

---

## Phase 4: User Story 2 - Acessar login por URL direta (Priority: P1)

**Goal**: `/login` continua utilizável por URL direta, favorito, refresh e links existentes, como página completa sem background.

**Independent Test**: Abrir e atualizar `/login` diretamente, autenticar e verificar o destino padrão/`next` interno; rejeitar destino absoluto, protocol-relative ou externo. Confirmar logout e sucesso de reset em página completa.

### Tests for User Story 2

- [X] T008 [P] [US2] Criar cenários E2E para login direto e refresh, destino padrão e `next` inseguro, logout, conclusão de reset e rotas de convite/redefinição como páginas completas em `frontend/e2e/login-page.spec.ts`

### Implementation for User Story 2

- [X] T009 [US2] Preservar a rota `/login` em página completa sem estado de fundo e aplicar fallback seguro para `next` ausente, inválido ou externo em `frontend/src/pages/AuthPages.tsx`
- [X] T010 [US2] Manter sucesso de redefinição de senha e logout como transições full-page para `/login`, sem manter conteúdo autenticado sob o formulário em `frontend/src/pages/AuthPages.tsx`
- [X] T011 [P] [US2] Confirmar que convite e redefinição continuam rotas independentes e sem apresentação modal em `frontend/src/App.tsx`

**Checkpoint**: Deep links e refresh continuam funcionando; logout/reset não mantêm conteúdo de sessão encerrada no fundo.

---

## Phase 5: User Story 3 - Fechar ou cancelar o modal (Priority: P2)

**Goal**: Visitante pode fechar login e voltar ao conteúdo público; guards protegidos levam a um destino seguro sem loop ou concessão de acesso.

**Independent Test**: Abrir login a partir de uma página pública e protegida; fechar pelo botão, Escape e voltar quando suportado. Confirmar retorno apropriado, foco restaurado e que rota protegida permanece inacessível até autenticar.

### Tests for User Story 3

- [X] T012 [P] [US3] Adicionar cobertura E2E para botão fechar, Escape, backdrop, navegação voltar, foco/teclado e cancelamento de guard sem reabertura em ciclo em `frontend/e2e/login-modal.spec.ts`

### Implementation for User Story 3

- [X] T013 [US3] Adicionar botão visível e localizado de fechar ao login modal, reutilizar comportamento de foco/Escape do diálogo existente e retornar a fundo ou fallback público seguro conforme origem em `frontend/src/pages/AuthPages.tsx`
- [X] T014 [US3] Ajustar integração do diálogo se necessário para restauração de foco válida após desmontar o modal e sua rota de fundo em `frontend/src/components/ui/Dialog.tsx`
- [X] T015 [P] [US3] Reutilizar a chave localizada `buttons.close` (pt-BR/en) e qualquer nova mensagem acessível em `frontend/src/locales/pt-BR/comum.json` e `frontend/src/locales/en/comum.json`

**Checkpoint**: Cancelamento retorna ao contexto público ou fallback seguro e nunca autentica nem concede acesso ao destino protegido.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar estados completos, segurança do destino e acessibilidade.

- [ ] T016 Executar cenários E2E de login modal, login direto, sessão, logout/reset e cancelamento em `frontend/e2e/login-modal.spec.ts` e `frontend/e2e/login-page.spec.ts`
- [ ] T017 Executar verificações axe nos estados modal e full-page, validar teclado/foco e build conforme `specs/126-login-modal-rota/quickstart.md`
- [X] T018 Auditar os nove pontos de navegação para login e confirmar a classificação final (sete entradas modais e logout/reset full-page) em `frontend/src/App.tsx`, `frontend/src/pages/HomePage.tsx`, `frontend/src/pages/PainelPage.tsx`, `frontend/src/pages/NovoCodexPage.tsx`, `frontend/src/pages/AuthPages.tsx` e `frontend/src/components/layout/UserMenu.tsx`

### Execution Notes

- T016/T017 permanecem pendentes de execução: os 24 casos E2E foram coletados e incluem verificações axe modal/página, cancelamento e foco; a execução visual precisa do Chromium build 1243 exigido pelo Playwright 1.63. O cache disponível só tem o build 1228 e a solicitação anterior de download foi rejeitada.
- `npm run build` passou e o lint direcionado (`oxlint`) passou sem avisos. T017 ainda requer percorrer manualmente o quickstart e executar axe/teclado no navegador.
- A auditoria dos nove pontos: Home CTA principal/final, UserMenu, AdminRedirect, guards Painel/Novo Codex e sessão expirada de Conta abrem modal; reset concluído e logout limpam o estado e abrem login full-page. Convite e reset continuam rotas independentes. `buttons.close` já existe nos dois idiomas.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Nenhuma dependência ou inicialização nova.
- **Foundational (Phase 2)**: Sem trabalho compartilhado bloqueante.
- **User Stories (Phases 3–5)**: US1 e US2 são P1. Escrever seus testes primeiro e em seguida implementar a integração de rotas. US3 depende da rota-modal de US1 para fechar/restaurar o contexto. A transição full-page de logout/reset em US2 deve permanecer separada da renderização modal.
- **Polish (Phase 6)**: Depende dos fluxos selecionados para entrega; cobre todas as exceções e estados de acessibilidade.

### User Story Dependencies

- **US1 (P1)**: Fluxo principal e MVP; T001 antecede mudanças nas entradas internas.
- **US2 (P1)**: Pode ser validada independentemente pela rota direta, mas integra com a mesma `LoginPage`; T008 antecede os ajustes em T009/T010.
- **US3 (P2)**: Depende da rota-modal e do estado de navegação da US1; T012 antecede as mudanças de cancelamento/foco.

### Parallel Opportunities

- T001, T008 e T012 podem ser preparados em paralelo, em arquivos E2E diferentes ou áreas isoladas da suíte; alterações concorrentes em `login-modal.spec.ts` devem ser coordenadas.
- T004, T005 e T006 alteram arquivos distintos e podem ser preparados em paralelo após T002/T003 definirem o contrato de estado.
- T009 e T010 estão no mesmo `AuthPages.tsx` e devem ser implementados juntos/coordenados.
- T011 e T015 usam arquivos diferentes e podem avançar em paralelo às mudanças de apresentação.

## Parallel Example: User Story 1

```text
T001 E2E dos pontos internos de entrada
Após definir o estado compartilhado em T002/T003:
T004 Home CTAs
T005 UserMenu SPA navigation
T006 Painel e Novo Codex guards
```

## Implementation Strategy

### MVP First (User Story 1)

1. Escrever cobertura para os fluxos internos, falha de login e destino seguro.
2. Implementar a rota-modal com background location e reaproveitar o formulário existente.
3. Migrar os sete pontos de entrada sem recarregar o documento.
4. Validar sucesso/erro e retorno ao contexto antes de avançar para cancelamento.

### Incremental Delivery

1. Entregar US1 para entradas internas.
2. Confirmar US2: acesso direto/refresh e transições full-page de logout/reset.
3. Entregar US3: fechar/cancelar, fallback de guards e comportamento de foco.
4. Executar toda a matriz Playwright/axe e auditar os nove pontos de entrada.
