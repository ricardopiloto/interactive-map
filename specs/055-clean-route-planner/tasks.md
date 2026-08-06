# Tasks: Clean Calcular Rota Panel

**Input**: Design documents from `/specs/055-clean-route-planner/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual QA via quickstart — no automated TDD suite requested.

**Organization**: US1 = primary path + order + compact results; US2 = collapsible Opções + non-default summary + power preserved; US3 = shorter labels / hierarchy polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock UI contract and current panel structure

- [x] T001 Skim `specs/055-clean-route-planner/contracts/ui-clean-route-planner.md`, `research.md` (§1–5: optionsOpen, summary fragments, labels, result meta), and `data-model.md`
- [x] T002 [P] Confirm current JSX order and control locations in `frontend/src/components/routes/RoutePlannerPanel.tsx` and styles in `frontend/src/components/routes/RoutePlanner.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared helpers and collapse state before layout stories land

**⚠️ CRITICAL**: Complete before user-story layout that depends on `optionsOpen` / summary

- [x] T003 Add `optionsOpen` boolean state (default `false`) and reset it to `false` on panel open (same open effect that resets modo/preferência) in `frontend/src/components/routes/RoutePlannerPanel.tsx` (research §1, FR-007)
- [x] T004 [P] Add `formatOptionsSummary(...)` (or inline helper) that returns non-default fragments per research §2 (`Próprio` [+ mi/h], `Intenso`, `Mais barata`, `Por rio`/`Por estrada`) in `frontend/src/components/routes/RoutePlannerPanel.tsx`
- [x] T005 Confirm **no** edits planned to `backend/app/services/route_planner.py`, `backend/app/routers/public/routes.py`, or `frontend/src/api/campaign.ts` planRoute signature (FR-010)

**Checkpoint**: Collapse state + summary helper ready; API untouched

---

## Phase 3: User Story 1 — Calcular com o mínimo de ruído (Priority: P1) 🎯 MVP

**Goal**: Vertical order De → Para → Calcular → Opções → Resultados; advanced controls not a wall of fieldsets on open; compact result rows

**Independent Test**: Quickstart A + D; open panel without expanding options; De/Para/Calcular works with defaults

### Implementation for User Story 1

- [x] T006 [US1] Reorder JSX in `frontend/src/components/routes/RoutePlannerPanel.tsx` to: title/close → De → Para → Calcular → error → options slot → results (contracts layout order; FR-001)
- [x] T007 [US1] Move transporte, ritmo, ordenação, preferência, and conditional velocidade out of the primary path into the options slot container in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-002) — body may still render always for now if collapse lands in US2; MUST NOT sit above Calcular
- [x] T008 [US1] Compact each result item to title band + single meta line `{mi} mi · {tempo} · Dentro {bp} · Fora {bp}` in `frontend/src/components/routes/RoutePlannerPanel.tsx` (research §5, FR-005)
- [x] T009 [P] [US1] Style compact result rows (title strong; meta muted/smaller; wrap only if needed) in `frontend/src/components/routes/RoutePlanner.css`
- [x] T010 [US1] Keep error / empty states visible in the primary flow (after Calcular / around results) in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-009)
- [x] T011 [US1] Smoke quickstart A (order + calc without expanding) + D (compact results) from `specs/055-clean-route-planner/quickstart.md`

**Checkpoint**: MVP — clean primary path + compact results; options may still be always-visible until US2 collapse

---

## Phase 4: User Story 2 — Ajustar opções sem perder poder (Priority: P1)

**Goal**: Collapsible “Opções de viagem” with non-default summary; all 046/050/054 behaviors preserved

**Independent Test**: Quickstart B + C; expand/collapse; auto-recalc; reopen → collapsed + defaults

### Implementation for User Story 2

- [x] T012 [US2] Wire options header as a button (“Opções de viagem” + chevron) with `aria-expanded` / `aria-controls` toggling `optionsOpen` in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-003, research §1)
- [x] T013 [US2] Show collapsed-header summary line only when `!optionsOpen` and fragments non-empty (join with ` · `); omit line when all defaults in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-003a, SC-006)
- [x] T014 [US2] Render options body (transporte, ritmo, ordenar, preferência, velocidade if próprio) only when `optionsOpen` in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-002/004)
- [x] T015 [P] [US2] Style options block header, chevron, collapsed summary, and expanded body in `frontend/src/components/routes/RoutePlanner.css`
- [x] T016 [US2] Preserve auto-recalc on modo / ordenação / preferência and velocidade-only-when-próprio while panel open (values persist on collapse) in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-004)
- [x] T017 [US2] Verify panel reopen: business defaults + `optionsOpen=false` + no summary line in `frontend/src/components/routes/RoutePlannerPanel.tsx` (FR-007)
- [x] T018 [US2] Run quickstart B (summary) + C (power intact) from `specs/055-clean-route-planner/quickstart.md`

**Checkpoint**: Progressive disclosure + power preserved

---

## Phase 5: User Story 3 — Legibilidade e etiquetas mais leves (Priority: P2)

**Goal**: Shorter ritmo/transporte labels; secondary h/dia hint; result hierarchy already from US1 reinforced if needed

**Independent Test**: Quickstart E; identify Normal/Intenso and Pago/Próprio in ≤ 30 s

### Implementation for User Story 3

- [x] T019 [US3] Shorten transporte radios to `Pago` / `Próprio` (legend “Transporte”) in `frontend/src/components/routes/RoutePlannerPanel.tsx` (research §4, FR-006)
- [x] T020 [US3] Shorten ritmo radios to `Normal` / `Intenso` and add muted `6 h/dia` / `8 h/dia` helper under the control when options expanded in `frontend/src/components/routes/RoutePlannerPanel.tsx` (research §4, FR-006)
- [x] T021 [P] [US3] Style muted ritmo helper / any leftover dense labels in `frontend/src/components/routes/RoutePlanner.css`
- [x] T022 [US3] Spot-check result title vs meta hierarchy still two bands after label work in `frontend/src/components/routes/RoutePlannerPanel.tsx` + CSS (SC-005)
- [x] T023 [US3] Run quickstart E (labels) from `specs/055-clean-route-planner/quickstart.md`

**Checkpoint**: Labels light; hierarchy clear

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Viewport QA, changelog, full quickstart

- [x] T024 Verify low viewport / scroll: De → Para → Calcular reachable without expanding options (quickstart F) in `frontend/src/components/routes/RoutePlannerPanel.tsx` + `RoutePlanner.css` (FR-008)
- [x] T025 [P] Add CHANGELOG entry under next patch (likely **[0.6.10]**) in `CHANGELOG.md` for painel Calcular rota mais limpo (progressive disclosure)
- [x] T026 Run full `specs/055-clean-route-planner/quickstart.md` (A–F); confirm no backend/`CampaignMap`/digitizer edits (FR-010)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T002) → **Foundational** (T003–T005) → **US1** (T006–T011) → **US2** (T012–T018) → **US3** (T019–T023) → **Polish** (T024–T026)
- US2 depends on T003–T004 and on US1 reorder (options slot under Calcular)
- US3 can start after US2 body exists (labels live inside expanded options)

### User Story Dependencies

- **US1 (P1)**: Layout order + compact results — MVP
- **US2 (P1)**: Depends on US1 options slot under Calcular; adds collapse + summary
- **US3 (P2)**: Depends on options body existing; label polish only

### Within Each User Story

- JSX structure before CSS polish where they touch the same control
- Story complete (incl. quickstart smoke) before next priority when sequential

### Parallel Opportunities

- T001 ∥ T002 (setup)
- T004 ∥ T005 after T003 (or T004 with T003 if same file — prefer sequential in Panel.tsx)
- T009 ∥ T008 after meta markup exists (CSS vs TSX)
- T015 ∥ T012–T014 carefully (same feature; prefer CSS after header markup)
- T021 ∥ T019–T020 (CSS vs label TSX)
- T025 ∥ T024 (docs vs viewport check)

---

## Parallel Example: User Story 1

```bash
# After T006–T007 reorder:
Task: "Compact result meta line in RoutePlannerPanel.tsx"
Task: "Style compact result rows in RoutePlanner.css"
```

---

## Parallel Example: User Story 2

```bash
# After options header markup exists:
Task: "Non-default summary line when collapsed in RoutePlannerPanel.tsx"
Task: "Style options header/chevron/summary in RoutePlanner.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational (`optionsOpen` + summary helper)
2. US1: reorder + move controls below Calcular + compact results
3. **STOP and VALIDATE** quickstart A + D
4. Then US2 collapse (without US2, options still visible but below Calcular — already cleaner)

### Incremental Delivery

1. Setup + Foundational → helpers ready  
2. US1 → primary path clean → demo MVP  
3. US2 → progressive disclosure + summary  
4. US3 → lighter labels  
5. Polish → CHANGELOG + full quickstart  

### Suggested MVP scope

**US1 only** (T001–T011): order + compact results. Ship US2 in the same PR if capacity allows — collapse is the core “clean” win.

---

## Notes

- Frontend-only; FR-010 forbids planner/API changes
- Summary microcopy: research §2 spirit; exact Portuguese fragments locked there
- Do not remove 046/050/054 controls — only hide behind collapse
- Same-file contention on `RoutePlannerPanel.tsx`: prefer sequential story order over parallel staff on US1/US2
