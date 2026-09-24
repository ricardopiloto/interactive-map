# Quickstart: Filtro de tipo de vínculo no painel de detalhe (133)

## Pré-requisitos

```bash
cd frontend && npm run dev
```

Uma campanha com um personagem que tenha vínculos de pelo menos dois tipos diferentes (ex.: um Aliado e um Inimizade).

## Cenário A — Filtro começa mostrando tudo

1. Ir em `/c/:slug/relacoes` e selecionar esse personagem.
2. Esperado: todos os vínculos dele aparecem, nenhum tipo pré-filtrado.

## Cenário B — Filtrar por um tipo

1. No painel de detalhe, ativar o filtro só pra um tipo (ex. "Inimizade").
2. Esperado: só os vínculos desse tipo aparecem; a contagem (`vinculosCount`) reflete só os visíveis.
3. Limpar o filtro (ou marcar "todos" de novo).
4. Esperado: a lista volta a mostrar todos os vínculos.

## Cenário C — Independente do filtro do grafo geral

1. No grafo geral (fora do painel de detalhe), filtrar só por um tipo (ex. só "Romance", usando os chips já existentes).
2. Selecionar um personagem que tenha vínculos de outros tipos também.
3. Esperado: o painel de detalhe mostra **todos** os vínculos dele, ignorando o filtro do grafo geral.

## Cenário D — Reseta ao trocar de personagem

1. Com o painel de detalhe de uma pessoa filtrado por um tipo, clicar em outra pessoa (via um vínculo listado, ou selecionando outro nó no grafo).
2. Esperado: o painel do novo personagem mostra todos os vínculos dele, sem herdar o filtro da pessoa anterior.

## Cenário E — Duas vias com tipos diferentes

1. Encontrar (ou criar) um vínculo duas-vias onde os dois sentidos têm tipos diferentes (ex. Amizade de um lado, Romance do outro).
2. Filtrar o painel de detalhe só por um dos dois tipos.
3. Esperado: a linha desse vínculo aparece (porque pelo menos um dos sentidos bate com o filtro).

## Verificação técnica

```bash
cd frontend && npx tsc --noEmit
```

## Esperado

- Filtro do grafo geral e filtro do painel de detalhe nunca se influenciam, em nenhuma direção.
- Nenhuma persistência entre sessões/visitas.
