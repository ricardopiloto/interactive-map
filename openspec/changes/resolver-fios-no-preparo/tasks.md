## 1. Ação de resolver no bloco

- [ ] 1.1 `frontend-v2/src/components/codex/SessionReadBlocks.tsx`: em cada fio do bloco «Fios Narrativos», botão «Resolver» (fio em aberto) ou «Reabrir» (fio resolvido) que chama `fiosApi.update(slug, fio.id, { estado })`, com nome acessível que inclui o título do fio e estado de carregando por fio (desabilitado/`aria-busy`); ao concluir, atualizar o fio no estado local do bloco com a resposta e reordenar (abertos antes dos resolvidos); em erro, manter o estado anterior e mostrar aviso próprio `role="alert"` dentro do bloco (sem esconder a lista); o estado de gravação é por id de fio, e a resposta só atualiza o bloco se a chave (sessão e revisão) ainda for a atual. Sem botões de editar, ordenar ou remover.
- [ ] 1.2 Reutilizar `fios.resolve`/`fios.reopen`; textos novos só para o erro ao gravar e o rótulo acessível com o título do fio (ex.: «Resolver fio: {{titulo}}») em `locales/{pt-BR,en}/sessoes.json` com o mesmo conjunto de chaves e o teste de paridade passando.

## 2. Testes

- [ ] 2.1 Em `SessionReadBlocks.test.tsx`: resolver um fio em aberto chama o PATCH com `estado: "resolvido"` e o fio passa para depois dos abertos; reabrir faz o inverso; falha no PATCH mantém o estado e mostra o aviso; o botão fica desabilitado enquanto grava (por fio: dois fios resolvidos em sequência funcionam); a falha mantém o estado e a lista visível; resposta tardia (PATCH em voo e troca de sessão) não altera o bloco da nova sessão; o botão tem nome acessível com o título do fio; jogador/Modo GM desligado não vê o bloco nem as ações (testes existentes continuam valendo).

## 3. Verificação e registro

- [ ] 3.1 `npx vitest run`, `npx tsc --noEmit` e `npx eslint .` do `frontend-v2` passando; pytest sem regressão (não há mudança de backend).
- [ ] 3.2 Verificação manual: na leitura de uma sessão com fios criados nela, resolver e reabrir pelo bloco e conferir o estado na página «Fios»; falha simulada (backend parado) mostra o aviso.
- [ ] 3.3 Registrar no `CHANGELOG.md`, em Unreleased (Changed), a ação de resolver e reabrir no bloco de fios da sessão.
