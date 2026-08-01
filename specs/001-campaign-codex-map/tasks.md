# Tasks: Codex da Campanha — Mapa Interativo

**Input**: Design documents from `/specs/001-campaign-codex-map/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados explicitamente na spec — omitidos (validação via quickstart.md na fase Polish).

**Organization**: Tasks agrupadas por user story (P1→P4). Scaffold monorepo já existe; tarefas focam em alinhar ao spec clarificado e completar gaps (admin UI, mobile, `data_sessao` string, seed opcional).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme spec.md
- Paths absolutos ao monorepo: `backend/`, `frontend/`, `deploy/`

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Deploy: `deploy/`, `docker-compose.yml`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar/alinhar o monorepo já scaffoldado ao plan

- [x] T001 Verify monorepo layout matches plan (`backend/app/`, `frontend/src/`, `deploy/`, `docker-compose.yml`, `.env.example`)
- [x] T002 [P] Align `backend/pyproject.toml` deps (fastapi, sqlmodel, uvicorn, slowapi, pydantic-settings, python-multipart, aiofiles) and document run scripts in `backend/README.md`
- [x] T003 [P] Align `frontend/package.json` deps (react-router-dom, react-zoom-pan-pinch) and Vite proxy for `/api` + `/uploads` in `frontend/vite.config.ts`
- [x] T004 [P] Confirm `.gitignore` excludes `.env`, `backend/.venv`, `backend/data/*.db`, `backend/uploads/**` (keep `.gitkeep`), `frontend/node_modules`, `frontend/dist`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelo de dados + API base alinhados ao data-model/contracts — bloqueia todas as stories

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase

- [x] T005 Change `Local.data_sessao` from `date` to optional `str` (max 100) in `backend/app/models/local.py` and recreate/migrate `backend/data/mapa.db` as needed
- [x] T006 [P] Update Pydantic schemas for free-text `data_sessao` in `backend/app/schemas/local.py`
- [x] T007 [P] Update TypeScript `Local` type (`data_sessao: string | null`) in `frontend/src/types/index.ts`
- [x] T008 Ensure `GrupoPosicao` singleton bootstrap (id=1, default 0.5/0.5) on `GET /api/grupo` in `backend/app/routers/public/grupo.py`
- [x] T009 [P] Verify public routers (`locais`, `npcs`, `arcos`, `grupo`) under `backend/app/routers/public/` match `specs/001-campaign-codex-map/contracts/openapi-outline.md`
- [x] T010 [P] Verify admin routers (`locais`, `npcs`, `arcos`, `grupo`, `uploads`) under `backend/app/routers/admin/` match the same contract (including PUT with new `x`/`y` for reposition)
- [x] T011 [P] Harden upload validation (MIME allowlist + size) in `backend/app/services/uploads.py` and wire `POST /api/admin/uploads` in `backend/app/routers/admin/uploads.py`
- [x] T012 Confirm CORS from env, SlowAPI on admin writes, no in-app auth, `DEBUG`/OpenAPI gated in `backend/app/main.py` and `backend/app/config.py`
- [x] T013 Add optional seed module `backend/app/seed.py` (prototype-like sample data) invoked only via explicit command / `SEED=1`, never on production startup
- [x] T014 [P] Confirm Caddy snippets protect `/admin*` and write methods to `/api/admin*` in `deploy/Caddyfile` and `deploy/Caddyfile.local` (no SPA password dialog)

**Checkpoint**: API pública + admin alinhadas; `data_sessao` string; seed opcional; Caddy documentado

---

## Phase 3: User Story 1 — Explorar o mapa e os locais visitados (Priority: P1) 🎯 MVP

**Goal**: Jogador vê mapa com pins e ícone do grupo, zoom/pan, abre detalhes do local com vínculos

**Independent Test**: Com seed de teste, abrir `/` sem login — mapa, zoom/pan, clique em pin → painel com nome, descrição, rótulo de sessão, arco, NPCs; legenda Local vs Grupo

### Implementation for User Story 1

- [x] T015 [US1] Load locais + grupo on MapPage via `frontend/src/hooks/useCampaignData.ts` and `frontend/src/api/campaign.ts`
- [x] T016 [US1] Render map image, pins (relative x/y), and party icon with zoom/pan (+/−/reset, wheel) in `frontend/src/components/map/CampaignMap.tsx` and `CampaignMap.css`
- [x] T017 [US1] Add map legend (Local vs Grupo) on map surface in `frontend/src/components/map/CampaignMap.tsx`
- [x] T018 [US1] Implement local detail panel (nome, descrição, `data_sessao` label, arco chip, NPC chips, optional image) in `frontend/src/components/common/LocalPanel.tsx`
- [x] T019 [US1] Wire pin click → select local → open panel; empty/placeholder map state in `frontend/src/pages/MapPage.tsx`
- [x] T020 [US1] Ensure default map URL / placeholder when no campaign map uploaded (`VITE_MAP_URL` or `/uploads/map/...`) in `frontend/src/pages/MapPage.tsx`

**Checkpoint**: US1 testável sozinha com seed; produção vazia mostra placeholder sem quebrar

---

## Phase 4: User Story 2 — Consultar locais, NPCs e história pelo menu (Priority: P2)

**Goal**: Menu Locais/NPCs/História com busca, expand/collapse e salto ao mapa; layout mobile

**Independent Test**: Só pelo menu, achar NPC e arco e saltar ao pin; em viewport ~375px usar barra inferior + voltar ao mapa

### Implementation for User Story 2

- [x] T021 [US2] Complete player Locais tab: search filter + click centers map and opens panel in `frontend/src/components/sidebar/SideMenu.tsx` and `frontend/src/pages/MapPage.tsx`
- [x] T022 [P] [US2] Complete player NPCs tab: list, expand detail, status tag, faction, local chips → center map in `frontend/src/components/sidebar/SideMenu.tsx` (and extract `NpcList`/`NpcDetail` under `frontend/src/components/sidebar/` if file grows)
- [x] T023 [P] [US2] Complete player História tab: arcos by `ordem`, expand events by local `id` order with `data_sessao` label, click → center pin in `frontend/src/components/sidebar/SideMenu.tsx`
- [x] T024 [US2] Navigate from LocalPanel arco/NPC chips to corresponding sidebar tab + selection in `frontend/src/pages/MapPage.tsx` and `frontend/src/components/common/LocalPanel.tsx`
- [x] T025 [US2] Implement mobile layout: bottom tab bar, overlay panel, back-to-map control in `frontend/src/pages/MapPage.tsx`, `MapPage.css`, and `frontend/src/components/sidebar/SideMenu.css` (breakpoint ~800px per prototype)
- [x] T026 [US2] Empty-state copy for empty locais/npcs/arcos lists in `frontend/src/components/sidebar/SideMenu.tsx`

**Checkpoint**: US1+US2; consulta lore &lt;30s via menu; mobile usável

---

## Phase 5: User Story 3 — GM gerencia locais no mapa (Priority: P3)

**Goal**: Em `/admin`, CRUD de locais com posicionar/reposicionar por clique no mapa; sem senha in-app

**Independent Test**: Em `/admin` (dev sem Caddy), criar pin por clique, editar+reposicionar, excluir com confirmação; em `/` após reload, jogador vê resultado

### Implementation for User Story 3

- [x] T027 [US3] Replace admin stub with campaign shell (map + tabs) in `frontend/src/pages/AdminPage.tsx` and `AdminPage.css` (no password dialog)
- [x] T028 [US3] Add admin Locais list (edit/delete) and “+ Novo local” → click-to-place mode with banner in `frontend/src/components/admin/LocalAdminList.tsx` (new) and map click handler on AdminPage
- [x] T029 [US3] Build local form dialog (nome, descrição, `data_sessao` free text, arco select, NPC multi-toggle, show x/y) in `frontend/src/components/admin/LocalFormDialog.tsx`
- [x] T030 [US3] Wire create/update/delete locais via `frontend/src/api/admin.ts` to `/api/admin/locais` from AdminPage
- [x] T031 [US3] Implement reposition-existing-local mode (click map → update draft x/y → save) in `frontend/src/pages/AdminPage.tsx` and `LocalFormDialog.tsx`
- [x] T032 [US3] Confirm-before-delete for locais in `frontend/src/components/admin/LocalAdminList.tsx`
- [x] T033 [US3] Ensure only one placement mode active at a time (new pin vs reposition vs group) in `frontend/src/pages/AdminPage.tsx`

**Checkpoint**: CRUD de locais completo; jogador vê após reload

---

## Phase 6: User Story 4 — GM gerencia NPCs, arcos e posição do grupo (Priority: P4)

**Goal**: CRUD NPCs/arcos, aba Grupo, uploads de imagens; auth só na borda

**Independent Test**: Criar NPC+arco, ligar a local, mover grupo, upload retrato/mapa; jogador vê após reload; com Caddy, `/admin` exige Basic Auth

### Implementation for User Story 4

- [x] T034 [P] [US4] Admin NPCs list + form (nome, descrição, facção, status) + delete confirm in `frontend/src/components/admin/NpcAdminList.tsx` and `NpcFormDialog.tsx`
- [x] T035 [P] [US4] Admin Arcos list + form (título, resumo, ordem) + delete confirm in `frontend/src/components/admin/ArcoAdminList.tsx` and `ArcoFormDialog.tsx`
- [x] T036 [US4] Wire NPC/arco admin API calls in `frontend/src/api/admin.ts` and mount lists on `frontend/src/pages/AdminPage.tsx`
- [x] T037 [US4] Add Grupo tab (show x/y, move-on-map mode) calling `PUT /api/admin/grupo` from `frontend/src/components/admin/GrupoAdminPanel.tsx` and AdminPage
- [x] T038 [US4] Image upload UI for map / local / portrait using `POST /api/admin/uploads` in `frontend/src/components/admin/ImageUploadField.tsx` and wire into forms
- [x] T039 [US4] On NPC/arco delete, rely on backend nullify/unlink behavior; refresh lists/map after success in AdminPage
- [x] T040 [US4] Document/verify edge Basic Auth path: no in-app password; update `README.md` with admin access via Caddy and validate `deploy/Caddyfile` match

**Checkpoint**: Ciclo GM completo pós-sessão; produção vazia sem seed

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade, deploy e validação E2E do quickstart

- [x] T041 [P] Apply nocturne/prototype-inspired tokens lightly in `frontend/src/styles/global.css` without requiring pixel-perfect DS parity
- [x] T042 [P] Optimize large map image loading (appropriate `img` attrs / optional progressive placeholder) in `frontend/src/components/map/CampaignMap.tsx`
- [x] T043 Ensure Docker build works: `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml` healthcheck and volumes
- [x] T044 Run full manual validation from `specs/001-campaign-codex-map/quickstart.md` scenarios A–D and fix gaps
- [x] T045 [P] Update root `README.md` with US1–US4 status, seed instructions, and link to spec/plan/tasks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup** → sem dependências
- **Phase 2 Foundational** → depende da Phase 1; **bloqueia** US1–US4
- **Phase 3 US1 (P1)** → após Phase 2 — MVP
- **Phase 4 US2 (P2)** → após Phase 2; integra com MapPage/US1
- **Phase 5 US3 (P3)** → após Phase 2; ideal após US1 (reusa mapa)
- **Phase 6 US4 (P4)** → após Phase 2; ideal após US3 (shell admin)
- **Phase 7 Polish** → após stories desejadas

### User Story Dependencies

- **US1**: Independente após foundation (precisa GET públicos + seed opcional)
- **US2**: Independente para listas; melhor com US1 para salto ao mapa
- **US3**: Pode começar em paralelo no backend; UI admin mapa beneficia de US1
- **US4**: Estende shell admin da US3; NPCs/arcos podem ser paralelizados entre si

### Parallel Opportunities

- T002–T004 em paralelo (Setup)
- T006–T007, T009–T011, T014 em paralelo (Foundational)
- T022–T023 em paralelo (US2)
- T034–T035 em paralelo (US4)
- T041–T042, T045 em paralelo (Polish)

---

## Parallel Example: User Story 2

```bash
# Em paralelo após T021 base do SideMenu:
Task: "T022 Complete player NPCs tab in frontend/src/components/sidebar/SideMenu.tsx"
Task: "T023 Complete player História tab in frontend/src/components/sidebar/SideMenu.tsx"
```

## Parallel Example: User Story 4

```bash
Task: "T034 Admin NPCs list + form in frontend/src/components/admin/NpcAdminList.tsx"
Task: "T035 Admin Arcos list + form in frontend/src/components/admin/ArcoAdminList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2  
2. Phase 3 (US1)  
3. **STOP** — validar mapa + pins + painel com seed  
4. Demo leitura pública

### Incremental Delivery

1. Foundation → US1 (MVP mapa)  
2. US2 (menu + mobile)  
3. US3 (CRUD locais)  
4. US4 (NPCs, arcos, grupo, uploads + Caddy)  
5. Polish + quickstart A–D

### Suggested MVP Scope

**Phases 1–3 only (T001–T020)** — jogador explora mapa e detalhes de locais.

---

## Notes

- Scaffold já cobre grande parte do backend; não recriar do zero — alinhar e completar
- Sem tasks de teste automatizado (não pedidos na spec); usar quickstart
- Commit após cada task ou grupo lógico
- Nunca adicionar dialog de senha na SPA
