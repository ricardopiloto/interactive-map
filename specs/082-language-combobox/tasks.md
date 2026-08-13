# Tasks: Seletor de Idioma em Combo-box

**Input**: Design documents from `/specs/082-language-combobox/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = trigger + listbox + change language; US2 = keyboard, focus return, narrow viewport

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Docs / version: `CHANGELOG.md`, `README.md`, package manifests

---

## Phase 1: Setup

**Purpose**: Align with contract and existing combobox patterns

- [x] T001 Skim `specs/082-language-combobox/contracts/ui-language-combobox.md`, `research.md`, and `data-model.md`
- [x] T002 [P] Skim `frontend/src/components/layout/LanguageSelector.tsx`, `LanguageSelector.css`, `CodexHeader.tsx`, and keyboard/listbox patterns in `frontend/src/components/routes/WaypointCombobox.tsx`

---

## Phase 2: Foundational (Blocking)

**Purpose**: i18n option labels ready before rewriting the control

**⚠️ CRITICAL**: List labels must exist in both locales before the new UI mounts

- [x] T003 [P] Add `language.pt` and `language.en` to `frontend/src/locales/pt-BR/comum.json` (Português / Inglês); keep existing `language.aria`
- [x] T004 [P] Add `language.pt` and `language.en` to `frontend/src/locales/en/comum.json` (Portuguese / English); keep existing `language.aria`

**Checkpoint**: `t('language.pt')` / `t('language.en')` resolve in both locales

---

## Phase 3: User Story 1 - Escolher idioma num combo-box (Priority: P1) 🎯 MVP

**Goal**: Single ghost trigger (sigla + chevron) opens Nocturne listbox; choosing applies language without reload and persists

**Independent Test**: Quickstart 1–4 (single control; PT/EN list labels; persist; instant switch)

### Implementation for User Story 1

- [x] T005 [US1] Rewrite `frontend/src/components/layout/LanguageSelector.tsx`: replace two-button group with trigger + `role="listbox"` options per `contracts/ui-language-combobox.md`; call `i18n.changeLanguage` on select; close list after choose
- [x] T006 [US1] Restyle `frontend/src/components/layout/LanguageSelector.css`: compact trigger, decorative chevron (`aria-hidden`), dropdown panel (Nocturne surface/elevation), accent highlight for `aria-selected` option (no checkmark)
- [x] T007 [US1] Confirm `frontend/src/components/layout/CodexHeader.tsx` still renders `<LanguageSelector />` before the GM toggle with no layout change required

**Checkpoint**: Quickstart 1–4 pass; no two side-by-side PT/EN buttons remain

---

## Phase 4: User Story 2 - Teclado e ecrã estreito (Priority: P2)

**Goal**: Full keyboard operation; focus returns to trigger; fits ≤800px next to GM toggle

**Independent Test**: Quickstart 5–7 (Escape/outside; keyboard-only; narrow viewport)

### Implementation for User Story 2

- [x] T008 [US2] In `frontend/src/components/layout/LanguageSelector.tsx`, implement keyboard: Enter/Space toggle; ArrowUp/Down move `focusIndex`; Enter confirms; Escape closes without language change (`data-model.md` transitions)
- [x] T009 [US2] In `frontend/src/components/layout/LanguageSelector.tsx`, add document pointerdown/mousedown outside-close and ensure every close path (choice, Escape, outside) calls `triggerRef.focus()` (FR-006 / FR-007)
- [x] T010 [US2] Tune `frontend/src/components/layout/LanguageSelector.css` so the single control stays compact at ≤800px and does not cover or push the GM toggle off-screen (SC-003)

**Checkpoint**: Quickstart 5–7 pass; focus always returns to trigger after close

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Version 0.16.1, changelog, build, spec status

- [x] T011 [P] Add `[0.16.1]` entry in `CHANGELOG.md` (language combobox replaces PT/EN button pair)
- [x] T012 [P] Bump version to **0.16.1** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T013 Run `cd frontend && npm run build` then `specs/082-language-combobox/quickstart.md`
- [x] T014 Set **Status: Implemented** in `specs/082-language-combobox/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T002) → Foundational (T003–T004) → US1 (T005–T007) → US2 (T008–T010) → Polish
- US2 extends the same `LanguageSelector` files as US1 — do not start US2 until T005–T006 exist
- Polish after US1–US2

### User Story Dependencies

- **US1**: Foundational i18n keys; core combobox UI
- **US2**: Depends on US1 component structure; adds keyboard, outside-close, focus, compact CSS

### Parallel Opportunities

- T001 ∥ T002
- T003 ∥ T004
- T011 ∥ T012
- T005 and T006 are same feature area — prefer sequential (TSX then CSS) or same author

---

## Parallel Example: Foundational

```bash
Task: "pt-BR language.pt / language.en (T003)"
Task: "en language.pt / language.en (T004)"
```

---

## Parallel Example: Polish

```bash
Task: "CHANGELOG 0.16.1 (T011)"
Task: "Bump manifests 0.16.1 (T012)"
```

---

## Implementation Strategy

### MVP

1. Setup + Foundational (T001–T004)
2. US1 rewrite (T005–T007) — usable mouse combobox
3. US2 a11y + narrow (T008–T010)
4. 0.16.1 + quickstart

### Notes

- Do **not** use native `<select>`
- Trigger siglas `PT`/`EN` stay hardcoded; list names via `t()`
- Do not change i18n detection/persistence (080)
- Hub out of scope
- No automated tests
- Reference `WaypointCombobox` for keyboard ideas only — do not extract a shared package
