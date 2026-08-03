# Tasks: Texto do pin em Markdown

**Input**: Design documents from `/specs/011-pin-markdown-text/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) leitura formatada no PinModal; US2 (P1) hint GM sem preview; US3 (P2) políticas de segurança no renderer.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 / US3 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e instalar dependências Markdown

- [x] T001 Skim `specs/011-pin-markdown-text/contracts/ui-pin-markdown.md` and `research.md` (react-markdown; no img; http(s) links; no GM preview; no API change)
- [x] T002 [P] Locate current description render in `frontend/src/components/common/PinModal.tsx` and description field in `frontend/src/components/admin/LocalFormDialog.tsx`
- [x] T003 Add `react-markdown` and `rehype-sanitize` (or equivalent sanitize stack from research) in `frontend/package.json` via `npm install` in `frontend/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Componente de render seguro compartilhado — bloqueia US1–US3

**⚠️ CRITICAL**: Completar antes das user stories de UI

- [x] T004 Create `MarkdownSafe` component in `frontend/src/components/common/MarkdownSafe.tsx` wrapping `react-markdown` + sanitize allowlist (emphasis, lists, headings, paragraphs, links; exclude raw HTML execution)

**Checkpoint**: `MarkdownSafe` importa e tipa; ainda pode não estar ligado ao PinModal

---

## Phase 3: User Story 1 — Jogador lê descrição formatada (Priority: P1) 🎯 MVP

**Goal**: PinModal renderiza Markdown suportado; texto puro continua legível

**Independent Test**: Abrir pin com `**negrito**` / lista e outro só prosa; formatação vs texto simples

### Implementation for User Story 1

- [x] T005 [US1] Replace plain `local.descricao` text node with `MarkdownSafe` (keep empty → “Sem descrição.”) in `frontend/src/components/common/PinModal.tsx`
- [x] T006 [US1] Add typography styles for rendered markdown under pin modal (e.g. `.pin-modal__markdown`) in `frontend/src/components/common/PinModal.css`

**Checkpoint**: SC-001 / SC-002 / FR-002 / FR-003

---

## Phase 4: User Story 2 — GM escreve texto livre ou Markdown (Priority: P1)

**Goal**: Textarea inalterado funcionalmente; hint de Markdown; sem preview

**Independent Test**: Editar descrição com MD, salvar, reabrir form (sintaxe intacta); label mostra suporte; sem UI de preview

### Implementation for User Story 2

- [x] T007 [US2] Add brief “Markdown opcional” (or equivalent) hint on description label/help in `frontend/src/components/admin/LocalFormDialog.tsx` (FR-005)
- [x] T008 [US2] Confirm no preview panel or “Pré-visualizar” control exists in `frontend/src/components/admin/LocalFormDialog.tsx` (FR-006)
- [x] T009 [US2] Confirm create/update still sends raw `descricao` string unchanged via `frontend/src/pages/MapPage.tsx` / `frontend/src/api/admin.ts` (FR-004; no schema change)

**Checkpoint**: SC-003 / FR-001 / FR-004 / FR-005 / FR-006

---

## Phase 5: User Story 3 — Conteúdo inseguro / inválido (Priority: P2)

**Goal**: Sem imagens MD; links só http(s) nova aba; sem XSS; MD quebrado não derruba modal

**Independent Test**: quickstart D–E; modal permanece usável

### Implementation for User Story 3

- [x] T010 [US3] Configure `MarkdownSafe` in `frontend/src/components/common/MarkdownSafe.tsx` to not render/load markdown images (`img` omitted or null component) (FR-010)
- [x] T011 [US3] Implement safe link component in `frontend/src/components/common/MarkdownSafe.tsx`: only `http:`/`https:` as `<a target="_blank" rel="noopener noreferrer">`; other schemes as non-navigating text (FR-011)
- [x] T012 [US3] Verify sanitize / allowlist in `frontend/src/components/common/MarkdownSafe.tsx` blocks script/HTML execution paths (FR-007 / FR-008)

**Checkpoint**: SC-004 / SC-005 / SC-006 / FR-007 / FR-008 / FR-010 / FR-011

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Regressões e quickstart

- [x] T013 [P] Confirm NPC/arco description UIs remain plain text (no MarkdownSafe) in `frontend/src/components/sidebar/SideMenu.tsx` and `frontend/src/components/admin/NpcAdminList.tsx` (FR-009)
- [x] T014 Run scenarios A–G from `specs/011-pin-markdown-text/quickstart.md` and fix gaps in `MarkdownSafe.tsx` / `PinModal.tsx` / `LocalFormDialog.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001–T003)** → **Foundational (T004)** → **US1** (MVP) → **US2** e **US3** (US3 pode overlap com T004 se políticas já nascem no componente; tasks T010–T012 completam/verificam)
- **Polish** após US1–US3

### User Story Dependencies

- **US1**: Precisa de T003–T004
- **US2**: Independente do renderer, mas validação completa após US1
- **US3**: Refina `MarkdownSafe` usado por US1

### Parallel Opportunities

- T001 ∥ T002
- T007 ∥ T005 após T004 (arquivos diferentes: LocalFormDialog vs PinModal)
- T013 ∥ preparação do T014

---

## Parallel Example: After Foundational

```bash
Task: "Wire MarkdownSafe in PinModal.tsx"
Task: "Add Markdown hint in LocalFormDialog.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup + T004 (`MarkdownSafe` mínimo)
2. T005–T006 (PinModal)
3. **STOP and VALIDATE**: quickstart A–B

### Incremental Delivery

1. US1 → leitura formatada
2. US2 → hint GM
3. US3 → políticas imagem/link/XSS
4. Polish → A–G

---

## Notes

- Sem backend / migrate
- Sem preview GM
- `descricao` permanece string
