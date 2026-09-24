# Feature Specification: Corrigir travamento ao entrar numa campanha vindo de fora

**Feature Branch**: `131-corrida-slug-campanha`
**Backlog**: [BKLG-019](../../docs/backlog/backlog.md#bklg-019-bug--sair-de-explorar-direto-pra-uma-campanha-trava-a-tela-campaign_slug_required)
**Created**: 2026-09-24
**Status**: Draft

**Input**: User description: "Saindo da tela de Explorar direto pra uma campanha, a tela trava — console mostra `Uncaught Error: CAMPAIGN_SLUG_REQUIRED`, stack passando por `listWaypoints`."

**Decision source**: causa raiz e direção de correção já levantadas e registradas no próprio item `BKLG-019` do backlog — condição de corrida entre o efeito que define o slug ativo (`CampaignShell`) e o efeito de um componente filho (`MapPage`) que já dispara uma chamada de API dependente desse slug, somada à ausência de um limite de erro na aplicação.

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; a correção não adiciona rota nem lê dado de outra campanha.
- Testes primeiro: não é rota de autenticação/permissão/migração/import — por III/Constitution, UI MAY validar só por quickstart manual; ainda assim, um teste de regressão simples é recomendado por ser barato e evitar reincidência (ver Assumptions).
- Produção legada: N/A.
- Simplicidade: a correção reaproveita um parâmetro opcional que a API do cliente já expõe (`slug?`); nenhuma dependência nova.
- i18n: N/A; nenhuma copy nova.
- Migrações: N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar numa campanha vindo de fora sem travar (Priority: P1)

Como jogador ou mestre, ao sair de Explorar (ou do Painel, ou de um link direto) para abrir uma campanha, quero que o Mapa carregue normalmente, sem a tela travar nem exigir recarregar a página.

**Why this priority**: É o próprio bug relatado — impede o primeiro acesso a qualquer campanha vinda de fora, o caminho mais comum de entrada.

**Independent Test**: A partir de `/explorar`, clicar numa campanha listada e confirmar que o Mapa carrega, sem erro não tratado no console e sem tela em branco. Repetir a partir de `/painel` e de um link direto (`/c/:slug` colado na barra de endereço).

**Acceptance Scenarios**:

1. **Given** o usuário em `/explorar`, **When** ele seleciona uma campanha, **Then** o Mapa dessa campanha carrega por completo, incluindo a rede de rotas associada, sem erro não tratado.
2. **Given** o usuário em `/painel`, **When** ele abre uma das suas campanhas, **Then** o mesmo carregamento correto ocorre.
3. **Given** um link direto pra `/c/:slug` colado na barra de endereço (primeira carga da página), **When** a página termina de carregar, **Then** o Mapa carrega sem erro.

### Edge Cases

- Navegação **dentro** de uma campanha já aberta (Mapa → Relações → Rota e vice-versa) deve continuar funcionando exatamente como hoje — `CampaignShell` já está montado nesses casos, então não é o caminho afetado pelo bug, mas não pode regredir.
- Trocar de uma campanha pra outra sem passar por fora (ex.: usando o seletor de campanhas no cabeçalho, se existir) deve ser verificado também, já que é outra forma de `CampaignShell`/página filha montarem juntos.
- Uma falha de rede real ao buscar waypoints (não relacionada a esse bug) deve continuar sendo tratada como já é hoje (lista vazia), não deve virar um novo tipo de erro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Mapa MUST NOT lançar uma exceção não tratada ao montar como parte de uma navegação vinda de fora da campanha (Explorar, Painel, ou carga direta de `/c/:slug`).
- **FR-002**: A chamada que lista a rede de rotas (waypoints) ao montar o Mapa MUST resolver o slug da campanha a partir da rota atual (já disponível no componente), em vez de depender exclusivamente do estado global de slug ativo, que pode ainda não estar definido no mesmo ciclo de montagem.
- **FR-003**: A navegação já existente dentro de uma campanha (entre Mapa, Relações e Rota) MUST continuar funcionando sem alteração de comportamento.

### Key Entities

Não aplicável — correção de comportamento de carregamento, sem entidade de dados nova.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Entrar numa campanha vinda de `/explorar`, `/painel` ou por link direto carrega a tela do Mapa com sucesso, sem erro não tratado, em 100% das tentativas.
- **SC-002**: A rede de rotas aparece corretamente já na primeira renderização do Mapa, sem exigir uma segunda navegação ou recarregamento da página.
- **SC-003**: Nenhuma regressão observável nos fluxos de navegação entre Mapa, Relações e Rota dentro de uma mesma campanha já aberta.

## Assumptions

- O limite de erro (`ErrorBoundary`) de nível de aplicação, cogitado no `BKLG-019` como endurecimento mais amplo, fica **fora do escopo** desta spec — é tratado como item separado no backlog, não como pré-requisito desta correção pontual.
- Um teste de regressão simples (chamada de API recebendo o slug explícito, sem depender do estado global) é recomendado, mas não bloqueante — a feature é classificada como correção de UI/carregamento, não como rota de autenticação/permissão/migração, então o Princípio II não a torna obrigatória.
- A correção é local ao componente do Mapa; não se estende, nesta spec, a uma auditoria de todos os outros pontos do código que também dependem do estado global de slug ativo (fica como possível item futuro, se surgir evidência de mais casos).
