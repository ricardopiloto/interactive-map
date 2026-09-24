# Data model: Mapa painel (115)

Nenhuma entidade de persistência nova. Estado de UI no MapPage:

## Selection

| Campo | Tipo | Notas |
|-------|------|--------|
| `kind` | `'local' \| 'npc'` | O que o painel detalha |
| `id` | number (produção) | Id da entidade |

`null` = modo lista/busca.

## Panel chrome

| Campo | Tipo | Notas |
|-------|------|--------|
| `expanded` | boolean | Folha móvel; desktop tipicamente sempre “expandido” visualmente |
| `query` | string | Busca |
| `filter` | `'todos' \| 'locais' \| 'npcs'` | Chips |

## Map camera / placement (existente)

| Campo | Fonte | Notas |
|-------|--------|--------|
| `--map-zoom` | CampaignMap transform | Escala estável dos pinos |
| `placementMode` | MapPage | `none` \| `add-pin` \| `reposition` \| `move-group` |
| `focusRequest` | MapPage → CampaignMap | Foco animado ao seleccionar da lista |

## Transitions

```text
[lista] --select local/npc or pin--> [detalhe]
[detalhe] --voltar--> [lista]
[lista] --focus search / select (mobile)--> expanded=true
[lista] --collapse grabber (mobile)--> expanded=false
[edit] --FAB+--> placement add-pin --> LocalFormDialog
[detalhe+edit] --editar--> LocalFormDialog
[detalhe+edit] --excluir--> ConfirmDialog --> API delete
```

## Validation

- Sem selecção: chips + lista (possivelmente vazia).
- Selecção inválida (id apagado): limpar para lista.
- Filtro `npcs` esconde secção de locais e vice-versa; `todos` mostra ambas.
