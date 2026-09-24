# Feature Specification: Filtro de tipo de vínculo no painel de detalhe (Relações)

**Feature Branch**: `133-filtro-vinculos-detalhe`
**Backlog**: [BKLG-022](../../docs/v2/backlog.md#bklg-022-design--painel-de-detalhe-de-personagem-relações-não-tem-filtro-de-tipo-de-vínculo)
**Created**: 2026-09-24
**Status**: Draft

**Input**: User description: "Quando o usuário seleciona um personagem no mapa de relações, ele mostra a lista de relações do personagem, mas ele não dá a opção de filtrar os tipos de bonds."

**Decision source**: causa raiz confirmada no item `BKLG-022` do backlog; decisão de UX confirmada com o usuário em 2026-09-24 — o painel de detalhe ganha um filtro **próprio**, independente do filtro do grafo geral (`activeTipos`), não compartilhado com ele.

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; mudança de UI sobre dados já carregados na tela, sem rota nova.
- Testes primeiro: UI de polimento — Constitution II permite validação só por quickstart manual.
- Produção legada: N/A.
- Simplicidade: reaproveita o padrão de conjunto de tipos (`Set<VinculoTipo>`) já usado pelo filtro do grafo geral, como um estado novo e independente — sem inventar mecanismo de filtro diferente.
- i18n: qualquer copy nova (rótulos do filtro) MUST existir em pt-BR e en; reaproveitar `getVinculoTipoLabel`/`VINCULO_TIPOS` já existentes onde possível.
- Migrações: N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filtrar os vínculos de um personagem selecionado por tipo (Priority: P1)

Como mestre ou jogador, ao selecionar um personagem no grafo de Relações, quero poder filtrar a lista de vínculos dele por tipo (Aliado, Romance, Inimizade, etc.), pra encontrar rápido o vínculo que procuro quando a pessoa tem muitos.

**Why this priority**: É o pedido central — hoje a lista mostra tudo, sem nenhuma forma de restringir por tipo.

**Independent Test**: Selecionar um personagem com vínculos de tipos diferentes, ativar o filtro pra um tipo específico e confirmar que só os vínculos desse tipo aparecem na lista; desativar e confirmar que a lista volta a mostrar todos.

**Acceptance Scenarios**:

1. **Given** um personagem selecionado com vínculos de mais de um tipo, **When** o painel de detalhe abre, **Then** todos os vínculos dele aparecem por padrão, sem nenhum tipo pré-filtrado.
2. **Given** o painel de detalhe de um personagem aberto, **When** o usuário escolhe filtrar só por um tipo específico, **Then** a lista mostra apenas os vínculos desse tipo, e a contagem exibida (`vinculosCount`) reflete só os vínculos visíveis após o filtro.
3. **Given** o filtro do painel de detalhe ativo num tipo, **When** o usuário limpa o filtro (ou seleciona "todos"), **Then** a lista volta a mostrar todos os vínculos do personagem.

---

### User Story 2 - Filtro do painel é independente do filtro do grafo geral (Priority: P1)

Como mestre, quero que o filtro de tipo do painel de detalhe não dependa do filtro que já estiver ativo no grafo geral, pra não perder vínculos de vista por engano ao abrir o detalhe de alguém.

**Why this priority**: Decisão de UX confirmada — evita o caso confuso de "por que não vejo o vínculo de Romance aqui" quando o grafo geral estava filtrado por outro tipo numa ação anterior.

**Independent Test**: Filtrar o grafo geral por um tipo (ex.: só "Inimizade"), depois selecionar um personagem que tenha vínculos de outros tipos também, e confirmar que o painel de detalhe mostra todos os tipos dele, não só "Inimizade".

**Acceptance Scenarios**:

1. **Given** o grafo geral filtrado por um tipo específico, **When** o usuário seleciona um personagem com vínculos de outros tipos, **Then** o painel de detalhe mostra todos os vínculos dele por padrão, ignorando o filtro do grafo geral.
2. **Given** o painel de detalhe com seu próprio filtro ativo, **When** o usuário fecha o detalhe e volta pro grafo geral, **Then** o filtro do grafo geral permanece como estava, sem ser afetado pelo filtro do painel.

### Edge Cases

- Personagem selecionado não tem nenhum vínculo do tipo filtrado: a lista mostra o estado vazio já existente (`detail.noVinculos`), não um erro.
- Trocar de personagem selecionado (via clique em outro nó ou em "outro" dentro da lista de vínculos) enquanto um filtro está ativo: o filtro do painel reseta pra "todos" ao trocar de personagem (não carrega o filtro de uma pessoa pra outra) — evita o mesmo tipo de confusão do US2, mas entre pessoas diferentes.
- Vínculo "duas vias" com tipos diferentes em cada sentido (ex.: Romance de um lado, Amizade do outro): conta como visível se **qualquer um** dos dois sentidos bater com o filtro ativo, já que a linha representa os dois sentidos ao mesmo tempo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel de detalhe de um personagem MUST oferecer um controle de filtro por tipo de vínculo, cobrindo os mesmos tipos já usados no grafo geral (`VINCULO_TIPOS`).
- **FR-002**: O filtro do painel de detalhe MUST ser um estado independente do filtro do grafo geral (`activeTipos`) — nenhuma leitura nem escrita cruzada entre os dois.
- **FR-003**: Ao abrir o painel de detalhe de um personagem, o filtro MUST iniciar mostrando todos os tipos (sem nenhum pré-selecionado/oculto).
- **FR-004**: Trocar de personagem selecionado MUST resetar o filtro do painel de detalhe pra "todos", não herdar o filtro da pessoa anterior.
- **FR-005**: A contagem de vínculos exibida no painel (`detail.vinculosCount`) MUST refletir a lista já filtrada, não o total bruto.
- **FR-006**: Um vínculo "duas vias" com tipos diferentes por sentido MUST aparecer na lista filtrada se pelo menos um dos dois sentidos corresponder ao(s) tipo(s) ativo(s) no filtro.

### Key Entities

Não aplicável — filtro de UI sobre dados (`Vinculo`) já existentes; nenhuma entidade nova.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com um tipo selecionado no filtro do painel de detalhe, cem por cento dos vínculos exibidos correspondem a esse tipo (ou, em duas vias, a pelo menos um dos dois sentidos).
- **SC-002**: Filtrar o grafo geral por um tipo não altera, em nenhum caso, o que aparece no painel de detalhe de um personagem selecionado depois — os dois filtros nunca se influenciam.
- **SC-003**: Trocar de personagem selecionado sempre reseta o filtro do painel de detalhe pra "todos", sem exceção.

## Assumptions

- O filtro do painel de detalhe reaproveita o mesmo conjunto de tipos (`VINCULO_TIPOS`) e rótulos (`getVinculoTipoLabel`) já usados no filtro do grafo geral — só o estado de quais tipos estão ativos é que fica separado.
- O widget exato do filtro (chips, checkboxes, um `SegmentedControl`) fica pra decisão de planejamento/design — esta spec define o comportamento (filtro independente, reseta ao trocar de pessoa, começa mostrando tudo), não a forma visual exata.
- Não persiste entre sessões/visitas — mesmo padrão de estado efêmero já usado no filtro do grafo geral e no `BKLG-004`.
