# Tasks: Estrutura e navegação

**Input**: `/specs/102-estrutura-navegacao/`

**Tests**: Checklist quickstart (unicidade marca/modo, tema reload, bottom nav, brand → `/`). Sem suite automatizada obrigatória além de gates UX-1.

## Phase 1: Setup

- [x] T001 Skim `plan.md`, `research.md`, `contracts/*`, `quickstart.md`
- [x] T002 [P] Add i18n keys chrome/editMode/theme in `frontend/src/locales/pt-BR/comum.json` and `frontend/src/locales/en/comum.json` (marca fixa «Campaign Codex»; «Modo edição»; Auto/Claro/Escuro)

## Phase 2: Foundational

- [x] T003 Implement `frontend/src/theme/themePreference.ts` (`codex.theme`, parse, apply) and extend `frontend/src/theme/applySystemTheme.ts` + FOUC in `frontend/index.html`
- [x] T004 Create `frontend/src/context/EditModeContext.tsx` (enabled, canEdit, toggle; reset on slug change; optional `sessionStorage`)
- [x] T005 [P] Create shared `frontend/src/components/layout/UserMenu.tsx` (Entrar/Sair, idioma, tema) using UX-2 Menu + authApi
- [x] T006 Wrap `CampaignShell` in `frontend/src/App.tsx` with `EditModeProvider`; probe `canEdit` via membership/admin

**Checkpoint**: Tema persiste; context monta sem UI completa

## Phase 3: US1 — Cabeçalho partilhado (P1) 🎯

**Goal**: Mapa e Relações partilham o mesmo chrome; marca única; sem Modo GM triplicado.

**Independent Test**: Abrir mapa e relações — mesmo cabeçalho; 1 marca; ≤1 controlo edição.

- [x] T007 [US1] Evolve `CodexHeader` → campaign chrome in `frontend/src/components/layout/CodexHeader.tsx` (+ CSS): brand Link→`/`, tabs (largo), campaign name text, slot Modo edição, UserMenu
- [x] T008 [US1] Wire MapPage + RelacoesPage to shared chrome + EditModeContext (`isGm` ← `enabled`); stop logout-on-toggle
- [x] T009 [US1] Remove brand row + `gm.modeTag` from `frontend/src/components/sidebar/SideMenu.tsx` (+ CSS)
- [x] T010 [US1] Align `SiteChrome` with UserMenu + brand Link (home/painel) in `frontend/src/components/layout/SiteChrome.tsx`

## Phase 4: US2 — Menu tema + sessão (P1)

**Goal**: Menu com Entrar/Sair, idioma, tema persistido.

**Independent Test**: Claro → reload → claro; Entrar/Sair via 095.

- [x] T011 [US2] Ensure UserMenu theme options call `themePreference` and update immediately
- [x] T012 [US2] Verify Entrar → `/login?next=…`; Sair encerra sessão e reflecte UI anónima

## Phase 5: US3 — Modo edição + bottom nav (P1)

**Goal**: Um Modo edição no topo; bottom nav móvel só Mapa/Relações; tabs ocultas no estreito.

**Independent Test**: canEdit vê 1 toggle; anónimo 0; móvel bottom só 2 itens; tabs off no topo.

- [x] T013 [US3] Render Modo edição só se `canEdit`; `aria-pressed` / label estado; persist Mapa↔Relações; reset ao sair de `/c/:slug`
- [x] T014 [US3] Add `frontend/src/components/layout/CampaignBottomNav.tsx` (Mapa|Relações, Tabler); show ≤800px; hide top tabs when shown
- [x] T015 [US3] Pad main content for bottom nav; confirm home/painel sem bottom nav

## Phase 6: US4 — Marca documento (P2)

**Goal**: Campaign Codex em locales, `<title>`, identidade.

**Independent Test**: pt-BR/en brand string idêntica; title alinhado.

- [x] T016 [P] [US4] Set `brand` pt-BR = «Campaign Codex»; update `frontend/index.html` `<title>`
- [x] T017 [US4] Sync any remaining «Codex da Campanha» / «Mapa da Campanha» product-name UI strings in chrome locales

## Phase 7: Polish

- [x] T018 CHANGELOG `[Unreleased]` UX-3 chrome notes
- [x] T019 Run `npm run lint:tokens` + `test:contrast`; walk `quickstart.md`; mark spec **Implemented**

## Dependencies

```text
Setup → Foundational → US1 → US2 / US3 (US3 needs EditMode from Foundational+US1)
US4 parallel after T002
Polish last
```

## Parallel examples

- T002 ∥ skim docs
- T005 ∥ T003/T004
- T016 ∥ mid-US1

## MVP

T001–T010 (US1 chrome único) — depois US3 bottom nav + US2 tema no menu.

## Implementation strategy

1. Theme + EditMode foundation  
2. Unify header / kill duplicates  
3. Bottom nav + canEdit gate  
4. Brand/title + CHANGELOG + quickstart  
