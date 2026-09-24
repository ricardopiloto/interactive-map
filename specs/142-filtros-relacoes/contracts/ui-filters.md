# UI Contract: Filtros de Relações

Este contrato descreve o comportamento observável dos filtros em `/c/:slug/relacoes`. Não altera estilos, geometria do grafo, endpoints ou dados persistidos.

## Estado de tipo

| Estado atual | Ação | Próximo estado | Resultado esperado |
| --- | --- | --- | --- |
| Nenhum tipo ativo (vazio) | Clique simples em `T` | `{T}` após o delay de clique simples | Somente vínculos compatíveis com `T` |
| `{T1, ...}` | Clique simples em tipo inativo `T2` | Conjunto anterior mais `T2` | União dos tipos ativos |
| `{T1, T2, ...}` | Clique simples em tipo ativo `T1` | Conjunto anterior sem `T1` | Vínculos que correspondem a qualquer tipo restante |
| Qualquer conjunto | Duplo-clique em `T` | `{T}` | Isola `T`, substituindo a seleção anterior |
| `{T}` | Duplo-clique em `T` | Vazio | Retorna a mostrar todos os tipos |

O estado ativo dos chips deve representar essa mesma seleção tanto na área de filtros/lista quanto quando os controles de tipo forem apresentados com o detalhe aberto.

## Efeito por superfície

- **Grafo**: exibe arestas que correspondem à seleção global de tipos. Se a seleção está vazia, não restringe por tipo.
- **SidePanel, lista de personagens**: aplica status e texto de busca; não filtra personagens pela presença de um tipo de vínculo.
- **SidePanel, detalhe do personagem**: exibe somente vínculos do personagem que correspondem à seleção global de tipos. O contador acompanha a quantidade exibida.
- **Vínculo de duas direções**: passa no filtro se qualquer uma de suas direções corresponder a um dos tipos ativos.
- **Busca no grafo**: destaca correspondências sem esconder os outros nós.
- **Status**: restringe os personagens na lista e no grafo. Vínculos entre pontas fora do conjunto visível não são exibidos.
- **Isolamento**: limita as arestas às incidentes ao personagem selecionado, em interseção com o filtro global de tipo.

## Estados vazios

- Se os tipos ativos não correspondem a nenhum vínculo do personagem, o detalhe mostra o estado vazio já existente e o grafo não desenha arestas incompatíveis.
- Se os tipos ativos são vazios, “todos” significa todos os vínculos que atendem aos filtros restantes; não significa nenhum vínculo.
- Se status ou busca não encontram personagens, os estados vazios existentes permanecem e não devem causar erro.

## Não regressão visual

Manter a disposição, cores, rótulos, dimensões e estilo atual do SidePanel e do Grafo. A mudança deste contrato é exclusivamente comportamental.
