# Tasks: Mapa

**Input**: `/specs/103-mapa/`

## Phase 1: Setup

- [x] T001 Skim plan/research/contracts/quickstart
- [x] T002 [P] Add i18n keys controlos/legenda/nomes in `frontend/src/locales/pt-BR/mapa.json` and `en/mapa.json`

## Phase 2: Foundational

- [x] T003 Restyle `campaign-map__controls` translucent panel + IconButton/Tabler + i18n in `CampaignMap.tsx|.css`
- [x] T004 Wire disable «ir ao grupo» when no grupo

## Phase 3: US1 — Controlos (P1)

- [x] T005 [US1] Verify bottom-right placement and contrast on light/dark map (checklist)

## Phase 4: US2 — Pinos + nomes (P1)

- [x] T006 [US2] Derive visited/known from `data_sessao`; CSS shapes + `cor_pin` in `CampaignMap.tsx|.css`
- [x] T007 [US2] Pin name labels: show if scale≥1.35 or hover/selected; track scale from transform

## Phase 5: US3 — Popover (P1)

- [x] T008 [US3] Remove dimming backdrop; Esc/outside/close already; omit empty description in `PinModal.tsx|.css`

## Phase 6: US4 — Legenda (P2)

- [x] T009 [US4] Collapsible legend bottom-left, default closed, i18n shapes in `CampaignMap.tsx|.css`

## Phase 7: Polish

- [x] T010 CHANGELOG Unreleased; lint:tokens + test:contrast; mark spec Implemented

## Dependencies

Setup → Foundational → US1∥US2∥US3 → US4 → Polish
