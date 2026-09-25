# Tasks: Associar personagens a Locais

**Input**: Design documents from `/specs/151-associacao-personagem-local/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: O plano pede cobertura antes da implementação para persistência, visibilidade e isolamento. Executar testes focados por fluxo; a suite completa não é necessária para cada alteração.

**Organization**: Tarefas ordenadas por história; a associação e edição formam o MVP, seguida por consulta com visibilidade.

## Phase 1: Setup

**Purpose**: Reutilizar o stack e os dados de teste existentes. Nenhuma dependência, tabela, migração ou endpoint novo é necessário.

Nenhuma tarefa de setup.

---

## Phase 2: Foundational

**Purpose**: O modelo `NPC`, a relação `LocalNPCLink` e os endpoints de Local já aceitam PJ e NPC; não há infraestrutura bloqueante além dos testes por história.

Nenhuma tarefa fundacional.

---

## Phase 3: User Story 1 - Associar PJs e NPCs a Locais (Priority: P1) 🎯 MVP

**Goal**: Permitir que o mestre selecione PJ e NPC no mesmo Local, salve/remova vínculos independentemente e identifique o tipo no editor.

**Independent Test**: Associar um PJ e um NPC a um Local, persistir após recarga, remover só um vínculo e confirmar que ambos os personagens e vínculos com outros Locais permanecem corretos.

### Tests for User Story 1

- [X] T001 [P] [US1] Criar `backend/tests/test_local_personagens.py` com testes focados de POST/PUT de Local usando um PJ e um NPC, persistência após nova leitura, remoção de somente um vínculo, associação de um personagem a dois Locais e rejeição de ID existente somente no banco de outra campanha sem mutação.
- [X] T002 [P] [US1] Criar `frontend/e2e/local-personagem-association.spec.ts` cobrindo edição autenticada de Local com PJ e NPC, salvar/reabrir, identificar tipo em pt-BR e en, remover apenas um vínculo e comunicar falha de salvamento sem afirmar persistência.

### Implementation for User Story 1

- [X] T003 [US1] Alterar `frontend/src/hooks/useCampaignData.ts` para manter no estado todos os personagens recebidos, inclusive `tipo === 'pj'`, sem alterar as regras de visibilidade da API.
- [X] T004 [US1] Atualizar `frontend/src/components/admin/LocalFormDialog.tsx` para identificar PJ e NPC nas opções selecionáveis e alterar `localForm.npcsPresentes` para uma label abrangente em `frontend/src/locales/pt-BR/admin.json` e `frontend/src/locales/en/admin.json`.

**Checkpoint**: O editor permite associar e desassociar qualquer tipo de personagem, persiste a lista e apresenta tipo e labels localizadas.

---

## Phase 4: User Story 2 - Consultar associações respeitando acesso (Priority: P1)

**Goal**: Exibir personagens associados com seus tipos nas consultas de Local, mantendo a filtragem de personagens/Locais ocultos e o acesso somente para membros autenticados nas rotas de edição.

**Independent Test**: Consultar um Local com vínculos visíveis e ocultos como pessoa anónima; ver apenas as associações permitidas e identificar o tipo PJ/NPC. Confirmar que anónimos e contas sem vínculo com a campanha não conseguem alterar o Local.

### Tests for User Story 2

- [X] T005 [P] [US2] Ampliar `backend/tests/test_visibility_local_arco.py` para cobrir associações de PJ e NPC visíveis/ocultos, garantindo que respostas públicas de Local e `local_ids` não revelem entidades ocultas e que a leitura administrativa mantenha os dados completos.
- [X] T006 [P] [US2] Adicionar `test_local_update_requires_campaign_membership` em `backend/tests/test_admin_auth_matrix.py` para confirmar que PUT de Local retorna 401 sem sessão e 403 para conta sem vínculo com a campanha, sem alteração da associação.
- [X] T007 [P] [US2] Criar `frontend/e2e/local-personagem-visibility.spec.ts` com um Local associado a personagens visível e oculto, verificar a consulta pública nos modos pt-BR/en, ausência de dados ocultos e ausência de controles de edição para pessoa anónima.

### Implementation for User Story 2

- [X] T008 [US2] Atualizar `frontend/src/pages/MapPage.tsx` para apresentar tipo localizado junto aos personagens associados ao Local e manter a navegação ao detalhe do personagem pelo chip.

**Checkpoint**: Consulta apresenta os vínculos visíveis com tipo identificável; as respostas e ações continuam limitadas pela campanha e permissões atuais.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Consolidar validação por escopo e as instruções para repetir os cenários.

- [X] T009 Atualizar `specs/151-associacao-personagem-local/quickstart.md` com os comandos focados e executar, em `backend/`, `uv run pytest tests/test_local_personagens.py tests/test_visibility_local_arco.py` e `uv run pytest tests/test_admin_auth_matrix.py -k local_update_requires_campaign_membership`; em `frontend/`, executar `npm run test:e2e -- --project=desktop local-personagem-association.spec.ts local-personagem-visibility.spec.ts` e `npm run build`; registrar resultados no quickstart sem executar a suite integral.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem mudanças de dependências ou estrutura.
- **Foundational (Phase 2)**: sem tarefa bloqueante; relação e contratos de dados já existem.
- **User Story 1 (Phase 3)**: inicia após setup; T001/T002 são a cobertura inicial e precedem a implementação do frontend.
- **User Story 2 (Phase 4)**: usa a lista completa de personagens habilitada pela US1; os testes de visibilidade/auth podem ser preparados em arquivos independentes.
- **Polish (Phase 5)**: depende dos fluxos das duas histórias e executa apenas validações focadas.

### User Story Dependencies

- **US1 (P1)**: independente; entrega seleção, persistência e edição de PJs/NPCs como MVP.
- **US2 (P1)**: requer a disponibilidade dos personagens da US1 para apresentá-los nos detalhes do Local; depende de US1.

### Within Each User Story

- Escrever e executar T001/T002 antes das mudanças de interface da US1.
- Em US2, T005/T006/T007 estabelecem visibilidade e controle de acesso antes da apresentação em `MapPage.tsx`.
- T003 e T004 alteram arquivos diferentes e podem ser paralelizadas após a cobertura inicial.

## Parallel Opportunities

- T001 (pytest de vínculo) e T002 (E2E do editor) podem ser escritos em paralelo, pois usam arquivos distintos.
- Depois da cobertura inicial da US1, T003 (hook de dados) e T004 (editor/i18n) podem ser implementados em paralelo.
- T005, T006 e T007 cobrem arquivos distintos e podem ser preparados em paralelo; não compartilhar o mesmo `DATA_DIR` entre execuções E2E simultâneas.

### Parallel Example: User Story 1

```text
Em paralelo:
- T001 backend/tests/test_local_personagens.py
- T002 frontend/e2e/local-personagem-association.spec.ts
Depois dos testes:
- T003 frontend/src/hooks/useCampaignData.ts
- T004 frontend/src/components/admin/LocalFormDialog.tsx e traduções admin
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Adicionar testes focados de persistência e o E2E do editor.
2. Incluir PJs no conjunto de personagens do Mapa.
3. Identificar tipo no seletor de associação em português e inglês.
4. Validar associação, remoção e persistência independentemente.

### Incremental Delivery

1. Entregar US1: associar/remover PJs e NPCs no editor.
2. Entregar US2: mostrar tipos nos detalhes e verificar acesso/visibilidade.
3. Executar os testes focados listados no quickstart; reservar as suites completas para mudanças de alto risco, marcos de entrega e CI.

## Notes

- Todas as tarefas executáveis seguem `- [X] TNNN [P?] [US?] descrição com caminho de arquivo`.
- Sem alterações planejadas no modelo, endpoints, schema, migrações ou dependências.
- As rotas administrativas atuais exigem sessão de membro; jogador público consulta dados filtrados sem papel de conta separado.
