# Contract: uploads por slug

**Feature**: `094-roteamento-campanha`

## Leitura

| Método | Path | Comportamento |
|--------|------|----------------|
| GET | `/uploads/c/{slug}/{relative}` | Ficheiro sob `{DATA_DIR}/{Campanha.caminho}/uploads/{relative}` |
| GET | `/uploads/…` (sem `c/{slug}`) | 404 — não serve pasta de campanha |

Slug inexistente/inactivo → 404 opaco (sem vazar existência). Path traversal (`..`) → 404/400 sem sair do root da campanha.

## Escrita (admin)

`POST /api/c/{slug}/admin/uploads` — grava na pasta dessa campanha; JSON de resposta inclui `url` começada por `/uploads/c/{slug}/…`.

Basic Auth obrigatório (como hoje).

## Isolamento

Ficheiro presente só no sítio A: `GET /uploads/c/{slug-b}/…` → 404 (não o ficheiro de A).

## Fora deste contrato

ACL por visibilidade de personagem, cota, nomes versionados de mapa — 096.
