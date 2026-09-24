# Contract: Isolamento de mídia (matriz)

**Feature**: `096-uploads-cota`  
Actualiza a superfície da matriz 094 de ficheiros.

## Setup

Campanhas A e B; ficheiro secreto só em A (`map/` ou `locals/` ou `portraits/`).

## Casos

| Actor | Pedido | Esperado |
|-------|--------|----------|
| Anónimo | `GET /api/c/A/media/…` ficheiro de A (mapa/local) | 200 |
| Anónimo | `GET /api/c/B/media/…` mesmo nome de ficheiro de A | 404 (sem conteúdo de A) |
| Membro só de B | `GET /api/c/A/media/portraits/oculto.webp` (retrato oculto só em A) | 404 |
| Membro de A | mesmo retrato oculto em A | 200 |
| Qualquer | `GET /uploads/c/A/…` | 404 |

Retrato oculto anónimo em A → 404; dono A → 200 (SC-001) — detalhe em testes de ACL.
