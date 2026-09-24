# Tasks: Aposentar nocturne.css

**Input**: Design documents from `/specs/117-aposentar-nocturne/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/migration-map.md](./contracts/migration-map.md), [contracts/kit-extensions.md](./contracts/kit-extensions.md), [contracts/removal-gates.md](./contracts/removal-gates.md), [quickstart.md](./quickstart.md)

**Depends on**: Specs **114–116** on the working branch before deleting `nocturne.css` (migration of class tokens can start earlier).

**Tests**: OPTIONAL (UI polish — Constitution II MAY). Validation via grep gates + [quickstart.md](./quickstart.md) + `tsc`. No pytest/API.

**Organization**: Por user story (US1–US3). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]…[US3]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Freeze inventory baseline for the branch

- [X] T001 Re-run Gate A patterns from [contracts/removal-gates.md](./contracts/removal-gates.md) over `frontend/src` and save a fresh hit list under `specs/117-aposentar-nocturne/checklists/inventory-hits.md` (path + class tokens)
- [X] T002 Confirm every hit maps to a destination row in [contracts/migration-map.md](./contracts/migration-map.md) / [research.md](./research.md) §2; amend those docs if a new consumer appeared

---

## Phase 2: Foundational — BLOCKS consumer migration

**Purpose**: Kit gaps + absorb globals (nocturne still imported)

**⚠️ CRITICAL**: Complete before bulk US2 file rewrites

- [X] T003 Extend `Button` in `frontend/src/components/ui/Button.tsx` + `ui.css` with `block?: boolean` and `size?: 'sm' | 'md'` per [contracts/kit-extensions.md](./contracts/kit-extensions.md)
- [X] T004 [P] Extend `Chip` in `frontend/src/components/ui/Misc.tsx` + `ui.css` with `variant` (`default` | `accent` | `neutral` | `outline`) and optional interactive `onClick` (button element)
- [X] T005 [P] Create `frontend/src/components/ui/SegmentedControl.tsx` (+ styles in `ui.css`) and export from `frontend/src/components/ui/index.ts` per kit-extensions contract
- [X] T006 Replace `dialog-body` in `frontend/src/components/ui/ConfirmDialog.tsx` (and any other kit file) with `ui-dialog__body` / kit class; ensure styles live in `ui.css`
- [X] T007 Move typography/focus/selection/`.text-muted` (and any still-needed global rules) from `frontend/src/styles/nocturne.css` into `frontend/src/styles/global.css` **without removing nocturne yet**
- [X] T008 Move `.npc-form__*` / `.local-form__*` rules from `nocturne.css` into `frontend/src/components/forms/formShell.css` and/or `frontend/src/components/media/ImageSlot.css` (component-owned CSS)

**Checkpoint**: Kit can replace all target families; globals/form-chrome no longer *only* in nocturne

---

## Phase 3: User Story 1 — Inventário e mapa (P1) 🎯 MVP

**Goal**: Inventário fechado e contrato de migração alinhado ao branch actual

**Independent Test**: [quickstart.md](./quickstart.md) §1; checklist inventory matches Gate A hits

### Implementation

- [X] T009 [US1] Finalize `specs/117-aposentar-nocturne/checklists/inventory-hits.md` as the authoritative pre-migration list (include kit-debt rows for `dialog-body` if any remain)
- [X] T010 [US1] Mark gap items closed after T003–T005 in [research.md](./research.md) / migration-map (SegmentedControl, Chip variants, Button block/size) so US2 has no open «criar no kit»

**Checkpoint**: Zero unmapped hits; kit gaps implemented

---

## Phase 4: User Story 2 — Migrar consumidores (P1)

**Goal**: Zero target classes outside `components/ui/`; flows unchanged

**Independent Test**: Gate A empty before delete; smoke controls on auth/painel/mapa

### Implementation — Auth / Painel / Sessões

- [X] T011 [P] [US2] Migrate `frontend/src/pages/AuthPages.tsx` from `.btn*` to `Button`
- [X] T012 [P] [US2] Migrate `frontend/src/pages/PainelPage.tsx` from `.btn*` to `Button` (Links styled via Button-as-child or `className` on `ui-btn` only if already supported — prefer `Button` / router patterns already in kit)
- [X] T013 [P] [US2] Migrate `frontend/src/pages/SessoesPage.tsx` from `.btn*` to `Button`

### Implementation — Admin forms / lists

- [X] T014 [US2] Migrate `frontend/src/components/admin/LocalFormDialog.tsx` (`.input` → Field; `.btn*` → Button; `.tag*` → Chip; `.card-meta` → ui-card meta / muted text)
- [X] T015 [P] [US2] Migrate `frontend/src/components/admin/NpcAdminList.tsx` (form + list add buttons)
- [X] T016 [P] [US2] Migrate `frontend/src/components/admin/ArcoAdminList.tsx`
- [X] T017 [P] [US2] Migrate `frontend/src/components/admin/LocalAdminList.tsx`
- [X] T018 [US2] Migrate `frontend/src/components/admin/GrupoAdminPanel.tsx` (`.card`/`.seg` → Card + SegmentedControl; buttons → Button)

### Implementation — Relações / forms

- [X] T019 [US2] Migrate `frontend/src/components/relacoes/PersonagemFormDialog.tsx` (`.input`, `.seg` → Field + SegmentedControl; `.tag` → Chip)
- [X] T020 [P] [US2] Migrate `frontend/src/components/relacoes/VinculoFormDialog.tsx` (`.input` → Field)
- [X] T021 [P] [US2] Migrate residual `.btn*` / `.tag*` in `frontend/src/pages/RelacoesPage.tsx`, `RelacoesDetailPanel.tsx`, `RelacoesSideColumn.tsx`, `GraphStage.tsx` (skip files already deleted by 116 if absent — migrate what remains)

### Implementation — Mapa / rotas / GM / misc

- [X] T022 [US2] Migrate residual nocturne classes in `frontend/src/pages/MapPage.tsx` and `frontend/src/components/map/CampaignMap.tsx` (`.btn*`, `.tag*`)
- [X] T023 [P] [US2] Migrate `frontend/src/components/routes/RoutePlannerPanel.tsx` and `WaypointCombobox.tsx` (`.btn*`, `.input`)
- [X] T024 [US2] Migrate `frontend/src/components/gm/RouteDigitizerView.tsx`, `DigitizerListPanel.tsx` (`.btn*`, `.input`)
- [X] T025 [US2] Replace `AdminGateDialog.tsx` legacy `.dialog-backdrop`/`.dialog`/`.input`/`.btn*` with kit `Dialog` + `Input` + `Button` in `frontend/src/components/gm/AdminGateDialog.tsx`
- [X] T026 [P] [US2] Migrate `frontend/src/components/layout/LanguageSelector.tsx` and `frontend/src/modules/fadiga/FadigaWidget.tsx`
- [X] T027 [US2] Sweep remaining hits: re-run Gate A; fix any leftover `dialog-body` / `.tag` / `.btn` in `MarkdownSafe` consumers, `PinModal`, form shells, or other files still listed

**Checkpoint**: Gate A returns empty; app still imports nocturne but no consumer needs its component classes

---

## Phase 5: User Story 3 — Remover nocturne.css (P1)

**Goal**: File deleted; import gone; build + smoke pass

**Independent Test**: [contracts/removal-gates.md](./contracts/removal-gates.md) Gates A–E; [quickstart.md](./quickstart.md) §3–4

### Implementation

- [X] T028 [US3] Verify Gate B (kit self-contained) and Gate C (globals/form-chrome absorbed) per removal-gates
- [X] T029 [US3] Remove `import './styles/nocturne.css'` from `frontend/src/main.tsx`
- [X] T030 [US3] Delete `frontend/src/styles/nocturne.css` from the repository
- [X] T031 [US3] Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean; fix fallout only related to this migration
- [X] T032 [US3] Execute visual smoke from [quickstart.md](./quickstart.md) (auth, mapa, relações, rota, painel — claro/escuro)

**Checkpoint**: `nocturne.css` absent; Gates A–E pass

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Docs and final proof

- [X] T033 [P] Note feature in `CHANGELOG.md` (Unreleased) — retire nocturne; kit-only controls
- [X] T034 Re-run full Gate A + B one last time; confirm `rg nocturne` finds no production imports under `frontend/src`
- [X] T035 Mark [checklists/requirements.md](./checklists/requirements.md) / inventory checklist complete for implement handoff

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** can finish in parallel with late foundational → **US2 (4)** needs T003–T008 → **US3 (5)** needs Gate A empty → **Polish (6)**

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | T001–T002 (+ gaps T003–T005) | Inventory MVP |
| **US2** | Phase 2 | Batch migrations |
| **US3** | US2 Gate A clean | Delete file |

### Parallel Opportunities

```text
T003 || T004 || T005
T011 || T012 || T013
T015 || T016 || T017
T019 || T020
T023 || T026
T033 || T034
```

### Parallel Example: US2 batches

```bash
# Agent A — Auth/Painel/Sessoes
# Agent B — Admin forms
# Agent C — GM + routes
# Merge; then shared Gate A sweep (T027)
```

---

## Implementation Strategy

### MVP First (User Story 1 + Foundational)

1. Inventory (T001–T002, T009–T010)
2. Kit extensions + globals move (T003–T008)
3. **STOP** — confirm gaps closed
4. Then US2 batches → US3 delete → Polish

### Suggested MVP scope

**US1 + Phase 2**: inventário fechado + kit capaz de substituir todas as famílias-alvo (ainda sem apagar nocturne).

### Incremental Delivery

1. Kit ready  
2. Auth/Painel  
3. Admin + Relações forms  
4. Map/Routes/GM  
5. Delete nocturne + smoke  

---

## Format Validation

- All tasks use `- [ ]`, sequential `T00N`, file paths, and `[USn]` on story phases only.
- No automated test tasks (UI polish MAY).
