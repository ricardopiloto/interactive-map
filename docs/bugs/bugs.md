# Bugs — Campaign Codex

Este documento registra defeitos observados no produto, separados do [backlog de melhorias e funcionalidades](../backlog/backlog.md). Os bugs migrados do backlog mantêm seus IDs `BKLG-NNN` para preservar referências existentes em specs e documentos; novos registros usam `BUG-NNN`.

---

## [BKLG-017] Bug/Design — Lista de personagens do Mapa deve ser igual à de Relações

**Status:** Descartado — não será feito.

**Registrado em:** 2026-09-23.

**Pedido:** os personagens que aparecem em Relações devem ser os mesmos que aparecem no Mapa — a lista deve ser exatamente a mesma.

**Achado — a causa é um filtro no frontend, o backend já trata os dois iguais.** As duas telas usam endpoints diferentes, mas ambos leem a **mesma tabela**, sem filtro de `tipo` nenhum no servidor:
- [`backend/app/routers/public/npcs.py:38-44`](../../backend/app/routers/public/npcs.py) (`GET /npcs`, usado pelo Mapa) — `select(NPC).order_by(...)`, sem filtrar por `tipo`.
- [`backend/app/routers/admin/personagens.py:16-18`](../../backend/app/routers/admin/personagens.py) (`GET /personagens`, usado por Relações) — `select(NPC).order_by(...)`, mesma tabela, mesma ausência de filtro.
- Confirma que são o mesmo dado: `Personagem = Required<Pick<NPC, 'tipo'>> & NPC` ([`frontend/src/types/index.ts`](../../frontend/src/types/index.ts)) — `Personagem` é literalmente o mesmo formato de `NPC`, só com `tipo` obrigatório.

**O filtro que causa a diferença é só no frontend, um `.filter()` em [`useCampaignData.ts`](../../frontend/src/hooks/useCampaignData.ts):**
```
setNpcs(npcsData.filter((n) => (n.tipo ?? 'npc') === 'npc'))
```
Esse hook alimenta tanto `MapPage.tsx` quanto `RotaPage.tsx` — as duas telas **excluem PJs** da lista de personagens, só mostram quem tem `tipo === 'npc'`. `RelacoesPage.tsx` não tem esse filtro — busca `personagens` direto (PJ + NPC juntos, "Personagens unificados" conforme o próprio README do projeto).

**Correção parece pequena, mas tem uma pergunta de design em aberto antes de aplicar:** remover o `.filter()` faz a lista do painel do Mapa (aba "NPCs") passar a incluir PJs, igual a Relações — isso resolve literalmente "a lista deve ser a mesma". Mas o Mapa também usa essa lista pra desenhar vínculo local↔personagem (`local.npc_ids.includes(n.id)`, em `MapPage.tsx`) — vale confirmar se PJs devem aparecer nessa mesma lógica de "personagem ligado a um Local" (ex.: um PJ pode estar "em" um Local do mesmo jeito que um NPC?), ou se a lista deve ficar igual só na aba de busca/listagem, sem entrar na lógica de vínculo com pino.

**Decisão:** descartado; não seguirá para spec. Se a necessidade voltar, será preciso confirmar primeiro se PJs devem participar dos vínculos a Locais.

---

## [BKLG-019] Bug — Sair de Explorar direto pra uma campanha "trava" a tela (CAMPAIGN_SLUG_REQUIRED)

**Status:** Implementado — [131-corrida-slug-campanha](../../specs/131-corrida-slug-campanha/spec.md) (5/5 tarefas). `campaignApi.listWaypoints` e o helper `p()` de `campaign.ts` ganharam `slug?` opcional (aditivo); `MapPage.tsx` passa o `slug` de `useParams()` explícito em vez de depender só do estado de módulo. `ErrorBoundary` (endurecimento mais amplo) ficou fora, de propósito.

**Registrado em:** 2026-09-24, reportado em produção (`campaign-codex.1nodado.com.br`) com o console mostrando `Uncaught Error: CAMPAIGN_SLUG_REQUIRED`, stack passando por `listWaypoints`.

**Causa raiz confirmada — condição de corrida entre efeitos, não é aleatório nem só em Explorar:**
- [`campaignSlug.ts`](../../frontend/src/api/campaignSlug.ts) guarda o slug ativo numa variável de módulo (`activeSlug`), lida por qualquer chamada de API via `requireCampaignSlug()` — que **lança** `CAMPAIGN_SLUG_REQUIRED` se `activeSlug` ainda for `null`.
- Quem escreve nessa variável é `CampaignShell` ([`App.tsx:34-37`](../../frontend/src/App.tsx)), num `useEffect(() => setCampaignSlug(slug), [slug])` — e `CampaignShell` é o componente **pai** que envolve `MapPage`/`RotaPage`/etc.
- `MapPage.tsx` (o filho) tem seu próprio `useEffect` que já dispara `campaignApi.listWaypoints(false)` no mount ([`MapPage.tsx:167-169`](../../frontend/src/pages/MapPage.tsx)).
- React executa efeitos de **filho antes do pai** no mesmo commit. Numa navegação nova pra dentro de uma campanha — `CampaignShell` e `MapPage` montando juntos pela primeira vez (vindo de `/explorar`, `/painel`, ou um link direto) — o efeito do `MapPage` roda **antes** do `CampaignShell` ter chamado `setCampaignSlug`, então `activeSlug` ainda é `null` e `listWaypoints()` lança síncrono, sem `try/catch` em volta.
- **Por que não acontece navegando dentro da mesma campanha** (Mapa → Relações, por exemplo): `CampaignShell` continua montado entre essas trocas, `activeSlug` já está setado de antes — sem corrida.
- **Por que "trava" a tela, não só um erro no console:** o erro é lançado de forma síncrona dentro do corpo do `useEffect`, e a aplicação não tem nenhum `ErrorBoundary` no nível de rota (confirmei — nenhuma ocorrência de `ErrorBoundary` no frontend) pra conter isso; sem um limite de erro, React pode desmontar a árvore inteira, deixando a tela em branco/travada em vez de só logar o erro.

**Ideias de correção (não é decisão, o bug é simples o bastante pra não precisar de TR):**
- Mais direta: `MapPage.tsx` já tem `slug` disponível via `useParams()` — passar esse valor explícito pra `campaignApi.listWaypoints`, em vez de depender da variável de módulo só pra essa chamada. **Correção ao planejar (spec 131):** `campaignApiPrefix(slug?)` já aceita o parâmetro, mas `listWaypoints`/o helper interno `p()` em `campaign.ts` ainda não o repassam — a correção precisa encadear isso em três pontos pequenos, não um só. Ver [`specs/131-corrida-slug-campanha/contracts/list-waypoints.md`](../../specs/131-corrida-slug-campanha/contracts/list-waypoints.md).
- Mais ampla (harden, item separado): adicionar um `ErrorBoundary` no nível de `CampaignShell`/rotas de campanha, pra qualquer erro futuro parecido virar uma tela de erro em vez de travar a aplicação inteira sem aviso nenhum ao usuário.

---

## [BKLG-021] Bug/Design — Home (marketing) manda usuário já logado pro login de novo

**Status:** Implementado — [132-home-cta-autenticado](../../specs/132-home-cta-autenticado/spec.md). `HomePage.tsx` agora checa `authApi.me()` no mount; os dois CTAs ("Entrar como mestre" e "Criar meu primeiro codex") apontam direto para `/painel`/`/painel#criar` quando autenticado, sem passar pelo `/login`.

**Registrado em:** 2026-09-24.

**Pedido:** se o usuário já está logado, clicar em "Entrar como mestre" deve levar direto ao painel; o mesmo pra "Criar meu primeiro codex".

**Confirmado no código — os dois CTAs da Home nunca checam se o usuário já está autenticado:**
- "Entrar como mestre" (`landing.ctaMaster`) — [`HomePage.tsx:56-63`](../../frontend/src/pages/HomePage.tsx#L56-L63) — sempre `to="/login?next=/painel"`, sempre abre o modal de login.
- "Criar meu primeiro codex" (`landing.ctaFinal`) — [`HomePage.tsx:177-183`](../../frontend/src/pages/HomePage.tsx#L177-L183) — sempre `to="/login?next=/painel%23criar"`, mesmo comportamento.
- `HomePage.tsx` nunca chama `authApi.me()` — não existe verificação de sessão na página inteira, então os dois links são "só login", incondicionais, mesmo pra quem já está autenticado.

**Ideia:** `HomePage` passa a checar `authApi.me()` (mesmo padrão já usado em `UserMenu.tsx`/`NovoCodexPage.tsx`); se autenticado, os dois `<Link>` apontam direto pra `/painel` e `/painel#criar` respectivamente, sem passar pelo `/login`; se não autenticado, comportamento atual (abre o modal de login) continua igual.

**Baixo risco, sem TR necessário** — é uma checagem condicional sobre um estado que a própria página já teria que buscar; não muda schema, não muda contrato de API, reaproveita o padrão de guarda já usado em outras páginas.

---

## [BKLG-023] Bug/Design — Filtro do painel de detalhe (Relações) não tem paridade de clique com o filtro do grafo geral

**Status:** Implementado — [134-paridade-clique-filtro-detalhe](../../specs/134-paridade-clique-filtro-detalhe/spec.md). **Achado ao investigar (2026-09-24):** a paridade de clique já existia entre os dois filtros (ambos usando `useVinculoTipoChipClicks`) — o problema real, reproduzido ao vivo, era a semântica: clicar num tipo *removia* esse tipo de um conjunto "todos ativos" (podendo até esvaziar a lista inteira), em vez de isolar/mostrar só ele. Corrigido pra um filtro aditivo com conjunto vazio = "mostra tudo": clique isola/soma tipos, duplo-clique pula direto pra "só esse tipo". Ver detalhes na spec.

**Registrado em:** 2026-09-24.

**Pedido:** o comportamento de single click e double click nos chips de filtro quando um personagem está selecionado (painel de detalhe, spec 133) tem que ser o mesmo de quando nenhum personagem está selecionado (filtro do grafo geral). Corrigido ao vivo em 2026-09-24: o usuário esclareceu que o problema não era falta de paridade, e sim que selecionar um filtro não restringia a lista aos tipos escolhidos.

---

## [BKLG-026] Bug/Design — Exibição da imagem do personagem no painel de detalhe (Relações) desproporcional

**Status:** Implementado — [137-imagem-retrato-painel-detalhe](../../specs/137-imagem-retrato-painel-detalhe/spec.md) (12/12 tarefas concluídas). `ImageSlot.css` aplica proporção e limite de altura no retrato do painel, removendo a moldura de placeholder do estado com imagem.

**Registrado em:** 2026-09-24.

**Pedido:** ajustar a exibição da imagem/retrato do personagem no painel de detalhe (print anexado mostra a imagem "espremida" no centro, com a moldura tracejada de placeholder visível nas laterais).

**Diagnóstico original:** `.relacoes-page__detail-portrait` definia apenas `max-height: 140px`, deixando visível a moldura tracejada do `ImageSlot` quando a imagem não preenchia o container. Os formulários de NPC/Local já tinham o padrão de largura proporcional e `object-fit: contain` que serviu de referência.

**Correção entregue:** `ImageSlot.css` agora aplica largura proporcional, altura automática, limite de 140px e remove a borda/fundo de placeholder no retrato com imagem; o estilo incompleto da página foi removido. A implementação está descrita em [spec 137](../../specs/137-imagem-retrato-painel-detalhe/spec.md), com 12/12 tarefas concluídas.

---

## [BKLG-028] Bug/Design — Botão "1:1" no grafo de Relações não ajusta a tela pra mostrar todos os tokens

**Status:** Implementado — [139-zoom-fit-grafo-relacoes](../../specs/139-zoom-fit-grafo-relacoes/spec.md). O comportamento de fit-to-view (`fitView()`) já estava implementado; o rótulo do botão tinha sido trocado pra "Ajustar"/"Fit" (pt-BR/en) — corrigido de volta pra "1:1" (texto do botão não muda, só o efeito do clique).

**Registrado em:** 2026-09-24.

**Pedido:** a função "1:1" no mapa de relações deveria ajustar a tela para que todos os tokens fiquem visíveis (fit-to-view), não resetar pro zoom literal 1:1. Corrigido em 2026-09-24: o rótulo do botão continua "1:1", só o comportamento muda.

**Confirmado no código:** `resetView()` ([`GraphStage.tsx:379-382`](../../frontend/src/components/relacoes/GraphStage.tsx#L379-L382)), acionado pelo botão "1:1" (`:748-750`), hoje só faz `setScale(1)` + `setPan({ x: 0, y: 0 })` — um reset fixo, sem olhar pra quantos/quais tokens estão visíveis nem calcular se cabem na tela.

**Ideia:** `resetView` passa a calcular o bounding box das posições (`positions`) de todos os personagens visíveis (considerando `NODE_W`/`NODE_H`) e ajustar `scale` (respeitando `MIN_SCALE`/`MAX_SCALE`, `:41-42`) + `pan` pra centralizar e caber tudo dentro do container (`containerRef`) — um "ajustar à tela" de verdade, no lugar do reset de zoom literal.

**Baixo/médio risco, sem TR necessário** — é cálculo geométrico local (bounding box + escala), sem mudança de schema/contrato; a complexidade é achar as dimensões atuais do container de forma confiável.

---

## [BKLG-031] Bug — Controles de zoom (+/−/1:1) do grafo de Relações não respondiam a clique real

**Status:** Implementado (2026-09-24). Encontrado ao investigar o relato do usuário de que os botões +/− "não estão funcionando" (ver spec 139).

**Registrado em:** 2026-09-24.

**Confirmado ao vivo (ambiente de dev, `localhost:5173`):** dois problemas empilhados, ambos em `frontend/src/components/relacoes/GraphStage.tsx`/`.css`:
1. `.graph-stage__zoom` (o grupo dos botões +/−/1:1) tinha `z-index: 4`, enquanto `.map-panel` (o painel colapsável de busca/filtro, BKLG-004) tem `z-index: 25` e, medido via `getBoundingClientRect()`, seu retângulo cobre inteiramente a área dos botões de zoom mesmo no estado colapsado em telas estreitas — os botões ficavam fisicamente atrás do painel, inalcançáveis ao clique.
2. Mesmo depois de corrigir o `z-index`, um clique real (mouse down→up, não um `.click()` sintético via JS) ainda não disparava o zoom: `.graph-stage` (o container do grafo) chama `e.currentTarget.setPointerCapture(...)` em **todo** `pointerdown`, inclusive quando a origem é um dos botões de zoom (o evento borbulha do botão pro container) — isso redireciona o `pointerup`/clique resultante pro container em vez do botão, silenciosamente engolindo o clique.

**Corrigido:**
- `GraphStage.css`: `.graph-stage__zoom` passou de `z-index: 4` pra `z-index: 26` (acima do painel).
- `GraphStage.tsx`: `.graph-stage__zoom` ganhou `onPointerDown={(e) => e.stopPropagation()}`, impedindo o `pointerdown` de chegar no handler do container e capturar o ponteiro.
- Verificado ao vivo: clique real (via automação de mouse, não JS) nos três botões (+, −, 1:1) agora funciona — `scale` mudou de `1` → `1.2` → `1.44` nos testes de +, e "1:1" (spec 139) ajustou a tela mostrando todos os personagens.

**Baixo risco** — correção isolada de CSS/propagação de evento, sem mudança de contrato ou schema.

---

## [BKLG-032] Bug — Filtros de vínculo em Relações devem manter paridade entre SidePanel e Grafo

**Status:** Implementado — [142-filtros-relacoes](../../specs/142-filtros-relacoes/spec.md) (6/6 tarefas). Estado `activeTipos` unificado: `PersonagemDetailBody` deixou de ter o `activeDetailTipos` independente e passou a receber `activeTipos`/`onTipoClick`/`onTipoDoubleClick` como props do `RelacoesPage`, usando o mesmo `edgeMatchesTipos` do Grafo. Conjunto vazio = sem filtro (mostra tudo); clique soma/remove tipos; duplo-clique isola um tipo só, restaurando o conjunto vazio se já isolado nele. Status, busca e isolamento continuam compondo com o filtro de tipo sem regressão.

**Registrado em:** 2026-09-24.

**Pedido:** comparar tecnicamente os filtros de Relações desta branch com `main` e corrigir a implementação funcional para que os filtros e a exibição tenham o comportamento de `main`. Os filtros devem afetar tanto o SidePanel quanto o Grafo; não é um pedido de mudança visual.

**Comparação técnica:** em `main`, o estado `activeTipos` é mantido pela página, os chips de tipo ficam na `RelacoesSideColumn` e o mesmo estado é passado ao `GraphStage`, onde filtra os vínculos desenhados. O filtro de status também é mantido na página e restringe `visiblePersonagens`/`visibleVinculos`, que alimentam a coluna e o grafo. Nesta branch, a tela foi migrada para `MapSidePanel` e o conteúdo de detalhe foi incorporado em `PersonagemDetailBody`; esse componente criou `activeDetailTipos` local e independente de `activeTipos`. Assim, o grafo geral e a lista de vínculos no detalhe podem exibir resultados diferentes para a mesma seleção de tipos, e o filtro local do detalhe não é compartilhado com o grafo.

**Ideia:** alinhar o fluxo de estado e filtragem ao comportamento funcional de `main`, mantendo o layout atual: filtros de tipo e status devem ter uma única fonte de estado na página, e os resultados correspondentes devem ser refletidos no SidePanel e no Grafo. Na seleção de personagem, a lista de vínculos no detalhe também deve respeitar os filtros ativos, sem manter um conjunto de tipos independente. Conferir ainda busca, seleção/isolar e estado vazio para que a filtragem não deixe conteúdo inconsistente entre painel e grafo.

**Escopo:** somente implementação e comportamento de filtro/exibição em `RelacoesPage.tsx`, `GraphStage.tsx` e componentes de painel relacionados. Sem alteração visual, de backend ou de modelo de dados. Antes de implementar, conferir a semântica atual de clique/duplo-clique dos chips e preservar a interação desejada, além dos filtros por status e busca que já existem.

---

## [BUG-001] Selecionar personagem não abre ficha nem detalhes

**Status:** Correção implementada; aguarda confirmação nos ambientes de desenvolvimento e produção. O foco do painel agora permanece acompanhado ao entrar nas linhas da lista; [147-selecao-personagem](../../specs/147-selecao-personagem/spec.md) tem E2E atualizado para validar seleção e detalhes em Relações.

**Registrado em:** 2026-09-24.

**Problema observado:**
- Em **Relações**, clicar em qualquer personagem no painel lateral move/reorganiza o grafo, mas não seleciona o personagem. Clicar diretamente no nó do grafo seleciona corretamente.
- No **Mapa**, clicar diretamente em um marcador de localidade funciona. Personagens não têm marcadores próprios; a seleção de personagem deve ser feita pela lista do painel lateral. O relato anterior diz que clicar em localidade ou personagem nessa lista não produz efeito.

**Comportamento esperado:**
- No **Mapa**, selecionar um personagem deve abrir sua ficha.
- No **Mapa de Relações**, selecionar um personagem deve selecionar o nó correspondente no grafo e mostrar os detalhes desse personagem no painel.

**Escopo:** restaurar o comportamento de seleção nas duas telas, mantendo cada resposta correspondente ao contexto da tela.

**Validação anterior (2026-09-24):** a seleção pela lista no Mapa passou em desktop e mobile (`mapa-retratos.spec.ts`); a seleção pela lista em Relações passou em desktop (`relacoes-retratos.spec.ts`). A falha reportada não foi reproduzida nesses casos, e os resultados não demonstraram falha dos handlers.

**Causa e correção (2026-09-24):** o rastreamento de foco estava no cabeçalho, embora os itens selecionáveis fiquem no corpo do painel. Ao mover o foco para uma linha, o blur do cabeçalho podia marcar o painel como desfocado e recolher a lista antes de concluir o clique. `MapSidePanel` agora rastreia o foco em toda a superfície; assim, os callbacks de seleção de `MapPage` e `RelacoesPage` podem concluir e manter o painel aberto. Em Relações, lista e nó já usam `selectPersonagem`; no Mapa, `selectLocalFromList` seleciona e centraliza a localidade, enquanto `selectNpc` abre os detalhes sem tentar centralizar um marcador inexistente.

**Validação da correção:** `npm run build` passou. `relacoes-retratos.spec.ts` passou em desktop com asserções de nó selecionado e título dos detalhes. `relacoes-flows.spec.ts` continua falhando antes das asserções de seleção por uma expectativa independente de visibilidade de vínculo. A execução de `mapa-retratos.spec.ts` alcançou as asserções de ficha, mas expirou durante a limpeza dos dados. A confirmação nos ambientes de desenvolvimento e produção e a validação mobile permanecem pendentes; T006 continua aberto em `tasks.md`.

---

## [BUG-002] Não é possível alternar estado de localidade entre Conhecido e Visitado

**Status:** Corrigido na implementação da [spec 149](../../specs/149-estado-local-scroll-sessoes/spec.md). Migração, isolamento e E2E desktop aprovados; validar novamente após deploy.

**Registrado em:** 2026-09-24.

**Problema observado:** não é possível alterar uma localidade de **Conhecido** para **Visitado**, nem de **Visitado** para **Conhecido**.

**Comportamento esperado:** deve ser possível alternar o estado da localidade entre **Conhecido** e **Visitado**, e a alteração deve ser salva e refletida na interface.

---

## [BUG-003] Lista de sessões sem rolagem no desktop

**Status:** Corrigido na implementação da [spec 149](../../specs/149-estado-local-scroll-sessoes/spec.md). E2E desktop aprovado; validar gesto touch em dispositivo mobile após deploy.

**Registrado em:** 2026-09-24.

**Problema observado:** no desktop, a lista de sessões não apresenta rolagem, impedindo visualizar todas as sessões. No mobile, a rolagem está disponível.

**Comportamento esperado:** a lista deve permitir rolagem também no desktop para que o usuário consiga acessar todas as sessões.

---
