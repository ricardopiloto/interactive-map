# Research: Retratos nas listas de personagens

## Decision 1: Usar os retratos já presentes nos objetos de personagem

- **Decision**: As listas consumirão `retrato_url` do personagem já carregado por cada tela.
- **Rationale**: O campo existe no tipo `NPC` (`frontend/src/types/index.ts`) e é utilizado pelo grafo de Relações. A lista do Mapa é construída a partir de `filteredNpcs`, e a lista de Relações a partir de `listItems`; ambas mantêm objetos completos de personagem.
- **Alternatives considered**: Adicionar endpoint ou buscar retratos separadamente. Rejeitado porque os dados necessários já estão disponíveis e uma consulta adicional ampliaria escopo e custo sem benefício.

## Decision 2: Reproduzir o tratamento visual e o fallback do token

- **Decision**: Exibir a imagem dentro do avatar circular existente, recortando para preenchê-lo sem distorcer; manter as iniciais por baixo e restaurá-las quando não houver URL ou quando o carregamento falhar.
- **Rationale**: `GraphStage.tsx` já implementa imagem, tratamento de falha e reinicialização do estado ao trocar a URL; `GraphStage.css` usa `object-fit: cover` dentro de uma área circular recortada. Os avatares das listas já são circulares e têm 28×28 px.
- **Alternatives considered**: Mostrar imagem sem fallback ou deixar que o navegador exiba a imagem quebrada. Rejeitado por deixar a lista sem identificação visual e divergir do comportamento já conhecido no grafo.

## Decision 3: Preservar as interações das listas e o comportamento do grafo

- **Decision**: Modificar apenas o conteúdo visual dos avatares em `MapPage` e `RelacoesPage`; manter os tokens do grafo e o avatar maior de detalhe do Mapa sem mudanças comportamentais.
- **Rationale**: O pedido delimita as listas do Mapa e do mapa de Relações. Busca, filtros, seleção e permissões já operam sobre os personagens independentemente do avatar.
- **Alternatives considered**: Redesenhar os tokens ou todos os retratos do produto. Rejeitado por ampliar a superfície e não ser necessário para atender ao pedido.

## Decision 4: Cobrir os dois fluxos com a infraestrutura de interface existente

- **Decision**: A validação automatizada será feita na suíte Playwright existente, verificando retrato e fallback nas duas listas; viewport estreito e estado selecionado devem preservar a linha e suas ações. Complementar com inspeção manual do recorte.
- **Rationale**: O projeto já dispõe de Playwright, fixtures de personagens para Relações e projeto desktop/móvel. Essa cobertura exercita a renderização sem introduzir framework de teste.
- **Alternatives considered**: Adicionar dependência de testes unitários. Rejeitado por constituir nova dependência para comportamento simples de interface.
