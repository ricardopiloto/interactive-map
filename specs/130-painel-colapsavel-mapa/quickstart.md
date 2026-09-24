# Quickstart: MapSidePanel colapsável no desktop (130)

## Pré-requisitos

```bash
cd frontend && npm run dev
```

Viewport desktop (≥ 861px).

## Cenário A — Nasce colapsado (US1)

1. Abrir `/c/:slug` (Mapa), sem clicar em nada.
2. Esperado: painel pequeno, só a busca visível.
3. Repetir em `/c/:slug/relacoes` e `/c/:slug/rota`.
4. Esperado nos três: painel colapsado — inclusive Rota, que hoje nasce expandida (mudança deliberada, FR-006).

## Cenário B — Expande ao focar busca (US2)

1. Com o painel colapsado no Mapa, clicar no campo de busca.
2. Esperado: painel expande mostrando a lista.
3. Repetir em Relações.
4. Em Rota: focar um dos campos do formulário De/Para — mesmo resultado esperado.

## Cenário C — Expande ao selecionar, sem tocar na busca (US2)

1. Painel colapsado, clicar direto num pino do mapa (sem focar a busca antes).
2. Esperado: painel expande mostrando o detalhe do Local.
3. Repetir selecionando um nó no grafo de Relações.
4. Em Rota: escolher uma opção de rota calculada — mesmo resultado.

## Cenário D — Volta a colapsar quando a ação termina (US2, FR-004)

1. Focar a busca, não selecionar nada, clicar fora.
2. Esperado: painel volta a colapsar.
3. Selecionar um pino (painel expande), depois limpar a seleção (deselecionar).
4. Esperado: painel volta a colapsar.
5. Selecionar um pino, depois clicar fora da busca (sem deselecionar) — esperado: painel continua expandido (a seleção ainda está ativa).

## Cenário E — Mobile sem regressão (FR-005)

1. Viewport < 861px.
2. Confirmar que a folha inferior "peek"/expandida e o grabber manual continuam exatamente como antes desta feature.

## Cenário F — Sem persistência (FR-007)

1. Expandir o painel (qualquer forma), recarregar a página.
2. Esperado: painel nasce colapsado de novo — nada foi lembrado da visita anterior.

## Automatizado

```bash
cd frontend && npx tsc --noEmit
```
