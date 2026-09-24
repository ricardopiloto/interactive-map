---

description: "Task list template for feature implementation"
---

# Tasks: Administrador da aplicação e convites de mestres

**Input**: Design documents from `/specs/129-administrador-convites/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/cli-promover-admin.md](./contracts/cli-promover-admin.md), [contracts/post-admin-convites.md](./contracts/post-admin-convites.md)

**Tests**: Autenticação/permissões MUST ter teste a falhar antes da implementação (Constitution II) — matriz de rotas admin e CLI de promoção/rebaixamento.

**Organization**: 3 user stories, todas P1 — US2 (CLI) bloqueia US1 (não dá pra testar a UI sem um admin já existir); US3 (negação) valida o endpoint que US1 cria.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivo diferente, sem dependência de tarefa incompleta)
- **[Story]**: US1, US2 ou US3

## Path Conventions

`backend/app/` (FastAPI) + `frontend/src/` (React).

---

## Phase 1: Foundational — schema e guarda de permissão

**Purpose**: Peça que as três user stories usam.

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase terminar.

- [X] T001 [P] Criar migração `backend/alembic_control/versions/006_usuario_is_admin.py` — adiciona `is_admin BOOLEAN NOT NULL DEFAULT 0` à tabela `usuario` (revisão após `005_genero.py`)
- [X] T002 [P] Adicionar `is_admin: bool = Field(default=False)` ao model `Usuario` em `backend/app/models/usuario.py`
- [X] T003 Adicionar `require_admin(usuario: Usuario = Depends(require_session_user)) -> Usuario` em `backend/app/deps/auth.py`, checando `usuario.is_admin` (403 se falso) — mesmo padrão de `require_dono`, sem `slug` (depende de T002)

**Checkpoint**: coluna existe, guarda pronta pra ser usada por rotas.

---

## Phase 2: User Story 2 - Operador promove o primeiro administrador via CLI (Priority: P1)

**Goal**: existir pelo menos um administrador antes de qualquer teste da UI.

**Independent Test**: `usuario promover-admin --email X` seguido de `usuario rebaixar-admin --email X`, confirmando o estado de `is_admin` em cada passo.

### Implementation for User Story 2

- [X] T004 [US2] Adicionar `promote_admin(session, email)` e `demote_admin(session, email)` em `backend/app/services/auth_admin.py` — mesma validação de usuário-existe-e-ativo que `assign_owner` já usa (depende de T002)
- [X] T005 [US2] Adicionar subcomandos `usuario promover-admin --email` e `usuario rebaixar-admin --email` em `backend/app/cli.py`, chamando T004 (depende de T004)
- [X] T006 [P] [US2] Teste `backend/tests/test_cli_promover_admin.py` — promover, rebaixar, e-mail inexistente, e-mail inativo (depende de T005)

**Checkpoint**: dá pra bootstrapar um administrador só com acesso ao servidor.

---

## Phase 3: User Story 1 - Administrador convida um novo mestre pela interface (Priority: P1) 🎯 MVP

**Goal**: tela + endpoint funcionando de ponta a ponta pra um administrador já promovido (Phase 2).

**Independent Test**: autenticado como administrador (promovido via Phase 2), abrir `/admin/convites`, criar um convite, confirmar que o link funciona no fluxo de ativação já existente.

### Implementation for User Story 1

- [X] T007 [US1] Criar `backend/app/routers/administrador.py` — `APIRouter(prefix="/api/admin", dependencies=[Depends(require_admin)])` com `POST /convites`, chamando `create_usuario_with_invite` sem duplicar lógica (depende de T003)
- [X] T008 [US1] Montar o router novo em `backend/app/main.py` (`app.include_router(administrador.router)`) (depende de T007)
- [X] T009 [US1] `me()` em `backend/app/routers/auth.py` passa a retornar `{email, id, is_admin}` (depende de T002)
- [X] T010 [P] [US1] Frontend: tipar `is_admin` no retorno de `authApi.me()` e adicionar `adminConvitesApi.criar(email)` em `frontend/src/api/client.ts` (depende de T008, T009)
- [X] T011 [US1] Criar `frontend/src/pages/AdminConvitesPage.tsx` — formulário de e-mail, exibição do link gerado, erro de e-mail duplicado (depende de T010)
- [X] T012 [US1] Rota `/admin/convites` em `frontend/src/App.tsx`, guardada client-side por `me().is_admin` (redireciona se não-admin — a guarda real continua sendo o backend) (depende de T011)
- [X] T013 [US1] Item de menu condicional a `is_admin` em `frontend/src/components/layout/UserMenu.tsx` (depende de T012)
- [X] T014 [P] [US1] Chaves i18n novas (formulário, erros, link gerado) em `frontend/src/locales/pt-BR/comum.json` e `en/comum.json` (depende de T011)

**Checkpoint**: administrador consegue convidar um mestre sem terminal, ponta a ponta.

---

## Phase 4: User Story 3 - Mestre comum não acessa a gestão de convites (Priority: P1)

**Goal**: garantir a contraparte de segurança da US1, sem regressão na criação de campanha.

**Independent Test**: mestre sem `is_admin` não vê o menu, recebe 403 no endpoint direto, e continua criando campanhas normalmente.

### Implementation for User Story 3

- [X] T015 [US3] Teste `backend/tests/test_admin_convites_route_matrix.py` — anónimo → 401, mestre sem `is_admin` → 403, administrador → sucesso real (depende de T008)
- [X] T016 [US3] Confirmar (teste ou verificação manual) que `POST /api/campanhas` (criação de campanha) continua sem nenhuma checagem de `is_admin` — regressão explícita da FR-007 (depende de T008)

**Checkpoint**: as três histórias funcionam juntas.

---

## Phase Final: Polish & Validação

- [X] T017 [P] Rodar `cd backend && python -m pytest -q` (suíte completa) e `cd frontend && npx tsc --noEmit`
- [X] T018 Executar os 5 cenários do `quickstart.md`

---

## Dependencies & Execution Order

Foundational (T001-T003) → US2 (T004-T006) → US1 (T007-T014) → US3 (T015-T016) → Polish.

Apesar das três histórias serem P1, a ordem importa na prática: US1 não é testável sem um admin (US2), e US3 testa o endpoint que US1 cria.

## Parallel Opportunities

T001+T002 (arquivos diferentes); T010+T014 dentro de US1 (arquivos diferentes, ambos após T009); T017 roda backend/frontend em paralelo.

## Notes

- Sem infraestrutura de e-mail — o link é só exibido na tela, o administrador copia e envia manualmente (mesmo padrão da CLI hoje).
- Listagem/revogação de convites pendentes fica fora do escopo (ver Assumptions em `spec.md`).
