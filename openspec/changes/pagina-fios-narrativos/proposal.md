## Why

A lista de fios narrativos vive hoje dentro da página de Sessões, embaixo da lista de sessões, numa coluna de 300 px. Como um fio, uma vez criado, permanece na lista da campanha até ser removido (a sessão de origem é só uma referência), a lista cresce com a campanha e fica espremida num espaço pensado para navegar entre sessões. O mestre quer um lugar próprio para os fios, com espaço e leitura confortável, no estilo de itens expansíveis que a Cronologia já usa.

## What Changes

- Nova **página «Fios»** da campanha (rota `/c/:id/:slug/fios`), só para o mestre dono, com largura total e cada fio como cartão expansível (`<details>`, como os eventos da Cronologia): o título e o estado ficam à vista; descrição e ações aparecem ao expandir.
- Novo item **«Fios»** na navegação da campanha (barra superior e barra inferior no celular), visível ao mestre dono com o Modo GM ligado.
- A lista de fios **sai da página de Sessões**: a coluna de sessões volta a ter só a lista de sessões.
- O link do bloco «Fios Narrativos» da leitura da sessão passa a levar à página «Fios» (hoje rola até a seção na própria página).
- Mesmas ações de hoje, sem mudar regras nem API: criar, editar, reordenar, resolver, reabrir e remover. A proposta de fios pela IA continua no editor da sessão, que é de onde ela recebe a sessão de origem.
- Textos novos em pt-BR e en.
- Sem alteração de backend, banco, exportação ou das regras de visibilidade dos fios.

## Capabilities

### New Capabilities
- `pagina-fios-narrativos`: a página dedicada dos fios (rota, item de navegação, acesso, layout em cartões expansíveis, estados vazio e de erro).

### Modified Capabilities
- `fios-narrativos`: a lista deixa de ser exibida na página de Sessões e passa a ser exibida na página «Fios».
- `sessao-leitura-blocos`: o link do bloco de fios e a sincronização entre o bloco e a lista passam a considerar a página «Fios».

## Impact

- Frontend: `routes/campaignRoutes.tsx` (rota), `components/codex/Shell.tsx` (item de navegação), nova `routes/fios.tsx`, `components/codex/FiosList.tsx` (layout em cartões), `routes/sessoes.tsx` (remove a lista e o rolar-até-seção), `components/codex/SessionReadBlocks.tsx` (link), locales `comum.json` e `sessoes.json`, e os testes correspondentes (`SessoesPage.test.tsx`, `SessionReadBlocks.test.tsx`, novo teste da página).
- Backend e API: nenhum. Quem tinha o endereço `#fios-em-aberto` da página de Sessões perde esse âncora.
