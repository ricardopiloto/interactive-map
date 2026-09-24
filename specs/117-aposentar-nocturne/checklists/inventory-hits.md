## Inventory hits (Gate A) — baseline 2026-09-22

Authoritative pre-migration list for spec 117. Destinations: [migration-map.md](../contracts/migration-map.md) / [research.md](../research.md) §2.

### btn* (outside `components/ui`)

| File | Tokens |
|------|--------|
| `pages/AuthPages.tsx` | btn-primary, btn-secondary, btn-block |
| `pages/PainelPage.tsx` | btn*, btn-secondary, btn-primary |
| `pages/SessoesPage.tsx` | btn* |
| `pages/MapPage.tsx` | btn-ghost, btn-secondary, btn-sm |
| `pages/RelacoesPage.tsx` | btn-ghost, btn-secondary, btn-sm |
| `components/admin/LocalFormDialog.tsx` | btn* |
| `components/admin/NpcAdminList.tsx` | btn* |
| `components/admin/ArcoAdminList.tsx` | btn* |
| `components/admin/LocalAdminList.tsx` | btn* |
| `components/admin/GrupoAdminPanel.tsx` | btn* |
| `components/gm/RouteDigitizerView.tsx` | btn* |
| `components/gm/DigitizerListPanel.tsx` | btn* |
| `components/gm/AdminGateDialog.tsx` | btn* |
| `components/map/CampaignMap.tsx` | btn-secondary |
| `components/routes/RoutePlannerPanel.tsx` | btn-primary, btn-ghost |
| `components/layout/LanguageSelector.tsx` | btn-ghost |
| `components/relacoes/GraphStage.tsx` | btn* |
| `modules/fadiga/FadigaWidget.tsx` | (check) |

Deleted by 116 (skip if absent): `RelacoesDetailPanel`, `RelacoesSideColumn`, `PinModal`, `SideMenu`.

### input / seg / tag / dialog / card

| File | Tokens |
|------|--------|
| Admin forms + lists | `.input`, `.tag*` |
| `GrupoAdminPanel` | `.card`, `.seg` |
| `PersonagemFormDialog` / `VinculoFormDialog` | `.input`, `.seg`, `.tag` |
| `RelacoesPage` / `MapPage` | `.tag*` |
| `RoutePlannerPanel` / `WaypointCombobox` / digitizer | `.input`, `.btn*` |
| `AdminGateDialog` | `.dialog-backdrop`, `.dialog`, `.input`, `.btn*` |
| Kit debt | `ConfirmDialog` → `dialog-body` |

### Gaps (Phase 2 — then closed)

- [x] Button `block` / `size`
- [x] Chip `variant` + interactive
- [x] SegmentedControl
- [x] `dialog-body` → `ui-dialog__body`
- [x] Globals + form-chrome out of nocturne

### Non-targets

`ui-*`, `auth-card`, `map-page__*`, `*-search-input`, page BEM, `frontend-next/`.

### Post-implement (2026-09-22)

Gate A empty outside kit; `nocturne.css` deleted; `main.tsx` import removed; `tsc -p tsconfig.app.json --noEmit` + `vite build` clean.
