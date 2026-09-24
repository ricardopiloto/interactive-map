# Research: Auditoria de paridade da Rede de Relações

## Decisions

### 1. Preservar a casca e os fluxos da branch atual

- **Decision**: Manter `MapSidePanel` flutuante, painel único lista↔detalhe e os fluxos atuais de busca, filtros, seleção, zoom/pan e edição do GM. Ajustar somente o palco e pistas visuais confirmadas pela auditoria.
- **Rationale**: Spec 116 define esse shell como a reconstrução aprovada; o pedido BKLG-018 explicitamente diz manter o frontend desta branch.
- **Alternatives considered**: Restaurar a coluna lateral e o detalhe destacado da `main`; rejeitada porque reverte a decisão estrutural da spec 116 e o requisito FR-001 desta feature.

### 2. Reforçar as pistas de privacidade no cliente, mantendo o servidor como fronteira

- **Decision**: Continuar obtendo o grafo completo para o GM pela API administrativa e a projeção filtrada/redigida para jogadores pela API pública. Adicionar no grafo/detalhe do GM identificação explícita de vínculo privado e de sentido não conhecido pelos jogadores; nunca renderizar essas pistas para jogadores.
- **Rationale**: `backend/app/routers/public/vinculos.py` já omite pares privados e personagens ocultos e redige tipo, nota e qualificador de sentidos desconhecidos. `GraphStage` atualmente não distingue `publico=false` no traço, e a ficha de vínculo não dá uma identificação visual clara dessa privacidade.
- **Alternatives considered**: Ocultar segredos só com CSS/estado local ou criar novos campos/API; rejeitadas porque a privacidade exige projeção de servidor e os dados existentes já expressam os estados.

### 3. Usar segmentos retos e documentar o desvio deliberado da spec 105

- **Decision**: Substituir os caminhos quadráticos atuais por segmentos SVG retos; uma relação de duas vias pode continuar usando uma linha gradiente reta e etiquetas por extremo. Se houver necessidade de separar sentidos, usar segmentos paralelos retos. Preservar o hit area, os rótulos em foco/hover e a temporização existente.
- **Rationale**: A `main` desenha linhas retas, e a instrução atual do BKLG-018 exige linhas retas. A curvatura foi introduzida pela spec 105 desta branch para reduzir cruzamentos, mas foi explicitamente substituída pela decisão atual.
- **Alternatives considered**: Manter curvas ou reverter toda a reconstrução 105; rejeitadas. A regra reta substitui apenas a forma da aresta; layout radial, foco, filtros e casca atuais permanecem.

### 4. Dar uma cor própria a cada tipo, sem remover pistas de traço/texto

- **Decision**: Mapear cada um dos oito tipos para uma cor distinta nos temas claro e escuro usando os aliases de tipo já existentes em `frontend/src/styles/tokens.css`. Manter as diferenças de padrão e espessura como redundância, usar os nomes em texto e fazer amostras/chips reproduzirem o traço do palco.
- **Rationale**: A `main` atribui oito matizes individuais e o manual documenta oito cores, enquanto o código atual compartilha quatro tokens de família. A nova spec prefere distinção explícita entre os oito tipos, sem depender apenas da cor.
- **Alternatives considered**: Manter as quatro famílias da spec 105 ou copiar a paleta histórica sem revisão; rejeitadas porque tipos da mesma família continuam difíceis de distinguir e o manual/spec 081 apresentam cores individuais que precisam ser validadas nas duas aparências.

### 5. Preservar o algoritmo radial e conferir o palco útil

- **Decision**: Preservar PJs no anel interno, NPCs no externo e o foco selecionado no centro com vínculos diretos no anel interno. Verificar sobreposição com o painel flutuante em desktop/móvel; só alterar origem/fit da viewport se os testes evidenciarem nós essenciais encobertos.
- **Rationale**: `computeInitialLayout`/`computeFocusLayout` já implementam os critérios históricos e são compartilhados pelo `GraphStage`. A mudança de shell não justifica redesenhar o motor radial.
- **Alternatives considered**: Reposicionar os grupos com um algoritmo novo ou voltar ao layout antigo; rejeitadas até existir um cenário reproduzível mostrando que os critérios atuais falham.

### 6. Fazer direção e identidade de cada sentido continuarem inequívocas

- **Decision**: Revisar as etiquetas e indicadores de direção no vínculo bidirecional, inclusive `a_para_b` versus `b_para_a`, com nome/tipo/qualificador preso ao extremo correto. Ao GM, marcar o sentido desconhecido; ao jogador, representar apenas o sentido autorizado e não sinalizar a existência ou o conteúdo do sentido secreto.
- **Rationale**: `GraphStage` exibe `→` quando `direcao` é definida sem inverter a seta para B→A. Os campos existentes já guardam os sentidos e a projeção pública remove os dados secretos; a camada visual precisa respeitar a perspectiva correta.
- **Alternatives considered**: Tratar sempre o sentido como A→B; rejeitada porque permite interpretação invertida. Adicionar estado persistente de apresentação; rejeitada por ser derivável dos campos existentes.

### 7. Atualizar documentos de uso e a referência estrutural vigente

- **Decision**: Atualizar `docs/manual-relacoes.md` com os indicadores, linhas retas e estilo final dos oito tipos; atualizar `specs/116-relacoes-rota-reconstrucao/spec.md` para manter a casca atual e apontar os critérios aprovados nesta spec. Tratar spec 105 como histórico e registrar sua divergência intencional.
- **Rationale**: FR-012 exige documentação de critérios aceitos e diferenças intencionais. Spec 116 define a estrutura de painel vigente; spec 105 contém requisitos visuais anteriores substituídos neste escopo.
- **Alternatives considered**: Editar specs históricas para parecer que decisões antigas nunca existiram; rejeitada. Preservar o histórico e ligar explicitamente a decisão atual é rastreável.

## Repository findings

- **Branch baseline**: O checkout atual está na branch `117-aposentar-nocturne` com mudanças locais extensas e ainda não commitadas, inclusive no grafo e nas páginas. A comparação de código foi feita entre a implementação presente no worktree e `main`; estas tarefas não devem descartar nem reverter as outras mudanças do checkout.
- **Arestas**: `main` usa `<line>` para linha visível e hit area em `frontend/src/components/relacoes/GraphStage.tsx`; o worktree usa curva quadrática com `EDGE_BEND`, `curveControl`, `qPath` e curva também no hit area. A regra reta desta spec é uma divergência deliberada da spec 105 do worktree.
- **Privacidade no servidor**: `backend/app/routers/public/vinculos.py` filtra vínculo privado, vínculos de personagens ocultos e sentidos não conhecidos. Para vínculos de duas vias, campos de tipo, nota e qualificador não conhecidos são redigidos. `backend/tests/test_visibility.py` cobre um vínculo conectado a personagem oculto, mas não cobre diretamente par privado nem redaction dos campos por sentido desconhecido.
- **Privacidade na interface**: `frontend/src/pages/RelacoesPage.tsx` usa a API administrativa em modo GM e a pública em modo jogador. `GraphStage` estiliza personagem oculto (`visivel_para_todos=false`) mas não consulta `Vinculo.publico` para uma pista explícita de privacidade da aresta. A ficha de detalhe renderiza perspectivas mas não mostra um indicador inequívoco de vínculo privado/sentido secreto.
- **Tipos e cores**: `main` tinha oito valores individuais em `vinculoStyles.ts`; o worktree mapeia tipos a quatro variáveis (`--vinculo-afinidade/laco/hostil/neutro`) em `frontend/src/styles/tokens.css`. Os aliases por tipo já existem, mas atualmente resolvem para cores compartilhadas. O manual lista as oito categorias/cor. Spec 081 e manual têm uma divergência nominal sobre o matiz de Vínculo de Sangue; validar e documentar a escolha final em vez de deixar valores concorrentes.
- **Estilos**: o worktree conserva padrões (sólido, pontilhado, duplo, tracejado) e larguras por tipo, mas `edgePattern` escolhe apenas um padrão para os dois sentidos e `edgeWidth` usa a largura máxima. Para sentido duplo de estilos diferentes, as etiquetas por extremo precisam continuar identificando tipo/qualificador corretos; o padrão combinado não deve ser descrito como representação completa por si só.
- **Direção**: `GraphStage.tsx` atualmente calcula `midDuasText` como `v.direcao ? '→' : ''`; não diferencia `a_para_b` de `b_para_a`. A lista/detalhe e os utilitários de perspectiva já contêm os dados A/B necessários para evitar inversão.
- **Layout**: `frontend/src/components/relacoes/graphLayout.ts` mantém PJs num anel interno e NPCs num anel externo na visão geral; no foco, selecionado no centro, vizinhos diretos no anel interno e restantes fora. `GraphStage.tsx` centra o mundo na área `.graph-stage`. A sobreposição potencial com o painel deve ser conferida com o shell atual `frontend/src/components/map/MapSidePanel.tsx` antes de qualquer ajuste geométrico.
- **Fluxos atuais**: busca, filtros de tipo/estado, isolar, sincronização lista/grafo, seleção, detalhe e operações do GM ficam em `frontend/src/pages/RelacoesPage.tsx`; não há necessidade identificada de alterar API/modelo para estas interações.
- **Referências**: `docs/manual-relacoes.md` descreve privacidade, tipos, direção, layout radial e interações. Specs 068/071/073/081 e 086–089 especificam arestas/foco/semântica; spec 105 introduz curvas/quatro famílias; spec 116 estabelece o painel flutuante atual.

## Open clarifications

None blocking. A verificação do contraste/legibilidade da paleta e do marcador de sentido desconhecido deve resultar em decisão documentada durante a implementação; não altera modelo nem contrato API.
