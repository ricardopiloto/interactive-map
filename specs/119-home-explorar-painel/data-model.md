# Data model: Home, Explorar e Painel (119)

**Feature**: `119-home-explorar-painel`  
**Scope**: Client UI models over existing API DTOs — **no** schema/API contract changes.

## API DTOs (unchanged)

### CatalogoItem (`GET /api/campanhas/catalogo`)

| Field | Use in UI |
|-------|-----------|
| `slug` | Link `/c/:slug` |
| `nome` | Title |
| `sistema` | Badge / search |
| `genero` | Genre badge + cover tint |
| `capa_url` | Cover image (optional) |

### PainelItem (`GET /api/campanhas/minhas`)

| Field | Use in UI |
|-------|-----------|
| (same as catalog +) | |
| `visibilidade` | Footer badge |
| `bytes_usados` / `cota_bytes` / `aviso_cota` | Quota bar |
| `unidade_distancia` | Existing toggle |
| `capa_url` | Cover + existing capa upload |

## UI entities

### CampaignCardViewModel

Normalized props for the shared component (mapped from CatalogoItem or PainelItem):

| Prop | Notes |
|------|--------|
| `slug`, `nome`, `sistema`, `genero` | Required |
| `capa_url` | Optional |
| `compact` | Home featured |
| `linkTo` | Set on public cards; omit when footer has primary link |
| `footer` | ReactNode slot |

### LandingGenrePreview

| Attribute | Notes |
|-----------|--------|
| `selectedGenre` | One of four product genres |
| Effect | Sets `data-genre` on document root while Landing mounted |

### ExplorarFilters

| Attribute | Notes |
|-----------|--------|
| `query` | string |
| `genreFilter` | `todos` \| GenreId |

## Explicitly out of model (prototype-only)

`jogadores`, `resumo`, `mestre`, `ultimaSessao`, `capaGradient` mock — do **not** add API fields; cover uses `capa_url` or CSS genre placeholder.
