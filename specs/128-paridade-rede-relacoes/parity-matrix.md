# Matriz de paridade: Rede de Relações

Esta matriz rastreia os critérios aplicáveis do [manual](../../docs/manual-relacoes.md), das specs 068, 071, 073, 081, 086–089, 105 e 116, desta spec e da implementação em `main`. A shell flutuante/lista-detalhe desta branch continua aprovada. Estados aqui descrevem a implementação antes dos ajustes da spec 128.

| Critério aplicável | Fonte | Estado inicial | Evidência / ação de implementação |
|---|---|---|---|
| A página mantém painel flutuante compartilhado, recolhível no mobile, com busca, filtros, lista e detalhe no mesmo painel | Manual; 116 FR-001/003/004; 128 FR-001 | Preservado nesta branch; diverge intencionalmente do shell antigo em `main` | E2E de fluxo e revisão da shell; não restaurar coluna fixa nem painel separado |
| Busca, filtros de tipo/estado, isolar, seleção no grafo/lista, zoom, pan e CRUD GM continuam sincronizados | Manual; 071 FR-007/008; 086 FR-003/004/009–013; 116 FR-009; 128 FR-009 | Implementado; requer regressão | Playwright cobre busca, chips, lista↔grafo↔detalhe, isolamento e ações GM |
| Personagens visíveis ao papel aparecem igualmente na lista e no palco; busca filtra lista e atenua palco | 086 FR-002/004/012 | Preservado | E2E de regressão com papéis GM/jogador |
| Lista tem scroll interno; clique seleciona; hover realça apenas personagem/arestas diretas e não muda seleção/layout | 086 FR-003/005/009–013 | Preservado; requer regressão de desktop/toque | Verificar scroll, clique e hover sem depender de hover em touch |
| GM recebe o grafo administrativo completo, incluindo personagens ocultos, privacidade do par e ambos os sentidos | Manual; 073 FR-002/006/008; 128 FR-010 | Implementado por API administrativa; pistas incompletas | Testar GM e renderizar as marcações somente quando `isGm` |
| Jogador não recebe vínculo privado nem vínculo conectado a personagem oculto | Manual; 071 FR-008/SC-005; 073 FR-003; 128 FR-004/010 | Filtrado no endpoint público; cobertura direta incompleta | Adicionar testes de endpoint e assegurar ausência no DOM público |
| Sentido não conhecido é redigido no payload público; sentido conhecido continua disponível | Manual; 073 FR-001/004/005/009/010; 128 FR-004/010 | Redação existente; cobertura direta incompleta | Testar ausência de tipo, qualificador, nota e flags de conhecimento no JSON público |
| Indicadores de vínculo privado e sentido desconhecido aparecem ao GM no grafo e no detalhe, sem abrir edição | Manual; 073 FR-002; 128 FR-003/010 | Gap visual confirmado | Indicadores GM-only junto à aresta/extremo e entrada de detalhe, com nome acessível |
| Nenhum indicador, contagem, marcador, cor/traço alternativo ou detalhe deixa jogador inferir segredo | Manual; 073 FR-003–005/SC-001; contrato 128 | Regra preservada no endpoint; interface depende dos testes | Inspecionar resposta JSON, grafo, detalhe e filtros como jogador |
| Par recíproco continua com uma natureza/cor/entrada; recíproco não ganha rótulos ociosos de duas vias | 068; 071 FR-003/006; 073 FR-007 | Preservado | Playwright verifica relação recíproca e ficha |
| Par duas vias mantém natureza de cada extremo; rótulos e detalhe associam tipo/qualificador/nota a quem vê | 071 FR-003–005; 073 FR-002/004/005 | Parcial: tipos e etiquetas estão nos extremos, direção não é explicitada corretamente em todos os casos | Corrigir orientação A→B/B→A e testar as duas perspectivas |
| Filtro por tipo inclui o par quando qualquer sentido corresponde a tipo ativo | 071 FR-007 | Preservado em `edgeMatchesTipos` | Cobrir filtro por cada sentido em E2E |
| Oito tipos e ordem canônica mantêm-se no catálogo, formulário, legenda e filtros; nenhuma alteração de esquema | 081 FR-001–003/006–008; manual | Preservado | E2E confere 8 nomes/ordem; formulário e dados não mudam |
| Cada tipo tem cor individual, legível em temas claro/escuro, complementada por padrão/espessura/texto | Manual; 081 FR-004/005; 105 FR-001/002/010; 128 FR-006 | Divergência visual: worktree compartilha quatro cores de família; `main` tinha cores individuais | Substituir aliases por valores individuais, conferir contraste ≥3:1 e reconhecimento 8/8 |
| Cores de Aliado, Vínculo de Sangue e Adversário conservam significados históricos aprovados; Vínculo de Sangue permanece violeta escuro/sangue | 081 FR-004/005; manual; divergência nominal documentada em pesquisa 128 | Aliado usa acento; sangue é família rosa; adversário compartilha hostil | Escolher cores individuais coerentes com manual/spec 081 e documentar mapeamento final |
| Amostras de filtro/legenda reproduzem cor e padrão do traço; rótulo textual não depende da cor | 105 FR-001/005; 128 FR-006/007 | Gap: chips exibem pontos circulares genéricos | Trocar os pontos por amostras lineares com dash/espessura do tipo |
| Relações são segmentos retos; hit area, foco/hover e linhas duplas permanecem utilizáveis | `main` GraphStage; manual; 128 FR-005; conflito explícito com 105 FR-008 | Divergência intencional: worktree usa curvas de 105; `main` usa segmentos | Trocar caminho e hit area para segmento; registrar que critério 128 supersede somente a curvatura de 105 |
| Direção explícita A→B e B→A aponta para o extremo certo; sentido secreto não cria seta ou pista pública | Manual; 071 FR-003/005; 073 FR-004; 128 FR-004/005 | Gap: renderer mostra `→` genérica para qualquer `direcao` | Orientar indicador conforme enumeração e verificar projeção pública parcialmente conhecida |
| Rótulos de aresta aparecem em foco/hover, rótulos de nó têm mínimo 12px, interação por Tab/Enter/Espaço preservada | 105 FR-003/004/007; 128 FR-009 | Preservado no renderer/contrato, sem teste de regressão focal | Incluir axe e interação de nós/arestas no fluxo E2E |
| Visão geral mantém PJs no anel interno e NPCs no externo, aproxima anéis sem sobrepor discos/nomes | 068 FR-002; 087 FR-001–005; manual | Algoritmo radial preservado nesta branch | E2E com grupos mistos, densidade e zoom mínimo; nenhuma mudança de algoritmo sem falha observada |
| Foco fica no centro; vizinhos diretos no anel interno; restantes no anel externo esmaecido | 068 FR-003/004; 071; 086 FR-006–008; 116 FR-005 | Preservado | E2E overview/focus confirma opacidade, seleção e vizinhos |
| Foco com >6 conexões usa compactação de 086/088; com 4–6 mantém distância padrão; ≤3 usa 130% apenas no anel interior | 086 FR-006–008; 088 FR-001–005; 089 FR-001–005 | Preservado por `focusInnerSpacing` | E2E com 2, 5 e 8 vizinhos e sem regressão da visão geral/anel exterior |
| Nós essenciais permanecem localizáveis fora da área coberta pelo painel em desktop/mobile, recolhido/expandido | Manual; 087 SC-001/003; 128 FR-008/SC-005 | Precisa de verificação no shell atual; sem gap reproduzido | Medir interseção de nós/painel nos cenários de layout; alterar origem/fit somente se houver falha reproduzível |
| Retrato opcional, descrição vazia omitida e conteúdo escrito pelo GM não é traduzido | Manual; 105 FR-006; Constituição V | Preservado | Regressão de detalhe; manter notas e nomes como conteúdo original |
| API/dados/tipos persistidos permanecem; nova regra visual não cria campos nem serviços | 071; 073; 081 FR-001/002; 105 FR-009; 128 plan | Preservado | Revisão final confirma nenhuma migração, endpoint ou dependência nova |
| Manual e spec 116 descrevem shell atual, estilos aprovados e diferenças intencionais de `main`/105, preservando histórico | 081 FR-009; 116 FR-001–010; 128 FR-012 | Pendente | Atualizar manual e spec 116; spec 105 fica histórica e não é reescrita |

## Fora do escopo desta paridade

- Requisitos de Rota em 116 FR-002/006–008 e SC-004 não mudam com esta auditoria.
- Criação/validação de tipos, sugestões de qualificadores e schema em 081 não mudam; são apenas regressão de catálogo/formulário.
- A auditoria não reverte a shell da página aprovada por 116 para a versão antiga de `main`.

## Convenção de conclusão

Na revisão final, substituir estados iniciais por `Preservado`, `Corrigido` ou `Divergência intencional`, com caminho do teste/captura e justificativa. Critérios de privacidade só podem ser concluídos com evidência do payload público e da vista GM/jogador.
