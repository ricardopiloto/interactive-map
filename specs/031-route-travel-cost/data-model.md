# Data Model: 031-route-travel-cost

Sem novas tabelas SQLite.

## Constantes (aplicação)

### Velocidade (tempo)

| Modo | estrada | rio | trilha |
|------|---------|-----|--------|
| Sem override | 6 | 8 | 4.8 (=6×0.8) |
| Override V | V×1.0 | V×1.4 | V×0.8 |

(`modificador_velocidade` do segmento: em modo override, continua a substituir o fator de tipo via `edge_mod`, como hoje.)

### Custo (bp / milha) — sempre default

| Tipo | Dentro | Fora |
|------|--------|------|
| estrada (Coach) | 2 | 1 |
| rio (Balsa) | 5 | 2 |
| trilha | 0 | 0 |

## RoutePlanItem (extensão)

| Campo | Tipo | Notas |
|-------|------|--------|
| …campos existentes… | | |
| `custo_dentro_bp` | float | Soma milhas×tarifa Dentro |
| `custo_fora_bp` | float | Soma milhas×tarifa Fora |

## Pedido de cálculo

| Campo | Obrigatório | Notas |
|-------|-------------|--------|
| origem_waypoint_id | sim | |
| destino_waypoint_id | sim | |
| ritmo | sim | normal \| intenso |
| velocidade_media_mph | **não** | Se omitido → modo tabela 6/8; se presente → deve ser > 0 |

## Validação

- Velocidade presente e ≤ 0 → 422
- Custos não dependem de ritmo nem de velocidade
