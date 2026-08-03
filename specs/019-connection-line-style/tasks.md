# Tasks: Estilo das linhas de conexão

**Input**: Design documents from `/specs/019-connection-line-style/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação visual via `quickstart.md` na fase Polish.

**Organization**: Duas user stories (P1 estilo da rota; P2 distinção vs pin visitado). Alteração cirúrgica em CSS do mapa.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar ponto de mudança e contrato visual

- [x] T001 Confirm connection line styles live in `frontend/src/components/map/CampaignMap.css` (`.campaign-map__connection-line`) and overlay markup uses that class in `frontend/src/components/map/CampaignMap.tsx` per `specs/019-connection-line-style/plan.md`
- [x] T002 [P] Skim `specs/019-connection-line-style/contracts/ui-connection-line-style.md` and `specs/019-connection-line-style/research.md` (visited red lighter; opacity ~55–65%; soft `drop-shadow`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Baseline visual atual — nenhuma infra nova

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 Note current `.campaign-map__connection-line` uses accent purple (`color-mix` with `var(--color-accent-300, #9184d9)`) and no soft shadow in `frontend/src/components/map/CampaignMap.css`; visited pin reference is `#e5484d` — replace stroke family and add opacity + shadow targets from the contract

**Checkpoint**: Alvo claro — vermelho visitado mais claro, opacidade moderada, sombra suave; sem accent roxo

---

## Phase 3: User Story 1 — Reconhecer a rota no mapa (Priority: P1) 🎯 MVP

**Goal**: Linhas de conexão em vermelho claro (família visitado), opacidade ~55–65%, sombra suave; visibilidade 017 intacta

**Independent Test**: Selecionar local com ≥1 saída; confirmar cor, transparência e sombra; deselecionar e confirmar que as linhas somem

### Implementation for User Story 1

- [x] T004 [US1] Replace accent purple `stroke` on `.campaign-map__connection-line` with lighter visited-red family (`#e5484d` lightened via `color-mix` or equivalent) in `frontend/src/components/map/CampaignMap.css`
- [x] T005 [US1] Apply moderate opacity (~55–65%) to the connection stroke (single mechanism: `color-mix` with transparent **or** `stroke-opacity`, not both stacked) in `frontend/src/components/map/CampaignMap.css`
- [x] T006 [US1] Add soft/discreet `filter: drop-shadow(...)` on `.campaign-map__connection-line` (no colored glow/animation) in `frontend/src/components/map/CampaignMap.css`
- [x] T007 [US1] Verify visibility rules unchanged: lines still only render when origin is selected with valid `saida_ids` in `frontend/src/components/map/CampaignMap.tsx` (no JSX logic change expected)

**Checkpoint**: US1 testável — rotas vermelho-claras, translúcidas, com sombra; somem ao deselecionar

---

## Phase 4: User Story 2 — Não confundir com pin visitado (Priority: P2)

**Goal**: Linha claramente mais clara/transparente que o preenchimento sólido do pin visitado

**Independent Test**: Selecionar local com pin `#e5484d` (ou cor visitada) e saídas; comparar linha vs pin

### Implementation for User Story 2

- [x] T008 [US2] Confirm `.campaign-map__pin` fill / visited color (`#e5484d`) and other pin/party styles remain unchanged while connection stroke stays lighter/more transparent in `frontend/src/components/map/CampaignMap.css`
- [x] T009 [US2] Fine-tune lighten mix on `.campaign-map__connection-line` if line still reads as solid-pin-red beside a visited pin (keep opacity band ~55–65%) in `frontend/src/components/map/CampaignMap.css`

**Checkpoint**: US2 testável — linha ≠ pin visitado sólido

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validação quickstart

- [x] T010 Run scenarios A–E from `specs/019-connection-line-style/quickstart.md` (cor, opacidade, sombra, visibilidade 017, distinção vs pin) and adjust only `.campaign-map__connection-line` in `frontend/src/components/map/CampaignMap.css` if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US1** → **US2** → **Polish**
- MVP = Phase 3 (US1)

### User Story Dependencies

- **US1 (P1)**: Após Foundational; sem dependência de outras stories
- **US2 (P2)**: Após US1 (mesmo seletor CSS; ajuste fino de contraste)

### Parallel Opportunities

- T001 e T002 em Setup
- T004–T006 tocam o mesmo arquivo → sequenciais (não marcar [P] entre si)
- T008–T009 sequenciais no mesmo CSS

---

## Parallel Example: Setup

```bash
Task: "Confirm styles in CampaignMap.css / CampaignMap.tsx"
Task: "Skim ui-connection-line-style.md and research.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup + Foundational
2. T004–T007 (CSS + verify visibility)
3. Quick visual check (cor / opacidade / sombra / hide)
4. Optionally continue US2 + T010

### Incremental Delivery

1. US1: estilo da rota
2. US2: contraste vs pin visitado
3. Polish: quickstart A–E

---

## Notes

- Preferir só `CampaignMap.css`; JSX só se inevitável
- Um único mecanismo de transparência (evitar dupla diluição)
- `box-shadow` em `<line>` é frágil — preferir `drop-shadow` (research.md)
- Implemented 2026-08-03: `stroke: color-mix(#e5484d 68%, white)`, `stroke-opacity: 0.6`, soft `drop-shadow`; JSX untouched
