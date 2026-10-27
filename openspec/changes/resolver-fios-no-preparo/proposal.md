## Why

Ao preparar uma sessão, o mestre vê na leitura da sessão o bloco de Notas de Preparo e o bloco de Fios Narrativos da sessão, mas só pode marcar um fio como resolvido indo à página «Fios» (ou à lista de fios). Isso obriga a trocar de tela no meio do preparo. O mestre quer resolver os fios da sessão ali mesmo, onde está preparando.

## What Changes

- O bloco «Fios Narrativos» da leitura da sessão (que fica logo abaixo das Notas de Preparo, só para o mestre dono) passa de somente leitura a **acionável**: cada fio da sessão ganha a ação **Resolver** (e **Reabrir**, se já estiver resolvido), que grava o novo estado na hora e atualiza o bloco, sem sair da sessão.
- Continuam aparecendo no bloco só os **fios criados nesta sessão** (sessão de origem = esta sessão); os demais fios seguem na página «Fios».
- Nenhuma mudança de API (usa a atualização de fio que já existe), de banco, de exportação ou de visibilidade; jogadores e visitantes continuam sem ver nada disso.
- Falha ao gravar: aviso dentro do bloco, o fio mantém o estado anterior.
- Textos novos em pt-BR e en.

**Premissa a confirmar:** o pedido foi «marcar direto no prep-notes»; a ação fica no bloco «Fios Narrativos», que fica colado às Notas de Preparo na leitura, em vez de duplicar a lista dentro do bloco de Notas.

## Capabilities

### New Capabilities

### Modified Capabilities
- `sessao-leitura-blocos`: o bloco de Fios Narrativos deixa de ser somente leitura e passa a permitir resolver e reabrir os fios da sessão.

## Impact

- Frontend: `components/codex/SessionReadBlocks.tsx` (ações no bloco), `locales/{pt-BR,en}/sessoes.json`, e os testes de `SessionReadBlocks.test.tsx`.
- Backend e API: nenhum (`PATCH /admin/fios/{id}` já aceita `estado`).
- Depende de a change `pagina-fios-narrativos` ser arquivada antes (as duas alteram o mesmo requisito de `sessao-leitura-blocos`; esta parte do texto já com o link para a página «Fios»).
