# Tasks

## 1. Layout radial — PJ interno, NPC externo

- [x] 1.1 Adicionar `layoutRadialByTipo(personagens: { id: number; tipo: "pj" | "npc" }[], box = NODE_BOX, gap = NODE_GAP): GraphFrame` em `frontend-v2/src/lib/graphLayout.ts`, reaproveitando `ringRadius`/`minCenterDistance` já existentes: raio do anel interno a partir da contagem de PJ; raio do anel externo como o maior entre o raio calculado isoladamente pra contagem de NPC e (raio interno + `minCenterDistance(box, gap)`); quando não houver PJ ou não houver NPC, delegar pra `layoutRing` normal sobre o grupo existente. Manter a mesma ordenação determinística por id dentro de cada anel (igual a `layoutRing`). Verificar com testes unitários em `graphLayout.test.ts`: (a) elenco misto pequeno (2 PJ, 3 NPC) — todos os PJ mais perto do centro que todos os NPC; (b) só PJ — degrada pra um anel só, sem erro; (c) só NPC — degrada pra um anel só, sem erro; (d) elenco grande (ex. 5 PJ + 40 NPC, perto da escala real de produção) — nenhuma caixa se sobrepõe, nem entre PJs, nem entre NPCs, nem entre os dois anéis; (e) mesma entrada duas vezes → mesmos pontos (determinístico).
- [x] 1.2 Em `RelationsGraph.tsx`, trocar a chamada de `layoutRing(personagens.map(p => p.id), box)` por `layoutRadialByTipo(personagens.map(p => ({ id: p.id, tipo: p.tipo })), box)`; verificar visualmente (ou via teste de render) que PJs (que já têm o anel de destaque `var(--seal)` ao redor) ficam mais perto do centro do grafo que os NPCs.

## 2. Zoom e pan reais via `react-zoom-pan-pinch`

- [x] 2.1 Envolver o `<svg>` do grafo em `RelationsGraph.tsx` com `TransformWrapper`/`TransformComponent` de `react-zoom-pan-pinch`, no mesmo padrão já usado em `frontend-v2/src/components/codex/WorldMap.tsx` (`minScale`/`maxScale` ajustados pro grafo, `wheel`, `pinch`, `onTransform` guardando a escala atual); remover o `scale` state antigo e a multiplicação de `width`/`height` do `<svg>` por `scale` — o `<svg>` volta a ter tamanho fixo igual ao `viewBox`, quem escala é o `TransformComponent`. Verificar manualmente (ou com teste de render) que a roda do mouse e o arrastar da área vazia mudam a escala/posição.
- [x] 2.2 Trocar os botões de zoom in/out (`graph.zoomIn`/`graph.zoomOut`) pra usar `useControls()` da lib (`zoomIn()`/`zoomOut()`) em vez do `setScale` manual antigo; trocar "Ajustar à tela" (`graph.fitView`) pra chamar `ref.fitToView({ mode: "contain", animationTime })` (não `"cover"`, pra não cortar nenhum nó) em vez de `setScale(1)`. Verificar que "Ajustar à tela" com um grafo maior que o viewport realmente muda a escala (não só reseta pra 1).
- [x] 2.3 Atualizar `pixelsPerGraphUnit`/a conversão de pixel-de-tela-pra-unidade-do-grafo usada por `beginGrab` pra ler a escala atual vinda do `onTransform` do `TransformWrapper` (substituindo a leitura do `scale` state removido na task 2.1); verificar com um teste que arrastar um nó em escalas diferentes (ex. depois de um zoom in) continua movendo o nó pela distância correta em unidades do grafo.

## 3. Coexistência entre arrastar nó e pan da viewport (maior risco técnico desta change)

- [x] 3.1 Confirmar que `event.stopPropagation()` já existente em `beginGrab` (no `pointerdown` do nó) é suficiente pra impedir que `react-zoom-pan-pinch` inicie um pan simultâneo ao arrastar um nó; escrever um teste explícito (não só reexecutar o já existente) que simula um `pointerdown`+`pointermove` num nó específico e confirma que (a) só aquele nó mudou de posição e (b) a escala/posição da viewport (lida via `onTransform`) não mudou. Se o teste mostrar que `stopPropagation()` sozinho não basta nesta versão da lib, implementar o plano B do `design.md` (Decision 2): desabilitar `panning.disabled` do `TransformWrapper` enquanto `grabbedId` não for `null`, reabilitando ao soltar.
- [x] 3.2 Reexecutar o teste já existente "dragging a node moves only that node" (`RelationsGraph.test.tsx`) e confirmar que continua passando sem modificação de expectativa, só adaptado ao novo mecanismo de zoom se o teste tocar `scale` diretamente.

## 4. Validação com dados reais de produção

- [ ] 4.1 Validar manualmente (ou com um teste de render usando um fixture com contagem real) contra a campanha com mais Personagens/Vínculos disponível numa cópia de dados reais de produção (ex. a usada para o ensaio da task 6.2 de `local-waypoint-vinculo-automatico`, se ainda disponível) — confirmar que a tela carrega, "Ajustar à tela" mostra o grafo inteiro de forma legível, e é possível navegar (zoom + pan) até qualquer Personagem sem travar ou ficar imperceptível.

## 5. Regressão

- [ ] 5.1 Rodar `npm run lint`, `npx tsc --noEmit`, `npm run test` e `npx playwright test` completos em `frontend-v2/`; confirmar que `e2e/relacoes.spec.ts` (fluxo de criar vínculo de duas vias, visibilidade pro jogador) continua passando sem modificação de asserção — essa change não deveria quebrar nenhum comportamento de vínculo/visibilidade, só layout e navegação do grafo.

## Workflow follow-up

- Arquivar esta change (`/openspec-archive-change`) depois que as tasks acima estiverem concluídas.
