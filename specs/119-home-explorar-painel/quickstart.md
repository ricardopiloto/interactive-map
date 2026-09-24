# Quickstart: Home, Explorar e Painel (119)

Validate [spec.md](./spec.md) SC-001–005 and contracts [campaign-card.md](./contracts/campaign-card.md), [routes-surfaces.md](./contracts/routes-surfaces.md).

## Prerequisites

- Backend + `frontend` `npm run dev`
- At least one `listada` campaign in catalog; GM account for `/painel`

## 1. Landing `/`

1. Open `/` — confirm marketing sections (hero, how-it-works, genres, optional featured), **not** full catalog as main content.
2. Click each genre — page theme/`data-genre` updates live.
3. CTA «Ver campanhas» → `/explorar`.
4. If featured cards show, they use shared card; click → `/c/:slug`.

## 2. Explorar `/explorar`

1. Open `/explorar` — grid from catalog API.
2. Search by name/system; filter genre chips — list updates client-side.
3. Empty filter → i18n empty state.
4. Open a card → `/c/:slug`.

## 3. Painel `/painel`

1. Login → `/painel`.
2. Confirm shared `CampaignCard` + quota/actions footer.
3. Abrir / export / visibility (and create/import) still work.
4. Confirm card is same component as Home/Explorar (devtools / source).

## 4. Visual

Capture `/`, `/explorar`, `/painel` claro+escuro vs prototype Landing / Explore / MestrePainel — structure + card shape.

## 5. Build

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

## 6. Grep sanity

```bash
rg -n 'home-page__card|painel-page__card' frontend/src/pages || true
rg -n 'CampaignCard' frontend/src/pages/HomePage.tsx frontend/src/pages/ExplorarPage.tsx frontend/src/pages/PainelPage.tsx
rg -n "path=\"/explorar\"" frontend/src/App.tsx
```

Expect: shared card imports on three pages; `/explorar` route present; legacy exclusive card classes no longer the default pattern.
