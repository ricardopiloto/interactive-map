# Tasks: Filtros consistentes em Relações

**Input**: Design documents from `/specs/142-filtros-relacoes/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-filters.md](./contracts/ui-filters.md), [quickstart.md](./quickstart.md)

**Tests**: Nenhuma tarefa de teste automatizado foi solicitada pela SPEC. A validação manual segue o quickstart na fase final.

## Phase 1: Setup

**Purpose**: O app, a rota de Relações e os componentes de UI necessários já existem; nenhuma inicialização ou dependência é necessária.

**Tasks**: Nenhuma.

---

## Phase 2: Foundational

**Purpose**: Não há infraestrutura bloqueadora. As histórias usam os dados e estado já carregados pela página de Relações.

**Tasks**: Nenhuma.

---

## Phase 3: User Story 1 - Aplicar filtro de tipo ao grafo e ao detalhe (Priority: P1) 🎯 MVP

**Goal**: Uma seleção de tipos controla o Grafo e a lista de vínculos do personagem no SidePanel; conjunto vazio significa “todos”.

**Independent Test**: Com vínculos de pelo menos dois tipos, usar chips na tela sem personagem selecionado e com detalhe aberto. Confirmar que os chips representam a mesma seleção e que o Grafo e a lista de detalhe mostram a mesma união; limpar tudo restaura todos os tipos.

### Implementation for User Story 1

- [X] T001 [P] [US1] Atualizar `edgeMatchesTipos` em `frontend/src/components/relacoes/vinculoDirection.ts` para que conjunto vazio permita todos os vínculos e conjunto não vazio permita vínculo quando qualquer direção corresponder a um tipo ativo.
- [X] T002 [P] [US1] Ajustar o estado inicial de `activeTipos` em `frontend/src/pages/RelacoesPage.tsx` e as transições de clique/duplo-clique em `frontend/src/components/relacoes/useVinculoTipoChipClicks.ts` para conjunto vazio = todos, clique simples aditivo/removível e duplo-clique em tipo já isolado restaurando conjunto vazio.
- [X] T003 [US1] Remover o estado independente `activeDetailTipos` de `PersonagemDetailBody` em `frontend/src/pages/RelacoesPage.tsx`; conectar chips, lista, contador e estado vazio do detalhe à seleção compartilhada de `activeTipos` e à mesma regra de correspondência do Grafo (depende de T001 e T002).

**Checkpoint**: O filtro de tipo funciona do mesmo modo no SidePanel e no Grafo, com a semântica de clique definida na SPEC 134.

---

## Phase 4: User Story 2 - Combinar status e busca sem divergência entre painel e grafo (Priority: P2)

**Goal**: Preservar o fluxo de status e busca de `main` ao compor os filtros de tipo: status restringe o conjunto visível, busca restringe a lista e destaca no Grafo.

**Independent Test**: Escolher um status e buscar um personagem; confirmar que o SidePanel lista somente correspondências permitidas pelo status, o Grafo só contém personagens desse status e a busca destaca sem remover outros nós por texto.

### Implementation for User Story 2

- [X] T004 [US2] Consolidar em `frontend/src/pages/RelacoesPage.tsx` o conjunto de personagens elegíveis por status, a lista lateral filtrada por busca e os vínculos cujas duas pontas são elegíveis; garantir que essas mesmas entradas, mais a consulta como destaque, sejam passadas ao SidePanel e ao `GraphStage`, e que seleção/isolamento sejam limpos quando o personagem selecionado sair do filtro de status.

**Checkpoint**: Status e busca mantêm seus resultados esperados enquanto o filtro compartilhado de tipos está ativo.

---

## Phase 5: User Story 3 - Preservar as interações de seleção e isolamento (Priority: P3)

**Goal**: Isolamento e seleção continuam funcionando como interseção da rede com o filtro global de tipos.

**Independent Test**: Selecionar um personagem, ativar isolamento e alternar os tipos; confirmar que só aparecem vínculos incidentes e compatíveis. Desativar isolamento e confirmar o retorno ao grafo geral ainda filtrado por tipo.

### Implementation for User Story 3

- [X] T005 [US3] Em `frontend/src/components/relacoes/GraphStage.tsx`, derivar vizinhos de foco e arestas isoladas exclusivamente do conjunto já filtrado por tipo; ao desativar isolamento ou limpar seleção, restaurar todas as arestas elegíveis, sem reintroduzir vínculos excluídos pelo filtro.

**Checkpoint**: Seleção e isolamento preservam a interseção entre foco do personagem e tipos ativos.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirmar os critérios de aceitação entre as histórias sem alterar a apresentação visual.

- [X] T006 Percorrer `specs/142-filtros-relacoes/quickstart.md` na tela `/c/:slug/relacoes`; confirmar compartilhamento dos filtros, status, busca, bidirecionalidade, isolamento, estados vazios e ausência de mudanças visuais.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem tarefas; ambiente e estrutura existentes.
- **Foundational (Phase 2)**: sem tarefas; não há infraestrutura bloqueadora.
- **User Story 1 (Phase 3)**: pode começar imediatamente; é o MVP e estabelece o estado semântico usado pelas demais histórias.
- **User Story 2 (Phase 4)**: depende de US1 para que status/busca componham com a fonte compartilhada de tipos.
- **User Story 3 (Phase 5)**: depende de US1 para garantir que foco/isolamento opere sobre as arestas do filtro compartilhado; pode ser desenvolvido em paralelo com US2 após US1, pois atua no `GraphStage.tsx` enquanto US2 integra a página.
- **Polish (Phase 6)**: depende de US1, US2 e US3.

### User Story Dependencies

- **US1 (P1)**: independente; cria o MVP.
- **US2 (P2)**: depende de US1.
- **US3 (P3)**: depende de US1; pode paralelizar com US2 depois de US1.

### Parallel Opportunities

- T001 e T002 podem ser executadas em paralelo: alteram o matcher de vínculo e o estado/transições dos chips em arquivos distintos.
- Depois de US1, T004 e T005 podem ser trabalhadas em paralelo por tratarem arquivos diferentes: derivação/props na página e composição de foco/arestas no grafo.

## Parallel Example: User Story 1

```text
Task: T001 — ajustar correspondência de tipos em vinculoDirection.ts
Task: T002 — ajustar estado inicial e transições dos chips em RelacoesPage.tsx e useVinculoTipoChipClicks.ts
```

## Implementation Strategy

### MVP First (User Story 1)

1. Concluir T001 e T002.
2. Concluir T003 para remover o filtro concorrente do detalhe.
3. Parar no checkpoint de US1 e validar a paridade do filtro de tipo no SidePanel e no Grafo.

### Incremental Delivery

1. Entregar US1 como primeira fatia funcional: fonte compartilhada de tipo, empty = all, detalhe e grafo coerentes.
2. Adicionar US2 sem mudar a semântica de busca/status já usada.
3. Adicionar US3 garantindo que isolamento opere sobre as arestas já filtradas.
4. Percorrer o quickstart em T006.

## Notes

- Todos os itens executáveis seguem `- [ ] Tnnn [P?] [USn?] ...` e indicam os caminhos dos arquivos envolvidos.
- Não criar endpoints, alterar API ou persistir preferências de filtro.
- Manter chips, SidePanel e Grafo visualmente como estão.
