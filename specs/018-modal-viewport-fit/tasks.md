# Tasks: Modais que cabem na tela

**Input**: Design documents from `/specs/018-modal-viewport-fit/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) formulário de local; US2 (P2) pin modal; US3 (P3) demais diálogos GM.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 / US3 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhar contrato UI e estado atual dos diálogos

- [x] T001 Skim `specs/018-modal-viewport-fit/contracts/ui-dialog-viewport-fit.md` and `research.md` (flex shell, `90dvh`, body scroll, sticky actions, no nested chip scroll)
- [x] T002 [P] Locate `.dialog` / `.dialog-actions` in `frontend/src/styles/nocturne.css`, `LocalFormDialog` structure in `frontend/src/components/admin/LocalFormDialog.tsx`, and pin overflow in `frontend/src/components/common/PinModal.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Padrão CSS global do shell — base para todas as stories

**⚠️ CRITICAL**: Completar antes de markup específico das stories

- [x] T003 Update `.dialog` in `frontend/src/styles/nocturne.css` with `max-height: 90dvh` (no fixed `height`), column flex, and `min-height: 0` as needed
- [x] T004 Add `.dialog__body` (or equivalent) scroll region styles and keep `.dialog-actions` `flex-shrink: 0` in `frontend/src/styles/nocturne.css`

**Checkpoint**: Estilos base prontos; forms ainda podem precisar do wrapper de markup

---

## Phase 3: User Story 1 — Formulário de local na viewport (Priority: P1) 🎯 MVP

**Goal**: Editar local com Saídas longas: corpo rola; Cancelar/Salvar sempre visíveis; painel cabe na tela

**Independent Test**: Janela ≤700px; form local com muitas Saídas; rolar campos; salvar/cancelar sem procurar botões no fim do scroll

### Implementation for User Story 1

- [x] T005 [US1] Wrap fields (image, inputs, chips including Saídas) in `.dialog__body` in `frontend/src/components/admin/LocalFormDialog.tsx`; keep title and `.dialog-actions` outside the scroll region
- [x] T006 [US1] Confirm chips have no nested `max-height`/`overflow` scroll of their own in `frontend/src/components/admin/LocalFormDialog.tsx` / related CSS (FR-008)
- [x] T007 [US1] Spot-check short content does not stretch the dialog to full `90dvh` when opening a compact form path that shares `.dialog` (FR-007)

**Checkpoint**: SC-001 / FR-001–FR-004 / FR-007 / FR-008

---

## Phase 4: User Story 2 — Pin modal com Fechar fixo (Priority: P2)

**Goal**: Detalhe do pin: só o corpo rola; Fechar sempre no rodapé; beside e centered respeitam viewport

**Independent Test**: Pin com descrição longa; Fechar visível sem scroll até o fim; ~375px e desktop

### Implementation for User Story 2

- [x] T008 [US2] Restructure `frontend/src/components/common/PinModal.tsx` into title | scrollable body | `.dialog-actions` (Fechar outside body scroll)
- [x] T009 [US2] Remove whole-panel `overflow: auto` from `.pin-modal` and align max-height/flex with the dialog contract in `frontend/src/components/common/PinModal.css` (beside + centered)

**Checkpoint**: SC-002 / FR-005

---

## Phase 5: User Story 3 — Demais diálogos GM (Priority: P3)

**Goal**: NPC, arco e gate herdam o mesmo padrão sem regressão

**Independent Test**: Editar NPC com texto longo em janela baixa; ações fixas; gate curto continua compacto

### Implementation for User Story 3

- [x] T010 [P] [US3] Wrap scrollable fields in `.dialog__body` in `frontend/src/components/admin/NpcAdminList.tsx` (`NpcFormDialog`) if title/fields/actions are siblings without a body wrapper
- [x] T011 [P] [US3] Wrap scrollable fields in `.dialog__body` in `frontend/src/components/admin/ArcoAdminList.tsx` (arco form dialog) the same way
- [x] T012 [US3] Verify `frontend/src/components/gm/AdminGateDialog.tsx` stays compact (no forced full height) and actions remain visible with the shared `.dialog` styles

**Checkpoint**: US3 / FR-006 / FR-007

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart A–E e regressões beside-pin / 017

- [x] T013 Confirm map connection lines (017) and beside-pin placement (013) still work with the taller-safe pin panel in `frontend/src/components/common/PinModal.tsx` / `CampaignMap.tsx` (smoke)
- [x] T014 Run scenarios A–E from `specs/018-modal-viewport-fit/quickstart.md` and fix gaps in nocturne/dialog components above

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003–T004)** → **US1** → **US2** → **US3** → **Polish**
- US1 pode validar o CSS base; US2/US3 dependem do mesmo shell

### User Story Dependencies

- **US1**: LocalFormDialog + estilos base (MVP)
- **US2**: PinModal (após ou em paralelo ao CSS base; não depende do markup do local)
- **US3**: Outros forms (após CSS base; paralelo entre T010/T011)

### Parallel Opportunities

- T001 ∥ T002
- T010 ∥ T011 após Foundational
- US2 pode seguir em paralelo a US1 após T003–T004 (arquivos diferentes)

---

## Parallel Example: After Foundational CSS

```bash
# Em paralelo (arquivos distintos):
Task: "T005 LocalFormDialog body wrapper"
Task: "T008 PinModal restructure"
# Depois US3:
Task: "T010 NpcFormDialog" || Task: "T011 Arco form"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational CSS
2. LocalFormDialog wrapper → **STOP** e validar quickstart A
3. PinModal → outros GM → Polish A–E

### Incremental Delivery

1. Shell global Nocturne
2. Form local (017 + viewport)
3. Pin Fechar fixo
4. NPC/Arco/Gate + quickstart

---

## Notes

- [P] = paralelizável
- Sem testes automatizados / sem backend
- Preferir flex + body scroll a `position: sticky` frágil
- Não adicionar scroll aninhado em chips
