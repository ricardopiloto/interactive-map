# Tasks: Alinhamento total com o protótipo

**Input**: Design documents from `/specs/003-align-prototype-ui/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados na spec — omitidos (validação via `quickstart.md` na fase Polish).

**Organization**: Tasks por user story (P1→P2). Monorepo já existe; foco em Nocturne, shell in-page, modal, slots, `formato` do grupo e Basic Auth.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US5 conforme spec.md
- Paths relativos à raiz do monorepo

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`
- Protótipo (referência): `prototype/`
- Deploy: `deploy/`, `.env.example`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar referências e scaffolding de pastas para a paridade UI

- [x] T001 Confirm feature docs present under `specs/003-align-prototype-ui/` (`plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)
- [x] T002 [P] Create dirs `frontend/src/styles/`, `frontend/src/components/media/`, `frontend/src/components/gm/` if missing
- [x] T003 [P] Ensure `.env.example` documents `ADMIN_USER` and `ADMIN_PASSWORD` for fail-closed admin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens Nocturne, auth API, campo `formato`, primitives de mídia/shell — bloqueia todas as stories

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase

- [x] T004 Port tokens + component classes from `prototype/nocturne.css` into `frontend/src/styles/nocturne.css` (`.btn`, `.card`, `.seg`, `.dialog`, `.tag`, `.input`, colors, space, radius, shadow)
- [x] T005 Wire `frontend/src/styles/nocturne.css` in `frontend/src/main.tsx` (or `global.css` import) and strip amber/brown hardcoded palette from `frontend/src/styles/global.css`
- [x] T006 Add `ADMIN_USER` / `ADMIN_PASSWORD` to `backend/app/config.py` (fail closed when unset for admin)
- [x] T007 [P] Implement HTTP Basic `verify_admin` in `backend/app/deps/auth.py`
- [x] T008 Apply `Depends(verify_admin)` to all routers under `backend/app/routers/admin/` and add optional `GET /api/admin/session` probe
- [x] T009 Add `formato` (`bandeira` \| `brasao`, default `bandeira`) to `backend/app/models/grupo.py` and migrate/alter `backend/data/mapa.db` as needed
- [x] T010 [P] Update `GrupoPosicaoRead` / `GrupoPosicaoUpdate` in `backend/app/schemas/grupo.py` and public/admin grupo routers to expose/accept `formato`
- [x] T011 [P] Update TypeScript `GrupoPosicao` type with `formato` in `frontend/src/types/index.ts` (or equivalent types file)
- [x] T012 [P] Create `ImageSlot` component in `frontend/src/components/media/ImageSlot.tsx` + `ImageSlot.css` (placeholder, drag/choose, preview; `editable` prop)
- [x] T013 Add admin Basic Auth header helpers + sessionStorage credential store in `frontend/src/api/client.ts` and `frontend/src/api/admin.ts`
- [x] T014 Scaffold shell mode state (`jogador` / gate / `gm`) and corner control stubs in `frontend/src/pages/MapPage.tsx` (without full CRUD yet)

**Checkpoint**: Nocturne carregado; `/api/admin/*` exige Basic Auth; `GET /api/grupo` retorna `formato`; ImageSlot existe; MapPage tem modo stub

---

## Phase 3: User Story 1 — Experiência visual e de mapa idêntica ao protótipo (Priority: P1) 🎯 MVP

**Goal**: Jogador vê Codex com Nocturne, pins gota, grupo (formato), zoom chrome e legenda como no protótipo

**Independent Test**: Side-by-side com `prototype/Mapa da Campanha.dc.html` (jogador) — cores, tipografia, pin/grupo, +/−/1:1, legenda; sem tema âmbar

### Implementation for User Story 1

- [x] T015 [US1] Restyle map chrome (zoom +/−/1:1, legend Local/Grupo) to match prototype in `frontend/src/components/map/CampaignMap.tsx` and `CampaignMap.css`
- [x] T016 [US1] Implement teardrop/gota pin shape + selected state in `frontend/src/components/map/CampaignMap.css` (and markup in `CampaignMap.tsx`)
- [x] T017 [US1] Render group icon as `bandeira` or `brasao` from `grupo.formato` in `frontend/src/components/map/CampaignMap.tsx` / `CampaignMap.css`
- [x] T018 [US1] Align desktop shell layout (sidebar brand “Codex da Campanha”, map header) with Nocturne in `frontend/src/pages/MapPage.tsx`, `MapPage.css`, and `frontend/src/components/sidebar/SideMenu.tsx` / `SideMenu.css`
- [x] T019 [US1] Replace remaining amber component colors in map/sidebar CSS with Nocturne tokens (`CampaignMap.css`, `SideMenu.css`, `MapPage.css`, `LocalPanel.css` if still present)

**Checkpoint**: US1 testável — visual do mapa/shell alinhado; formato do grupo refletido na leitura pública

---

## Phase 4: User Story 2 — Pin abre modal de leitura como no protótipo (Priority: P1)

**Goal**: Clique no pin/lista abre dialog Nocturne (backdrop, mídia, chips, Fechar)

**Independent Test**: Clicar pin → dialog com imagem/slot, meta, descrição, chips; backdrop/Fechar fecha; chips navegam abas

### Implementation for User Story 2

- [x] T020 [US2] Create `PinModal` dialog (backdrop, title, `data_sessao`, body, arco/NPC chips, Fechar) in `frontend/src/components/common/PinModal.tsx` + `PinModal.css`
- [x] T021 [US2] Use read-only `ImageSlot` for local image inside `PinModal.tsx`
- [x] T022 [US2] Wire pin click and local list selection to open `PinModal` in `frontend/src/pages/MapPage.tsx`; remove/retire floating `LocalPanel` usage
- [x] T023 [US2] Implement chip navigation (arco → História, NPC → NPCs) closing modal in `PinModal.tsx` and `MapPage.tsx`
- [x] T024 [US2] Close on backdrop click and Fechar; preserve feature 002 map placeholder rules in `CampaignMap.tsx` / `MapPage.tsx`

**Checkpoint**: US2 testável — modal de pin fiel ao protótipo

---

## Phase 5: User Story 5 — Área logada do GM alinhada ao protótipo (Priority: P1)

**Goal**: Gate no canto → Modo GM in-page (CRUD, banners, dialogs, slot do mapa, escolha bandeira/brasão); `/admin` não é jornada principal

**Independent Test**: Na mesma URL `/`, autenticar sem dica de senha; CRUD local/NPC/arco; mover grupo; trocar formato; upload no slot do mapa; sair; senha errada bloqueia

### Implementation for User Story 5

- [x] T025 [US5] Build `AdminGateDialog` (“Acesso do Mestre”, password only, no hint) in `frontend/src/components/gm/AdminGateDialog.tsx` using Nocturne `.dialog`
- [x] T026 [US5] Wire corner actions + badge “Modo GM” / “Modo GM · Sair” and session probe via `GET /api/admin/session` in `frontend/src/pages/MapPage.tsx`
- [x] T027 [US5] In-page admin lists (Locais/NPCs/História) with Editar/Excluir/+ Novo using cards/buttons Nocturne under `frontend/src/components/gm/` (reuse/adapt from `frontend/src/components/admin/*`)
- [x] T028 [US5] Port form dialogs (local, NPC, arco) to Nocturne dialogs with editable `ImageSlot` for local image and NPC portrait in `frontend/src/components/gm/` (or updated admin form components)
- [x] T029 [US5] Placement banners + click-to-place/reposition/move-group in `CampaignMap.tsx` and `MapPage.tsx` matching prototype copy
- [x] T030 [US5] Map background `ImageSlot` editable only in Modo GM (upload via `POST /api/admin/uploads`) in `CampaignMap.tsx` / `MapPage.tsx`
- [x] T031 [US5] Grupo tab: move icon + formato selector (`bandeira`/`brasao`) calling `PUT /api/admin/grupo` in `frontend/src/components/gm/GrupoAdminPanel.tsx` (or adapt `GrupoAdminPanel.tsx`)
- [x] T032 [US5] Redirect `/admin` to `/` opening gate (or remove separate shell) in `frontend/src/App.tsx` and deprecate `AdminPage.tsx` as primary UX
- [x] T033 [US5] Ensure failed auth never shows edit lists; Cancel on gate returns to jogador in `MapPage.tsx` / `AdminGateDialog.tsx`

**Checkpoint**: US5 testável — Modo GM in-page completo; API 401 sem credencial

---

## Phase 6: User Story 3 — Menu jogador (Locais / NPCs / História) como no protótipo (Priority: P2)

**Goal**: Seg tabs, cards, busca, expansão NPC/arco fiéis ao protótipo

**Independent Test**: Percorrer três abas vs protótipo — estrutura e hierarquia visual iguais

### Implementation for User Story 3

- [x] T034 [US3] Restyle tab control as Nocturne `.seg` in `frontend/src/components/sidebar/SideMenu.tsx` / `SideMenu.css`
- [x] T035 [P] [US3] Restyle Locais list as cards (kicker arco, title) + search field `.input` in `SideMenu.tsx` / `SideMenu.css`
- [x] T036 [P] [US3] Restyle NPCs list: circular `ImageSlot` portrait, status `.tag`, expand panel with faction + local chips in `SideMenu.tsx`
- [x] T037 [US3] Restyle História: expandable arcs + session-labeled events clicking to pin/modal in `SideMenu.tsx` and `MapPage.tsx`

**Checkpoint**: US3 testável — menu jogador visualmente alinhado

---

## Phase 7: User Story 4 — Mobile como no protótipo (Priority: P2)

**Goal**: Mapa full-bleed, bottom bar, overlay, `‹ Mapa`

**Independent Test**: Viewport ~375–800px — barra inferior, overlay, retorno ao mapa; Modo GM ainda usável

### Implementation for User Story 4

- [x] T038 [US4] Align mobile bottom tab bar and overlay panel styles to prototype in `frontend/src/pages/MapPage.css` and `SideMenu.css`
- [x] T039 [US4] Ensure “‹ Mapa” control and panel open/close match prototype behavior in `MapPage.tsx` / `SideMenu.tsx`
- [x] T040 [US4] Verify PinModal and AdminGateDialog usable on narrow viewports (`PinModal.css`, `AdminGateDialog` styles, `MapPage.css`)

**Checkpoint**: US4 testável — mobile parity

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Docs, seed, limpeza, validação quickstart

- [x] T041 [P] Update seed to set `grupo.formato = "bandeira"` in `backend/app/seed.py`
- [x] T042 [P] Update README auth/UI notes (in-page GM, no password hint) in `README.md`
- [x] T043 Remove dead amber CSS / unused `LocalPanel` if fully replaced; delete or stub obsolete admin-only chrome in `frontend/src/pages/AdminPage.tsx` / `AdminPage.css`
- [x] T044 Run validation scenarios A–D from `specs/003-align-prototype-ui/quickstart.md` and fix gaps against `contracts/ui-parity.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as stories
- **US1 (Phase 3)**: Após Foundational — MVP visual
- **US2 (Phase 4)**: Após Foundational; ideal após US1 (tokens/dialog já no mapa)
- **US5 (Phase 5)**: Após Foundational (auth + formato); beneficia de US1/US2 (shell/modal)
- **US3 (Phase 6)**: Após Foundational; ideal após US1 (Nocturne no shell)
- **US4 (Phase 7)**: Após US3 layout de abas (ou em paralelo se mobile só de CSS)
- **Polish (Phase 8)**: Após stories desejadas

### User Story Dependencies

- **US1 (P1)**: Só Foundational
- **US2 (P1)**: Foundational; integra seleção de pin do mapa (US1)
- **US5 (P1)**: Foundational (auth, formato, ImageSlot); reutiliza shell MapPage
- **US3 (P2)**: Foundational; compartilha SideMenu com US1
- **US4 (P2)**: Depende do shell/abas (US1/US3)

### Parallel Opportunities

- T002–T003; T007; T010–T012 em Foundational
- T035–T036 em US3
- T041–T042 em Polish
- Após Foundational: US1 e início de US5 (auth UI) podem paralelizar se arquivos distintos; US2 após PinModal não conflitar com CampaignMap pin CSS

---

## Parallel Example: Foundational

```bash
Task: "Implement HTTP Basic verify_admin in backend/app/deps/auth.py"
Task: "Update GrupoPosicao schemas in backend/app/schemas/grupo.py"
Task: "Create ImageSlot in frontend/src/components/media/ImageSlot.tsx"
Task: "Update GrupoPosicao TypeScript type in frontend/src/types/index.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Restyle Locais cards in SideMenu.tsx / SideMenu.css"
Task: "Restyle NPCs list with ImageSlot in SideMenu.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup
2. Phase 2 Foundational (CRITICAL)
3. Phase 3 US1 — validar side-by-side cores/pins/zoom
4. **STOP** e revisar visual antes de modal/GM

### Incremental Delivery

1. Setup + Foundational
2. US1 → demo visual mapa
3. US2 → demo modal pin
4. US5 → demo Modo GM in-page (aceite principal do GM)
5. US3 → menu polido
6. US4 → mobile
7. Polish + quickstart A–D

### Parallel Team Strategy

1. Juntos: Setup + Foundational
2. Dev A: US1 → US2
3. Dev B: US5 (auth UI + CRUD in-page)
4. Dev C: US3 → US4
5. Integrar no MapPage; Polish conjunto

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- Sem tasks de teste automatizado (spec não pediu)
- Fonte de verdade visual: `prototype/` + `contracts/ui-parity.md`
- Preservar feature 002 (placeholder só se mapa ausente/falhou)
- Gate **nunca** mostra senha de demonstração
