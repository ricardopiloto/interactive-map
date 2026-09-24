# Tasks: Seleção de personagem no Mapa e em Relações

**Input**: Design documents from `/specs/147-selecao-personagem/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/selection-ui.md`, `quickstart.md`

**Tests**: Incluídos para cobrir a regressão de seleção e identidade do personagem. Nenhuma alteração de autenticação, permissão, API ou schema está prevista.

**Organization**: Tarefas agrupadas por história de usuário para permitir validação independente.

## Phase 1: Setup — Reprodução do relato

**Purpose**: Confirmar o caminho exato do relato antes de mexer nos handlers que já estão cobertos.

- [X] T001 Reproduzir os passos reportados em BUG-001 nas telas Mapa e Relações usando `frontend/e2e/mapa-retratos.spec.ts`, `frontend/e2e/relacoes-flows.spec.ts` e `frontend/e2e/relacoes-retratos.spec.ts`; registrar os passos concretos e o resultado em `docs/bugs/bugs.md`.

---

## Phase 2: Foundational

**Purpose**: Nenhuma infraestrutura compartilhada é necessária. A seleção é estado local de cada página; fixtures E2E, servidor de teste e helpers existentes são reutilizados.

**Checkpoint**: As histórias podem ser implementadas independentemente após T001; não há tarefa de backend ou schema.

---

## Phase 3: User Story 1 — Abrir ficha pelo Mapa (Priority: P1) 🎯 MVP

**Goal**: Selecionar uma linha de personagem no Mapa abre e mantém a ficha do personagem correto.

**Independent Test**: Selecionar dois personagens consecutivamente na lista e confirmar após cada ação que o título/dados da ficha pertencem ao personagem selecionado.

### Tests for User Story 1

- [X] T002 [P] [US1] Ampliar o teste E2E em `frontend/e2e/mapa-retratos.spec.ts` para selecionar dois personagens em sequência e verificar que os detalhes exibidos acompanham cada seleção, mantendo a cobertura de retratos ausentes ou inválidos.

### Implementation for User Story 1

- [ ] T003 [P] [US1] Se T002 reproduzir seleção sem resposta ou detalhes de personagem incorreto, corrigir a transição de seleção e resolução de ficha em `frontend/src/pages/MapPage.tsx`; se o teste passar sem alteração, registrar a evidência em `docs/bugs/bugs.md` e não duplicar o estado existente.

**Checkpoint**: História 1 validada independentemente; ficha e seleção correspondem nos casos cobertos.

---

## Phase 4: User Story 2 — Selecionar personagem em Relações (Priority: P1)

**Goal**: Selecionar pela lista ou pelo nó mantém o personagem em foco e os detalhes do painel sincronizados.

**Independent Test**: Selecionar um personagem pela lista e outro pelo grafo; em cada etapa, confirmar que o nó marcado e o título/detalhes do painel identificam o mesmo personagem.

### Tests for User Story 2

- [X] T004 [P] [US2] Ampliar `frontend/e2e/relacoes-flows.spec.ts` para afirmar que o painel mostra o personagem selecionado pela lista e é atualizado para corresponder ao novo nó selecionado no grafo.

### Implementation for User Story 2

- [ ] T005 [P] [US2] Se T004 reproduzir divergência, corrigir o estado compartilhado de seleção e os callbacks entre `frontend/src/pages/RelacoesPage.tsx` e `frontend/src/components/relacoes/GraphStage.tsx`; se a sincronização passar sem alteração, registrar a evidência em `docs/bugs/bugs.md` e não criar uma segunda fonte de estado.

**Checkpoint**: História 2 validada independentemente; lista, grafo e painel apontam para o mesmo personagem.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validar os fluxos nos viewports suportados e confirmar que a mudança permanece limitada à interface.

- [ ] T006 Executar os cenários dos dois fluxos E2E em desktop e mobile e `npm run build`, conforme `specs/147-selecao-personagem/quickstart.md`; corrigir falhas relacionadas à seleção sem alterar filtros, visibilidade ou comportamento de arrasto.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 confirma o ponto de entrada do relato e desbloqueia a validação das histórias.
- **Foundational (Phase 2)**: sem tarefas; infraestrutura atual é suficiente.
- **User Stories (Phases 3–4)**: dependem de T001 e são independentes entre si.
- **Polish (Phase 5)**: T006 depende da conclusão das duas histórias.

### User Story Dependencies

- **US1 (P1)**: independente após T001; entrega a abertura e atualização da ficha no Mapa.
- **US2 (P1)**: independente após T001; sincroniza seleção de lista/grafo com detalhes em Relações.

### Within Each User Story

- Executar a extensão E2E primeiro; confirmar se há falha reproduzível antes de alterar os handlers.
- A tarefa de implementação correspondente só muda código se a regressão for demonstrada; se passar, registrar evidência e concluir sem alteração desnecessária.
- Validar a história isoladamente antes do checkpoint.

## Parallel Opportunities

- T002 e T004 podem ser desenvolvidas em paralelo após T001, pois alteram arquivos E2E diferentes.
- Após cada teste, T003 e T005 também podem ser trabalhadas em paralelo quando ambas as regressões forem reproduzidas; os caminhos de produção das duas histórias são distintos.
- T006 é sequencial e só começa após ambas as histórias.

## Parallel Example: User Stories 1 and 2

```text
Após T001:
Trabalho A: T002 — regressão da ficha em frontend/e2e/mapa-retratos.spec.ts
Trabalho B: T004 — sincronização painel/grafo em frontend/e2e/relacoes-flows.spec.ts

Depois dos testes:
Trabalho A: T003 — corrigir frontend/src/pages/MapPage.tsx se T002 falhar
Trabalho B: T005 — corrigir RelacoesPage.tsx/GraphStage.tsx se T004 falhar
```

## Implementation Strategy

### MVP First (User Story 1)

1. Concluir T001 para confirmar a entrada do relato.
2. Concluir T002 e, se necessário, T003.
3. Validar a ficha do personagem no Mapa independentemente.

### Incremental Delivery

1. Adicionar US1 e validar o comportamento da ficha.
2. Adicionar US2 e validar lista, nó selecionado e painel.
3. Executar T006 em desktop/mobile e build.

## Notes

- Toda tarefa segue o formato `- [ ] TNNN [marcadores] descrição com caminho de arquivo`.
- `[P]` é usado somente onde há arquivos distintos e nenhuma dependência entre tarefas.
- Não há tarefa para backend, schema, API, dependência nova ou mudança visual.
- A cobertura E2E existente já verifica parte dos caminhos; as novas asserções devem complementar essa cobertura, não duplicá-la sem necessidade.
