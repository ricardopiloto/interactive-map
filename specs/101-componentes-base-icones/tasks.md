# Tasks: Componentes base e ícones

**Input**: `/specs/101-componentes-base-icones/`

**Tests**: REQUIRED — zero `window.confirm|alert` após migração; Esc/foco checklist no quickstart.

## Phase 1: Setup

- [x] T001 [P] Skim contracts + research + quickstart
- [x] T002 Add `@tabler/icons-react` to `frontend/package.json` (MIT)

## Phase 2: Foundational

- [x] T003 Create `frontend/src/components/ui/` barrel + shared `ui.css` (40/44px, tokens)
- [x] T004 [P] Implement Dialog (Esc, trap, restore, aria-modal, scroll lock) in `ui/Dialog.tsx`
- [x] T005 [P] Implement ToastProvider + `toast.ts` imperative API; wrap in `main.tsx`
- [x] T006 Implement ConfirmDialog on top of Dialog

**Checkpoint**: Dialog/Toast/Confirm work in isolation

## Phase 3: US1 — Replace confirm/alert (P1) 🎯

- [x] T007 [US1] Migrate RelacoesPage ×2 confirms → ConfirmDialog
- [x] T008 [P] [US1] Migrate NpcAdminList, LocalAdminList, ArcoAdminList confirms
- [x] T009 [P] [US1] Migrate RouteDigitizerView ×2 confirms
- [x] T010 [P] [US1] Migrate ImageUploadField, ImageSlot, CampaignMap alerts → toast.error
- [x] T011 [US1] Verify `rg 'window\.(confirm|alert)' frontend/src` is empty

## Phase 4: US2 — Remaining primitives (P1)

- [x] T012 [P] [US2] Button, IconButton, Input, Select, Textarea
- [x] T013 [P] [US2] Tabs, Chip, Card, DropdownMenu, Tooltip, EmptyState, Skeleton, Drawer
- [x] T014 [US2] Use Button in ConfirmDialog actions (one primary / danger)

## Phase 5: US3 — Icons + i18n + styleguide (P2)

- [x] T015 [US3] Tabler icons on IconButton / ConfirmDialog as needed; aria-hidden / aria-label
- [x] T016 [US3] i18n keys pt-BR/en for toast/confirm defaults if any new copy
- [x] T017 [US3] Expand StyleGuidePage with component demos (incl. Drawer)

## Phase 6: Polish

- [x] T018 CHANGELOG Unreleased + bundle note for Tabler
- [x] T019 Mark spec Implemented; run quickstart

## Dependencies

Setup → Foundational → US1 → US2/US3 → Polish
