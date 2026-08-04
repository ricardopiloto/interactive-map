# UI Contract: Vínculo nó ↔ Local

**Feature**: 029-link-node-local

## Rede de rotas (`RouteDigitizerView`)

| Elemento | Comportamento |
|----------|----------------|
| Lista de nós | Mostra nome + Local associado (nome, não só id) |
| Select por nó | “Sem Local” + Locais elegíveis |
| Ao mudar select | `updateWaypoint` + reload; pin do Local no mapa (fora da vista) fica nas coords do nó após refresh da campanha |

## Formulário de Local (`LocalFormDialog`)

| Elemento | Comportamento |
|----------|----------------|
| Campo “Nó da rede” | Select: “Sem nó” + nós elegíveis |
| Ao escolher nó | Opcional: atualizar preview x/y do draft para o nó |
| Ao gravar | Payload inclui `waypoint_id`; servidor aplica snap |

## Invariantes

- “Novo nó” com Local opcional permanece
- Conflito de Local/nó ocupado → erro visível
- Desvincular não move o Local de volta
