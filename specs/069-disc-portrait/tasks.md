# Tasks: Disc Portrait

**Input**: Design documents from `/specs/069-disc-portrait/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual visual QA via `quickstart.md` — no automated TDD suite requested.

**Organization**: US1 = retrato a preencher o disco (ou iniciais); US2 = estados visuais no disco com foto; US3 = upload/remoção reflecte no grafo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: US1 / US2 / US3
- Paths relative to monorepo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock contract and current disc markup

- [x] T001 Skim `specs/069-disc-portrait/contracts/ui-disc-portrait.md` and `research.md` (cover crop; initials under img; `onError` reveals initials)
- [x] T002 [P] Confirm disc today is initials-only (`<span>{initials(p.nome)}</span>`) and `Personagem.retrato_url` is already on graph nodes in `frontend/src/components/relacoes/GraphStage.tsx` and `frontend/src/types/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Clip the 58px disc so a photo cannot spill; do not change `DISC` / 067 / 068

**⚠️ CRITICAL**: US1–US3 assume this clip

- [x] T003 Add `overflow: hidden` on `.graph-node__disc` and styles for `.graph-node__disc img` (`width`/`height` 100%, `object-fit: cover`, `object-position: center`, `display: block`) in `frontend/src/components/relacoes/GraphStage.css` without changing disc size, borders, halo, or grayscale

**Checkpoint**: Disc still shows initials; CSS ready for an overlay image

---

## Phase 3: User Story 1 — Disco com retrato quando existe (Priority: P1) 🎯 MVP

**Goal**: If `retrato_url` is set and loads, the disc is filled with that photo (centred cover). If missing, initials remain. Name/papel stay below. Detail panel stays `contain`.

**Independent Test**: Quickstart scenarios 1–3 (`specs/069-disc-portrait/quickstart.md`)

### Implementation for User Story 1

- [x] T004 [US1] In `frontend/src/components/relacoes/GraphStage.tsx`, keep initials as the disc base layer; when `p.retrato_url` is set, overlay `<img src={p.retrato_url} alt="" />` (decorative; name is adjacent)
- [x] T005 [US1] On `onError` of that image in `frontend/src/components/relacoes/GraphStage.tsx`, hide the `<img>` so initials show (never a blank disc). Reset the error state when `retrato_url` changes (small inner component or `key={retrato_url}`)
- [x] T006 [US1] Smoke quickstart scenarios 1–3 from `specs/069-disc-portrait/quickstart.md` (cover, no overflow, initials without URL, same asset vs detail panel)

**Checkpoint**: MVP — faces in discs; initials when no portrait

---

## Phase 4: User Story 2 — Estados visuais do disco não se perdem (Priority: P2)

**Goal**: PJ/NPC border, selection halo, morto grayscale, and ~28% unfocused fade still apply when the disc contains a photo

**Independent Test**: Quickstart scenario 4

### Implementation for User Story 2

- [x] T007 [US2] Confirm `--selected` halo, `--pj`/`--npc` borders, `--morto` grayscale, and node `opacity` still apply to discs with photos in `frontend/src/components/relacoes/GraphStage.css` (fix img/`filter` conflicts only if a smoke check fails)
- [x] T008 [US2] Smoke quickstart scenario 4 from `specs/069-disc-portrait/quickstart.md`

**Checkpoint**: Photo discs match text-only discs for focus / morto / fade

---

## Phase 5: User Story 3 — Retrato actualizado reflecte-se no grafo (Priority: P2)

**Goal**: After GM add/remove portrait, the disc updates on the next list refresh; invalid URL falls back to initials

**Independent Test**: Quickstart scenario 5

### Implementation for User Story 3

- [x] T009 [US3] Confirm RelacoesPage already passes refreshed `personagens` (including `retrato_url`) into `frontend/src/components/relacoes/GraphStage.tsx` after save; img `src` / error reset follow the new URL
- [x] T010 [US3] Smoke quickstart scenario 5 from `specs/069-disc-portrait/quickstart.md` (add, remove, optional broken URL)

**Checkpoint**: Ficha and disc stay in sync without a full page reload beyond existing list refresh

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Changelog, version, spec status

- [x] T011 [P] Add CHANGELOG note for disc portraits in `CHANGELOG.md`
- [x] T012 [P] Bump patch version (0.8.3) in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T013 Mark feature status Implemented in `specs/069-disc-portrait/spec.md` if acceptance matches

---

## Dependencies & Execution Order

```text
Setup → Foundational (T003 CSS clip) → US1 (img + onError) → US2 (state smoke) → US3 (refresh smoke) → Polish
```

US2 and US3 depend on US1 putting the photo in the disc. US2 is CSS verification; US3 is data-flow verification.

### Parallel opportunities

- T001 ∥ T002
- T007 and T009 can be inspected together after US1, but smokes stay sequential
- T011 ∥ T012 after visual pass

### Independent tests (summary)

| Story | Independent test |
|-------|------------------|
| US1 | Portrait fills disc; no portrait → initials; same `retrato_url` as ficha |
| US2 | Halo / morto / ~28% fade still visible on photo discs |
| US3 | Add/remove portrait updates the disc; broken URL → initials |

### MVP scope

**T003 + US1** (clip + cover image + initials fallback).

## Implementation Strategy

1. Clip disc + overlay `img` with cover crop
2. `onError` → initials; reset on URL change
3. Smoke visual states and GM upload/remove
4. Changelog / version / Implemented

## Format validation

All tasks use `- [ ]`, sequential `T00N` IDs, optional `[P]`, story labels only on US phases, and concrete file paths.
