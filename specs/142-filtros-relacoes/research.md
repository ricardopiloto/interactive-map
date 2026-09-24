# Research: Filtros consistentes em Relações

**Data**: 2026-09-24  
**Escopo**: comparar o comportamento da branch atual com `main`, esclarecer o requisito mais recente e definir critérios de filtragem para SidePanel e Grafo.

## Decisão 1: uma seleção compartilhada de tipos

**Decision**: a seleção de tipos mantida na página de Relações é a única fonte de estado para os chips exibidos no SidePanel, para as arestas do grafo e para os vínculos na lista de detalhe.

**Rationale**: em `main`, os chips de tipo da `RelacoesSideColumn` e o `GraphStage` já recebem o mesmo estado `activeTipos`. Na branch atual, `PersonagemDetailBody` cria `activeDetailTipos` separado, então selecionar um tipo na área de detalhe não corresponde necessariamente ao grafo geral. BKLG-032 e SPEC 142 pedem explicitamente paridade no SidePanel e no Grafo. Essa decisão posterior substitui, para esta feature, a escolha de independência feita na SPEC 133.

**Alternatives considered**:
- Manter filtro de detalhe independente, conforme a SPEC 133: rejeitado para este escopo porque conserva a divergência apontada pelo pedido BKLG-032.
- Fazer o SidePanel apenas espelhar visualmente os chips sem filtrar sua lista de vínculos: rejeitado porque o requisito exige que a seleção afete a exibição no painel e no grafo.

## Decisão 2: conjunto vazio significa “todos”

**Decision**: nenhum tipo selecionado é o estado sem restrição por tipo; um vínculo passa pelo filtro se o conjunto estiver vazio ou se pelo menos uma direção relevante do vínculo corresponder a um tipo ativo.

**Rationale**: a SPEC 134 já definiu o estado vazio como “mostrar todos”, clique único aditivo/removível e duplo-clique como atalho para isolar. Porém, a implementação atual diverge desse contrato: `activeTipos` começa preenchido com todos os tipos, `activeDetailTipos` é independente e a função `edgeMatchesTipos` atual devolve `false` quando recebe um conjunto vazio. Essa combinação deixa os resultados confusos/inconsistentes ao limpar filtros e deve ser tratada no plano de implementação.

**Alternatives considered**:
- Representar “todos” com todos os tipos explicitamente dentro do conjunto: rejeitado porque conflita com a semântica já documentada na SPEC 134 e torna ambíguo o ato de desmarcar o último chip.
- Desativar automaticamente o filtro e repor todos os tipos ao tentar limpar o último: rejeitado porque não representa o estado vazio definido e dificulta aplicar a mesma regra a painel e grafo.

## Decisão 3: combinar tipos, status, busca e isolamento em suas responsabilidades atuais

**Decision**: manter as regras de combinação definidas pela SPEC 142: status controla os personagens que podem aparecer; busca reduz a lista lateral e destaca correspondências no grafo sem remover nós não correspondentes; tipos controlam vínculos/arestas; isolamento restringe arestas aos vínculos incidentes ao personagem selecionado após a filtragem por tipo.

**Rationale**: `main` calcula personagens visíveis por status e aplica a busca à lista, passando a consulta ao grafo como destaque. `GraphStage` primeiro calcula vínculos correspondentes aos tipos e depois aplica isolamento a esse subconjunto. A mudança de estado compartilhado não deve alterar essas responsabilidades nem a limpeza de seleção quando o personagem deixa de ser visível.

**Alternatives considered**:
- Fazer busca ocultar nós do grafo: rejeitado porque difere do comportamento de `main` e pode ocultar contexto da rede.
- Fazer isolamento preceder a filtragem por tipo: rejeitado porque poderia reintroduzir arestas que o usuário explicitamente filtrou.

## Regras direcionais de vínculo

- Para um vínculo com tipos diferentes em cada direção, o grafo e o detalhe devem incluir o vínculo se qualquer uma das direções corresponder a um tipo selecionado.
- O detalhe usa a perspectiva do personagem selecionado para determinar o tipo exibido; a correspondência, contudo, considera ambas as direções, conforme a regra já documentada na SPEC 133.
- Vínculos sem tipo em nenhuma direção só podem aparecer quando não há restrição de tipo, se já forem considerados válidos para exibição por outras regras.

## Superfície e verificações

- `RelacoesPage.tsx`: dono do estado compartilhado, lista do painel e seleção/status.
- `GraphStage.tsx` + `vinculoDirection.ts`: filtro das arestas e layout/isolamento baseado nos vínculos filtrados.
- `PersonagemDetailBody` no arquivo da página: filtro e contagem de vínculos do personagem selecionado.
- `useVinculoTipoChipClicks.ts`: preservar clique/double-click e cancelamento do clique simples pendente.
- Interface de usuário somente; sem endpoint ou persistência. Roteiro manual documentado em [quickstart.md](./quickstart.md).

Sem dependências novas ou dúvidas pendentes.
