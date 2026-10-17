# Proposal

## Why

Na Rede de Relações, qualquer gesto que termina em `click` na área vazia do grafo limpa a seleção — inclusive pan (arrastar a viewport). Isso força o usuário a reescolher o Personagem depois de só mover a visão. Arrastar a tela vazia não é um gesto de desseleção; só um clique simples na área vazia deve limpar a seleção.

## What Changes

- Distinguir **clique simples** na área vazia (desseleciona) de **arrasto/pan** na área vazia (preserva a seleção).
- Manter o comportamento já correto de arrastar um nó: não altera a seleção.
- Manter clique em um nó (sem arrastar) como toggle de seleção.
- Cobrir o novo contrato com teste de interação (e, se útil, e2e).

## Capabilities

### New Capabilities

<!-- nenhuma — comportamento novo entra na capability já existente -->

### Modified Capabilities

- `rede-relacoes`: formalizar que pan/arrasto na área vazia NÃO limpa a seleção; apenas clique simples (sem deslocamento relevante) na área vazia desseleciona.

## Impact

- **Frontend**: `frontend-v2/src/components/codex/RelationsGraph.tsx` — o `onClick` do `<svg>` chama `onSelect(null)` sem distinguir pan de clique; o `skipClickRef` só suprime click após arrasto de **nó**.
- **Testes**: `RelationsGraph.test.tsx` (e possivelmente `e2e/relacoes-zoom.spec.ts`).
- **Sem** mudanças de API, backend ou persistência.
