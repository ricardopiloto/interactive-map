# Data Model: Sistema de RPG system agnostic

Sem alteração de schema.

### Campo existente

| Campo | Tipo | Validação **antes** | Validação **depois** |
|-------|------|---------------------|----------------------|
| `Campanha.sistema` | `str` max 40 | Allowlist `KNOWN_SISTEMAS` + min/max length | Só não-vazio + max 40 (API/schema); valor livre |

### Mapa de comportamento especial (inalterado)

| Chave exacta | `default_modulos` |
|--------------|-------------------|
| `wfrp4e` | `["fadiga"]` |
| `wod` | `[]` |
| qualquer outro | `[]` |

Nenhuma entidade nova. Sem migração Alembic.
