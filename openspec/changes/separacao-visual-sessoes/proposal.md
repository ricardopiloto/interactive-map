# Proposal

## Why

Na leitura de uma sessão, o mestre vê hoje as notas de preparo (com o Modo GM ligado) logo acima do resumo, sem moldura que as distinga, e os fios narrativos não aparecem na sessão, só na lista geral da página. O resumo, por sua vez, não tem rótulo. Como o resumo é a única parte que jogadores veem, o mestre precisa enxergar de relance o que é material privado de preparo (Notas de Preparo, Fios Narrativos) e o que é o texto público (Resumo), para não confundir nem publicar por engano o que é só dele.

## What Changes

- Na leitura de uma sessão, o mestre com o Modo GM ligado passa a ver **três blocos visualmente separados e rotulados**, nesta ordem: **Notas de Preparo**, **Fios Narrativos** e **Resumo**. Os dois blocos privados levam um selo "Só para o mestre"; o Resumo fica sem selo, por ser o texto público.
- O bloco de **Fios Narrativos** mostra os fios **criados naquela sessão** (`sessao_origem_id` igual à sessão), abertos primeiro e resolvidos distinguíveis, em modo só leitura, com um link para a lista completa "Fios em aberto" da página de Sessões. Aparece só para o mestre dono.
- Jogadores, visitantes e o mestre com o Modo GM desligado veem apenas o Resumo, exatamente como hoje (sem blocos, rótulos novos nem contagens).
- O Resumo **nunca** exibe fios nem notas de preparo: nem conteúdo, nem rótulos, nem contagens.
- A seção "Fios em aberto" da página de Sessões passa a aparecer só para o mestre dono **com o Modo GM ligado** (hoje aparece com o Modo GM desligado também), e fica sincronizada com o bloco de fios da sessão após cada alteração.
- Backend, ajuste mínimo: `GET /admin/fios` ganha o filtro opcional `sessao_origem_id`. Um teste de regressão garante que as respostas públicas de sessões não carregam notas nem fios.
- Layout empilhado no mobile e textos em pt-BR e en.

## Capabilities

### New Capabilities

- `sessao-leitura-blocos`: apresentação da leitura de sessão com blocos separados de Notas de Preparo, Fios Narrativos e Resumo para o mestre, e só o Resumo para os demais.

### Modified Capabilities

- `fios-narrativos`: o requirement "Lista de fios narrativos só do mestre" passa a exigir o Modo GM ligado para o mestre dono ver a lista na página de Sessões.

<!-- `sessao-notas-preparo` e `sessoes-layout` não mudam de requirement: esta change só apresenta, sem alterar regras de visibilidade das notas, e acrescenta um filtro de leitura à API administrativa. -->

## Impact

- **Backend**: filtro opcional `sessao_origem_id` em `GET /api/c/{slug}/admin/fios` (`routers/admin/fios.py`); testes de filtro e de não vazamento nas rotas públicas de sessões. Sem migração.
- **Frontend (`frontend-v2`)**: novo componente de blocos de leitura em `routes/sessoes.tsx` (substitui o trecho atual de notas e resumo), chamada de `fiosApi.list` com o filtro, âncora na seção `FiosList`; i18n pt-BR/en; testes.
- **`FiosList`**: passa a exigir `enabled && isDono` e a notificar o pai a cada alteração; `docs/api-contracts.md`, defasado, fica fora do escopo.
- **Privacidade**: nenhuma regra de visibilidade das notas muda; a lista de fios fica ainda mais restrita (só com o Modo GM ligado). As notas continuam fora de `SessaoPublic`, e os fios continuam só em rotas `admin` com `require_dono`.
- **Dependências**: as changes `fios-narrativos-lista` e `ia-assistente-mestre` já estão arquivadas e aplicadas.
