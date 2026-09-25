# Tasks: Estado de locais e rolagem de sessões

**Input**: Design documents from `specs/149-estado-local-scroll-sessoes/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/local-status.md`, `quickstart.md`

**Tests**: Obrigatórios primeiro para migração Alembic, persistência e isolamento entre campanhas. Os E2Es de interface também serão escritos antes das respectivas correções visuais.

**Organization**: tarefas organizadas por história de usuário para permitir implementação e validação independentes.

## Phase 1: Setup

**Purpose**: confirmar escopo e estrutura existente do projeto.

Não há inicialização de projeto ou dependências a adicionar; backend, frontend, SQLite, Alembic, pytest e Playwright já estão configurados.

---

## Phase 2: Foundational

**Purpose**: infraestrutura compartilhada que bloquearia as histórias.

Não há pré-requisito de infraestrutura compartilhada. As duas histórias podem ser desenvolvidas independentemente depois da preparação do ambiente existente.

---

## Phase 3: User Story 1 — Alterar o estado de um local (Priority: P1) 🎯 MVP

**Goal**: permitir mudar um Local de Conhecido para Visitado e vice-versa, mantendo o estado após recarga e sem alterar sua cor ou rótulo de sessão.

**Independent Test**: criar/usar um Local, salvar as duas transições, recarregar a página e confirmar estado, cor e `data_sessao`; verificar também leitura, valor inválido e isolamento entre duas campanhas.

### Tests for User Story 1

- [X] T001 [P] [US1] Criar testes Alembic para estado inicial e backfill de Locais com `data_sessao` nulo, vazio, espaços e preenchido em `backend/tests/test_local_status_migration.py`.
- [X] T002 [P] [US1] Criar testes HTTP para leitura pública/administrativa, criação default, update bidirecional, valor inválido e preservação de `data_sessao`/`cor_pin` em `backend/tests/test_local_status.py`.
- [X] T003 [P] [US1] Criar teste que atualiza Locais com mesmo ID em duas campanhas e confirma isolamento de leitura e gravação em `backend/tests/test_local_status_isolation.py`.

### Implementation for User Story 1

- [X] T004 [US1] Adicionar o estado `estado_exploracao` com valores `conhecido`/`visitado` e default `conhecido` ao modelo em `backend/app/models/local.py`.
- [X] T005 [US1] Criar revisão Alembic de campanha seguinte à revisão corrente que adiciona `estado_exploracao`, faz backfill usando `data_sessao` sem reescrever o texto e remove somente a coluna no downgrade em `backend/alembic_campaign/versions/007_estado_exploracao_local.py`.
- [X] T006 [US1] Incluir `estado_exploracao` nos schemas de criação, atualização parcial e leitura, rejeitando valores fora do domínio em `backend/app/schemas/local.py`.
- [X] T007 [US1] Propagar o campo na criação administrativa e nas leituras pública e administrativa do Local em `backend/app/routers/admin/locais.py` e `backend/app/routers/public/locais.py`.
- [X] T008 [US1] Criar E2E que altera um Local nos dois sentidos, salva, recarrega e confirma estado e preservação dos campos independentes em `frontend/e2e/local-status.spec.ts`.
- [X] T009 [US1] Integrar o estado tipado, a seleção explícita no editor e sua apresentação consistente no Mapa, lista e detalhe em `frontend/src/types/index.ts`, `frontend/src/components/admin/LocalFormDialog.tsx`, `frontend/src/pages/MapPage.tsx`, `frontend/src/components/map/CampaignMap.tsx`, `frontend/src/locales/pt-BR/admin.json` e `frontend/src/locales/en/admin.json`.

**Checkpoint**: os estados Conhecido e Visitado podem ser alternados e permanecem consistentes após recarga sem cruzar campanhas ou sobrescrever a cor e o rótulo de sessão.

---

## Phase 4: User Story 2 — Percorrer a lista completa de sessões (Priority: P1)

**Goal**: garantir rolagem vertical suficiente para alcançar todas as Sessões no desktop e manter o comportamento mobile.

**Independent Test**: em viewport desktop e mobile, carregar uma campanha com uma lista que exceda a altura visível, rolar até a primeira e a última entradas e confirmar que ambas podem ser lidas integralmente.

### Tests for User Story 2

- [X] T010 [P] [US2] Criar E2E com sessões longas suficientes para exceder o viewport e verificar primeira/última entrada usando wheel ou teclado no desktop, a região rolável no viewport mobile e redimensionamento em `frontend/e2e/sessoes-scroll.spec.ts`.

### Implementation for User Story 2

- [X] T011 [US2] Corrigir a região de rolagem da página/lista para manter todas as entradas acessíveis em desktop e mobile, sem cortar conteúdo nem afetar a navegação inferior, em `frontend/src/pages/SessoesPage.css` e, se necessário, `frontend/src/pages/SessoesPage.tsx`.

**Checkpoint**: uma lista longa pode ser percorrida até o fim em ambos os tamanhos de tela; listas curtas permanecem legíveis sem rolagem desnecessária.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: validar os fluxos juntos e documentar a execução final.

- [X] T012 Executar a migração e os testes de isolamento de US1, os E2Es de estado e rolagem em desktop e `npm run build`; atualizar limitações e resultados em `specs/149-estado-local-scroll-sessoes/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: nenhuma dependência; ferramentas e estrutura já existem.
- **Foundational (Phase 2)**: não há tarefas de infraestrutura compartilhada.
- **User Stories (Phases 3–4)**: independentes entre si; US1 requer a sequência interna de teste, modelo, migração, schemas, leitura/gravação e frontend. US2 requer teste E2E antes do ajuste de layout.
- **Polish (Phase 5)**: depende da conclusão das histórias que serão entregues.

### User Story Dependencies

- **US1 (P1)**: independente; exige a nova revisão de campanha e os schemas existentes de Local.
- **US2 (P1)**: independente de US1; altera somente o acesso à lista de Sessões.
- US1 e US2 podem ser implementadas em paralelo depois de preparar seus respectivos testes, pois atuam em arquivos e jornadas separados.

### Within Each User Story

- Para US1, T001–T003 devem ser escritos e falhar antes da implementação; podem ser feitos em paralelo por estarem em arquivos de teste diferentes. Implementar T004 antes da migração T005; schemas T006 antes de integrar os routers T007. O E2E T008 deve falhar antes da integração visual T009.
- Para US2, T010 deve demonstrar a falha antes de T011 ajustar o layout.
- T012 roda somente após ambas as histórias implementadas.

## Parallel Opportunities

- **US1 — preparação de testes**: T001, T002 e T003 são paralelizáveis.
- **Entre histórias**: após os testes independentes estarem definidos, US1 (backend/modelo e interface do Local) e US2 (layout/E2E da tela de Sessões) podem avançar em paralelo.
- **US2**: T010 é independente dos testes de estado de Local.

## Parallel Example: User Story 1

```bash
# Preparar os testes de migração, contrato e isolamento em arquivos distintos:
Task: T001 backend/tests/test_local_status_migration.py
Task: T002 backend/tests/test_local_status.py
Task: T003 backend/tests/test_local_status_isolation.py
```

## Parallel Example: User Story 2

```bash
# O teste de US2 pode ser preparado em paralelo com os testes backend de US1:
Task: T001 backend/tests/test_local_status_migration.py
Task: T010 frontend/e2e/sessoes-scroll.spec.ts
# Depois que T010 reproduzir a falha, executar T011 para corrigi-la.
```

## Implementation Strategy

### MVP First (User Story 1)

1. Preparar os testes T001–T003 e confirmar que falham pelo contrato/estado ausente.
2. Implementar modelo, migração, schemas e serialização (T004–T007).
3. Escrever e validar o fluxo E2E de estado e integrar a interface (T008–T009).
4. **STOP e validar** o Checkpoint de US1 de forma independente.

### Incremental Delivery

1. Entregar US1 e validar persistência, backfill, isolamento e representações do Local.
2. Entregar US2 e validar rolagem até a última sessão em desktop e mobile.
3. Executar T012 para migração, suíte focada, E2Es e build.

## Notes

- Todas as tarefas seguem `- [ ] TNNN [P?] [US?] descrição com caminho de arquivo`.
- `[P]` aparece somente em tarefas independentes e com arquivos distintos.
- Tarefas de teste para migração e isolamento vêm antes das respectivas alterações, conforme os princípios II e VI.
- A revisão Alembic deve confirmar o head real do ambiente integrado; o nome `007_estado_exploracao_local.py` segue o head 006 registrado no plano.
