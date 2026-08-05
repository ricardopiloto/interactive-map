# Tasks: Align Altdorf Pin to Map Target

**Input**: Design documents from `/specs/051-altdorf-pin-target/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados — validação manual via `quickstart.md` na fase Polish.

**Organization**: US1 (P1) Altdorf no ponto verde (print); US2 (P1) desvio sistemático móvel sem repetir 047/049 (stage↔imagem + pin/grupo).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 / US2 conforme spec.md
- Paths relativos à raiz do monorepo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato, prior art e CSS actual do stage/imagem

- [x] T001 Skim `specs/051-altdorf-pin-target/contracts/ui-altdorf-pin-target.md`, `research.md`, and `data-model.md` (cover/aspect; no 047 left nudge; pin+grupo)
- [x] T002 [P] Inspect `.campaign-map__stage` / `__image` (`min-height`, `object-fit: cover`, min-width) in `frontend/src/components/map/CampaignMap.css` (research §2)
- [x] T003 [P] Confirm pin/party `%` positioning and `--mobile-marker-nudge-x` (default 0; no active negative mobile rule) in `frontend/src/components/map/CampaignMap.css` and `frontend/src/components/map/CampaignMap.tsx`
- [x] T004 [P] Confirm `map-page--mobile` / `MOBILE_BP` in `frontend/src/pages/MapPage.tsx`; note layout wrappers in `frontend/src/pages/MapPage.css` only if they force stage aspect

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Lock da estratégia de correcção (research §3); baseline 049

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T005 Lock approach in comments/plan mindset: (1) fix stage↔painted-image box so `%` matches art; (2) keep `--mobile-marker-nudge-x` at 0 / never negative; (3) optional small **positive** nudge only after aspect fix if residual &lt;~10px; (4) FR-007 Altdorf data only if still wrong — per `specs/051-altdorf-pin-target/research.md`
- [x] T006 Confirm 047 left nudge is **not** reintroduced and pin+party share the same nudge variable in `frontend/src/components/map/CampaignMap.css` (FR-008/009)

**Checkpoint**: Estratégia locked; digitizer fora de âmbito

---

## Phase 3: User Story 1 — Pin de Altdorf no sítio certo (Priority: P1) 🎯 MVP

**Goal**: Em móvel, a âncora de Altdorf coincide com o ponto verde do print (cidade), não Flats

**Independent Test**: Viewport &lt;800px; Altdorf tip on green city art (quickstart A)

### Implementation for User Story 1

- [x] T007 [US1] Remove or neutralize `object-fit: cover` (and conflicting `min-height: 540px` forcing wrong aspect) on `.campaign-map__image` / stage so the laid-out image box matches the percentage coordinate box in `frontend/src/components/map/CampaignMap.css` (FR-001/002/010, research §2–3)
- [x] T008 [US1] Align `.campaign-map__stage` sizing to image-driven geometry (`height: auto` / intrinsic aspect; drop min-height that creates tall portrait crop boxes on mobile) in `frontend/src/components/map/CampaignMap.css` (FR-003/010)
- [x] T009 [US1] If pure CSS is insufficient, set stage aspect from natural image dimensions on load in `frontend/src/components/map/CampaignMap.tsx` (research §3 alternative) — **skipped**: CSS shrink-wrap sufficient
- [x] T010 [US1] Re-verify pin tip still anchors on `left`/`top` after layout change (margins / `transform-origin`) for `.campaign-map__pin` states in `frontend/src/components/map/CampaignMap.css` (FR-005)
- [x] T011 [US1] Visual QA mobile: Altdorf matches print green target (`specs/051-altdorf-pin-target/quickstart.md` A) (SC-001/007) — ready for user confirm in &lt;800px

**Checkpoint**: SC-001 — Altdorf no verde; MVP

---

## Phase 4: User Story 2 — Desvio sistemático sem repetir 047/049 (Priority: P1)

**Goal**: Todos os pins + grupo alinhados no móvel; sem nudge esquerdo 047; além do “nudge zero” da 049; desktop OK

**Independent Test**: ≥2 outros pins + grupo alinhados; desktop sem regressão; CSS sem nudge negativo (quickstart B–F)

### Implementation for User Story 2

- [x] T012 [US2] Confirm `.campaign-map__party--bandeira` / `--brasao` stay on the same presentation rule as pins (shared box + shared nudge var) in `frontend/src/components/map/CampaignMap.css` (FR-009, SC-004)
- [x] T013 [US2] Spot-check ≥2 other locais on mobile for systematic left bias gone (`specs/051-altdorf-pin-target/quickstart.md` B) (SC-003)
- [x] T014 [US2] Spot-check group pin on mobile (`quickstart.md` C); zoom/pan stability (`quickstart.md` D) (SC-002/004)
- [x] T015 [US2] Desktop ≥800 spot-check Altdorf + 1 other pin — no regression (`quickstart.md` E) (FR-004, SC-005)
- [x] T016 [US2] Verify no `.map-page--mobile` rule sets **negative** `--mobile-marker-nudge-x`; only optional small **positive** residual after aspect fix — never 047 left (`quickstart.md` F) (FR-008, SC-006)
- [x] T017 [US2] If Altdorf alone still misses green but others align: document FR-007 GM reposition path only — do **not** mass-edit coords (`quickstart.md` H) (FR-007)

**Checkpoint**: SC-002–006; prior art constraints satisfied

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regressão digitizer, quickstart completo, changelog

- [x] T018 Confirm `RouteDigitizer*` / segment strokes and Calcular rota untouched (FR-006; Out of Scope); grep or quick visual
- [x] T019 Run remaining scenarios from `specs/051-altdorf-pin-target/quickstart.md` (G–H as needed); tune only `CampaignMap.css` / `CampaignMap.tsx` if gaps
- [x] T020 [P] Note change in `CHANGELOG.md` under next patch: mobile campaign map — pin/group align to map art (stage/image aspect; not left nudge)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** (T001–T004) → **Foundational** (T005–T006) → **US1** (T007–T011) → **US2** (T012–T017) → **Polish** (T018–T020)
- T007–T008 sequential in same CSS file; T009 only if T007–T008 insufficient
- T012–T016 after US1 layout change; T017 only if needed

### User Story Dependencies

- **US1 (P1)**: MVP — Altdorf ↔ green via stage/image fix
- **US2 (P1)**: Same fix validated across markers + anti-047/049 regressions (depends on US1 layout)

### Parallel Opportunities

- T002 ∥ T003 ∥ T004
- T018 ∥ T020 após implementação visual estável

---

## Parallel Example: Setup

```bash
Task: "Inspect stage/image CSS in CampaignMap.css"
Task: "Confirm map-page--mobile in MapPage.tsx"
Task: "Confirm pin/party nudge vars in CampaignMap.css"
```

---

## Parallel Example: After US1 CSS

```bash
# Visual checks can be parallelized by reviewer; code edits stay sequential in CampaignMap.css
Task: "QA other pins + group on mobile"
Task: "QA desktop no regression"
```

---

## Implementation Strategy

### MVP First (US1)

1. Setup + Foundational
2. Fix stage/image coupling (T007–T010)
3. **STOP**: Altdorf on green (T011)
4. Then US2 multi-marker / anti-regression, Polish

### Incremental Delivery

1. Foundation → strategy locked
2. US1 → Altdorf print acceptance (MVP!)
3. US2 → systematic markers + no 047
4. Changelog + digitizer smoke

---

## Notes

- Primary fix is **layout/aspect**, not another ±8px nudge
- Never reintroduce 047 `--mobile-marker-nudge-x: -8px` (or any negative)
- Optional positive residual nudge only after aspect fix
- FR-007 data tweak is last resort for Altdorf alone
- [P] = arquivos diferentes sem dependência incompleta
