# Data Model: Lista, hover e anel compacto (Relações)

**Feature**: `086-relacoes-list-compact`  
**Date**: 2026-08-14

Nenhuma entidade persistida nova. Nenhuma coluna, migração ou contrato HTTP novo. Personagem e vínculo continuam os da Rede ([066](../066-relationship-network/spec.md), visibilidade [084](../084-personagem-visibility/spec.md)).

Esta frente só acrescenta **estado de sessão no cliente** e um parâmetro de layout.

## Personagem (lista)

Conjunto = resposta já carregada em `RelacoesPage` (`campaignApi.listPersonagens` ou `adminApi.listPersonagensAdmin`).

| Campo usado na lista | Origem | Notas |
|----------------------|--------|--------|
| `id` | API | chave; clique e hover |
| `nome` | API | ordenação A→Z; filtro da busca |
| `tipo` | API | PJ/NPC — **não** gera secções nem rótulo obrigatório na linha |
| `visivel_para_todos` | API | se `false` e o papel é GM, indicador de oculto na linha (paridade com o disco) |

**Validação**: não entra na lista quem a API já omitiu (jogador vs oculto). Isolar selecção **não** reduz este conjunto.

**Filtro de busca**: `labelMatchesQuery(nome, query)` — se `query` vazio, todos os visíveis ao papel.

**Ordenação**: `nome.localeCompare(..., 'pt', { sensitivity: 'base' })`.

## Destaque de hover (sessão)

| Campo | Tipo | Ciclo de vida |
|-------|------|----------------|
| `hoveredId` | `number \| null` | `pointerenter` no item → id; `pointerleave` (lista) ou desmontar → `null`. **Não** persiste. **Não** substitui `selectedId`. |

**Relação com o palco**: preview só se o disco correspondente está desenhado (`isVisible`). Arestas de preview ⊂ `visibleEdges` (já filtradas por chips, Isolar e visibilidade de vínculo). Hover **não** revela vínculo secreto.

## Selecção (já existente)

`selectedId` inalterado. Clique na lista = `selectPersonagem` (toggle). Hover não chama este caminho.

## Layout — anel de conexões

`computeFocusLayout(selectedId, directIds, otherIds, center, spacing, innerSpacing?)`.

| Parâmetro | Quando |
|-----------|--------|
| `spacing` | sempre o `espacamento` do palco (default 240) — anel exterior e vista geral |
| `innerSpacing` | `spacing` se `directIds.length ≤ 6`; senão `compactInnerSpacing(spacing)` |

`directIds` = personagens com vínculo **visível** (chips) a `selectedId`. Limiar **estrito** `> 6`.

Não há estado persistido de folga.

## Lifecycle (UI)

```text
idle → hover item → hoveredId = id (preview no palco)
     → leave item → hoveredId = null
     → click item → selectedId toggle (painel); hoveredId pode permanecer enquanto o ponteiro estiver no item
isolate on  → palco reduz nós; lista inalterada; hover sem disco visível = sem preview
```
