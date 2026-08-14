# Tasks: Legenda da Rede no mesmo sítio que no mapa

**Input**: Design documents from `/specs/091-relacoes-legend-position/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = chave no canto inferior esquerdo do palco (P1 MVP)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Docs / version: `docs/manual-relacoes.md`, `CHANGELOG.md`, `README.md`, package manifests

---

## Phase 1: Setup

**Purpose**: Align with overlay contract and current palco / coluna / mapa legend

- [x] T001 Skim `specs/091-relacoes-legend-position/contracts/ui-legend-overlay.md`, `research.md`, `data-model.md`, and `quickstart.md`
- [x] T002 [P] Skim `frontend/src/components/relacoes/GraphStage.tsx` (`.graph-stage` vs `__world` vs `__zoom`), `frontend/src/components/relacoes/RelacoesSideColumn.tsx` (bloco `.relacoes-side__legend`), and `frontend/src/components/map/CampaignMap.css` (`.campaign-map__legend` left/bottom)

---

## Phase 2: Foundational (Blocking)

**Purpose**: Confirm the overlay must sit outside `__world` so it does not pan/zoom; zoom stays a sibling

**⚠️ CRITICAL**: Do not put the legend inside `.graph-stage__world`. Do not change `graphLayout.ts` or 087–089 constants. Do not edit `CampaignMap` legend. Do not make the overlay clickable.

- [x] T003 Confirm `frontend/src/components/relacoes/GraphStage.tsx` renders `__zoom` as a sibling of `__world` (both under `.graph-stage`), and that pan/zoom only transform `__world`

**Checkpoint**: Overlay as sibling of zoom is the placement strategy

---

## Phase 3: User Story 1 - Encontrar a legenda da Rede no mesmo sítio que no mapa (Priority: P1) 🎯 MVP

**Goal**: Vertical compact overlay on the stage (bottom-left, no background, opacity 0.55, no title, pointer-events none); column loses the legend block; zoom stays bottom-right

**Independent Test**: Quickstart scenarios 1–8 (same corner as map, column without legend, compact form, fixed on pan/zoom, click-through, mobile, empty stage, i18n)

### Implementation for User Story 1

- [x] T004 [P] [US1] In `frontend/src/components/relacoes/GraphStage.css`, add `.graph-stage__legend` (absolute left/bottom like `.campaign-map__legend`, `max-width: calc(100% - 5.5rem)`, `z-index: 3`, `pointer-events: none`, `opacity: 0.55`, no background/border, vertical compact list: ~0.65rem, gap ~2px, discs ~10px) and raise `.graph-stage__zoom` to `z-index` ≥ 4
- [x] T005 [US1] In `frontend/src/components/relacoes/GraphStage.tsx`, render the overlay as a sibling of `.graph-stage__zoom` (not inside `__world`): PJ/NPC discs then `VINCULO_TIPOS` lines/labels; no visible title; `aria-label={t('column.legend')}`; reuse `comum:tipo.*` and `getVinculoTipoLabel`
- [x] T006 [P] [US1] In `frontend/src/components/relacoes/RelacoesSideColumn.tsx` and `RelacoesSideColumn.css`, remove the `.relacoes-side__legend` block (title, PJ/NPC, hr, tipos) so the column ends at Isolar; drop unused legend CSS

**Checkpoint**: Quickstart 1–8 pass; overlay does not move with pan/zoom; clicks hit discs; column has no legend

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Manual, version 0.19.1, changelog, build, spec status

- [x] T007 [P] In `docs/manual-relacoes.md`, move the legenda description from the coluna to the palco (canto inferior esquerdo; lista vertical compacta; sem fundo); coluna no longer lists «Legenda»
- [x] T008 [P] Add `[0.19.1]` **Changed** entry in `CHANGELOG.md` (chave da Rede no palco, canto inferior esquerdo; spec 091)
- [x] T009 [P] Bump version to **0.19.1** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`; add 091 row in `specs/v2/README.md` follow-ups table
- [x] T010 Run `cd frontend && npm run build` then `specs/091-relacoes-legend-position/quickstart.md`
- [x] T011 Set **Status: Implemented** in `specs/091-relacoes-legend-position/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T002) → Foundational (T003) → US1 (T004–T006) → Polish
- T005 depends on T004 (CSS classes)
- T006 ∥ T004 (different files)
- Polish after US1

### User Story Dependencies

- **US1**: Only story; T004 ∥ T006 → T005 (T005 after T004)

### Parallel Opportunities

- T001 ∥ T002
- T004 ∥ T006
- T007 ∥ T008 ∥ T009 (after T006)

---

## Parallel Example: Setup

```bash
Task: "Skim 091 contracts/research (T001)"
Task: "Skim GraphStage + SideColumn + map legend CSS (T002)"
```

---

## Parallel Example: US1 overlay vs coluna

```bash
Task: "GraphStage.css overlay (T004)"
Task: "Remove SideColumn legend (T006)"
```

---

## Parallel Example: Polish docs

```bash
Task: "docs/manual-relacoes.md (T007)"
Task: "CHANGELOG 0.19.1 (T008)"
Task: "Bump manifests 0.19.1 (T009)"
```

---

## Implementation Strategy

### MVP

1. Setup + Foundational (T001–T003)
2. US1 (T004–T006) — CSS overlay, markup on stage, remove column legend
3. **STOP and VALIDATE**: Quickstart 1–8
4. 0.19.1 + quickstart

### Incremental Delivery

1. Setup + Foundational → sibling-of-zoom strategy confirmed
2. US1 → overlay on palco (MVP)
3. Polish → 0.19.1

### Notes

- Sem backend, sem Vitest
- `pointer-events: none` na overlay; zoom continua clicável
- Não editar `CampaignMap` nem `graphLayout.ts`
- `column.legend` fica como `aria-label`, não como título visível
- `docs/v2/feature-rede-relacoes.md` fora de âmbito
