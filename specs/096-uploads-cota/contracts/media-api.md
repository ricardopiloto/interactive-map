# Contract: API de mídia

**Feature**: `096-uploads-cota`

## GET `/api/c/{slug}/media/{categoria}/{arquivo}`

**Categorias**: `map` | `portraits` | `locals` (iguais às pastas / ao `category` do upload).

### Autorização

| Categoria | Anónimo / não-membro | Membro da campanha |
|-----------|----------------------|--------------------|
| `map`, `locals` | 200 se ficheiro existe | 200 se existe |
| `portraits` | 200 só se personagem **dessa** campanha referencia o ficheiro **e** `visivel_para_todos` | 200 se existe |

Slug inválido/inactivo → **404** `CAMPANHA_NAO_ENCONTRADA` (opaco).  
Ficheiro inexistente ou ACL falha (retrato) → **404** opaco (mesmo código genérico de «não encontrado»; MUST NOT distinguir «existe mas oculto»).

### Headers (sucesso)

Ver [cache-headers.md](./cache-headers.md).

### Isolamento

Pedido sob slug A MUST NOT ler pasta de B — ver [isolation-media.md](./isolation-media.md).

## Removido

- `GET /uploads/c/{slug}/…` → **404** (não serve ficheiros).
- `GET /uploads/…` → **404**.

## Config

`GET /api/c/{slug}/config` MUST incluir:

- `has_map_image`: true sse `mapa_arquivo` não vazio (após ponte 094 se aplicável)
- `mapa_arquivo`: nome do ficheiro **ou** campo derivado `map_url` = `/api/c/{slug}/media/map/{mapa_arquivo}`

MUST NOT incluir `bytes_usados` / `cota_bytes`.
