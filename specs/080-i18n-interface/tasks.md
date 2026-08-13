# Tasks: Internacionalização da Interface

**Input**: Design documents from `/specs/080-i18n-interface/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual only via quickstart.md (no automated test tasks)

**Organization**: US1 = detecção + seletor; US2 = cobertura ecrãs principais; US3 = erros API surfaced

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/src/`
- Backend: `backend/app/`
- Docs: `CHANGELOG.md`, `README.md`, version manifests

---

## Phase 1: Setup

**Purpose**: Dependencies, contracts baseline, string inventory

- [x] T001 Skim `specs/080-i18n-interface/contracts/api-error-codes.md`, `contracts/ui-locale-detection.md`, `contracts/ui-language-selector.md`, `contracts/ui-translation-namespaces.md`, `research.md`, and `data-model.md`
- [x] T002 Add `react-i18next`, `i18next`, and `i18next-browser-languagedetector` to `frontend/package.json` and update `frontend/package-lock.json` (`npm install`)
- [x] T003 [P] Skim `frontend/src/components/layout/CodexHeader.tsx`, `frontend/src/main.tsx`, `frontend/src/api/client.ts`, and backend `HTTPException` sites listed in `specs/080-i18n-interface/contracts/api-error-codes.md`

---

## Phase 2: Foundational (Blocking)

**Purpose**: i18n boot, locale skeletons, app entry — blocks all user stories

**⚠️ CRITICAL**: US1–US3 depend on i18n init and namespace files existing

- [x] T004 Create `frontend/src/i18n/normalizeLocale.ts` with prefix rules (`pt*` → `pt-BR`, `en*` → `en`, else `pt-BR`) per `contracts/ui-locale-detection.md`
- [x] T005 Create `frontend/src/i18n/index.ts`: init i18next + browser detector + custom `convertDetectedLanguage`; `supportedLngs: ['pt-BR','en']`; `fallbackLng: { en: ['pt-BR'], default: ['pt-BR'] }`; static imports of all 8 JSON namespaces
- [x] T006 [P] Create skeleton locale files `frontend/src/locales/pt-BR/{comum,mapa,relacoes,admin}.json` and `frontend/src/locales/en/{comum,mapa,relacoes,admin}.json`
- [x] T007 Import `./i18n` in `frontend/src/main.tsx` before `createRoot` render
- [x] T008 Seed `frontend/src/locales/pt-BR/comum.json` and `frontend/src/locales/en/comum.json` with nav, generic buttons, and `erros.GENERICO` per `contracts/ui-translation-namespaces.md`

**Checkpoint**: App boots with i18n; `t('comum:…')` works; missing EN keys fall back to PT-BR (FR-009)

---

## Phase 3: User Story 1 - Detecção e persistência de idioma (Priority: P1) 🎯 MVP

**Goal**: Browser/localStorage detection, PT/EN selector in header, persistence across reload

**Independent Test**: Quickstart scenarios 1–5 (en-US → EN; pt-PT → PT-BR; fr → PT-BR; manual override persists; switch &lt;1 s)

### Implementation for User Story 1

- [x] T009 [US1] Create `frontend/src/components/layout/LanguageSelector.tsx` (PT/EN sigla, `i18n.changeLanguage`) per `contracts/ui-language-selector.md`
- [x] T010 [US1] Integrate `LanguageSelector` in `frontend/src/components/layout/CodexHeader.tsx` (right cluster, before GM toggle)
- [x] T011 [US1] Migrate `CodexHeader` strings (brand, nav links, GM toggle) to `comum.json` (both locales) and replace literals with `useTranslation('comum')`
- [x] T012 [US1] Migrate `frontend/src/components/gm/AdminGateDialog.tsx` strings to `comum.json` (both locales)

**Checkpoint**: Header + gate fully localized; detection chain matches clarify Q4; localStorage override works

---

## Phase 4: User Story 2 - Cobertura de ecrãs principais (Priority: P1)

**Goal**: Mapa, Relações, digitalização, diálogos GM — ≥95% keys, no hardcoded PT chrome; master content untouched

**Independent Test**: Quickstart scenarios 6–7; SC-001 flow Mapa → Relações → digitizer → edit personagem in EN

### Implementation for User Story 2

- [x] T013 [P] [US2] Migrate `frontend/src/pages/MapPage.tsx` and `frontend/src/components/sidebar/SideMenu.tsx` strings to `mapa.json` / `comum.json` (both locales)
- [x] T014 [P] [US2] Migrate `frontend/src/pages/RelacoesPage.tsx`, `RelacoesSideColumn`, `RelacoesDetailPanel`, and `GraphStage` UI chrome to `relacoes.json` (both locales)
- [x] T015 [P] [US2] Migrate `frontend/src/components/relacoes/PersonagemFormDialog.tsx` and `VinculoFormDialog.tsx` labels/group titles to `relacoes.json` (both locales)
- [x] T016 [P] [US2] Migrate `frontend/src/components/admin/LocalFormDialog.tsx`, `NpcAdminList.tsx` (NpcFormDialog), and `ArcoAdminList.tsx` (ArcoFormDialog) to `admin.json` (both locales)
- [x] T017 [US2] Migrate `frontend/src/components/gm/RouteDigitizerView.tsx` and `DigitizerListPanel.tsx` (column, search, sheet, sections) to `admin.json` (both locales)
- [x] T018 [P] [US2] Migrate `frontend/src/components/common/PinModal.tsx`, `frontend/src/components/routes/RoutePlannerPanel.tsx`, and upload placeholders in `ImageSlot.tsx` / `ImageUploadField.tsx` to `mapa.json` / `admin.json`
- [x] T019 [US2] Add enum **display** keys for personagem status and vínculo tipo catalog in `comum.json` / `relacoes.json`; verify master fields (`nome`, `descricao`, `nota`, waypoint names) are **not** wrapped in `t()` (FR-004)

**Checkpoint**: Main surfaces pass quickstart 6–7; grep audit trending to ≥95% on covered components

---

## Phase 5: User Story 3 - Erros da API traduzíveis (Priority: P2)

**Goal**: Surfaced API errors return `{ detail: { erro, detalhes } }`; frontend maps to localized messages

**Independent Test**: Quickstart scenarios 8–10 (upload limit EN/PT; AdminGate creds; unknown code → GENERICO)

### Implementation for User Story 3

- [x] T020 [US3] Create `backend/app/errors.py` with `raise_api_error(codigo, *, status_code, detalhes=None)` returning FastAPI-compatible `detail` object per `contracts/api-error-codes.md`
- [x] T021 [US3] Migrate surfaced errors in `backend/app/deps/auth.py` and `backend/app/services/uploads.py` to structured codes
- [x] T022 [P] [US3] Migrate surfaced errors in `backend/app/services/mecanica.py` and `backend/app/services/waypoint_local_link.py` to structured codes
- [x] T023 [P] [US3] Migrate surfaced errors in admin routers (`locais.py`, `vinculos.py`, `personagens.py`, `npcs.py`, `arcos.py`, `waypoints.py`, `route_segments.py`) and `backend/app/routers/public/routes.py` to structured codes
- [x] T024 [US3] Create `frontend/src/api/parseApiError.ts` and update `frontend/src/api/client.ts` to throw typed `ApiError` (parse `detail.erro` / legacy string → null code)
- [x] T025 [US3] Create `frontend/src/hooks/useApiErrorMessage.ts` mapping `comum:erros.{{codigo}}` with `detalhes` interpolation + `erros.GENERICO` fallback
- [x] T026 [US3] Populate all `erros.*` keys in `frontend/src/locales/pt-BR/comum.json` and `frontend/src/locales/en/comum.json` per `contracts/api-error-codes.md` catalog
- [x] T027 [US3] Wire `useApiErrorMessage` in surfaced catch/display paths: `MapPage.tsx`, `RelacoesPage.tsx`, `RouteDigitizerView.tsx`, `ImageSlot.tsx`, `ImageUploadField.tsx`, `useCampaignData.ts`, `useInstanceConfig.ts` — never show raw PT server string in EN UI

**Checkpoint**: 100% surfaced errors from contract return codes; EN session shows localized error messages

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Audit, version 0.15.0, docs, quickstart

- [x] T028 [P] Run SC-002 grep audit on `frontend/src` (exclude `locales/`); fix remaining hardcoded PT in main surfaces until ≥95%
- [x] T029 [P] Add `[0.15.0]` changelog entry for v2 Frente D in `CHANGELOG.md`
- [x] T030 [P] Bump version to **0.15.0** in `README.md`, `frontend/package.json`, `frontend/package-lock.json`, `backend/pyproject.toml`, `backend/uv.lock`
- [x] T031 Run `cd frontend && npm run build` then full `specs/080-i18n-interface/quickstart.md`
- [x] T032 Set feature status to Implemented in `specs/080-i18n-interface/spec.md`; document hub i18n follow-up in plan if not already noted

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational (T004–T008) → US1 → US2; US3 after T008 (needs `erros.GENERICO`) and ideally after T011–T012 (comum namespace pattern)
- US2 and US3 backend (T020–T023) can overlap with US2 frontend after Foundational
- Polish after US1–US3

### User Story Dependencies

- **US1**: Foundational then T009–T012
- **US2**: Foundational + US1 recommended (header already i18n); T013–T019 (T017 after digitizer files stable from 079)
- **US3**: T020–T023 (backend) ∥ T024–T025 (frontend infra); then T026 → T027

### Parallel Opportunities

- T001 ∥ T003 (after T002 deps installed)
- T006 ∥ T004 (skeleton JSON while normalizeLocale written — merge in T005)
- T013 ∥ T014 ∥ T015 ∥ T016 ∥ T018 (US2, different component trees)
- T022 ∥ T023 (backend routers)
- T028 ∥ T029 ∥ T030
- US2 frontend ∥ US3 backend after Foundational

---

## Parallel Example: User Story 2

```bash
# After US1 checkpoint:
Task: "MapPage + SideMenu (T013)"
Task: "RelacoesPage + column + detail + GraphStage (T014)"
Task: "Personagem + Vinculo dialogs (T015)"
Task: "Local/NPC/Arco dialogs (T016)"
# Then sequential:
Task: "Route digitizer (T017)"
Task: "Enum display keys + FR-004 audit (T019)"
```

---

## Parallel Example: User Story 3

```bash
Task: "backend/app/errors.py (T020)"
Task: "auth + uploads migration (T021)"
Task: "mecanica + waypoint_local_link (T022)"
Task: "admin routers + public routes (T023)"
# Frontend:
Task: "parseApiError + client.ts (T024)"
Task: "useApiErrorMessage hook (T025)"
# Then:
Task: "Populate erros.* locales (T026)"
Task: "Wire catch paths (T027)"
```

---

## Implementation Strategy

### MVP

1. Setup + Foundational (T001–T008)
2. US1 detection + selector (T009–T012)
3. US2 surface-by-surface migration
4. US3 API error pipeline
5. Audit + 0.15.0 + quickstart

### Notes

- **Hub** (`hub/`) explicitly **out of scope** — no tasks
- Master-written content never passes through `t()`
- Missing EN key → PT-BR at runtime (FR-009); still fails SC-002 audit
- Both locales bundled — no lazy-load
- Frente C (079) complete — digitizer strings included in US2 T017
- Completes Codex v2.0.0 frentes A–D before tag **2.0.0**
