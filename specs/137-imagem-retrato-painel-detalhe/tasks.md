# Tasks: Exibição da imagem do personagem no painel de detalhe (Relações)

**Input**: Design documents from `/specs/137-imagem-retrato-painel-detalhe/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/detail-portrait-layout.md](./contracts/detail-portrait-layout.md), [quickstart.md](./quickstart.md)

**Depends on**: Existing `ImageSlot` + conditional render in `PersonagemDetailBody` (spec 133 area).

**Tests**: OPTIONAL (UI polish — Constitution II MAY). Validation via [quickstart.md](./quickstart.md) visual + `tsc`. No pytest/API.

**Organization**: Uma user story P1 (US1). Paths are repo-relative.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete deps)
- **[Story]**: [US1]
- Setup / Foundational / Polish: no story label

---

## Phase 1: Setup

**Purpose**: Confirm bug surface and form pattern to copy

- [X] T001 Skim `frontend/src/pages/RelacoesPage.tsx` — `PersonagemDetailBody` `ImageSlot` with `className="relacoes-page__detail-portrait"` only when `retrato_url` (no JSX change expected)
- [X] T002 [P] Skim `frontend/src/pages/RelacoesPage.css` (`.relacoes-page__detail-portrait { max-height: 140px }` only) and form chrome in `frontend/src/components/media/ImageSlot.css` (`.npc-form__portrait.image-slot` / `.local-form__image.image-slot` + `img`)
- [X] T003 [P] Skim [contracts/detail-portrait-layout.md](./contracts/detail-portrait-layout.md) — width 100%, contain, max-height 140px, no dashed placeholder, padding 0

---

## Phase 2: Foundational — N/A beyond skim

**Purpose**: No new component; CSS recipe is the feature

- [X] T004 Confirm `ImageSlot` base (`.image-slot`) dashed border + padding is what causes the “placeholder sides” look when img does not fill width — fix via detail-portrait override, not by changing base empty-state for forms

**Checkpoint**: Ready to add detail-portrait rules next to form block

---

## Phase 3: User Story 1 — Retrato preenche o painel corretamente (P1) 🎯 MVP

**Goal**: Detail portrait fills panel width proportionally without dashed side frame

**Independent Test**: [quickstart.md](./quickstart.md) §1–4

### Implementation

- [X] T005 [US1] In `frontend/src/components/media/ImageSlot.css`, add `.relacoes-page__detail-portrait.image-slot` (+ `img`) mirroring form portrait rules: `width/max-width: 100%`, `height: auto`, `max-height: 140px`, `padding: 0`, `object-fit: contain`, `display: block` on img — per [contracts/detail-portrait-layout.md](./contracts/detail-portrait-layout.md)
- [X] T006 [US1] On the detail-portrait block in `frontend/src/components/media/ImageSlot.css`, set `border: none` (and neutral/transparent background if needed) so a loaded portrait never looks like an empty placeholder (FR-001 / research Decisão 3)
- [X] T007 [US1] Remove the incomplete `.relacoes-page__detail-portrait { max-height: 140px }` rule from `frontend/src/pages/RelacoesPage.css` so `ImageSlot.css` is the single source of truth
- [X] T008 [US1] Confirm `frontend/src/pages/RelacoesPage.tsx` still mounts `ImageSlot` only when `personagem.retrato_url` (aceitação 3 — no empty placeholder in detail)

**Checkpoint**: Vertical/landscape portraits fill width, ≤140px tall, no dashed sides; no-retrato unchanged

---

## Phase 4: Polish & Cross-Cutting

**Purpose**: Gates and docs

- [X] T009 Run [quickstart.md](./quickstart.md) §1–4 (vertical, proportions, no portrait, mobile ~390px)
- [X] T010 [P] Run `npx tsc -p tsconfig.app.json --noEmit` in `frontend/` until clean
- [X] T011 [P] Grep sanity from quickstart §5 (`detail-portrait` rules complete in `ImageSlot.css`; not only `max-height` in `RelacoesPage.css`)
- [X] T012 [P] Note feature in `CHANGELOG.md` (Unreleased) — Relações detail portrait layout parity with form ImageSlot (width 100%, max-height 140px)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 (3)** → **Polish (4)**
- T005 → T006 → T007 (CSS then cleanup); T008 can follow or parallel with T007 (different concern, same story)

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| **US1** | Phase 2 | Only story; is the MVP |

### Parallel Opportunities

```text
T001 || T002 || T003
T010 || T011 || T012
```

---

## Implementation Strategy

### MVP

1. Full CSS recipe on `.relacoes-page__detail-portrait` in `ImageSlot.css` (T005–T006)
2. Drop incomplete page CSS (T007)
3. Visual quickstart + CHANGELOG

### Incremental Delivery

CSS-only ship; no API/JSX behaviour change.

---

## Format Validation

- All tasks use `- [ ]`, sequential `T00N`, file paths, and `[US1]` on story phase only.
- No automated test tasks (UI polish MAY).
- Do not change NPC/Local form `max-height: 50vh`.
