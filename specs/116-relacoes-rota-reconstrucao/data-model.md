# Data model: Relações / Rota painéis (116)

Nenhuma entidade de persistência nova. Estado de UI:

## Shared panel chrome (from 115)

| Campo | Tipo | Notas |
|-------|------|--------|
| `expanded` | boolean | Folha móvel; desktop tipicamente expandido |
| Shell | MapSidePanel | Mesma geometria/breakpoints que o Mapa |

## Relações — selection & filters

| Campo | Tipo | Notas |
|-------|------|--------|
| `selectedId` | `number \| null` | Personagem activo (painel + foco no grafo) |
| `query` | string | Busca na lista |
| `activeTipos` / families | `Set` de tipos/famílias | Filtra arestas (e chips no head) |
| `hoveredId` | `number \| null` | Hover lista ↔ grafo |
| `statusFilter` | existente | Se mantido, continua client-side |
| `isolate` | boolean (existente) | Se mantido, só com selecção |

`selectedId == null` → modo lista; senão → modo detalhe no mesmo painel.

## Rota — planner state (rehost 106)

| Campo | Tipo | Notas |
|-------|------|--------|
| `fromId` / `toId` | waypoint ids | Combobox existentes |
| Opções | modo, ritmo, ordenação, preferência, velocidade… | Mesmas do RoutePlannerPanel |
| `plan` | `RoutePlanItem[]` | Resultado da API/cálculo existente |
| `selectedIndex` | number | Cartão activo ↔ overlay no mapa |
| `calculated` / loading / error | flags | Empty state i18n se 0 rotas |

## Map highlight (Rota)

| Campo | Fonte | Notas |
|-------|--------|--------|
| `travelPlan` + `selectedIndex` | RotaPage → CampaignMap / RouteOverlay | Stroke seleccionado = acento campanha |
| Pernos / fadiga visual | RoutePlanItem.dias_visuais | Preservar se já existir |

## Transitions

```text
### Relações
[lista] --select list or graph node--> [detalhe no painel]
[detalhe] --voltar--> [lista]
[lista] --focus search / select (mobile)--> expanded=true
[edit] --FAB/menu +--> PersonagemFormDialog | VinculoFormDialog
[detalhe+edit] --editar/excluir--> drawers / ConfirmDialog

### Rota
[form] --calcular--> [cartões]
[cartões] --select card--> highlight path on map (accent)
[form] --change endpoints/options--> invalidate or clear plan (comportamento actual)
fromId == toId --> hint i18n; disable calculate
plan.length == 0 after calculate --> empty state i18n
```

## Validation

- Selecção de personagem apagado/oculto: limpar para lista.
- Sem waypoints: formulário desabilitado / empty.
- Sem caminho: empty cards + mensagem.
- Deep-link `personagem`: detalhe no painel flutuante.
