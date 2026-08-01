# Data Model: 005-menu-hover-pin

Nenhuma alteração de persistência ou API.

## Estado de UI (efêmero)

| Campo | Tipo | Onde | Notas |
|-------|------|------|--------|
| hoveredLocalId | `number \| null` | MapPage (ou equivalente) | Set no enter do nome na aba Locais; `null` no leave |
| selectedLocalId | existente | MapPage | Inalterado; independente do hover |

Transições: `null` → `id` (enter) → `null` ou outro `id` (leave / enter outro). Não persiste em reload.
