# Research: Seleção de personagem no Mapa e em Relações

**Feature**: [147-selecao-personagem](spec.md)
**Data**: 2026-09-24

## Escopo de pesquisa

Inspecionada a aplicação ativa em `frontend/`, seus handlers de seleção e os testes Playwright existentes. `frontend-next/` não é o alvo: é um protótipo paralelo e não determina o comportamento em produção.

## Decisões

### 1. Reutilizar os fluxos de estado existentes

**Decisão**: não introduzir uma segunda fonte de seleção. No Mapa, manter o estado `selected` já usado para locais e NPCs; em Relações, manter `selectedId` como estado compartilhado pela lista, grafo e painel.

**Evidência**:
- `MapPage.tsx` tem `selectNpc(id)`, que seleciona o NPC e expande o painel; `selectedNpc` é derivado dos personagens carregados e renderiza `NpcDetail`.
- As linhas de personagem no painel chamam `selectNpc`; os detalhes de Local também podem encaminhar à ficha de um NPC.
- `RelacoesPage.tsx` tem `selectPersonagem(id)`, deriva `selectedPersonagem` e usa o mesmo identificador em `PersonagemDetailBody` e `GraphStage`.
- `GraphStage.tsx` encaminha clique/toque no nó para `onSelect`; o componente também representa visualmente e semanticamente o nó selecionado.

**Alternativas consideradas**: criar evento global, rota ou requisição de API para carregar detalhes; rejeitadas porque dados e estado já estão disponíveis na página e os requisitos não pedem navegação nem persistência.

### 2. Identificar a reprodução específica antes de corrigir

**Decisão**: a implementação apresenta atualmente os handlers esperados e testes E2E já cobrem os principais caminhos. Antes de modificar código, confirmar no teste e na interação relatada qual entrada ainda falha. Corrigir somente a discrepância reproduzível e deixar uma regressão automatizada para essa entrada.

**Evidência**:
- `frontend/e2e/mapa-retratos.spec.ts` clica em uma linha de personagem e confirma que o detalhe mostra o nome selecionado.
- `frontend/e2e/relacoes-flows.spec.ts` escolhe um personagem na lista e depois um nó diferente, validando os nós selecionados.
- `frontend/e2e/relacoes-retratos.spec.ts` valida a seleção do nó correspondente após seleção pela lista.

**Alternativas consideradas**: reescrever integralmente seleção das duas páginas; rejeitada por duplicar comportamento existente e ampliar o risco sem causa raiz demonstrada.

### 3. Manter a seleção limitada aos dados visíveis na campanha ativa

**Decisão**: manter regras existentes de carregamento, filtro/status e limpeza de seleção quando o personagem deixa de estar disponível. Não criar consulta cross-campaign.

**Alternativas consideradas**: buscar personagem globalmente ao selecionar; rejeitada por ser desnecessária e contrariar o isolamento entre campanhas.

## Resultados por requisito

| Requisito | Fluxo ativo identificado | Validação proposta |
|---|---|---|
| FR-001 | Linha de personagem chama `selectNpc`, que abre `NpcDetail` | Selecionar personagem na lista do Mapa; verificar ficha e troca de personagem |
| FR-002 | `selectPersonagem` alimenta seleção do grafo e painel | Selecionar pela lista e verificar nó + detalhes correspondentes |
| FR-003 | Nós encaminham interação para `onSelect` | Selecionar outro nó e conferir painel atualizado |
| FR-004 | Estado selecionado único por tela | Trocar personagem e verificar identidade nos dois destinos |
| FR-005 | Listas vêm dos dados da campanha ativa | Confirmar contexto da campanha durante os fluxos E2E |
| FR-006 | Detalhes são derivados dos dados existentes | Cobrir personagem com campos opcionais ausentes, se o fixture disponível reproduzir a falha |

## Riscos que merecem validação

- Interação por toque pode diferir de clique do mouse; validar no projeto mobile do Playwright.
- O grafo diferencia clique de arrasto e possui animação da seleção; a regressão deve aguardar a conclusão do estado visível, não depender de temporização arbitrária.
- Filtros podem remover o personagem focado da lista; a aplicação já limpa a seleção nesse caso e esse comportamento deve ser preservado.
- A evidência atual não explica em qual caminho o usuário observou a BUG-001, pois os caminhos centrais aparecem implementados e cobertos. A reprodução e o ponto de entrada exatos permanecem essenciais na fase de implementação.
