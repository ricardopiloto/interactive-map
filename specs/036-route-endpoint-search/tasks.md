# Tasks: Busca De/Para no Calcular Rota

**Input**: Design documents from `/specs/036-route-endpoint-search/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) filtrar sugestões ao digitar nos comboboxes De/Para; US2 (P2) seleccionar sugestão, reflectir rótulo, limpar selecção ao reeditar.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato UI e decisões de research

- [X] T001 Skim `specs/036-route-endpoint-search/contracts/ui-route-endpoint-combobox.md` and `research.md` (combobox custom, accent-fold, clear-on-edit, full lists)
- [X] T002 [P] Confirm current De/Para `<select>` + `waypointOptionLabel` / `options` in `frontend/src/components/routes/RoutePlannerPanel.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Match helper + combobox reutilizável antes de ligar ao painel

**⚠️ CRITICAL**: Completar antes das stories de integração no painel

- [X] T003 Add accent-fold substring helper (`normalize` NFD + strip diacritics + lower; trim query) in `frontend/src/components/routes/textMatch.ts`
- [X] T004 Create `WaypointCombobox` (input + filtered suggestions listbox; props: options `{id,label}[]`, value/selectedId, query, onQueryChange, onSelect, empty message) in `frontend/src/components/routes/WaypointCombobox.tsx`
- [X] T005 [P] Style combobox / suggestions / empty state in `frontend/src/components/routes/RoutePlanner.css` (reuse Nocturne input tokens where possible)

**Checkpoint**: Helper + combobox prontos para montar em De/Para

---

## Phase 3: User Story 1 — Filtrar origem e destino ao digitar (Priority: P1) 🎯 MVP

**Goal**: Em Calcular rota, De e Para são comboboxes; digitar filtra sugestões (case/accent-insensitive); filtro vazio = lista completa; filtros independentes; extremo oposto não omitido

**Independent Test**: Abrir Calcular rota → digitar fragmento em De → só matches → limpar → lista completa; repetir em Para; Calcular ainda exige selecção válida

### Implementation for User Story 1

- [X] T006 [US1] Replace De/Para `<select>` with two `WaypointCombobox` instances wired to shared `options` in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-001, FR-002, FR-004, FR-010)
- [X] T007 [US1] Wire query-driven filter via `textMatch` so suggestions update while typing (FR-003) in `frontend/src/components/routes/RoutePlannerPanel.tsx` and/or `WaypointCombobox.tsx`
- [X] T008 [US1] Show visible empty state when filter matches nothing (FR-008) in `frontend/src/components/routes/WaypointCombobox.tsx`
- [X] T009 [US1] Keep `calcular()` using only confirmed `selectedId` (not raw query); preserve ritmo/velocidade/plan API unchanged (FR-007) in `frontend/src/components/routes/RoutePlannerPanel.tsx`

**Checkpoint**: SC-001–SC-003 (filtro); quickstart A, B (parcial), C, F

---

## Phase 4: User Story 2 — Autocomplete ao escolher um resultado (Priority: P2)

**Goal**: Escolher sugestão confirma nó e mostra rótulo; reeditar limpa selecção; nova escolha substitui a anterior

**Independent Test**: Filtrar → seleccionar → campo mostra rótulo → Calcular usa esse nó; editar texto → selecção limpa → Calcular sem origem/destino

### Implementation for User Story 2

- [X] T010 [US2] On suggestion pick, set `selectedId` and `query` to label (FR-005) in `frontend/src/components/routes/WaypointCombobox.tsx` / `RoutePlannerPanel.tsx`
- [X] T011 [US2] On query change after selection, clear `selectedId` until new pick (FR-009) in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [X] T012 [US2] Keyboard support: ArrowUp/Down + Enter to choose, Escape to close list in `frontend/src/components/routes/WaypointCombobox.tsx` (research §5)

**Checkpoint**: SC-004; quickstart B, D, E

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quickstart e regressão do planeador

- [X] T013 Run scenarios A–F from `specs/036-route-endpoint-search/quickstart.md`; fix only `frontend/src/components/routes/*` if needed
- [X] T014 [P] Confirm plan overlay / ritmo / custos / titles unchanged after a successful calc in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-007)
- [X] T015 [P] Note fix in `CHANGELOG.md` under Fixed or Changed (patch bump if releasing)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational (T003–T005)** → **US1** → **US2** → **Polish**
- US2 assume comboboxes já no painel (US1)

### User Story Dependencies

- **US1 (P1)**: MVP — filtrar e ver sugestões / lista completa
- **US2 (P2)**: Confirmar selecção + clear-on-edit (+ teclado)

### Parallel Opportunities

- T001 ∥ T002
- T005 ∥ T003/T004 (CSS vs TS após esboço do markup)
- T014 ∥ T015 após T013

---

## Parallel Example: After T004

```bash
Task: "Style combobox in RoutePlanner.css"
Task: "Wire De/Para in RoutePlannerPanel (after T004 exists)"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001–T005 setup + helper + combobox
2. T006–T009 De/Para filtráveis no painel
3. Validate quickstart A/C/F
4. T010–T012 selecção + clear-on-edit
5. T013–T015 polish

### Incremental Delivery

1. Foundational: match + combobox
2. US1: filtragem no Calcular rota
3. US2: autocomplete / selecção fiável
4. Polish

---

## Notes

- Sem alterações de backend / API `planRoute`
- Sem nova dependência npm
- Labels = `waypointOptionLabel` existente (FR-006)
- Não omitir extremo oposto nas sugestões (FR-010)
