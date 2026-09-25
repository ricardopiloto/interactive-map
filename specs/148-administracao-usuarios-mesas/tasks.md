# Tasks: Administração de usuários e mesas

**Input**: Design documents from `/specs/148-administracao-usuarios-mesas/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/admin-console.md`, `quickstart.md`

**Tests**: Obrigatórios antes de implementação de autorização, permissões, migrações e ciclo de vida de dados, conforme a Constituição II. Incluem a matriz anônimo/não-admin/admin e testes de isolamento das exclusões.

**Organization**: histórias ordenadas como na spec; US3 fecha a validação de segurança de ponta a ponta. A infraestrutura de autorização `require_admin` já existe e será reutilizada.

## Phase 1: Setup — Base compartilhada

**Purpose**: Preparar fixtures isoladas reutilizadas pelas jornadas administrativas.

- [X] T001 Adicionar fixtures reutilizáveis de administrador, usuário comum e sessão autenticada em `backend/tests/conftest.py`, mantendo cada teste em `tmp_path` e sem reutilizar `DATA_DIR` real.

---

## Phase 2: Foundational — Contratos e console protegido

**Purpose**: Criar tipos e shell compartilhados que bloqueiam o trabalho independente das histórias.

- [X] T002 Criar schemas allow-listed de request/response para usuários, convites, campanhas, estado e erros em `backend/app/schemas/admin_console.py`, sem campos de senha, hash, sessão ou narrativa.
- [X] T003 Criar wrappers tipados para as rotas globais `/api/admin/*` em `frontend/src/api/adminConsole.ts`, usando `api.adminGet`, `adminPost`, `adminPatch` e `adminDelete` de `frontend/src/api/client.ts`.
- [X] T004 Criar o shell `/admin` autenticado por `authApi.me()` em `frontend/src/pages/AdminConsolePage.tsx`; registrar a rota em `frontend/src/App.tsx`, a entrada condicional do menu em `frontend/src/components/layout/UserMenu.tsx` e as chaves base em `frontend/src/locales/pt-BR/comum.json` e `frontend/src/locales/en/comum.json`.

**Checkpoint**: contratos comuns e ponto de entrada protegido existem; os fluxos de cada história podem ser implementados sem criar autenticação ou cliente API paralelo.

---

## Phase 3: User Story 1 — Contas, convites e redefinição de senha (Priority: P1) 🎯 MVP

**Goal**: Administradores encontram e gerenciam contas sem consultar comandos no servidor nem manipular senhas.

**Independent Test**: Como administrador, localizar contas ativas, pendentes e inativas por e-mail; criar/copiar convite e link de reset; desativar/reativar conta e confirmar revogação de sessão; excluir uma conta elegível e verificar bloqueios de proprietário e último administrador.

### Tests for User Story 1

> Escrever e executar estes testes antes dos serviços e rotas abaixo; as verificações de acesso devem esperar 401/403 para anônimo/não-admin.

- [X] T005 [P] [US1] Escrever testes HTTP para listagem, pesquisa/filtro, projeção sem segredos, convite, duplicidade e reset de usuários em `backend/tests/test_admin_console_users.py`.
- [X] T006 [P] [US1] Escrever testes de serviço para estados pendente/ativa/inativa, revogação de sessões, último administrador, bloqueio por propriedade e limpeza de registros na exclusão em `backend/tests/test_admin_console_user_service.py`.

### Implementation for User Story 1

- [X] T007 [US1] Implementar projeção de status, listagem filtrada, resumo de mesas próprias e criação de links de convite/reset em `backend/app/services/admin_console.py`, reaproveitando `create_usuario_with_invite`, `reset_usuario` e `invite_url` de `backend/app/services/auth_admin.py`.
- [X] T008 [US1] Implementar desativação/reativação e exclusão atômica em `backend/app/services/admin_console.py`, incluindo bloqueio do último admin e de qualquer proprietário, revogação de sessões e remoção explícita de convites, vínculos, sessões e bloqueio por e-mail.
- [X] T009 [US1] Expor `GET /usuarios`, `POST /usuarios/{id}/reset`, `PATCH /usuarios/{id}/estado` e `DELETE /usuarios/{id}` no router global protegido `backend/app/routers/administrador.py`, mantendo `POST /convites` compatível e convertendo erros para códigos/status do contrato.
- [X] T010 [US1] Implementar lista de usuários, pesquisa por e-mail, filtro de estado e estados de carregamento/vazio/erro no componente `frontend/src/components/admin/AdminUsersSection.tsx`, com copy em `frontend/src/locales/pt-BR/comum.json` e `frontend/src/locales/en/comum.json`.
- [X] T011 [US1] Implementar criação e cópia de convite/reset, além de desativação/reativação e confirmação explícita de exclusão com campanhas bloqueadoras, em `frontend/src/components/admin/AdminUsersSection.tsx`.
- [X] T012 [US1] Integrar a seção de usuários ao shell e preservar o fluxo antigo de convite em `frontend/src/pages/AdminConsolePage.tsx`, `frontend/src/pages/AdminConvitesPage.tsx` e `frontend/src/App.tsx`.
- [X] T013 [US1] Cobrir jornada administrativa de pesquisa, convite, reset, mudança de estado e exclusão protegida em `frontend/e2e/admin-console-users.spec.ts` usando dados de teste descartáveis.

**Checkpoint**: a história de usuários funciona isoladamente; links são de uso único, sessões revogadas não continuam acessando e exclusões não apagam mesas.

---

## Phase 4: User Story 2 — Consultar e administrar mesas (Priority: P1)

**Goal**: Administradores encontram mesas, veem seus metadados operacionais e podem transferir, desativar, reativar ou excluir a mesa confirmada.

**Independent Test**: Localizar uma mesa por nome/slug/proprietário, conferir estado, visibilidade e última alteração; transferir proprietário; desativar/reativar; excluir uma mesa descartável e verificar que mesas irmãs continuam acessíveis e intactas.

### Tests for User Story 2

> Escrever e executar antes das migrações e serviços. Testar ambos os bancos Alembic, commits/rollback e isolamento da exclusão em `DATA_DIR` temporário.

- [X] T014 [P] [US2] Escrever testes de migração de `control.db` 006→head e campanha 005→head, backfill desconhecido como `NULL`, criação de nova mesa e downgrade em `backend/tests/test_admin_console_migration.py`.
- [X] T015 [P] [US2] Escrever testes de HTTP para listagem allow-listed, pesquisa/filtro, estado, transferência e exclusão targeted de mesa, incluindo 401/403 e preservação de uma mesa irmã em `backend/tests/test_admin_console_campaigns.py`.
- [X] T016 [P] [US2] Escrever testes de timestamp para gravação ORM, configuração, rollback, leitura/login sem alteração e mesa legada sem data em `backend/tests/test_campaign_modified_at.py`.

### Implementation for User Story 2

- [X] T017 [US2] Adicionar `criado_em` e `modificado_em` nullable ao modelo `Campanha` em `backend/app/models/campanha.py` e revisão Alembic de controle `backend/alembic_control/versions/007_admin_console_timestamps.py`, sem inventar datas de criação para legado.
- [X] T018 [US2] Criar o modelo singleton `CampaignState` em `backend/app/models/campaign_state.py`, registrá-lo em `backend/app/models/__init__.py` e adicionar a revisão Alembic `backend/alembic_campaign/versions/006_campaign_state.py` com `modificado_em` nulo para bancos legados.
- [X] T019 [US2] Atualizar criação/importação de mesa para registrar `criado_em` e instalar o hook transacional `before_flush` para gravar `CampaignState.modificado_em`; atualizar também mutações de configuração para gravar `Campanha.modificado_em` em `backend/app/campaign_db.py`, `backend/app/services/campanha_admin.py` e `backend/app/services/campaign_import.py`.
- [X] T020 [US2] Implementar listagem de metadados, filtros e data efetiva como máximo conhecido entre criação, configuração e `CampaignState` em `backend/app/services/admin_console.py`, lendo apenas a linha operacional de cada banco de campanha.
- [X] T021 [US2] Implementar estado reversível, transferência atômica de dono ativo e exclusão permanente idempotente em `backend/app/services/admin_console.py`, validando o caminho canônico sob `DATA_DIR/campanhas`, descartando engine em cache e preservando mesas irmãs.
- [X] T022 [US2] Expor `GET /campanhas`, `PATCH /campanhas/{id}/estado`, `PATCH /campanhas/{id}/proprietario` e `DELETE /campanhas/{id}` em `backend/app/routers/administrador.py` sob `require_admin` e schemas do contrato.
- [X] T023 [US2] Implementar lista de mesas com busca, filtro, proprietário, visibilidade separada de estado e formatação de data/indisponível em `frontend/src/components/admin/AdminCampaignsSection.tsx`, com copy em `frontend/src/locales/pt-BR/comum.json` e `frontend/src/locales/en/comum.json`.
- [X] T024 [US2] Implementar transferência para usuário ativo e controles de estado operacional em `frontend/src/components/admin/AdminCampaignsSection.tsx`, mostrando o resultado salvo sem confundir visibilidade e ativação.
- [X] T025 [US2] Implementar confirmação de exclusão identificando nome e slug, aviso permanente e estados de erro em `frontend/src/components/admin/AdminCampaignsSection.tsx`; integrar a seção no shell em `frontend/src/pages/AdminConsolePage.tsx`.
- [X] T026 [US2] Cobrir pesquisa, filtro, datas, transferência, desativação/reativação e exclusão de mesa com verificação de mesa irmã em `frontend/e2e/admin-console-campaigns.spec.ts`.

**Checkpoint**: a gestão de mesa opera sobre metadados e armazenamento da mesa confirmada; leituras não alteram última modificação e campanhas irmãs permanecem preservadas.

---

## Phase 5: User Story 3 — Autorização do console (Priority: P1)

**Goal**: Garantir que somente administradores vejam dados globais ou concluam operações, inclusive por acesso direto às rotas.

**Independent Test**: Anônimo recebe 401 e usuário autenticado sem `is_admin` recebe 403 em todas as rotas do contrato e não vê a tela; administrador acessa os dois painéis. Nenhuma tentativa recusada altera dados.

### Tests for User Story 3

- [X] T027 [P] [US3] Consolidar a matriz de anônimo/não-admin/admin para todos os endpoints de usuário, convite/reset e mesa, verificando ausência de vazamento e mutação em `backend/tests/test_admin_console_auth.py`.
- [X] T028 [P] [US3] Cobrir acesso direto à página, redirecionamento de anônimo/não-admin, navegação admin condicional e compatibilidade de `/admin/convites` em `frontend/e2e/admin-console-auth.spec.ts`.

### Implementation for User Story 3

- [X] T029 [US3] Fechar os casos encontrados pela matriz na dependência `require_admin` e na validação de página em `backend/app/routers/administrador.py`, `frontend/src/pages/AdminConsolePage.tsx`, `frontend/src/pages/AdminConvitesPage.tsx` e `frontend/src/components/layout/UserMenu.tsx`, sem depender da proteção visual como controle de API.

**Checkpoint**: a matriz completa comprova a autorização em servidor e interface e confirma ausência de mutações para requisições recusadas.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar os fluxos completos, traduções, regressões e segurança antes do handoff.

- [X] T030 [P] Revisar todas as chaves e estados de erro de administração em `frontend/src/locales/pt-BR/comum.json` e `frontend/src/locales/en/comum.json`, incluindo duplicidade, usuário inexistente, conta pendente/inativa, último admin, proprietário bloqueado e data indisponível.
- [ ] T031 Executar testes de backend e migrações descritos em `specs/148-administracao-usuarios-mesas/quickstart.md` e corrigir falhas nos arquivos de teste/implementação correspondentes.
- [X] T032 Executar `npm run build` e os E2E `admin-console-users.spec.ts`, `admin-console-campaigns.spec.ts` e `admin-console-auth.spec.ts` descritos em `specs/148-administracao-usuarios-mesas/quickstart.md`; corrigir regressões nos caminhos indicados.
- [X] T033 Fazer revisão manual de exclusão usando `DATA_DIR` descartável e registrar o resultado em `specs/148-administracao-usuarios-mesas/quickstart.md`, confirmando árvore UUID correta, recuperação de falha e preservação de mesa irmã e dados de membros.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 prepara identidade e fixtures para testes isolados.
- **Foundational (Phase 2)**: depende de T001; schemas, cliente tipado e shell precedem as duas áreas do console.
- **US1 (Phase 3)** e **US2 (Phase 4)**: dependem da fundação. Podem começar em paralelo depois dela se cada história mantiver seus componentes separados; a integração final no shell/router compartilhado deve ser sequencial.
- **US3 (Phase 5)**: depende de US1 e US2 para executar a matriz contra todas as rotas existentes.
- **Polish (Phase 6)**: depende das três histórias concluídas.

### User Story Dependencies

- **US1 (P1)**: independente de US2 após a fundação; entrega gestão de usuários/convites/reset.
- **US2 (P1)**: independente de US1 após a fundação; transfere proprietário por endpoint próprio e pode ser demonstrada com contas fixture ativas.
- **US3 (P1)**: fecha a validação de autorização sobre as operações entregues por US1/US2; usa `require_admin` existente.

### Parallel Opportunities

- T005 e T006 escrevem testes em arquivos diferentes e podem ser desenvolvidas em paralelo após T001.
- T014, T015 e T016 cobrem superfícies distintas e podem ser escritas em paralelo antes da implementação de US2.
- T017 (control DB) e T018 (campaign DB) alteram árvores Alembic diferentes e podem avançar em paralelo depois que os testes T014/T016 falharem como esperado.
- T023/T024/T025 usam o mesmo `AdminCampaignsSection.tsx` e devem ser executadas em sequência; T022 também integra o router compartilhado.
- US1 e US2 podem ter seus testes e componentes isolados em paralelo, mas serviços, router, locales e shell têm arquivos compartilhados e requerem integração sequencial.

## Parallel Example: User Story 2 migration tests

```text
Após T001–T013 e antes de migrations:
Trabalho A: T014 — migrações e retrocompatibilidade em backend/tests/test_admin_console_migration.py
Trabalho B: T016 — data de modificação em backend/tests/test_campaign_modified_at.py
Trabalho C: T015 — API, autorização e isolamento em backend/tests/test_admin_console_campaigns.py

Depois de confirmar os testes falhando:
Trabalho A: T017 — modelo e migration de control.db
Trabalho B: T018 — modelo e migration de cada campanha
```

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Setup e Foundational (T001–T004).
2. Escrever os testes de usuário (T005–T006) e confirmá-los falhando.
3. Implementar listagem, convite/reset, estado e exclusão segura (T007–T013).
4. Validar isoladamente a jornada de contas com T013 antes de iniciar US2.

### Incremental Delivery

1. Entregar console protegido e gestão de usuários como MVP.
2. Adicionar gestão de mesas, migrações e timestamps com testes de isolamento.
3. Fechar matriz de autorização sobre todas as rotas e E2E de papéis.
4. Rodar build, quickstart e revisão de exclusão em dados descartáveis.

## Notes

- Todas as tarefas seguem `- [ ] TNNN [P?] [US?] descrição com caminho de arquivo`.
- `[P]` aparece somente em tarefas sem dependência e com arquivos distintos.
- As rotas globais não leem narrativa; os testes de exclusão devem verificar o caminho da mesa confirmada e a preservação das demais.
- A tarefa T033 usa dados descartáveis e não deve apontar para `DATA_DIR` local de desenvolvimento ou produção.
