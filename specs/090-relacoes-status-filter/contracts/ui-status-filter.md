# UI Contract: Filtro de estado (Relações)

**Feature**: `090-relacoes-status-filter`  
**Scope**: FR-001–FR-010, US1, SC-001–SC-006

## Superfície

Coluna esquerda, mesmo bloco que Isolar, **acima** da checkbox, abaixo da lista, antes da legenda.

```ts
export type RelacoesStatusFilter =
  | 'todos'
  | 'vivo'
  | 'morto'
  | 'desconhecido'
  | 'desaparecido'

matchesStatusFilter(p, 'todos') === true
matchesStatusFilter({ status: undefined }, 'desconhecido') === true
matchesStatusFilter({ status: 'vivo' }, 'morto') === false
```

`<select>` opções (ordem fixa): Todos, Vivos, Mortos, Desconhecidos, Desaparecido.  
Rótulos de estado: `t('comum:status.*')`. Todos: `relacoes:column.statusFilterTodos`.  
`aria` / label visível: `relacoes:column.statusFilter`.

## Conjunto

| Destino | Array |
|---------|--------|
| Lista da coluna | `visiblePersonagens` (depois busca por nome) |
| `GraphStage.personagens` | `visiblePersonagens` |
| `GraphStage.vinculos` | `visibleVinculos` (ambos os extremos em `visiblePersonagens`) |

Isolar, `searchQuery` e chips: inalterados em significado; Isolar **não** reduz a lista.

## Proibições

- Persistir `statusFilter` (localStorage / API).
- Multi-selecção.
- Filtrar o mapa geográfico.
- Revelar personagens ocultos ao jogador.
- Deixar no layout nós que falharam o filtro (buracos).
- Alterar `compactInnerSpacing` / `OVERVIEW_SPACING` / limiares 088–089 (aplicam-se ao conjunto **já** filtrado).

## Vazio

Lista e palco sem nós: `column.listEmptyStatus` na lista; palco vazio (sem anéis). Com busca e filtro: se a busca esvaziar, `listEmptySearch` como hoje.
