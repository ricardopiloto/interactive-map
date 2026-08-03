# Tasks: Evitar diálogo de mapa ao clicar em modo GM

**Input**: Design documents from `/specs/006-fix-gm-map-click/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: Duas user stories (P1 bugfix clique → file picker; P2 ação explícita de substituir mapa). Preferir não alterar `ImageSlot` globalmente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar causa raiz e contrato de gatilhos

- [x] T001 Confirm bug path: `mapEditable={isGm}` in `frontend/src/pages/MapPage.tsx` drives editable `ImageSlot` in `frontend/src/components/map/CampaignMap.tsx` whose click opens file input (`frontend/src/components/media/ImageSlot.tsx`)
- [x] T002 [P] Skim `specs/006-fix-gm-map-click/contracts/ui-map-upload-triggers.md` and `research.md` (loaded map = non-uploadable surface; explicit replace control; leave ImageSlot portraits/locais unchanged)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Baseline de renderização do mapa sem upload por clique — compartilhado pelas stories

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 In `frontend/src/components/map/CampaignMap.tsx`, when `mapEditable && showImage`, stop mounting editable `ImageSlot` as the map surface; render non-clickable `<img>` (same pattern as non-editable branch) so generic stage clicks cannot open a file picker
- [x] T004 Keep empty/failed map path for GM usable: when `mapEditable && !showImage`, still allow loading via editable `ImageSlot` (or equivalent) in `frontend/src/components/map/CampaignMap.tsx` per FR-004

**Checkpoint**: Em modo GM com mapa visível, cliques no stage **não** abrem seletor (MVP parcial); upload ainda possível só no estado vazio/falha até US2

---

## Phase 3: User Story 1 — Usar o mapa em modo GM sem diálogo de arquivo (Priority: P1) 🎯 MVP

**Goal**: Com mapa carregado, cliques genéricos e fluxos de placement não abrem o seletor de arquivo

**Independent Test**: Modo GM + mapa visível → vários cliques no mapa e um fluxo add-pin/reposition/move-group → **0** diálogos de arquivo; posição ainda funciona

### Implementation for User Story 1

- [x] T005 [US1] Verify `handleStageClick` / placement flows in `frontend/src/components/map/CampaignMap.tsx` still fire when placing and are not blocked by leftover upload handlers on the map surface
- [x] T006 [US1] Confirm mode jogador path unchanged: `mapEditable={false}` in `frontend/src/pages/MapPage.tsx` never exposes map file picker (FR-005)
- [x] T007 [US1] Smoke-check pin/controls clicks do not open map file picker; ensure no accidental `ImageSlot` editable wrapper remains over the loaded map in `CampaignMap.tsx`

**Checkpoint**: US1 testável — SC-001/SC-002/FR-001/FR-002; substituição com mapa carregado ainda pode faltar até US2

---

## Phase 4: User Story 2 — Substituir o mapa de forma intencional (Priority: P2)

**Goal**: Controle explícito “Substituir mapa” (ou equivalente) abre o seletor só quando acionado; upload `category=map` atualiza a imagem

**Independent Test**: Com mapa carregado em GM, só o controle dedicado abre o file picker; após upload válido o mapa atualiza; cancelar deixa o mapa igual

### Implementation for User Story 2

- [x] T008 [US2] Add explicit replace-map control (button + hidden file input or equivalent) visible only when `mapEditable && showImage` in `frontend/src/components/map/CampaignMap.tsx` (prefer near zoom controls per research)
- [x] T009 [P] [US2] Style the replace-map control to match existing map chrome buttons in `frontend/src/components/map/CampaignMap.css`
- [x] T010 [US2] Wire replace control to `adminApi.upload('map', file)` (via existing `frontend/src/api/admin.ts`) and call `onMapUploaded` / clear `mapFailed` on success; on cancel leave `mapUrl` unchanged (FR-006)
- [x] T011 [US2] Ensure empty/failed GM path from T004 still loads a map after US2 control exists (no dead-end if image missing)

**Checkpoint**: US1 + US2 — clique genérico silencioso; substituição só pelo controle; SC-003

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressões e validação quickstart

- [x] T012 [P] Confirm `ImageSlot` click-to-replace still works for portraits/locals in `frontend/src/components/media/ImageSlot.tsx` consumers (`NpcAdminList`, `LocalFormDialog`, etc.) — no global behavior change
- [x] T013 Run scenarios A–F from `specs/006-fix-gm-map-click/quickstart.md` and fix any remaining accidental map file-picker opens in `CampaignMap.tsx` / `MapPage.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US1** → **US2** → **Polish**
- Foundational (T003–T004) blocks both stories; US2 builds on the non-editable loaded-map surface from Foundational/US1

### User Story Dependencies

- **US1 (P1)**: Após Foundational; valida clique/placement sem picker
- **US2 (P2)**: Após US1 (ou pelo menos após T003); adiciona o único gatilho intencional com mapa carregado

### Within Each User Story

- US1: surface fix first, then placement/player smoke checks
- US2: control UI → styles can parallel → upload wiring → empty-state check

### Parallel Opportunities

- T001 ∥ T002 (Setup)
- T009 ∥ pode começar após esboço do botão em T008 (mesmo CSS file — prefer sequential if conflicting)
- T012 ∥ T013 parcialmente (T012 é regressão ImageSlot; T013 é E2E mapa)

---

## Parallel Example: User Story 2

```bash
# Após T008 criar o botão/markup:
Task: "Style replace-map control in frontend/src/components/map/CampaignMap.css"
# Em seguida (depende do markup):
Task: "Wire adminApi.upload('map') + onMapUploaded in CampaignMap.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup T001–T002
2. Foundational T003–T004
3. US1 T005–T007
4. **STOP and VALIDATE**: cliques + placement sem file picker
5. Nota: sem US2, GM só troca mapa no estado vazio/falha

### Incremental Delivery

1. Setup + Foundational → mapa carregado deixa de abrir picker
2. US1 → MVP jogável em GM (posicionar pins/grupo)
3. US2 → restaura substituição intencional com mapa carregado
4. Polish → quickstart A–F + regressão ImageSlot

### Parallel Team Strategy

Feature pequena — um implementador sequencial é o caminho natural; se dois: A fecha T003–US1 enquanto B prepara markup/CSS do botão US2 após T003.

---

## Notes

- Não alterar comportamento global de `ImageSlot` (research §4)
- Sem mudanças de backend/API
- Commit após Foundational e após cada story
- MVP sugerido = Phase 3 (US1); entrega completa = US1 + US2
