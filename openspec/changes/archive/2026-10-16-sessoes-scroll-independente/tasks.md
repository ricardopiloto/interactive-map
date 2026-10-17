# Tasks

## 1. Layout de altura fixa com scroll por coluna

- [x] 1.1 Em `frontend-v2/src/routes/sessoes.tsx`, trocar `min-h-screen` por `fixed inset-0 overflow-y-auto lg:overflow-hidden` (ou equivalente) no `<main>`, mantendo o `pt-24 pb-28`/`lg:pb-16` já existente como respiro do TopBar/nav inferior (ver `design.md`, Decision 1). Confirmar que em mobile (abaixo de `lg:`) o comportamento de rolagem de página inteira continua exatamente igual ao de hoje.
- [x] 1.2 Remover `lg:sticky lg:top-24 lg:self-start` do `<nav>` da lista de sessões; adicionar `lg:h-full lg:overflow-y-auto` (mais padding pra barra de rolagem não colar no conteúdo, ex. `lg:pr-2`) — ver `design.md` Decision 2.
- [x] 1.3 Adicionar `lg:h-full lg:overflow-y-auto` (mais padding equivalente) no `<article>` da descrição da sessão selecionada — ver `design.md` Decision 3.
- [x] 1.4 Verificar visualmente (ou com teste de render/e2e) numa campanha com muitas sessões (lista mais alta que a viewport) e uma sessão com descrição longa (mais alta que a viewport): a lista rola sem mover a descrição, e a descrição rola sem mover a lista, em telas grandes.
- [x] 1.5 Confirmar visualmente que `SessionEditor` (drawer de criar/editar) e `AlertDialog` (confirmação de exclusão) continuam abrindo normalmente, por cima de tudo, sem nenhuma mudança de comportamento depois da alteração de layout do `<main>` (ver `design.md` Risks).
- [x] 1.6 Confirmar que o layout mobile (lista horizontal no topo, `overflow-x-auto`) permanece visualmente idêntico ao de antes da mudança.

## 2. Regressão

- [x] 2.1 Rodar `npm run lint`, `npx tsc --noEmit` e `npm run test` completos em `frontend-v2/`; confirmar 0 erros e nenhum teste quebrado.
- [x] 2.2 Rodar `npx playwright test` completo; confirmar que `e2e/sessoes.spec.ts` (e qualquer outro teste que toque a tela de Sessões, ex. os testes de deep-link `?item=`/`?s=` de `itens.spec.ts`) continuam passando sem modificação de asserção.

## Workflow follow-up

- Arquivar esta change (`/openspec-archive-change`) depois que as tasks acima estiverem concluídas.
