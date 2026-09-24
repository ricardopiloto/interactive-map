# Quickstart: Relações e Rota reconstrução (116)

## Prerequisites

- Specs **114** (chrome) and **115** (MapSidePanel + mapa) implementados no branch.
- Backend + frontend locais; campanha `wfrp` com personagens/vínculos e rede de waypoints.
- Referência: `frontend-next` RelacoesPage / RotaPage / MapSidePanel.

## Relações — desktop

1. Abrir `/c/wfrp/relacoes` (≥ 900px), tema claro e escuro.
2. Confirmar **painel flutuante** (mesma forma/posição que o Mapa) — **não** coluna flush à esquerda.
3. Confirmar **ausência** de painel de detalhe separado.
4. Busca + chips de família/tipo filtram lista/arestas.
5. Clicar personagem na lista **e** no grafo → detalhe **no mesmo** painel; «Voltar» → lista.
6. Com selecção: foco no centro do grafo, directos internos, resto esmaecido.
7. Captura vs. protótipo e vs. painel do Mapa (SC-001).

## Relações — mobile

1. Viewport ≤ 860px.
2. Folha recolhida; focar busca ou seleccionar → expande (paridade Mapa).
3. Detalhe + voltar na folha.

## Relações — edição

1. Sem Edit Mode: sem FAB/menu de criar.
2. Com Edit Mode: criar personagem / vínculo pelos drawers existentes; editar/excluir no detalhe.

## Rota — desktop

1. Abrir `/c/wfrp/rota`.
2. Mapa full-bleed + painel flutuante com formulário no head.
3. Escolher origem/destino distintos → Calcular.
4. Cartões mostram tempo (dias+h), distância, timeline de pernoites quando houver.
5. Clicar cada cartão → caminho destacado no mapa com **acento** da campanha.
6. Origem = destino → hint; zero rotas → empty i18n.
7. Captura vs. protótipo RotaPage (SC-001/004).

## Rota — mobile

1. Folha inferior com mesmo padrão de expand/collapse que Mapa/Relações.
2. Cartões utilizáveis; destaque no mapa visível atrás/acima da folha.

## Regressões a evitar

1. Não reaparecer `RelacoesSideColumn` / `RelacoesDetailPanel`.
2. Não regressar o cálculo de rota (mesmos resultados sensatos que antes para o mesmo input).
3. Não deixar o planejador antigo no Mapa como UX canónica.

## i18n

Alternar pt-BR ↔ en: voltar, empty states, calcular, hints.
