# UI Contract: Título da rota pelo tipo

**Feature**: 025-route-type-title  
**Component**: `RoutePlannerPanel`

## Lista de resultados (por item)

| Elemento | Antes (024) | Depois (025) |
|----------|-------------|--------------|
| Título | `Rota {n}` (+ “mais rápida”) | Tipo(s) capitalizados; duplicados → `(2)`, `(3)`…; 1.ª da lista pode ter ` · mais rápida` |
| Distância | mi | inalterado |
| Tempo | `tempo_texto` | inalterado |
| Linha tipos | `tipos.join(', ')` | **Removida** |

## Regras de título

1. Base = tipos mapeados (`estrada`→`Estrada`, …) unidos por `", "`; vazio → `Rota`.
2. Na lista (ordem da API = mais rápida primeiro), se o mesmo base já apareceu, anexar ` (2)`, ` (3)`, …
3. Não usar `Rota 1` / `Rota 2` como título.

## Invariantes

- Sem mudança de API, ordenação ou seleção.
- Distância e tempo continuam visíveis sob o título.
