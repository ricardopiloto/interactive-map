# Data Model: Busca De/Para no Calcular Rota

**Feature**: `036-route-endpoint-search` | **Date**: 2026-08-03

Sem entidades persistidas novas. Modelo = estado de UI + opções derivadas dos dados já existentes.

## Entities (UI / derived)

### WaypointOption

Representa uma entrada nas sugestões De/Para.

| Field | Type | Notes |
|-------|------|--------|
| `id` | number | `Waypoint.id` |
| `label` | string | Mesma regra actual: nome do nó → nome do Local → `Nó {id}` |

**Population**: Todos os waypoints da campanha carregados no painel (inalterado vs select actual).

**Sort**: `label.localeCompare(..., { sensitivity: 'base' })`.

### EndpointFieldState (por De e por Para)

| Field | Type | Notes |
|-------|------|--------|
| `query` | string | Texto no input; trim só para matching, não necessariamente no valor mostrado |
| `selectedId` | `number \| ''` | Nó confirmado; `''` = sem seleção válida |

**Transitions**:

```text
[idle] --type--> [filtering]  (selectedId cleared on query change)
[filtering] --pick suggestion--> [selected]  (query := label, selectedId := id)
[selected] --type/edit query--> [filtering]  (selectedId := '')
[any] --clear query--> [filtering] with full suggestion list
```

### Filter

| Input | Rule |
|-------|------|
| `query` vazio (após trim) | Todas as `WaypointOption` |
| `query` não vazio | `normalize(label).includes(normalize(trim(query)))` |
| `normalize` | NFD + strip diacritics + lower case |

**Independence**: Estado De e Para são independentes (FR-004).

**Cross-field**: Nenhuma exclusão mútua na lista (FR-010). `calcular` exige `selectedId` distintos.

## Validation (unchanged planner rules)

- Origem e destino obrigatórios (`selectedId` não vazios)
- Origem ≠ destino
- Velocidade / ritmo / API de plano: inalterados
