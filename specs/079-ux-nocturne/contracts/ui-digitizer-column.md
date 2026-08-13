# UI Contract: Coluna de digitalização de rotas

**Feature**: `079-ux-nocturne`  
**Component**: `RouteDigitizerView` (+ optional `DigitizerListPanel`)

## Layout desktop (`> 800px`)

```
┌─────────────────────────────────────────────┐
│ header (modos, sair)                        │
├──────────┬──────────────────────────────────┤
│ coluna   │ mapa (TransformWrapper)          │
│ 236px    │                                  │
│ busca    │                                  │
│ ▼ WP     │                                  │
│ ▼ Segs   │                                  │
└──────────┴──────────────────────────────────┘
```

| Rule | Requirement |
|------|-------------|
| Largura coluna | ~236px (`flex-shrink: 0`), alinhada a `RelacoesSideColumn` |
| Busca | Input no topo; placeholder indicando waypoints e arestas |
| Secções | "Waypoints" e "Arestas" colapsáveis; default **expandidas** |
| Filtro | `labelMatchesQuery` em nome de WP; identidade de segmento (nós + tipo) |
| Item WP | Nome, select Local, apagar — mantidos da lista actual |
| Item segmento | Identidade + apagar — mantidos |

## Layout narrow (`≤ 800px`)

| Rule | Requirement |
|------|-------------|
| Coluna | Bottom sheet retrátil (`listSheetOpen`) |
| Toggle | Botão visível para abrir/fechar lista |
| Fechada | Mapa ocupa palco completo (sem lista fixa em baixo) |
| Aberta | `max-height: ~70dvh`, cantos superiores arredondados — padrão `RelacoesDetailPanel` mobile |
| Rede mobile | **Não** alterar — FR-004a |

## Interacção lista → mapa

| Action | Map behaviour |
|--------|---------------|
| Click waypoint row | Pan/zoom para centrar pin; classe `is-focused`; scroll row into view |
| Click segment row | Centrar viewport no segmento; highlight polyline; scroll row |
| Hover segment (map) | Mantém sync com row (`hoveredSegmentId`) |

## Visual (Nocturne)

- Coluna usa `--elevation-column` — sem `border-right` pesado como separador principal.
- Campo busca: cantos 8px, elevação leve dentro da coluna.

## Non-regression

- Modos `idle` / `place-wp` / `draw-seg` inalterados.
- Clique no mapa para criar nó/segmento inalterado.
- Barra de ferramentas (escala, tipos) permanece acima do palco ou integrada no header — não dentro da coluna de listagem.

## Out of scope

- Autocomplete de waypoints no calculador de rotas (outras specs).
- i18n strings (080).
