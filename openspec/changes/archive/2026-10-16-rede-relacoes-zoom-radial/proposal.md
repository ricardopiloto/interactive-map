# Proposal

## Atualização: zoom gradual e foco por vínculos

A implementação parcial desta change já introduziu `react-zoom-pan-pinch` e o layout PJ/NPC. Na navegação atual, porém, a roda do mouse ainda produz apenas dois saltos grandes perceptíveis e selecionar um Personagem apenas destaca seus vínculos, sem reorganizar o grafo. Esta atualização inclui:

- Ajustar a resposta da roda para permitir vários incrementos pequenos e previsíveis entre o enquadramento geral e a ampliação dos nós, preservando pan, pinça e os controles existentes.
- Ao selecionar um Personagem, colocá-lo no centro do layout, distribuir seus vizinhos diretos em um anel interno e todos os demais Personagens visíveis em um anel externo, independentemente de serem PJ ou NPC.
- Centralizar o foco também na viewport. Ao remover a seleção, voltar ao layout padrão por tipo (PJ interno, NPC externo).

A mudança é somente de apresentação; vínculos e posições não são persistidos. Os vínculos considerados são os que a tela pode mostrar ao usuário e que passam pelo filtro de tipo ativo. O filtro de status continua definindo quais Personagens entram no grafo.

## Why

Testando `frontend-v2/` contra uma cópia real dos dados de produção (não fixtures de teste), a tela de Rede de Relações (`frontend-v2/src/routes/relacoes.tsx` + `frontend-v2/src/components/codex/RelationsGraph.tsx`) ficou inutilizável: o volume real de Personagens e Vínculos de uma campanha de anos de jogo é muito maior que qualquer elenco de teste, e hoje:

- O layout (`frontend-v2/src/lib/graphLayout.ts`, `layoutRing`) coloca **todos** os Personagens — PJ e NPC misturados — num único anel, ordenado só por `id`, cujo raio cresce sem limite conforme o elenco cresce. Não há nenhuma hierarquia visual entre PJ e NPC.
- O "zoom" hoje é só um multiplicador de 0.4×–2× aplicado à largura/altura CSS do `<svg>` (`RelationsGraph.tsx`), com o `viewBox` fixo no tamanho natural do grafo — não é uma transformação real, e "Ajustar à tela" só reseta pra escala 1, sem calcular o bounding box do conteúdo.
- "Pan" hoje é só a rolagem nativa do navegador num `<div overflow-auto>` — sem arrastar, sem pinça, sem roda do mouse.

Com um elenco grande, o anel único fica maior que qualquer viewport possível de alcançar com esses controles, tornando a tela, na prática, ilegível e não-navegável.

**Achado relevante**: o `frontend/` legado (pré-`frontend-v2`) já resolveu exatamente isso uma vez — `frontend/src/components/relacoes/graphLayout.ts` (`computeInitialLayout(pjIds, npcIds, center, spacing)`, PJ num anel interno e NPC num anel externo) e `frontend/src/components/relacoes/GraphStage.tsx` (zoom por roda do mouse, arrastar pra pan, pinça em touch, `fitScalePan` calculando escala real a partir do bounding box do conteúdo). `openspec/changes/frontend-v2-paper-parchment/design.md` (Decision 9) decidiu deliberadamente não portar a **implementação visual** desse código legado na reescrita — mas a **capacidade** (hierarquia PJ/NPC, zoom/pan de verdade) acabou se perdendo no processo e nunca foi reconstruída em `frontend-v2/`. Esta proposta reconstrói essa capacidade, adaptada ao sistema visual novo.

## What Changes

- **Zoom e pan reais**: adotar `react-zoom-pan-pinch` (já é dependência do projeto, já usado de forma idêntica em `frontend-v2/src/components/codex/WorldMap.tsx` pro Mapa) no lugar do multiplicador de CSS atual — roda do mouse, arrastar, pinça em touch, e um "Ajustar à tela" que calcula de verdade a escala a partir do bounding box do grafo (como o `fitScalePan` do legado), não um reset fixo pra escala 1.
- **Layout radial PJ-centro / NPC-redor**: estender `frontend-v2/src/lib/graphLayout.ts` pra posicionar Personagens com `tipo === "pj"` num anel interno, centralizado, e `tipo === "npc"` num anel externo ao redor — mesma ideia do `computeInitialLayout` legado, recalculada pro sistema de coordenadas e constantes visuais atuais (`NODE_BOX`/`NODE_GAP`/`ringRadius` já existentes). Um elenco sem nenhum PJ (ou sem nenhum NPC) degrada graciosamente pra um único anel, sem quebrar.
- **Sem biblioteca de física/simulação de grafo**: mantém a decisão arquitetural já registrada em `frontend-v2-paper-parchment/design.md` (Decision 5) — o layout continua sendo cálculo geométrico determinístico em TypeScript puro, sem `d3-force`/`cytoscape`/etc. `react-zoom-pan-pinch` é uma camada de interação (pan/zoom da viewport), não uma biblioteca de layout/física — não contradiz essa decisão.
- **Arrastar um nó continua funcionando como hoje** (reposicionamento manual de sessão, não persistido), agora coexistindo com o pan da viewport via `react-zoom-pan-pinch` (que já resolve esse mesmo tipo de conflito gesto-a-gesto no Mapa, com `WorldMap.tsx` tendo pins arrastáveis dentro de um `TransformWrapper`).

## Capabilities

### New Capabilities
- `rede-relacoes`: cobre o comportamento de zoom, pan e layout da tela de Rede de Relações em `frontend-v2/` — não existia nenhuma capability registrada pra essa tela antes desta proposta.

### Modified Capabilities
(nenhuma — a Requirement já existente "Rede de Relações usa os tipos reais de vínculo" em `frontend-v2-paper-parchment/specs/frontend-v2/spec.md` não muda; esta proposta não altera os 8 tipos de vínculo nem sua direção/qualificador por lado, só layout e navegação do grafo.)

## Impact

- **Frontend (`frontend-v2/`)**: `src/lib/graphLayout.ts` (nova função de layout em dois anéis), `src/components/codex/RelationsGraph.tsx` (troca o zoom/pan manual por `react-zoom-pan-pinch`, recalcula "Ajustar à tela"), possivelmente `src/routes/relacoes.tsx` se os controles de zoom precisarem mudar de lugar.
- **Backend**: nenhuma mudança — nenhum campo novo persistido, a posição continua calculada em tempo de render como já é hoje.
- **Dados/migração**: nenhuma.
- **`frontend-v2-paper-parchment`**: nenhuma edição nessa change; mantém a Decision 5 (sem lib de física) e a Requirement de tipos de vínculo intactas.
