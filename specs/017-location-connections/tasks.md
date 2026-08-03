# Tasks: Conexões entre locais no mapa

**Input**: Design documents from `/specs/017-location-connections/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) linhas no foco; US2 (P2) cadastro no formulário; US3 (P3) legibilidade/interação.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 / US3 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhar contratos e decisões de research antes de codar

- [x] T001 Skim `specs/017-location-connections/contracts/api-local-saidas.md`, `contracts/ui-map-connection-lines.md`, and `research.md` (link dirigido, SVG no stage, só `selectedLocalId`)
- [x] T002 [P] Locate Local CRUD sync pattern (`npc_ids`) in `backend/app/routers/admin/locais.py`, `backend/app/schemas/local.py`, and pin stage layout in `frontend/src/components/map/CampaignMap.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persistir e expor `saida_ids` — bloqueia desenho real e o formulário GM

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 Add `LocalConexaoLink` (`origem_id`, `destino_id`) in `backend/app/models/links.py` and export from `backend/app/models/__init__.py`
- [x] T004 Wire optional relationship / usage of `LocalConexaoLink` from `backend/app/models/local.py` (or query-based sync only — keep consistent with research)
- [x] T005 Add `saida_ids` to Local create/update/read schemas in `backend/app/schemas/local.py`
- [x] T006 Implement `_sync_saidas` + include `saida_ids` in `_to_read` / create / update / delete cascade in `backend/app/routers/admin/locais.py` and `backend/app/routers/public/locais.py` (reject self-link; dedupe; delete local clears origem+destino links)
- [x] T007 [P] Add `saida_ids: number[]` to `Local` in `frontend/src/types/index.ts` and to admin local payload in `frontend/src/api/admin.ts`

**Checkpoint**: `GET /api/locais` returns `saida_ids`; admin PUT com `saida_ids` persiste; create_all cria `local_conexao`

---

## Phase 3: User Story 1 — Ver saídas no mapa ao focar (Priority: P1) 🎯 MVP

**Goal**: Com um local selecionado/aberto, desenhar linhas simples origem→destinos; sem seleção, nenhuma linha

**Independent Test**: Com A→B e A→C via API/seed, abrir pin A → duas linhas; fechar → some; abrir B sem saídas → sem linhas; hover não mostra linhas

### Implementation for User Story 1

- [x] T008 [US1] Draw connection overlay (SVG or equivalent) inside `.campaign-map__stage` in `frontend/src/components/map/CampaignMap.tsx` when `selectedLocalId` is set, using that local’s `saida_ids` and destination `x`/`y` (percent coords like pins)
- [x] T009 [US1] Style lines (simple stroke, no arrow/label, `pointer-events: none`, under pins) in `frontend/src/components/map/CampaignMap.css`
- [x] T010 [US1] Ensure hover (`hoveredLocalId`) does not render lines and clearing `selectedLocalId` hides lines in `frontend/src/components/map/CampaignMap.tsx` / `frontend/src/pages/MapPage.tsx`

**Checkpoint**: SC-001 / SC-005 / FR-003 / FR-004 / FR-005 / FR-006

---

## Phase 4: User Story 2 — GM cadastra saídas no formulário (Priority: P2)

**Goal**: Multi-seleção de destinos no formulário do local; save/load `saida_ids`

**Independent Test**: Modo GM → editar A → marcar B/C → salvar → recarregar → abrir A vê linhas; desmarcar C → some; próprio local não selecionável

### Implementation for User Story 2

- [x] T011 [US2] Add `saida_ids` to `LocalFormDraft` / `localToDraft` and Saídas multi-select (exclude self) in `frontend/src/components/admin/LocalFormDialog.tsx` (pass other `locais` as options)
- [x] T012 [US2] Thread `locais` into `LocalFormDialog` and persist `saida_ids` on create/update in `frontend/src/pages/MapPage.tsx` (new draft defaults `saida_ids: []`)

**Checkpoint**: SC-003 / FR-007 / FR-008 / FR-009 / FR-011

---

## Phase 5: User Story 3 — Legibilidade e interação (Priority: P3)

**Goal**: Hub com muitas saídas usável; linhas não bloqueiam pins/placement/zoom

**Independent Test**: ≥5 saídas em A; zoom/pan; clicar pins; placement GM não bloqueado

### Implementation for User Story 3

- [x] T013 [US3] Verify/adjust z-index and `pointer-events` so pins and stage clicks work with overlay in `frontend/src/components/map/CampaignMap.css` / `CampaignMap.tsx`
- [x] T014 [US3] Confirm delete-local cascade leaves no ghost lines (admin delete path in `backend/app/routers/admin/locais.py`) and map stays usable after destination removal

**Checkpoint**: SC-004 / US3 acceptance / FR-010

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Seed opcional, docs e quickstart A–E

- [x] T015 [P] Optionally seed 1–2 example connections in `backend/app/seed.py`
- [x] T016 [P] Mention location connections / `saida_ids` briefly in `README.md` (and `frontend/README.md` if GM form section lists fields)
- [x] T017 Run scenarios A–E from `specs/017-location-connections/quickstart.md` and fix gaps in map/form/API files above

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003–T007)** → **US1** → **US2** → **US3** → **Polish**
- US1 precisa de `saida_ids` na API (Foundational); dados de teste via PUT admin ou seed (T015)
- US2 desbloqueia cadastro pela UI (recomendado antes do quickstart completo)

### User Story Dependencies

- **US1**: Overlay + `selectedLocalId` (após Foundational)
- **US2**: Formulário (após Foundational; valida US1 com dados reais pela UI)
- **US3**: Refino sobre US1 overlay + delete cascade

### Parallel Opportunities

- T001 ∥ T002
- T007 ∥ T003–T006 (após T003 model existir, types/API client pode seguir em paralelo ao fim do sync)
- T015 ∥ T016 após stories
- T008/T009 sequenciais no mesmo CSS/TSX area (cuidado com conflito)

---

## Parallel Example: Foundational + Types

```bash
# Após T003 link model:
Task: "T005 schemas saida_ids"
Task: "T006 routers sync"
# Em paralelo perto do fim:
Task: "T007 frontend types + admin payload"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational
2. PUT admin `saida_ids` em A → B,C
3. US1 overlay → **STOP** e validar quickstart A/B
4. US2 formulário → US3 → Polish

### Incremental Delivery

1. API `saida_ids` + tabela
2. Linhas no foco (MVP jogador)
3. Formulário GM
4. Hub/cascade polish + quickstart A–E

---

## Notes

- [P] = paralelizável
- Sem testes automatizados
- Não desenhar no hover; sem setas; sem modo ligar pins no mapa
- Espelhar padrão `npc_ids` / `_sync_npcs` para `_sync_saidas`
