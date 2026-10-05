# Tasks

## 1. Slug com dono

- [x] 1.1 Em `campaignSlug.ts`, acrescentar `claim` e `release`: `claim` grava o slug e o dono; `release` só apaga se o dono atual for o mesmo; repetir `claim` com o mesmo dono e o mesmo slug não muda o dono. Verificar com um teste `node:test` corrido com `node --experimental-strip-types`, cobrindo claim, release do dono certo, e release de um dono antigo depois de um claim posterior.

## 2. Shell

- [x] 2.1 `CampaignShell` reivindica o slug da rota durante a renderização, com um dono estável por instância, e liberta no cleanup. Verificar com `npm run build` em `frontend/` e com o teste da tarefa 1.1 ainda a passar.

## 3. Verificação na tela

- [x] 3.1 No browser, com a campanha já aberta nesta sessão: voltar ao Painel, escolher "Abrir mesa" e confirmar que o mapa aparece sem "Falha ao carregar dados"; atualizar a página e confirmar que o mapa continua; abrir Relações e confirmar que os dados dessa campanha aparecem; voltar ao Painel e abrir outra campanha e confirmar que o mapa é o dessa campanha. Não alterar dados persistidos.
