---
description: "Tarefas de implementação da gestão de arcos narrativos"
---

# Tasks: Gestão de arcos narrativos

**Input**: Design documents from `/specs/123-gestao-arcos/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/arc-management.md`, `quickstart.md`

**Tests**: Escrever primeiro os testes de isolamento e integridade de associação de dados, conforme os princípios I e II. Cobertura existente de autorização e visibilidade será reutilizada e executada na validação final.

**Organization**: Tarefas agrupadas pelas histórias da spec. O produto usa a API existente; o `frontend-next` implementa interações locais com dados mockados.

## Phase 1: Setup

**Purpose**: Preparar o trabalho sem introduzir infraestrutura, dependências ou schema novos.

- [X] T001 Confirmar no `specs/123-gestao-arcos/plan.md` e no `specs/123-gestao-arcos/research.md` que a implementação reutiliza API, modelos e componentes existentes; não há tarefas de migração ou dependências novas previstas

---

## Phase 2: Foundational

**Purpose**: Não há pré-requisitos compartilhados bloqueantes: os dois frontends podem usar os contratos existentes e as tarefas de segurança ficam junto das histórias que os exercitam.

---

## Phase 3: User Story 1 - Organizar arcos da campanha (Priority: P1) 🎯 MVP

**Goal**: Mestre cria, edita, ordena e exclui arcos no contexto do Mapa; Locais associados são preservados ao excluir um arco.

**Independent Test**: Como mestre, abrir a gestão pelo Mapa, criar e editar arcos, alterar sua ordem, cancelar uma exclusão e confirmar outra; verificar lista ordenada e preservação dos Locais sem associação após excluir.

### Tests for User Story 1

- [X] T002 [P] [US1] Adicionar testes de integração para criar, listar, atualizar, ordenar e excluir arcos, incluindo Local preservado e desassociado, em `backend/tests/test_arcos_crud.py`
- [X] T003 [P] [US1] Adicionar teste de isolamento HTTP entre campanhas para operações de leitura e escrita de Arco em `backend/tests/test_arcos_isolation.py`
- [X] T004 [P] [US1] Criar fluxo Playwright da gestão de arcos no produto, cobrindo entrada pelo Mapa, criação, edição, ordenação, cancelamento e confirmação de exclusão, em `frontend/e2e/arco-management.spec.ts`

### Implementation for User Story 1

- [X] T005 [US1] Integrar `ArcoAdminList` e `ArcoFormDialog` à gestão aberta pelas ferramentas do mestre no Mapa, conectando consulta, criação, edição, ordenação, exclusão, atualização da lista e estados de carregamento/erro em `frontend/src/pages/MapPage.tsx`
- [X] T006 [US1] Exibir na confirmação de exclusão que os Locais serão mantidos e ficarão sem arco, usando a descrição de `ConfirmDialog` em `frontend/src/components/admin/ArcoAdminList.tsx`
- [X] T007 [P] [US1] Adicionar em pt-BR e en as chaves de gestão de arcos e aviso de exclusão em `frontend/src/locales/pt-BR/admin.json` e `frontend/src/locales/en/admin.json`

**Checkpoint**: CRUD e ordem funcionam a partir do Mapa do produto, e a exclusão comunica e preserva os Locais conforme o contrato.

---

## Phase 4: User Story 2 - Controlar acesso e associação de Locais (Priority: P1)

**Goal**: Mestre controla visibilidade e associação; jogadores não recebem dados de arcos ocultos; Local pode ficar sem arco ou referenciar um arco da campanha atual.

**Independent Test**: Alternar visibilidade de um arco e verificar a vista pública e a redação da associação; associar e desassociar um Local; confirmar que associação a ID inexistente é rejeitada sem alterar o Local.

### Tests for User Story 2

- [X] T008 [P] [US2] Adicionar testes de criação e atualização de Local com arco válido, `arco_id=null` e ID de arco inexistente, verificando rejeição sem mutação no último caso, em `backend/tests/test_local_arco_validation.py`
- [X] T009 [P] [US2] Adicionar fluxo Playwright do produto cobrindo alternância de visibilidade, comportamento público e atribuição/desatribuição de Local em `frontend/e2e/arco-visibility.spec.ts`

### Implementation for User Story 2

- [X] T010 [US2] Validar que `arco_id` não nulo pertence à campanha ativa nas operações de criação e atualização de Local, somente se os testes em `backend/tests/test_local_arco_validation.py` demonstrarem que a persistência existente não rejeita IDs inválidos, em `backend/app/routers/admin/locais.py`
- [X] T011 [P] [US2] Incluir estado de visibilidade em `Arco` e tornar `Local.arcoId` anulável nos tipos do protótipo em `frontend-next/src/data/types.ts`
- [X] T012 [P] [US2] Incluir dados mockados representativos de arco oculto e Local sem associação em `frontend-next/src/data/mock.ts`
- [X] T013 [US2] Permitir manter ou selecionar estado sem arco ao criar/editar Local, inclusive quando não há arcos, e localizar a nova opção em pt-BR e en em `frontend-next/src/components/map/LocalFormModal.tsx`

**Checkpoint**: Visibilidade pública mantém as regras existentes, e associações válidas, nulas e inválidas têm resultados definidos em ambos os modelos de dados.

---

## Phase 5: User Story 3 - Acessar a gestão pelo Mapa (Priority: P2)

**Goal**: Protótipo apresenta a gestão equivalente a partir das ferramentas do mestre no Mapa, com estados mockados; jogadores não veem controles de escrita.

**Independent Test**: No protótipo, entrar em modo mestre, abrir a gestão e exercitar lista, criação, edição, ordem, visibilidade e exclusão; mudar para modo jogador e confirmar que ações de escrita não aparecem.

### Implementation for User Story 3

- [X] T014 [P] [US3] Criar textos localizados pt-BR/en para gestão de arcos no protótipo, lendo o idioma salvo em `codex-proto-lang`, em `frontend-next/src/components/map/arcoCopy.ts`
- [X] T015 [US3] Criar painel de gestão mockado com lista ordenada, criação/edição, visibilidade, marcador de oculto, estado vazio e confirmação de exclusão em `frontend-next/src/components/map/ArcoManagerPanel.tsx`
- [X] T016 [US3] Integrar ação de gestão ao Mapa em modo mestre, abrir/fechar o painel e ocultar controles ao alternar para modo jogador em `frontend-next/src/pages/MapPage.tsx`

**Checkpoint**: Mestre encontra gestão de arcos sem sair do Mapa no protótipo, que oferece o mesmo fluxo visual do produto sem chamadas à API.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar segurança existente, build e os percursos do quickstart.

- [ ] T017 Executar testes backend de CRUD, isolamento, validação de associação, visibilidade e autorização em `backend/tests/test_arcos_crud.py`, `backend/tests/test_arcos_isolation.py`, `backend/tests/test_local_arco_validation.py`, `backend/tests/test_visibility_local_arco.py` e `backend/tests/test_admin_auth_matrix.py`
- [ ] T018 Executar os fluxos Playwright de gestão e visibilidade em `frontend/e2e/arco-management.spec.ts` e `frontend/e2e/arco-visibility.spec.ts`
- [ ] T019 Validar builds do produto e protótipo e percorrer os cenários de idioma, mestre/jogador, associação, visibilidade e exclusão em `specs/123-gestao-arcos/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Confirma escopo; sem alterações de infraestrutura.
- **Foundational (Phase 2)**: Sem tarefas bloqueantes compartilhadas.
- **User Stories (Phases 3–5)**: US1 e US2 são P1 e podem avançar em paralelo após preparação; US3 é P2 e pode avançar em paralelo, respeitando a integração dos tipos e do editor do protótipo em US2.
- **Polish (Phase 6)**: Depende das histórias que serão entregues; executar os testes e builds após as implementações correspondentes.

### User Story Dependencies

- **US1 (P1)**: Independente; entrega o fluxo de gestão do produto e é o MVP.
- **US2 (P1)**: Independente no produto; no protótipo, T013 depende de T011 e T012. Preserva os controles de visibilidade já existentes.
- **US3 (P2)**: T015 depende de T014. T016 integra o painel e depende de T015; coordena com os tipos atualizados em T011 para mostrar visibilidade corretamente.

### Parallel Opportunities

- T002, T003 e T004 podem ser escritos em paralelo, pois cobrem arquivos distintos.
- T008 e T009 podem ser escritos em paralelo; implementar validação backend (T010) depois de confirmar o resultado de T008.
- T011 e T012 podem ser feitos em paralelo. T014 também pode avançar em arquivo separado.
- US1 pode ser implementada em paralelo com as tarefas do protótipo, desde que cada tarefa tenha um arquivo proprietário claro.

## Parallel Example: User Story 1

```text
T002 backend CRUD regression tests
T003 backend campaign isolation tests
T004 product Playwright management flow
```

## Implementation Strategy

### MVP First (User Story 1)

1. Confirmar o escopo sem adicionar infraestrutura.
2. Escrever os testes backend de CRUD/isolation e o fluxo E2E do produto.
3. Integrar a lista e os formulários existentes ao Mapa e esclarecer a confirmação de exclusão.
4. Validar US1 independentemente: mestre gerencia arcos no Mapa e Locais permanecem preservados ao excluir.

### Incremental Delivery

1. Entregar US1 como fluxo de gestão do produto.
2. Completar US2 com verificações de visibilidade e associação válida/nula.
3. Completar US3 e a paridade visual/interativa mockada no protótipo.
4. Executar testes, builds e cenários do quickstart para as histórias entregues.

## Execution Notes

- Os testes backend e os fluxos Playwright foram escritos. Os builds de ambos os frontends passaram e o Playwright listou os quatro casos novos.
- T017 e T018 continuam pendentes de execução: o pytest trava no `TestClient.__enter__` ao iniciar o fixture `client`, antes de executar qualquer teste. Reproduzi o mesmo travamento com uma aplicação FastAPI mínima; `init_control()` isolado finaliza normalmente.
- T019 continua pendente de percurso manual dos cenários do quickstart; a etapa de build dos dois frontends foi validada.
