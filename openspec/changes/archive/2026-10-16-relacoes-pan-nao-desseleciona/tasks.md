# Tasks

## 1. Suppress click após pan na área vazia

- [x] 1.1 Em `RelationsGraph.tsx`, rastrear o gesto de ponteiro na área vazia (fora de nó) e, se o deslocamento ultrapassar `GRAB_SLOP_PX`, armar o mesmo `skipClickRef` usado pelo arrasto de nó; **não** chamar `stopPropagation`/`preventDefault` nesse tracking (senão o pan do TransformWrapper quebra); limpar estado do tracking em `pointerup`/`pointercancel`. Verificar manualmente: pan com seleção preserva personagem; clique simples na área vazia ainda chama `onSelect(null)`.
- [x] 1.2 Em `RelationsGraph.test.tsx`, com `selectedId` ativo: (a) pointerdown + move (> slop) + click na área vazia → `onSelect` não chamado; (b) click simples sem move → `onSelect(null)`; (c) manter o teste existente de arrasto de nó sem chamar `onSelect`. Rodar `npm test -- RelationsGraph` em `frontend-v2/` e confirmar verde.

## 2. Verificação de regressão

- [x] 2.1 Estender `e2e/relacoes-zoom.spec.ts` (ou equivalente): abrir com `?personagem=1`, pan na área vazia, afirmar que a URL/seleção permanece e o viewport mudou de pan; opcionalmente com isolate ligado. Rodar e2e de relações + unitários do grafo sem regressão em zoom, fit, arrasto de nó e centralização na seleção.
