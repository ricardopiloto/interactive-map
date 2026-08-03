# Tasks: Seletor de cor do pin de local

**Input**: Design documents from `/specs/009-pin-visit-colors/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: Duas user stories P1 (US1 visualizar cores no mapa; US2 GM escolhe cor no formulário). Backend/tipos na fundação.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contratos e pontos de integração

- [x] T001 Skim `specs/009-pin-visit-colors/contracts/api-local-cor-pin.md`, `contracts/ui-pin-color.md`, and `research.md` (hex `#RRGGBB`, migrate default lilás, GM-only write)
- [x] T002 [P] Locate current Local pin styling (`.campaign-map__pin` background) in `frontend/src/components/map/CampaignMap.css` and Local form flow in `frontend/src/components/admin/LocalFormDialog.tsx` / `frontend/src/pages/MapPage.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Campo `cor_pin` persistido e tipado — bloqueia US1 e US2

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 Add `cor_pin: str` to `Local` model in `backend/app/models/local.py` (max_length 7, required; default only for SQL/migration safety)
- [x] T004 [P] Add `cor_pin` to `LocalCreate` (required), `LocalUpdate` (optional), `LocalRead` in `backend/app/schemas/local.py` with hex pattern `^#[0-9A-Fa-f]{6}$`
- [x] T005 Extend `_migrate_sqlite` in `backend/app/database.py` to `ALTER TABLE local ADD COLUMN cor_pin` with `NOT NULL DEFAULT '#c4b5fd'` when column missing
- [x] T006 Wire `cor_pin` through admin create/update in `backend/app/routers/admin/locais.py` (reject missing/invalid on create; persist on update)
- [x] T007 [P] Ensure public Local responses expose `cor_pin` via existing `LocalRead` path (confirm `backend/app/routers/public/locais.py` or campaign aggregate uses schema)
- [x] T008 [P] Set `cor_pin` on seed locais in `backend/app/seed.py` (mix of `#e5484d` and `#c4b5fd` for demo)
- [x] T009 Add `cor_pin: string` to `Local` and related payloads in `frontend/src/types/index.ts` and `frontend/src/api/admin.ts` (`LocalPayload`)

**Checkpoint**: API devolve `cor_pin`; DB migrada; tipos frontend alinhados

---

## Phase 3: User Story 1 — Reconhecer locais pela cor do pin (Priority: P1) 🎯 MVP

**Goal**: Pins no mapa usam `cor_pin`; legenda explica convenção sugerida; grupo intacto

**Independent Test**: Locais com cores distintas no mapa; legenda legível; jogador vê as mesmas cores

### Implementation for User Story 1

- [x] T010 [US1] Apply per-local pin color via `style={{ background: local.cor_pin }}` (keep border/shape) in `frontend/src/components/map/CampaignMap.tsx`
- [x] T011 [US1] Adjust `.campaign-map__pin` / selected/hover styles in `frontend/src/components/map/CampaignMap.css` so fixed red background does not override dynamic color (use `currentColor` or remove hardcoded fill where needed)
- [x] T012 [US1] Update map legend to show suggested visit convention (vermelho ≈ visitado, lilás ≈ conhecido; GM may use others) in `frontend/src/components/map/CampaignMap.tsx` / `CampaignMap.css`
- [x] T013 [US1] Confirm group pin (`.campaign-map__party*`) unchanged in `frontend/src/components/map/CampaignMap.css`

**Checkpoint**: SC-001 / FR-001 / FR-005 / FR-006 — mapa colorido mesmo antes do seletor polido (via seed/API)

---

## Phase 4: User Story 2 — GM escolhe a cor ao criar/editar (Priority: P1)

**Goal**: Seletor livre + swatches no form GM; cor obrigatória; payload create/update; sem UI de cor no jogador

**Independent Test**: Criar/editar com vermelho e lilás; salvar sem cor bloqueado; jogador sem editor

### Implementation for User Story 2

- [x] T014 [US2] Extend `LocalFormDraft` / `localToDraft` with `cor_pin` (default `#c4b5fd`) in `frontend/src/components/admin/LocalFormDialog.tsx`
- [x] T015 [US2] Add color `<input type="color">` plus suggested swatches (`#e5484d`, `#c4b5fd`) and disable save when `cor_pin` empty/invalid in `frontend/src/components/admin/LocalFormDialog.tsx`
- [x] T016 [US2] Include `cor_pin` in create/update payload in `frontend/src/pages/MapPage.tsx` (`saveLocal` / draft init for new pins)
- [x] T017 [US2] Confirm player `PinModal` / non-GM flows have no color editor in `frontend/src/components/common/PinModal.tsx` and related UI (FR-008)

**Checkpoint**: SC-003 / SC-004 / SC-005 / FR-002 / FR-007

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressões e quickstart

- [x] T018 [P] Fallback display if `cor_pin` missing on old client cache: use `#c4b5fd` in `CampaignMap.tsx` pin render
- [x] T019 Run scenarios A–E from `specs/009-pin-visit-colors/quickstart.md` and fix gaps in backend/frontend paths listed above

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US1** e **US2** (US2 pode começar após T009; US1 após T007/T009)
- US1 é MVP visual; US2 completa o fluxo GM

### User Story Dependencies

- **US1 (P1)**: Precisa de `cor_pin` na API/tipos (Foundational)
- **US2 (P1)**: Precisa de Foundational + formulário; melhora atribuição além do seed

### Parallel Opportunities

- T001 ∥ T002
- T004 ∥ T003 (após acordo de nome do campo); T007 ∥ T008 ∥ T009 após schemas
- T010–T013 sequenciais no mesmo CSS/TSX (evitar [P] conflitante)
- T014–T016 sequenciais no form/MapPage; T017 ∥ T018

---

## Parallel Example: Foundational

```bash
Task: "Add cor_pin to schemas/local.py"
Task: "Add cor_pin to frontend types + LocalPayload"
# After model+migrate:
Task: "Update seed.py with demo colors"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup + Foundational (persistência + seed colorido)
2. US1 render + legenda
3. **STOP and VALIDATE**: mapa mostra cores distintas

### Incremental Delivery

1. Foundational → API/DB
2. US1 → visualização
3. US2 → seletor GM obrigatório
4. Polish → quickstart

---

## Notes

- Sem enum `status_visita` nesta entrega
- Hex only `#RRGGBB`
- MVP sugerido = Foundational + US1; entrega completa = + US2
