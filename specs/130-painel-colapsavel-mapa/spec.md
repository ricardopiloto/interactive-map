# Feature Specification: MapSidePanel colapsável no desktop

**Feature Branch**: `130-painel-colapsavel-mapa`
**Backlog**: [BKLG-004](../../docs/v2/backlog.md#bklg-004-design--mapsidepanel-colapsável)
**Created**: 2026-09-23
**Status**: Draft

**Input**: User description: "MapSidePanel, compartilhado por Mapa/Relações/Rota, nasce colapsado no desktop mostrando só a busca, ao estilo Google Maps; expande sozinho quando o usuário foca a busca ou seleciona qualquer coisa (pino, nó, waypoint) — vale pras três telas."

**Decision source**: [Sessão de brainstorming — MapSidePanel colapsável](../../docs/v2/brainstorming/brainstorming-session-2026-09-23-1701.md), que fechou o modelo de interação com o usuário.

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; mudança de UI, sem rota nova de dados.
- Testes primeiro: UI de polimento sobre um componente já existente — quickstart manual é suficiente (Princípio II permite isso pra layout/interação sem tocar auth, permissões ou dados).
- Produção legada: N/A.
- Simplicidade: estende a regra de `[data-expanded]` que o componente `MapSidePanel` já usa no mobile também pro desktop; sem componente novo, sem dependência nova.
- i18n: reaproveita as chaves `panel.expand`/`panel.collapse` já existentes; sem string nova.
- Migrações: N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver mais mapa quando não está buscando nem com nada selecionado (Priority: P1)

Como jogador ou mestre, ao abrir o Mapa, Relações ou Rota sem ter buscado ou selecionado nada ainda, quero ver o painel ocupando pouco espaço, só com o campo de busca visível, pra ter mais área de mapa/grafo disponível.

**Why this priority**: É o problema central do item — hoje o painel é fixo em largura total, sempre ocupando espaço, mesmo quando ninguém está usando ele.

**Independent Test**: Abrir qualquer uma das três telas em desktop, sem clicar em nada, e confirmar que o painel aparece pequeno, mostrando só a busca.

**Acceptance Scenarios**:

1. **Given** a tela Mapa recém-aberta em desktop, sem seleção, **When** a página termina de carregar, **Then** o painel aparece colapsado, mostrando só o campo de busca.
2. **Given** a tela Relações recém-aberta em desktop, **When** a página termina de carregar, **Then** o painel aparece colapsado do mesmo jeito.
3. **Given** a tela Rota recém-aberta em desktop, **When** a página termina de carregar, **Then** o painel também aparece colapsado — mudança deliberada em relação ao comportamento atual, no qual a Rota nasce com o painel aberto.

---

### User Story 2 - O painel expande sozinho quando vira o foco da ação (Priority: P1)

Como jogador ou mestre, ao focar a busca ou selecionar qualquer coisa no mapa/grafo (um Local, um NPC, um waypoint), quero que o painel expanda automaticamente pra mostrar as opções ou o detalhe, sem precisar clicar num botão de expandir à parte.

**Why this priority**: É o gatilho que torna o painel útil apesar de nascer pequeno — sem ele, o usuário ficaria preso num painel sempre minúsculo.

**Independent Test**: Com o painel colapsado, focar o campo de busca e confirmar que expande; separadamente, clicar num pino/nó/waypoint sem tocar na busca e confirmar que também expande.

**Acceptance Scenarios**:

1. **Given** o painel colapsado, **When** o usuário foca o campo de busca, **Then** o painel expande mostrando a lista/opções.
2. **Given** o painel colapsado, **When** o usuário seleciona um item diretamente no mapa ou no grafo (sem antes tocar na busca), **Then** o painel expande mostrando o detalhe do item selecionado.
3. **Given** o painel expandido por uma seleção, **When** a seleção é limpa e a busca não está em foco, **Then** o painel volta a colapsar.

---

### User Story 3 - Comportamento idêntico nas três telas que compartilham o componente (Priority: P2)

Como pessoa usando a aplicação, quero que o painel se comporte da mesma forma em Mapa, Relações e Rota, pra não precisar reaprender a interação ao trocar de tela.

**Why this priority**: As três telas já compartilham o mesmo componente `MapSidePanel`; comportamento divergente entre elas seria inconsistência perceptível, não uma escolha deliberada.

**Independent Test**: Repetir o teste da User Story 1 e 2 nas três telas e confirmar que o resultado é o mesmo em todas.

**Acceptance Scenarios**:

1. **Given** as três telas (Mapa, Relações, Rota), **When** comparado o comportamento de colapsar/expandir em cada uma, **Then** o resultado é idêntico nas três.

### Edge Cases

- Usuário foca a busca, digita algo, mas não seleciona nenhum resultado e clica fora: o painel volta a colapsar (o estado é dirigido pela interação corrente, não lembrado).
- Troca de campanha ou recarregamento da página: o painel sempre nasce colapsado, como em qualquer carregamento novo — não existe estado lembrado de uma visita anterior.
- Comportamento em telas móveis (folha inferior "peek"/expandida, com o grabber manual que já existe) MUST NOT mudar — esta feature é só sobre o comportamento em desktop.
- Uma seleção feita a partir de outra tela ou de uma ação vinda de fora (ex.: um link direto pra um Local) chega com o painel já expandido, mostrando o item selecionado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No desktop, o `MapSidePanel` MUST nascer colapsado por padrão nas três telas que o utilizam (Mapa, Relações, Rota), mostrando apenas o conteúdo do `head` (busca).
- **FR-002**: Focar o campo de busca do `head` MUST expandir o painel.
- **FR-003**: Selecionar qualquer item nas telas que usam o painel (Local/NPC no Mapa, personagem no grafo de Relações, waypoint na Rota) MUST expandir o painel, independentemente de a busca ter sido usada ou não.
- **FR-004**: Quando a ação termina — a busca perde o foco sem seleção, ou a seleção é limpa — o painel MUST voltar ao estado colapsado.
- **FR-005**: O comportamento em telas móveis (folha inferior com estados "peek"/expandida e o grabber manual) MUST permanecer sem alteração.
- **FR-006**: A tela Rota MUST passar a nascer colapsada, alinhada às outras duas telas — mudança deliberada em relação ao comportamento atual (hoje nasce sempre expandida).
- **FR-007**: O estado colapsado/expandido MUST NOT ser persistido entre sessões ou visitas — é determinado apenas pela interação em curso.

### Key Entities

Não aplicável — mudança de comportamento de interface sobre um componente existente, sem entidade de dados nova.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em desktop, abrir qualquer uma das três telas sem seleção prévia resulta no painel colapsado, mostrando só a busca, em 100% dos casos.
- **SC-002**: Focar a busca ou selecionar qualquer item expande o painel sem atraso perceptível, em qualquer uma das três telas.
- **SC-003**: O comportamento de colapsar/expandir é idêntico nas três telas, sem exceção documentada além da mudança já prevista pra Rota (FR-006).
- **SC-004**: O comportamento em telas móveis não apresenta nenhuma regressão perceptível em relação ao estado anterior a esta feature.

## Assumptions

- O estado colapsado/expandido não é lembrado entre visitas — é sempre reconstruído a partir da interação corrente, conforme fechado na sessão de brainstorming.
- Esta feature cobre apenas o comportamento em desktop; o comportamento móvel já resolvido (folha inferior) permanece como está.
- O item [`BKLG-016`](../../docs/v2/backlog.md#bklg-016-produtodesign--unificar-mapa-e-rota-numa-única-tela) (unificar Mapa e Rota) pode alterar novamente o comportamento inicial da Rota no futuro — esta spec não antecipa nem depende dele, só alinha a Rota ao mesmo padrão das outras duas telas por ora.
- Sem string de i18n nova — reaproveita as chaves `panel.expand`/`panel.collapse` já existentes no componente.
