# Proposal

## Why

O usuário pediu que a tela de Sessões (`frontend-v2/src/routes/sessoes.tsx`) ganhe scroll independente pra lista de sessões (coluna da esquerda) e pra descrição da sessão selecionada (coluna central/direita) — assim a descrição sempre fica visível na tela, mesmo com uma lista de sessões longa, e a lista também continua navegável mesmo com uma descrição longa.

Hoje a tela inteira usa um único scroll de página: `<main className="mx-auto grid min-h-screen max-w-6xl gap-10 ... lg:grid-cols-[300px_1fr] ...">`. A lista de sessões (`<nav>`) usa `lg:sticky lg:top-24 lg:self-start` — isso gruda a lista no topo enquanto a página rola, mas **não dá à lista um scroll próprio**: se ela for mais alta que a viewport (muitas sessões), ela simplesmente continua crescendo e empurra a rolagem geral da página junto com a descrição. O mesmo vale ao contrário: uma descrição (`<article>`) muito longa faz a página inteira crescer, exigindo rolar além do fim da lista pra terminar de ler.

Esse padrão de "duas colunas, cada uma com scroll próprio dentro de um contêiner de altura fixa" já existe noutras telas de `frontend-v2/` (ex. `LocationInspector.tsx`: `max-h-[62vh] flex flex-col overflow-hidden` no contêiner externo + `overflow-y-auto` no conteúdo interno) — esta proposta aplica a mesma ideia à tela de Sessões.

## What Changes

- Em `frontend-v2/src/routes/sessoes.tsx`, trocar o layout de "página que cresce com `min-h-screen`" por um layout de altura fixa (viewport), com a lista de sessões (`<nav>`) e a descrição da sessão selecionada (`<article>`) cada uma com seu próprio `overflow-y-auto`, independente uma da outra — em telas grandes (`lg:` e acima, onde as duas colunas já aparecem lado a lado). Em telas pequenas (mobile, onde a lista já usa um layout horizontal diferente, `overflow-x-auto`), o comportamento atual de rolagem de página inteira é mantido — essa proposta é só sobre o layout de duas colunas lado a lado.
- Sem mudança nenhuma de dado, API, ou comportamento funcional além do scroll — criar/editar/excluir sessão, sugestão por IA, chips de local/personagem, tudo continua igual.

## Capabilities

### New Capabilities
- `sessoes-layout`: cobre o comportamento de layout/scroll da tela de Sessões — não existia nenhuma spec cobrindo isso antes.

### Modified Capabilities
(nenhuma)

## Impact

- **Frontend (`frontend-v2/`)**: `src/routes/sessoes.tsx` (CSS/estrutura de layout apenas).
- **Backend**: nenhuma mudança.
- **Dados/migração**: nenhuma.
