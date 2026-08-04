# Data Model: 028-route-any-waypoint

**Sem migration.** Reutiliza entidades existentes.

## Waypoint (nó)

| Campo | Uso no calculador |
|-------|-------------------|
| `id` | Identificador de origem/destino |
| `nome` | Prioridade 1 do rótulo |
| `local_id` | Opcional; se `nome` vazio, FE usa nome do Local |
| `x`, `y` | Já usados na geometria das rotas |

## Local

Continua existindo; **não** é parâmetro do plano. Só fornece nome de fallback para rótulo quando o nó não tem `nome`.

## Pedido de cálculo (conceitual)

| Campo | Tipo | Notas |
|-------|------|--------|
| origem_waypoint_id | int | Obrigatório; ≠ destino |
| destino_waypoint_id | int | Obrigatório |
| ritmo | enum | Inalterado |
| velocidade_media_mph | float > 0 | Inalterado |

## Resposta

Inalterada: `RoutePlanResponse.rotas[]` com `waypoint_ids`, geometria, tempos, tipos, etc.
