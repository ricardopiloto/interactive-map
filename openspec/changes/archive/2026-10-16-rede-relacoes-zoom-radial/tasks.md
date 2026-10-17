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

- [x] 4.1 Validar manualmente (ou com um teste de render usando um fixture com contagem real) contra a campanha com mais Personagens/Vínculos disponível numa cópia de dados reais de produção (ex. a usada para o ensaio da task 6.2 de `local-waypoint-vinculo-automatico`, se ainda disponível) — confirmar que a tela carrega, "Ajustar à tela" mostra o grafo inteiro de forma legível, e é possível navegar (zoom + pan) até qualquer Personagem sem travar ou ficar imperceptível.

## 5. Regressão

- [x] 5.1 Rodar `npm run lint`, `npx tsc --noEmit`, `npm run test` e `npx playwright test` completos em `frontend-v2/`; confirmar que `e2e/relacoes.spec.ts` (fluxo de criar vínculo de duas vias, visibilidade pro jogador) continua passando sem modificação de asserção — essa change não deveria quebrar nenhum comportamento de vínculo/visibilidade, só layout e navegação do grafo.
  - Validação do coordenador (revisão de arquitetura, 2026-10-17): lint 0 erros (17 warnings pré-existentes não relacionados), `tsc --noEmit` limpo, `npm run test` 78/78, e2e completo **32/32** (confirmado só depois de corrigir uma regressão não relacionada a esta change — ver nota abaixo). `e2e/relacoes.spec.ts` passa sem modificação.
  - **Nota**: durante esta verificação, a suíte e2e completa revelou uma regressão real em `Shell.tsx` (a aba "Itens", de `itens-publicos`, tinha sumido do array `lenses` — import do ícone, entrada e chave de label todos ausentes, embora a rota e a página continuassem intactas). Não era causada por esta change; corrigida separadamente pelo cursor-agent e revalidada (32/32 e2e) antes de marcar esta task.

## 6. Zoom gradual da roda

- [x] 6.1 Reproduzir o salto atual com eventos de roda representativos e verificar como a versão instalada de `react-zoom-pan-pinch` interpreta `wheel.step` e `deltaY`; ajustar o controle para que cada incremento usual mude a escala em no máximo 15%, com vários níveis úteis entre enquadramento geral e ampliação, preservando zoom no ponteiro e limites.
- [x] 6.2 Cobrir a progressão do zoom com teste de interação que compara escalas após incrementos sucessivos, incluindo roda de delta grande e afastamento; conferir pinça e botões existentes.

## 7. Foco radial na seleção

- [x] 7.1 Adicionar layout determinístico para seleção em `graphLayout.ts`: nó selecionado no centro, vizinhos diretos únicos no anel interno, demais ids visíveis no anel externo; calcular raios e `GraphFrame` sem sobreposição, inclusive grupos vazios e elenco grande. Cobrir no teste unitário casos com zero, um e muitos vizinhos, ids em ordem diferente e vínculos múltiplos.
- [x] 7.2 Em `RelationsGraph.tsx`, usar os vínculos disponíveis já filtrados por tipo para descobrir vizinhos diretos, sem diferenciar direção ou PJ/NPC; manter `layoutRadialByTipo` quando não houver seleção. Recalcular ao mudar seleção, filtros, elenco ou vínculos, e preservar o arrasto manual de sessão.
- [x] 7.3 Centralizar o nó selecionado na área visível do grafo após a mudança de layout, com escala legível e sem ser sobrescrito pelo `fitToView` geral; ao limpar a seleção, voltar ao enquadramento geral. Cobrir seleção por clique e URL, troca de personagem, filtros, seleção removida e nó isolado, com teste de interação e verificação visual em desktop e mobile.

## 8. Validação da atualização

- [x] 8.1 Validar a seleção e o zoom com elenco de produção ou fixture de tamanho equivalente; verificar ausência de sobreposição, centralização apesar do painel lateral, desempenho e navegação em ambos os anéis. Executar os testes e verificações pertinentes do `frontend-v2/` após a implementação.

## Workflow follow-up

- Arquivar esta change (`/openspec-archive-change`) depois que as tasks acima estiverem concluídas.
