# Quickstart: Corrigir travamento ao entrar numa campanha vindo de fora (131)

## Pré-requisitos

- `cd frontend && npm run dev`
- Uma campanha listada e acessível (autenticado ou via catálogo público de `/explorar`)

## Cenário A — Vindo de Explorar

1. Abrir `/explorar`.
2. Clicar numa campanha da listagem.
3. Esperado: Mapa carrega por completo (mapa, pins, rede de rotas), sem erro no console (`CAMPAIGN_SLUG_REQUIRED` não deve aparecer), sem tela em branco.

## Cenário B — Vindo do Painel

1. Autenticado, abrir `/painel`.
2. Abrir uma das campanhas listadas.
3. Mesmo resultado esperado do Cenário A.

## Cenário C — Link direto (primeira carga)

1. Colar `/c/<slug>` direto na barra de endereço (nova aba, sem navegação prévia dentro do app).
2. Mesmo resultado esperado do Cenário A.

## Cenário D — Regressão dentro da campanha (não pode quebrar)

1. A partir do Mapa já aberto (qualquer um dos cenários acima), navegar pra Relações, depois pra Rota, depois de volta pro Mapa.
2. Esperado: nenhuma mudança de comportamento em relação a antes desta correção — continua funcionando normalmente.

## Verificação técnica

```bash
cd frontend && npx tsc --noEmit
```

Confirma que a assinatura nova de `listWaypoints(linkedOnly?, slug?)` não quebra nenhum call site existente (mudança aditiva).

## Esperado

- Console do navegador sem `Uncaught Error: CAMPAIGN_SLUG_REQUIRED` em nenhum dos cenários A–C.
- Rede de rotas do Mapa populada já na primeira renderização, sem precisar de refresh.
