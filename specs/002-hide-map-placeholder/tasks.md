# Tasks: Ocultar placeholder quando o mapa já existe

**Input**: Design documents from `/specs/002-hide-map-placeholder/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados na spec — validação via quickstart.md

**Organization**: Por user story (P1 → P2). Escopo mínimo: só `CampaignMap`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Paralelo (arquivos diferentes)
- **[Story]**: [US1] / [US2]
- Paths sob `frontend/src/components/map/`

---

## Phase 1: Setup

**Purpose**: Confirmar ponto de mudança

- [x] T001 Confirm `CampaignMap` is the shared map surface for `/` and `/admin` in `frontend/src/pages/MapPage.tsx` and `frontend/src/pages/AdminPage.tsx`

---

## Phase 2: Foundational

**Purpose**: Alinhar CSS para não sobrescrever ocultação do placeholder

**⚠️ CRITICAL**: Completar antes das stories de comportamento

- [x] T002 Fix placeholder visibility CSS so hidden state wins over `display: grid` in `frontend/src/components/map/CampaignMap.css` (e.g. `[hidden]` / `.is-hidden { display: none !important; }` or only apply grid when visible)

**Checkpoint**: CSS não força o placeholder visível quando marcado oculto

---

## Phase 3: User Story 1 — Ver o mapa real sem mensagem de envio (Priority: P1) 🎯 MVP

**Goal**: Com mapa carregado, mensagem de “envie a imagem” não aparece

**Independent Test**: Com `backend/uploads/map/campaign-map.*` válido, abrir `/` e `/admin` — só a imagem, sem o texto de envio

### Implementation for User Story 1

- [x] T003 [US1] Add React state for map load failure (default false) in `frontend/src/components/map/CampaignMap.tsx`
- [x] T004 [US1] Wire `img` `onLoad` to clear failure state and keep placeholder unmounted/hidden in `frontend/src/components/map/CampaignMap.tsx`
- [x] T005 [US1] Render placeholder message only when failure state is true (not merely via HTML `hidden` attribute) in `frontend/src/components/map/CampaignMap.tsx`
- [x] T006 [US1] Reset failure state when `mapUrl` prop changes (useEffect) in `frontend/src/components/map/CampaignMap.tsx`

**Checkpoint**: US1 validável com campaign-map presente (SC-001)

---

## Phase 4: User Story 2 — Placeholder só quando falta o mapa (Priority: P2)

**Goal**: Sem mapa / falha de carga → empty state com orientação ao GM

**Independent Test**: Remover/renomear `campaign-map.*`, hard refresh — mensagem visível; restaurar — mensagem some

### Implementation for User Story 2

- [x] T007 [US2] Wire `img` `onError` to set failure state and hide/suppress broken image display in `frontend/src/components/map/CampaignMap.tsx`
- [x] T008 [US2] Ensure empty-state copy remains the GM upload guidance text in `frontend/src/components/map/CampaignMap.tsx`
- [x] T009 [US2] Verify mutual exclusivity: never show guidance text over a successfully loaded map (FR-004) in `frontend/src/components/map/CampaignMap.tsx` and `CampaignMap.css`

**Checkpoint**: US1+US2; cenários com/sem arquivo cobertos

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validação E2E do quickstart

- [x] T010 Run quickstart scenarios in `specs/002-hide-map-placeholder/quickstart.md` against `/` and `/admin`
- [x] T011 [P] Confirm `npm run build` succeeds in `frontend/` after changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → sem dependências
- **Phase 2** → após Phase 1; bloqueia US1/US2 se CSS ainda vaza o placeholder
- **Phase 3 US1** → após Phase 2 (MVP)
- **Phase 4 US2** → após Phase 2; naturalmente usa o mesmo estado da US1
- **Phase 5** → após US1+US2

### User Story Dependencies

- **US1**: Independente após foundation (testar com mapa presente)
- **US2**: Completa o mesmo estado `onError`; depende da infraestrutura de estado da US1 (T003–T006)

### Parallel Opportunities

- T010 e T011 após implementação
- T002 pode começar em paralelo com T001 se desejado (arquivos diferentes)

---

## Parallel Example: Polish

```bash
Task: "T010 Run quickstart scenarios"
Task: "T011 Confirm npm run build in frontend/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001–T002  
2. T003–T006  
3. **STOP** — validar com campaign-map presente  

### Incremental Delivery

1. Foundation CSS  
2. US1 (ocultar quando mapa ok)  
3. US2 (mostrar quando falha)  
4. Quickstart  

### Suggested MVP Scope

**T001–T006** — com mapa, mensagem some.

---

## Notes

- Não criar endpoints nem alterar upload
- MapPage/AdminPage não precisam mudar se `CampaignMap` estiver correto
- Commit após US1 e após US2
