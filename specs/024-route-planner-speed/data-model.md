# Data Model: 024-route-planner-speed

Sem novas tabelas persistidas. Ajuste de **DTOs / enums de API** e constantes de cálculo.

## Persistido (inalterado)

| Entidade | Notas |
|----------|--------|
| Waypoint | id, x, y, local_id, … |
| RouteSegment | tipo (`estrada`\|`rio`\|`trilha`), distancia_milhas, modificador_velocidade opcional |
| MapScale | miles_per_map_unit |

## Enum Ritmo (API)

| Valor | Horas/dia |
|-------|-----------|
| `normal` | 6 |
| `intenso` | 8 |

Remove do contrato público ativo: `cauteloso`, `arriscado` (como ritmos de velocidade).

## Constantes de velocidade efetiva

| Tipo | Fator vs velocidade média |
|------|---------------------------|
| estrada | 1.0 |
| rio | 1.4 |
| trilha | 0.8 |

Override: `RouteSegment.modificador_velocidade` se não nulo.

## RoutePlanItem (resposta)

| Campo | Tipo | Significado |
|-------|------|-------------|
| waypoint_ids | int[] | Nós da rota |
| distancia_milhas | float | Soma das distâncias |
| tempo_horas | float | Horas de marcha totais |
| tempo_dias | int | Dias cheios na jornada |
| tempo_horas_resto | float | Horas no último dia |
| tempo_texto | string | Ex.: “1 dia e 1 h” |
| tipos | string[] | Tipos de via presentes (ordem de aparição) |
| geometria | Point[] | Polyline no mapa |

## Pedido de cálculo

| Campo | Regra |
|-------|--------|
| origem_local_id / destino_local_id | Locais com waypoint ligado |
| ritmo | normal \| intenso |
| velocidade_media_mph | > 0; default 4 |

## Regras de conversão tempo → texto

```
horas_por_dia = 6 se normal else 8
dias = floor(tempo_horas / horas_por_dia)
resto = tempo_horas - dias * horas_por_dia
# formatar omitindo partes zero
```
