# Proposal

## Why

“Abrir mesa” no Painel mostra “Falha ao carregar dados” e o mapa só aparece depois de um refresh. O pedido nem chega à API: a página pede os dados antes de o slug da campanha existir. O levantamento está em `docs/v2/tr-bug-004-abrir-mesa.md`.

## What Changes

- Na primeira navegação para uma campanha, inclusive quando a configuração já está em cache, o mapa carrega sem refresh.
- O slug da rota fica disponível antes dos efeitos das páginas. Ao sair da campanha, esse slug deixa de valer, e o cleanup da página anterior não apaga o slug da página que acabou de montar.
- Relações, Rota, Sessões e Linha do Tempo, que carregam dados no mesmo tipo de efeito, passam a ver o slug a tempo. Não se acrescenta um parâmetro de slug a cada método de API.

## Capabilities

### New Capabilities

- `entrada-campanha`: entrar numa campanha a partir do Painel, ou mudar de página dentro dela, carrega os dados dessa campanha na primeira navegação.

### Modified Capabilities

(nenhuma. As specs existentes não cobrem a entrada na campanha nem o slug usado nos pedidos.)

## Impact

- **Frontend:** `CampaignShell` em `App.tsx` e `campaignSlug.ts`. Sem API nova e sem migração.
- **Fora disto:** não se adiciona `ErrorBoundary` nem se altera o texto “Falha ao carregar dados”.
