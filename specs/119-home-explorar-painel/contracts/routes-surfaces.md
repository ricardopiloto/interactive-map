# Contract: Public & painel surfaces (119)

**Feature**: `119-home-explorar-painel`  
**Visual SoT**: `frontend-next` LandingPage / ExplorePage / MestrePainel

## Routes

| Path | Page | Auth | Data |
|------|------|------|------|
| `/` | Marketing Landing | Public | Optional `catalogo()` subset for featured |
| `/explorar` | Public catalog | Public | `catalogo()` full + client filters |
| `/painel` | Master dashboard | Session (existing redirect) | `minhas()` + existing mutations |

## Landing sections (order)

1. Hero (value prop + CTAs → login/painel + `/explorar`)
2. How it works (mapa / relações / rotas)
3. Genre showcase (live `data-genre` preview)
4. Featured campaigns (optional; `CampaignCard` compact)
5. Final CTA (create / go to painel flow)

## Explorar

- Toolbar: search + genre chips including «todos»
- Grid of `CampaignCard` with `linkTo`
- Empty state i18n when filter yields zero

## Painel

- Header: title + primary «Criar» CTA (scroll/focus existing create UI or equivalent)
- Grid: `CampaignCard` + footer actions; «new card» tile optional
- MUST preserve create, import, export, visibility, unit, capa behaviors

## APIs

| Endpoint | Change |
|----------|--------|
| `GET /api/campanhas/catalogo` | None |
| `GET /api/campanhas/minhas` | None |
| Create / patch / export / import | None |

## Navigation notes

- Old mental model «catalog on `/`» → CTAs to `/explorar`
- No forced redirect `/` → `/explorar`
