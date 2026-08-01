# Tasks: Borda escura no pin do grupo

**Input**: Design documents from `/specs/004-group-pin-border/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação visual via `quickstart.md` na fase Polish.

**Organization**: Uma user story (P1). Alteração cirúrgica em CSS do mapa.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar ponto de mudança e contrato visual

- [x] T001 Confirm group marker styles live in `frontend/src/components/map/CampaignMap.css` (`.campaign-map__party`, `.campaign-map__legend-party`) per `specs/004-group-pin-border/plan.md`
- [x] T002 [P] Skim `specs/004-group-pin-border/contracts/ui-group-border.md` and `research.md` (replace accent; drop-shadow if clip-path clips border)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Baseline visual atual — nenhuma infra nova

**⚠️ CRITICAL**: Completar antes da US1

- [x] T003 Note current group border uses accent (`border: 2px solid var(--color-accent)`) on `.campaign-map__party` in `frontend/src/components/map/CampaignMap.css`; local pins use dark `var(--color-bg)` — target parity of border role

**Checkpoint**: Alvo claro — substituir accent por contorno escuro no grupo + legenda

---

## Phase 3: User Story 1 — Grupo legível sobre o mapa (Priority: P1) 🎯 MVP

**Goal**: Ícone do grupo (bandeira/brasão) e legenda com borda escura, sem accent

**Independent Test**: Abrir o mapa; confirmar contorno escuro no grupo e na legenda; pins de local inalterados; alternar bandeira/brasão se possível

### Implementation for User Story 1

- [x] T004 [US1] Replace accent border on `.campaign-map__party` with dark outline matching local pins (`2px solid var(--color-bg)` and/or `filter: drop-shadow` if `clip-path` on bandeira clips the border) in `frontend/src/components/map/CampaignMap.css`
- [x] T005 [US1] Ensure both `.campaign-map__party--bandeira` and `.campaign-map__party--brasao` show a continuous dark outline (no accent) in `frontend/src/components/map/CampaignMap.css`
- [x] T006 [US1] Apply the same dark outline treatment to `.campaign-map__legend-party` (and `--bandeira` / `--brasao` variants) in `frontend/src/components/map/CampaignMap.css`
- [x] T007 [US1] Verify local pin styles (`.campaign-map__pin`) remain unchanged in `frontend/src/components/map/CampaignMap.css`

**Checkpoint**: US1 testável — mapa + legenda com borda escura; sem blurple no grupo

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Validação quickstart

- [x] T008 Run scenarios A–E from `specs/004-group-pin-border/quickstart.md` (bandeira, brasão, legenda, pins intactos, zoom) and fix any remaining accent bleed in `CampaignMap.css`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US1** → **Polish**
- Só uma user story; MVP = Phase 3

### User Story Dependencies

- **US1 (P1)**: Após Foundational; sem dependências de outras stories

### Parallel Opportunities

- T001 e T002 em Setup
- T004–T006 tocam o mesmo arquivo → sequenciais (não marcar [P] entre si)

---

## Parallel Example: Setup

```bash
Task: "Confirm styles in CampaignMap.css"
Task: "Skim ui-group-border.md and research.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational
2. T004–T007 (CSS)
3. T008 quickstart
4. Done

### Incremental Delivery

Único incremento: aparência do grupo. Entregar após T008.

---

## Notes

- Preferir só `CampaignMap.css`; JSX só se inevitável
- `clip-path` na bandeira: preferir `drop-shadow` escuro se `border` for cortada (research.md)
