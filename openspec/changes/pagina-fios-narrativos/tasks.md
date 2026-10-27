## 1. Rota e navegação

- [ ] 1.1 Rota `fios` em `frontend-v2/src/routes/campaignRoutes.tsx` (filha ao lado de `sessoes`/`ferramentas`, na forma canônica e na compatível) `/fios` em `CAMPAIGN_SUBROUTES` de `lib/navigation.tsx`, e nova página `routes/fios.tsx` que usa `isDono` e `ready` do `EditModeContext` (nunca `canEdit`), com os estados: carregando permissão, não é dono (indicação «só do mestre», sem dados), dono com o Modo GM desligado (orientação, sem carregar fios) e dono com o Modo GM ligado (formulário e lista).
- [ ] 1.2 Item «Fios» em `components/codex/Shell.tsx` (barra superior e inferior), visível para `isDono && enabled`, com ícone (`Waypoints` ou `GitBranch`, conferindo que existe na versão instalada de lucide) e rótulo curto; incluir a chave `fios` no mapa `labels` do `Shell` (`fios → threads`); chave `v2.threads` em `comum.json` (pt-BR e en); verificar a barra inferior em 320 px com o dono vendo sete itens e, se não couber, registrar a decisão de mover o item para um atalho em Sessões.

## 2. Lista em cartões expansíveis

- [ ] 2.1 `components/codex/FiosList.tsx`: cada fio como `<details>`/`<summary>` (título + estado, sem botões no `summary`) com descrição e ações ao expandir (editar, reordenar, resolver/reabrir, remover), abertos antes dos resolvidos e na ordem da lista; formulário de novo fio no topo; sem mudar chamadas de API nem regras; estado vazio e aviso de erro preservados; remover o `id="fios-em-aberto"` e o `h2` interno da seção atual (o `h1` fica em `fios.tsx`).
- [ ] 2.2 Textos novos (título e introdução da página, avisos de acesso e do Modo GM) em `locales/{pt-BR,en}/sessoes.json` com o mesmo conjunto de chaves e teste de paridade passando.

## 3. Página de Sessões e bloco da sessão

- [ ] 3.1 `routes/sessoes.tsx`: remover a renderização de `FiosList`, o `onShowThreads` e o rolar até `#fios-em-aberto`; manter `fiosRevision` só para o bloco atualizar quando fios são aceitos pela IA no editor.
- [ ] 3.2 `components/codex/SessionReadBlocks.tsx`: trocar o âncora pelo `Link` de `@/lib/navigation` com `to="/fios"` (respeitando a URL canônica pelo `CAMPAIGN_SUBROUTES`), removendo `onShowThreads` e o `id` antigo; o bloco consulta os fios ao montar para refletir mudanças feitas na página «Fios».

## 4. Testes

- [ ] 4.1 Testes da página de fios (vitest): dono com Modo GM ligado vê os cartões (abertos antes dos resolvidos) e executa criar, editar, reordenar, resolver, reabrir e remover; dono com Modo GM desligado vê a orientação e nenhuma chamada de lista é feita; não dono vê «só do mestre» sem chamadas; lista vazia e falha ao carregar.
- [ ] 4.2 Ajustar `SessoesPage.test.tsx` (os testes que esperam o heading e a região «Fios em aberto» em Sessões, perto das linhas 540–644, migram para o teste da página «Fios»; a lista não aparece mais em Sessões) e `SessionReadBlocks.test.tsx` (o teste do âncora `#fios-em-aberto`, perto da linha 60, passa a verificar o link para a página «Fios»; troca de sessão e falha ao carregar continuam valendo); teste do item de navegação nos dois estados do Modo GM (aparece só para o dono com o Modo GM ligado; não aparece para editor não dono, jogador nem visitante), e teste de que o bloco da sessão consulta os fios ao montar depois de mudanças na página «Fios». Nos testes de ações, abrir o `<details>` clicando no `summary`.

## 5. Verificação e registro

- [ ] 5.1 `npx vitest run`, `npx tsc --noEmit` e `npx eslint .` do `frontend-v2` passando; `uv run pytest` completo do backend sem regressão (fora do sandbox do codex).
- [ ] 5.2 Verificação manual: abrir a página «Fios» como dono (cartões expandem, ações funcionam); conferir que Sessões não mostra mais a lista; clicar no link do bloco da sessão e chegar à página «Fios»; testar em 320 px (barra inferior com sete itens) e com o Modo GM desligado; abrir o endereço como jogador.
- [ ] 5.3 Registrar no `CHANGELOG.md`, em Unreleased (Added/Changed): a página «Fios» e a saída da lista da página de Sessões.
