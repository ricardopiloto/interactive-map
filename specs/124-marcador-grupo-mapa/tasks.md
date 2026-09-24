---
description: "Tarefas de implementação do marcador do grupo no Mapa"
---

# Tasks: Posição e formato do marcador do grupo

**Input**: Design documents from `/specs/124-marcador-grupo-mapa/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/group-marker.md`, `quickstart.md`

**Tests**: Escrever primeiro os testes de autorização, validação, persistência e isolamento antes de alterar a proteção da rota ou comportamento de dados. Cobrir estados da interface com Playwright; verificar o protótipo pelo quickstart.

**Organization**: Tarefas por história. O menu compartilhado do mestre é definido pela spec 123; esta feature acrescenta as ações de mover grupo e escolher formato sem duplicar o menu.

## Phase 1: Setup

**Purpose**: Projeto, dependências, modelo e rota já existem; não há tarefas de setup, migração ou instalação previstas.

---

## Phase 2: Foundational

**Purpose**: Não há pré-requisitos técnicos compartilhados. Os testes de autorização e isolamento ficam na US1 antes da mudança de backend; as histórias de interface consomem os contratos existentes.

---

## Phase 3: User Story 1 - Reposicionar o grupo (Priority: P1) 🎯 MVP

**Goal**: Dono/mestre inicia e cancela posicionamento, persiste um ponto válido e recebe feedback correto se o salvamento falhar.

**Independent Test**: Como dono, ativar mover, cancelar sem gravar, escolher ponto válido e recarregar; simular falha e confirmar que a posição persistida continua visível. Como jogador ou membro sem papel de dono, confirmar que escrita é negada.

### Tests for User Story 1

- [X] T001 [P] [US1] Adicionar testes de endpoint para escrita anónima, não membro, membro sem papel de dono e dono, persistência, limites de coordenadas, formato inválido e isolamento entre campanhas em `backend/tests/test_grupo_owner_auth.py`
- [X] T002 [P] [US1] Adicionar teste Playwright do produto para ativar/cancelar posicionamento, salvar ponto e simular falha sem apresentar a posição candidata como persistida em `frontend/e2e/group-marker.spec.ts`

### Implementation for User Story 1

- [X] T003 [US1] Aplicar `require_dono` especificamente à escrita do marcador, mantendo a rota existente e seu escopo por campanha em `backend/app/routers/admin/grupo.py`
- [X] T004 [US1] Tornar o estado de mover cancelável e persistência-ciente: sair após sucesso, manter posição anterior e oferecer erro traduzido com opção de tentar novamente ou cancelar em `frontend/src/pages/MapPage.tsx`
- [X] T005 [US1] Exibir dica de posicionamento e ação de cancelar durante o modo mover, sem permitir que cliques de posicionamento acionem outra ação do mapa em `frontend/src/components/map/CampaignMap.tsx`
- [X] T006 [P] [US1] Adicionar traduções pt-BR/en para instrução de mover, cancelar, falha de salvamento e rótulos acessíveis em `frontend/src/locales/pt-BR/mapa.json` e `frontend/src/locales/en/mapa.json`

**Checkpoint**: Só o dono grava posição; cancelar não grava, sucesso persiste e falha mantém o marcador salvo anterior com feedback compreensível.

---

## Phase 4: User Story 2 - Escolher a forma do marcador (Priority: P1)

**Goal**: Dono alterna entre bandeira e brasão sem modificar a posição, enquanto os demais participantes veem a forma persistida sem controles de escrita.

**Independent Test**: Como dono, escolher cada forma e recarregar; confirmar que a forma persiste e x/y não mudam. Em modo jogador, confirmar que a forma é visível, mas os controles não.

### Tests for User Story 2

- [X] T007 [P] [US2] Estender os testes de endpoint para verificar que atualização de formato preserva x/y, e que um membro sem papel de dono não altera posição nem formato, em `backend/tests/test_grupo_owner_auth.py`
- [X] T008 [P] [US2] Estender o teste Playwright para alternar bandeira/brasão, verificar preservação das coordenadas e ausência de controles para jogador em `frontend/e2e/group-marker.spec.ts`

### Implementation for User Story 2

- [X] T009 [US2] Garantir que a escolha de formato atualize somente `formato` usando as coordenadas persistidas e que falha não apresente formato não salvo em `frontend/src/pages/MapPage.tsx`
- [X] T010 [US2] Manter recentralização como ação exclusiva da câmera, sem gravar coordenadas do marcador, em `frontend/src/components/map/CampaignMap.tsx`

**Checkpoint**: Bandeira e brasão persistem sem deslocar o grupo, e jogador só visualiza o formato atual.

---

## Phase 5: User Story 3 - Usar controles no contexto do Mapa (Priority: P2)

**Goal**: O menu compartilhado de gestão no protótipo oferece mover e escolher formato em modo mestre; modo jogador permanece somente leitura.

**Independent Test**: No protótipo, abrir as ferramentas do mestre, mover o marcador mockado, cancelar, escolher as duas formas e recentralizar sem mudar a posição; alternar para jogador e verificar que ações de escrita desaparecem.

### Implementation for User Story 3

- [X] T011 [P] [US3] Adicionar `formato` ao tipo e estado mockado do marcador, mantendo `bandeira` como padrão para campanhas antigas sem valor, em `frontend-next/src/data/types.ts` e estado inicial do layout compartilhado
- [X] T012 [US3] Acrescentar as ações mover grupo e escolher formato ao menu compartilhado do mestre previsto na spec 123, sem criar menu concorrente, em `frontend-next/src/pages/CampaignLayout.tsx`
- [X] T013 [US3] Implementar estados mockados de posicionamento, cancelamento, limites normalizados e seleção bandeira/brasão no canvas; garantir que recentralização só altera a câmera em `frontend-next/src/components/map/MapCanvas.tsx`
- [X] T014 [US3] Ligar as ações do menu ao canvas, restringi-las ao modo mestre e traduzir rótulos/dica/cancelamento em pt-BR e en em `frontend-next/src/pages/MapPage.tsx`

**Checkpoint**: Protótipo representa os controles e estados do produto no menu compartilhado, sem chamadas à API e sem ações de escrita em modo jogador.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Executar a matriz de segurança, fluxos de interface e cenários de validação definidos no quickstart.

- [ ] T015 Executar testes de autorização, isolamento, persistência e validação do marcador em `backend/tests/test_grupo_owner_auth.py` e `backend/tests/test_admin_auth_matrix.py`
- [ ] T016 Executar o fluxo Playwright do marcador em `frontend/e2e/group-marker.spec.ts` e os checks de acessibilidade aplicáveis aos novos controles
- [ ] T017 Validar builds do produto e protótipo e percorrer os cenários de mestre/jogador, pt-BR/en, cancelamento, falha e recentralização em `specs/124-marcador-grupo-mapa/quickstart.md`

### Execution Notes

- T015 permanece pendente: a coleta do pytest chega ao primeiro caso, mas o `TestClient` trava ao iniciar o lifespan do FastAPI neste ambiente. O mesmo travamento foi reproduzido com uma aplicação FastAPI mínima; os testes foram escritos, mas suas asserções não chegaram a executar.
- T016 permanece pendente: o teste Playwright foi descoberto para desktop e mobile, mas não foi executado; a validação da interface pelo navegador e os checks de acessibilidade ainda precisam ser feitos.
- Builds de `frontend` e `frontend-next` passaram. `py_compile` dos módulos/testes backend e parsing dos arquivos de tradução também passaram. T017 segue pendente até percorrer manualmente o quickstart.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Nenhuma instalação ou inicialização necessária.
- **Foundational (Phase 2)**: Sem tarefas bloqueantes compartilhadas.
- **User Stories (Phases 3–5)**: US1 e US2 reutilizam o endpoint e canvas atuais; os testes de autorização de US1 devem falhar antes da alteração em T003. US3 depende do menu compartilhado estabelecido pela spec 123.
- **Polish (Phase 6)**: Depende da conclusão das histórias incluídas na entrega.

### User Story Dependencies

- **US1 (P1)**: Independente e candidata ao MVP; testes T001/T002 precedem alterações de autorização e interação.
- **US2 (P1)**: Independente quanto ao contrato, mas compartilha MapPage, CampaignMap e os arquivos de teste com US1; coordenar alterações nesses arquivos após T003–T006.
- **US3 (P2)**: Integra-se ao menu da spec 123. Se a implementação do menu compartilhado ainda não estiver disponível, completar essa dependência antes de T012/T014; não duplicar o menu.

### Parallel Opportunities

- T001 e T002 podem ser escritos em paralelo em arquivos separados.
- T006 pode ser desenvolvido junto dos testes backend, pois usa arquivos independentes.
- T007 pode ampliar a cobertura em paralelo à implementação mockada T011.
- T011 pode avançar em paralelo às alterações do produto; T012–T014 seguem a dependência do menu compartilhado e a sequência de integração.

## Parallel Example: User Story 1

```text
T001 backend authorization, validation, persistence and isolation tests
T002 product Playwright move/cancel/failure flow
```

## Implementation Strategy

### MVP First (User Story 1)

1. Escrever os testes de autorização, persistência, validação e isolamento e o fluxo de mover/cancelar.
2. Fazer o endpoint exigir papel de dono.
3. Completar o fluxo cancelável e failure-safe no produto, incluindo copy pt-BR/en.
4. Validar US1 independentemente antes de avançar para formato e protótipo.

### Incremental Delivery

1. Entregar US1 com escrita exclusiva do dono e posicionamento confiável.
2. Entregar US2 com alternância de formato sem alteração da posição.
3. Entregar US3 no menu compartilhado do protótipo definido pela spec 123.
4. Executar matriz backend, Playwright, acessibilidade e quickstart.
