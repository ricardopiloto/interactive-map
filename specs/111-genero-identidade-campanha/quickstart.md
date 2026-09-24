# Quickstart: Gênero como identidade

**Feature**: `111-genero-identidade-campanha`

## Prerequisites

- Backend + frontend dev servers (or pytest + build as usual)
- Control DB that can be migrated (`alembic_control` upgrade)

## 1. Migration / backfill

```bash
cd backend
# with DATA_DIR pointing at a control DB that has wfrp4e+latao and wod+vinho fixtures
uv run alembic -c alembic_control.ini upgrade head
```

**Expect**: every `campanha.genero` NOT NULL; WFRP → `fantasia`; WoD → `gotico`.

## 2. API create + owner-only update

```bash
# POST /api/campanhas with genero=scifi → 201 + genero in body
# POST without genero → error
# PATCH /api/campanhas/{slug}/genero — owner updates any of the 4 genre ids
# anonymous / non-owner denied; invalid genero rejected without changing saved value
# GET /api/c/{slug}/config reflects the saved genero
```

**Expect**: campaign genre creation and the post-creation owner update work; prior palette, migration, and export/import behavior remains unchanged.

## 3. Capa only

```bash
# PATCH /api/campanhas/{slug}/capa — owner OK; others denied
# PATCH …/identidade → 404
```

## 4. Export / import

```bash
# export campaign with genero=gotico → manifest has genero
# import into fresh slug → genero preserved
# import old zip with only acento_id=vinho → genero=gotico
```

## 5. UI

1. `/painel` → create form: 4 genre cards; switching card re-skins the form before submit.
2. Submit → new campaign; open `/c/{slug}` → skin matches genre; gothic/scifi/urban force dark.
3. Home + painel cards show genre swatch + label (not 5 accent chips).
4. Accent selector gone; capa upload/clear still works.

## 6. Gates

```bash
cd frontend && npm run test:contrast && npm run lint:tokens
cd backend && uv run pytest  # genre/capa/import tests
```

**Expect**: contrast OK for 4 genres (fantasia light+dark; others dark); tokens lint OK.
