# Tasks

## 1. Backend — filtro e garantia de privacidade

- [ ] 1.1 Em `GET /admin/fios` (`routers/admin/fios.py`), aceitar o parâmetro opcional `sessao_origem_id` (`gt=0`), combinável com `estado`, mantendo a ordem atual e o comportamento sem o parâmetro; verificar em `tests/test_fios_narrativos.py` (só os fios da sessão, combinação com estado, sem filtro devolve todos, jogador/visitante e dono de outra campanha negados).
- [ ] 1.2 Teste de regressão de não vazamento: com uma sessão visível que tem `notas_preparo` e fios com `sessao_origem_id`, a listagem e o detalhe de `routers/public/sessoes.py` não contêm `notas_preparo` nem chaves ou textos de fios; incluir sessão oculta; verificar com `uv run pytest`.

## 2. Frontend — blocos de leitura e lista

- [ ] 2.1 `fiosApi.list` aceita o filtro `sessao_origem_id` (junto de `estado`); teste do cliente no padrão de `fios.test.ts`.
- [ ] 2.2 Componente `SessionReadBlocks` (Notas de Preparo, Fios Narrativos, Resumo) com moldura, rótulo e selo "Só para o mestre" (ícone e texto) nos dois blocos privados; mensagens de vazio; fios com abertos antes dos resolvidos e estado distinguível; somente leitura; falha de carregamento como aviso dentro do bloco (inclusive 429); resposta tardia descartada ao trocar de sessão.
- [ ] 2.3 Integrar em `routes/sessoes.tsx`, substituindo o trecho atual de notas e resumo: sem Modo GM a marcação do resumo permanece igual à atual; fios só com `enabled && isDono`, sem buscar fios nos demais casos; `id="fios-em-aberto"` na seção `FiosList` e link com rolagem suave que respeita `prefers-reduced-motion`.
- [ ] 2.4 Condicionar a renderização da `FiosList` em `routes/sessoes.tsx` a `enabled && isDono` (hoje só `isDono`), de modo que o dono com o Modo GM desligado não veja "Fios em aberto".
- [ ] 2.5 Sincronização: a `FiosList` recebe um callback `onChange` chamado após cada mutação bem-sucedida (criar, editar, resolver, reabrir, remover, reordenar); o pai incrementa o contador `fiosRevision` (já usado ao aceitar propostas da IA) e o bloco de fios da sessão o usa na chave de recarga.
- [ ] 2.6 Layout mobile: blocos empilhados, sem rolagem horizontal até 320 px, com quebra de palavras longas.
- [ ] 2.7 Copy pt-BR e en (rótulos, selo, vazio, erro, link) com o mesmo conjunto de chaves e teste de paridade passando.
- [ ] 2.8 Testes de componente e de `SessoesPage.test.tsx` (ajustando a marcação sem enfraquecer asserções): dono em Modo GM vê os três blocos na ordem; editor não dono não vê Fios (se o cenário for alcançável; senão, teste de unidade do componente); Modo GM desligado, jogador e visitante veem só o Resumo, sem rótulos, selos, contagens nem textos de notas ou fios; o Resumo não contém texto de notas nem de fios; só os fios da sessão aparecem; troca de sessão não mostra fios da anterior; falha de fios (incluindo 429) não derruba o Resumo; link leva a `#fios-em-aberto`; dono com Modo GM desligado não vê "Fios em aberto" e com Modo GM ligado vê; resolver ou remover um fio na lista atualiza o bloco da sessão.

## 3. Verificação e documentação

- [ ] 3.1 `uv run pytest` completo do backend e `npx vitest run`, `npx tsc --noEmit` e `npx eslint .` do `frontend-v2` passando.
- [ ] 3.2 Verificação manual: como dono em Modo GM, ver os três blocos, abrir uma sessão com fios e outra sem, seguir o link para a lista, resolver um fio na lista e ver o bloco atualizar; desligar o Modo GM e conferir que só o Resumo aparece e que "Fios em aberto" some; entrar como jogador e conferir que não há rótulos nem textos privados; conferir mobile em pt-BR e en.
- [ ] 3.3 Registrar em `CHANGELOG.md`, em Unreleased, a leitura de sessão com blocos separados para o mestre e a lista de fios passando a exigir o Modo GM.
