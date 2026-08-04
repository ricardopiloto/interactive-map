# Tasks: Reverter offset/tamanho de pins (030)

**Input**: Design documents from `/specs/034-revert-pin-offset/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) restaurar CSS pré-030 de pin/grupo; US2 (P2) marcar 030 Deferred/Staged + limpar CHANGELOG.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline pré-030 vs CSS actual

- [X] T001 Skim `specs/034-revert-pin-offset/contracts/ui-revert-pin-030.md` and `research.md` (pré-030 margins -12/-22; remove tip origin + media 799)
- [X] T002 [P] Diff current `.campaign-map__pin` / party / `@media (max-width: 799px)` against pré-030 table in `frontend/src/components/map/CampaignMap.css` (and `git show HEAD:…` if needed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Identificar blocos a tocar sem apagar estilos 032+

**⚠️ CRITICAL**: Antes de editar CSS, listar o que preservar

- [X] T003 Confirm banner Cancelar / connections / legend / `@media 720px` controls must stay untouched in `frontend/src/components/map/CampaignMap.css`

**Checkpoint**: Escopo CSS pin/party + media 799 apenas

---

## Phase 3: User Story 1 — Pin alinhado (pré-030) (Priority: P1) 🎯 MVP

**Goal**: Restaurar âncora/tamanho pré-030; reposicionar sem desvio lateral da 030

**Independent Test**: Reposicionar num ponto óbvio → pin sem desvio “para o lado”; móvel sem shrink 20px da 030

### Implementation for User Story 1

- [X] T004 [US1] Restore `.campaign-map__pin` to pré-030 (24×24; `margin-left: -12px`; `margin-top: -22px`; rotate -45°; no `--pin-size` / tip `transform-origin`) in `frontend/src/components/map/CampaignMap.css`
- [X] T005 [US1] Restore `.campaign-map__pin--selected` and `--hovered` to pré-030 (scale without `transform-origin: 100% 100%`) in `frontend/src/components/map/CampaignMap.css`
- [X] T006 [US1] Restore `.campaign-map__party--bandeira` and `--brasao` to pré-030 sizes/margins in `frontend/src/components/map/CampaignMap.css`
- [X] T007 [US1] Remove `@media (max-width: 799px)` pin/party size overrides in `frontend/src/components/map/CampaignMap.css` (FR-001, SC-002)

**Checkpoint**: SC-001, SC-002; FR-001–FR-003, FR-004, FR-007

---

## Phase 4: User Story 2 — 030 Deferred / Staged (Priority: P2)

**Goal**: Artefactos 030 marcados diferidos; CHANGELOG sem claims 030 activos

**Independent Test**: `specs/030-pin-size-offset/spec.md` Status Deferred/Staged; pasta intacta; changelog sem “pins menores / alinhados pela ponta” como shipped

### Implementation for User Story 2

- [X] T008 [US2] Set `**Status**: Deferred / Staged` and short note (reverted by 034; re-apply only after reposition validation) in `specs/030-pin-size-offset/spec.md` (FR-005, SC-003)
- [X] T009 [P] [US2] Remove or rewrite 0.6.0 bullets that claim 030 mobile shrink / tip alignment as shipped in `CHANGELOG.md` (keep routes/other 0.6.0 content)

**Checkpoint**: SC-003; FR-005

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart e regressões 032/033

- [X] T010 Run scenarios A–D from `specs/034-revert-pin-offset/quickstart.md`; fix only scoped CSS/docs if needed
- [X] T011 [P] Confirm `campaign-map__banner-cancel` and 032/033 MapPage behavior still present in `frontend/src/components/map/CampaignMap.css` / `frontend/src/pages/MapPage.tsx` (FR-006, SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003)** → **US1 (CSS)** → **US2 (docs)** → **Polish**
- US2 pode começar em paralelo com US1 (ficheiros diferentes: CSS vs spec/CHANGELOG)

### User Story Dependencies

- **US1 (P1)**: MVP — produto sem visual 030
- **US2 (P2)**: Status + changelog; independente do CSS após T001

### Parallel Opportunities

- T001 ∥ T002
- T004–T007 sequenciais no mesmo CSS (ou um único patch)
- T008 ∥ T009 após/alongside US1
- T010 ∥ T011

---

## Parallel Example: After T003

```bash
Task: "Restore pin CSS pré-030 in CampaignMap.css"
Task: "Mark 030 spec Deferred / Staged"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T003 setup
2. T004–T007 CSS revert
3. T008–T009 defer 030 + changelog
4. T010–T011 quickstart

### Incremental Delivery

1. CSS pré-030 → pin alinhado ao reposicionar
2. Docs 030 Deferred
3. Polish

---

## Notes

- Do not `git checkout` entire `CampaignMap.css`
- Do not delete `specs/030-pin-size-offset/`
- Git add/commit is not an acceptance criterion (clarification A)
