# Tasks: UX Nocturne & Débitos

**Input**: Design documents from `/specs/079-ux-nocturne/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = coluna de digitalização; US2 = pinch-zoom na Rede; US3 = elevação Nocturne + diálogos GM

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Docs: `CHANGELOG.md`, `README.md`, version manifests

---

## Phase 1: Setup

**Purpose**: Align on UI contracts and current digitizer / graph / column baseline

- [x] T001 Skim `specs/079-ux-nocturne/contracts/ui-digitizer-column.md`, `contracts/ui-graph-gestures.md`, `contracts/ui-nocturne-elevation.md`, `contracts/ui-gm-dialogs.md`, `research.md`, and `data-model.md`
- [x] T002 [P] Skim `frontend/src/components/gm/RouteDigitizerView.tsx`, `frontend/src/components/gm/RouteDigitizer.css`, `frontend/src/components/relacoes/GraphStage.tsx`, `frontend/src/components/relacoes/RelacoesDetailPanel.css` (bottom sheet ≤800px), and `frontend/src/styles/nocturne.css` (`--shadow-*`, `.dialog`)

---

## Phase 2: Foundational (Blocking)

**Purpose**: Tokens de elevação e agrupamento de diálogo partilhados por US1 (coluna nova) e US3

**⚠️ CRITICAL**: US1 coluna e US3 visual dependem destes tokens; US2 pode começar após T001

- [x] T003 Add `--elevation-column`, `--elevation-panel`, `--elevation-modal` (sombra ambiente dominante, hairline não como delimitador principal) and `.dialog__group` (label 12px muted + spacing/grid) in `frontend/src/styles/nocturne.css`; ensure `.dialog-backdrop` is darkened (~55% black) per `contracts/ui-nocturne-elevation.md` and `contracts/ui-gm-dialogs.md`

**Checkpoint**: Tokens existem; `.dialog` / `.dialog__group` usáveis sem mudar layout das colunas ainda

---

## Phase 3: User Story 1 - Digitalização de rotas usável (Priority: P1) 🎯 MVP

**Goal**: Coluna lateral 236px com busca, secções Waypoints/Arestas colapsáveis, clique centra no mapa; ≤800px vira bottom sheet retrátil

**Independent Test**: Quickstart scenarios 1, 2, 7 (busca &lt;10 s; sheet abre/fecha; protocolo clique mapa intacto)

### Implementation for User Story 1

- [x] T004 [US1] Extract list UI into `frontend/src/components/gm/DigitizerListPanel.tsx`: search input, collapsible "Waypoints" / "Arestas" (default expanded), waypoint rows (nome, Local select, apagar) and segment rows (identidade, apagar) per `contracts/ui-digitizer-column.md`
- [x] T005 [US1] Filter both lists with `labelMatchesQuery` from `frontend/src/utils/textMatch.ts` (waypoints by `nome` or `#id`; segments by `segmentIdentity`) in `frontend/src/components/gm/DigitizerListPanel.tsx` / `RouteDigitizerView.tsx`
- [x] T006 [US1] On waypoint/segment row click: set `focusedWaypointId` / `focusedSegmentId`, pan/zoom `TransformWrapper` to center the element, apply `is-focused` on pin or polyline highlight, scroll row into view in `frontend/src/components/gm/RouteDigitizerView.tsx`
- [x] T007 [US1] Relayout digitizer to left column ~236px + map stage (desktop) using `--elevation-column` (no heavy `border-right`) in `frontend/src/components/gm/RouteDigitizer.css`; keep tools/header out of the list column
- [x] T008 [US1] At `max-width: 800px`, turn list column into retrátil bottom sheet (`listSheetOpen` default false, toggle visible, `max-height: ~70dvh`, top radius) mirroring `RelacoesDetailPanel` mobile in `frontend/src/components/gm/RouteDigitizer.css` and `RouteDigitizerView.tsx` — do **not** change Rede mobile layout

**Checkpoint**: 20+ nós → busca filtra; clique centra; ≤800px sheet retrátil; criar nó/segmento por clique no mapa inalterado

---

## Phase 4: User Story 2 - Pinch-zoom na Rede de Relações (Priority: P1)

**Goal**: Pinça no palco da Rede altera o mesmo `scale` que a roda; 3+ dedos estável

**Independent Test**: Quickstart scenarios 3–4 (3 dispositivos; Mapa pinch check)

### Implementation for User Story 2

- [x] T009 [US2] Implement `usePinchZoom` (native Pointer Events, max 2 pointers, ignore extras, expose scale ratio) in `frontend/src/hooks/usePinchZoom.ts` per `contracts/ui-graph-gestures.md`
- [x] T010 [US2] Wire pinch into existing `scale` state in `frontend/src/components/relacoes/GraphStage.tsx`: suspend pan/node-drag during pinch; keep `handleWheel` 0.9/1.1 and clamp 0.35–2.5; maintain `touch-action: none` in `frontend/src/components/relacoes/GraphStage.css`
- [x] T011 [US2] Verify pinch on `frontend/src/components/map/CampaignMap.tsx` (`react-zoom-pan-pinch`); if gap confirmed, enable/fix pinch options (or reuse `usePinchZoom`) in the same change — FR-005a

**Checkpoint**: Pinça e roda partilham `scale`; 3 dedos não quebra; Mapa pinch documentado/corrigido

---

## Phase 5: User Story 3 - Diretriz visual Nocturne (Priority: P2)

**Goal**: Colunas/painéis separam por elevação; accent só em interactivos; diálogos GM agrupados

**Independent Test**: Quickstart scenarios 5–6 (side-by-side colunas; cada diálogo GM)

### Implementation for User Story 3

- [x] T012 [P] [US3] Replace heavy `border-right` with `--elevation-column` on map sidebar in `frontend/src/components/sidebar/SideMenu.css`
- [x] T013 [P] [US3] Replace heavy `border-right` with `--elevation-column` on relationship column in `frontend/src/components/relacoes/RelacoesSideColumn.css` (keep mobile fixed bottom panel layout — FR-004a)
- [x] T014 [P] [US3] Apply `--elevation-panel` (stronger than column) on `frontend/src/components/relacoes/RelacoesDetailPanel.css` and `frontend/src/components/common/PinModal.css`
- [x] T015 [US3] Group Personagem fields with `.dialog__group` (identidade / atributos / módulos / notas) in `frontend/src/components/relacoes/PersonagemFormDialog.tsx` (and `.css` if needed)
- [x] T016 [P] [US3] Group Vinculo fields (A+B / tipo+qualificador+direção / nota) in `frontend/src/components/relacoes/VinculoFormDialog.tsx` and `VinculoFormDialog.css`
- [x] T017 [P] [US3] Group Local / NPC / Arco dialogs per `contracts/ui-gm-dialogs.md` in `frontend/src/components/admin/LocalFormDialog.tsx`, `NpcFormDialog.tsx`, and `ArcoFormDialog.tsx`
- [x] T018 [US3] Audit accent blurple: only primary/ghost buttons, selected chips/tabs, selected node, `:focus-visible` — strip decorative accent from static chrome in `frontend/src/styles/nocturne.css` and the column/dialog CSS files touched above

**Checkpoint**: Colunas sem borda grossa; detalhe/modal mais elevados; diálogos agrupados; `AdminGateDialog` intacto

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Version 0.14.0, docs, quickstart

- [x] T019 [P] Add `[0.14.0]` changelog entry for v2 Frente C in `CHANGELOG.md`
- [x] T020 [P] Bump version to **0.14.0** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T021 Run `cd frontend && npm run build` then full `specs/079-ux-nocturne/quickstart.md`
- [x] T022 Set feature status to Implemented in `specs/079-ux-nocturne/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational (T003 tokens) → US1 (coluna) and US3 (visual)  
- US2 (pinch) can start after T001/T002 — does not need T003  
- Polish after US1–US3

### User Story Dependencies

- **US1**: T003 then T004–T008 (T004/T005 before T006; T007/T008 with or after T004)
- **US2**: Independent of US1/US3 (T009 → T010 → T011)
- **US3**: T003 then T012–T018; digitizer column already elevated in US1 (T007)

### Parallel Opportunities

- T001 ∥ T002
- T012 ∥ T013 ∥ T014 ∥ T016 ∥ T017 (after T003)
- T019 ∥ T020
- US1 and US2 in parallel after Setup (US1 waits T003)

---

## Parallel Example: User Story 1

```bash
# After T003:
Task: "DigitizerListPanel extract (T004)"
# Then sequential:
Task: "Filter search (T005)"
Task: "Click to center (T006)"
Task: "Desktop column CSS (T007)"
Task: "Bottom sheet ≤800px (T008)"
```

---

## Parallel Example: User Story 3

```bash
Task: "SideMenu elevation (T012)"
Task: "RelacoesSideColumn elevation (T013)"
Task: "Detail + PinModal elevation (T014)"
Task: "VinculoFormDialog groups (T016)"
Task: "Local/NPC/Arco groups (T017)"
# Then:
Task: "PersonagemFormDialog groups (T015)"
Task: "Accent audit (T018)"
```

---

## Implementation Strategy

### MVP

1. Tokens (T003)
2. US1 coluna + busca + sheet
3. US2 pinch Rede + check Mapa
4. US3 elevação + diálogos
5. 0.14.0 + quickstart

### Notes

- Frontend-only — no backend / schema changes
- Clique no mapa para criar waypoint/aresta **não muda**
- Rede mobile: coluna inferior **fixa** (só visual)
- Hub `hub/` fora de escopo
- i18n (080) depois — strings PT hardcoded
- No automated tests requested
