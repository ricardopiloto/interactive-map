# Feature Specification: Revelação progressiva (Local e Arco)

**Feature Branch**: `113-revelacao-progressiva`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "Revelação progressiva de Local e Arco. Adicionar visivel_para_todos (default true) a Local e Arco, mesmo padrão de NPC. GM marca local/arco oculto sem apagar. Anónimo/fora de Modo edição: local oculto some do mapa, lista, busca e saídas conhecidas; arco oculto some da navegação por arco; local com arco oculto continua visível mas mostra «Sem arco» sem vazar o título. Local oculto não aparece como «visto ali» nas respostas públicas de NPCs. Modo edição mostra tudo com o mesmo badge de oculto dos NPCs. Generalizar o helper de visibilidade. Fora: visibilidade por jogador; ocultar vínculo isolado. Critério-chave: local oculto + NPC dentro não vazam (local, local_ids do NPC, saída de local visível); Modo edição vê tudo com badge."

**Depends on**: Padrão já validado em NPC (`visivel_para_todos` + filtro público); superfícies de mapa/lista/admin existentes (specs 102–104). Nenhuma spec pendente obrigatória.

**Phase**: Conteúdo de mesa — extensão da revelação progressiva já usada em personagens para Locais e Arcos.

## Constitution

- Isolamento (I): Local/Arco continuam no SQLite da campanha; filtros públicos MUST NOT alterar isolamento entre slugs; matriz de isolamento cobre leituras públicas afectadas.
- Testes primeiro (II): migração com default true; local oculto + NPC ligado + saída a partir de local visível — zero vazamento ao anónimo; admin/Modo edição vê tudo.
- Produção legada (III): MUST NOT tocar `/opt/codex-*`.
- Simplicidade (IV): reutilizar o mesmo flag e o mesmo badge visual de NPC; generalizar o helper de visibilidade em vez de três cópias.
- i18n (V): rótulos de UI («oculto», «Sem arco», interruptor de visibilidade) MUST ter pt-BR e en; nomes/títulos do mestre MUST NOT ser traduzidos.
- Migrações (VI): colunas novas no banco de conteúdo da campanha MUST ser versionadas, com default «visível para todos» (mesas existentes ficam públicas como hoje).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogador não vê rascunhos / spoilers do mestre (Priority: P1)

Um jogador anónimo (ou qualquer vista fora de Modo edição) consulta o mapa, a lista de locais, a busca e as saídas de um local que conhece. Locais marcados como não visíveis para todos **não** aparecem em nenhuma dessas superfícies. Se um local visível tinha saída para um local oculto, essa saída **não** aparece como «conhecida». Arcos marcados como ocultos **não** aparecem na navegação por arco. Um local cujo arco está oculto **continua** no mapa, mas o jogador vê-o como **sem arco** (sem título nem identificador do arco oculto).

**Why this priority**: Critério-chave — evita spoilers sem apagar conteúdo.

**Independent Test**: Campanha com local A (visível) → saída para B (oculto, com NPC ligado); arco C oculto ligado a local D visível; anónimo não vê B, não vê B nas saídas de A, não vê C; D aparece sem nome de arco.

**Acceptance Scenarios**:

1. **Given** local B com `visivel_para_todos=false`, **When** anónimo lista/busca/abre mapa, **Then** B **não** aparece (lista, pinos, detalhe).
2. **Given** local A visível com saída para B oculto, **When** anónimo vê A, **Then** as saídas conhecidas de A **não** incluem B.
3. **Given** arco C oculto e local D visível apontando para C, **When** anónimo navega por arcos ou vê D, **Then** C não aparece na navegação e D mostra estado «Sem arco» (sem vazar o título de C).
4. **Given** nenhum local oculto, **When** anónimo usa o mapa, **Then** o comportamento actual (tudo público) permanece.

---

### User Story 2 - Cruzamento com personagens (Priority: P1)

Nas respostas públicas de personagens/NPCs, um local oculto **não** conta como «visto ali»: o identificador desse local MUST NOT aparecer na lista pública de locais do personagem. O personagem em si continua a seguir a sua própria regra de visibilidade (como hoje). Isto espelha o cuidado cruzado já feito nos vínculos entre personagens.

**Why this priority**: Parte do critério-chave; evita bypass pelo cartão do NPC.

**Independent Test**: Local oculto ligado a NPC visível; anónimo vê o NPC (se o NPC for público) **sem** esse local na lista de aparições; não vê o local em lado nenhum.

**Acceptance Scenarios**:

1. **Given** local oculto ligado a NPC com `visivel_para_todos=true`, **When** anónimo obtém a ficha/lista pública do NPC, **Then** o local oculto **não** figura como local associado.
2. **Given** o mesmo cenário, **When** anónimo lista locais, **Then** o local oculto continua ausente (sem bypass).
3. **Given** NPC com `visivel_para_todos=false` ligado só a locais visíveis, **When** anónimo lista NPCs, **Then** o NPC continua oculto (regra existente intacta).

---

### User Story 3 - Mestre gere revelação em Modo edição (Priority: P1)

Em Modo edição, o mestre vê **todos** os locais e arcos, incluindo ocultos, com o **mesmo indicador visual de «oculto»** já usado para NPCs ocultos (reutilizar, não inventar outro). Pode marcar/desmarcar «visível para todos» no formulário de local e de arco sem apagar o registo. Fora de Modo edição não há controlos de escrita desta flag.

**Why this priority**: Sem gestão pelo mestre a feature não serve à mesa.

**Independent Test**: Ligar Modo edição; local e arco ocultos visíveis com badge; gravar toggle; desligar Modo edição e confirmar ocultação pública.

**Acceptance Scenarios**:

1. **Given** Modo edição e local/arco ocultos, **When** o mestre abre lista/mapa/formulário, **Then** vê esses itens com o badge de oculto familiar dos NPCs.
2. **Given** local ou arco existente, **When** o mestre desliga «visível para todos» e grava, **Then** anónimo deixa de o ver conforme US1/US2; o registo permanece na mesa.
3. **Given** Modo edição desligado, **When** se visita mapa/listas, **Then** não há controlos para alterar esta visibilidade.
4. **Given** mesa após migração, **When** o mestre abre conteúdo antigo, **Then** todos os locais/arcos existentes estão visíveis para todos (default seguro, sem surpresa).

---

### Edge Cases

- Local oculto é o único local de um arco visível → arco continua listável; não força ocultar o arco.
- Arco oculto com vários locais → cada local visível mostra «Sem arco»; locais ocultos do mesmo arco seguem a regra de local.
- Local oculto com imagem/média → superfície pública MUST NOT servir essa média como se o local fosse conhecido (mesmo espírito da ACL de personagem).
- Saída bidirecional / lista de conexões → filtrar destinos ocultos em ambos os sentidos na vista pública.
- Busca por nome de local oculto → zero resultados para anónimo.
- Export/import e pacotes → preservar a flag; default true em conteúdo antigo sem o campo.
- Sessões (crônica) com chip para local oculto → chip MUST NOT aparecer na lista pública de sessões (consistência com chips de personagem oculto).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Local MUST ter flag «visível para todos» (default verdadeiro), no mesmo sentido conceptual de personagem.
- **FR-002**: Arco MUST ter a mesma flag com o mesmo default.
- **FR-003**: Fora de Modo edição / jogador anónimo: local com flag falsa MUST NOT aparecer no mapa, na lista, na busca, no detalhe público, nem como saída conhecida de outro local.
- **FR-004**: Fora de Modo edição: arco com flag falsa MUST NOT aparecer na navegação/listagem de arcos; locais públicos que o referenciem MUST apresentar-se como sem arco, **sem** expor título ou identificador do arco oculto.
- **FR-005**: Respostas públicas de personagem/NPC MUST omitir locais ocultos da associação «visto ali» / lista de locais do personagem.
- **FR-006**: Modo edição MUST listar e editar locais e arcos ocultos, com o **mesmo** indicador visual de oculto já usado para NPCs.
- **FR-007**: Formulários de edição de local e de arco MUST permitir alterar a flag sem apagar o registo.
- **FR-008**: Conteúdo existente após activar a funcionalidade MUST permanecer visível para todos por omissão (sem exigir acção do mestre).
- **FR-009**: A regra de visibilidade MUST ser aplicada de forma consistente (mesmo critério booleano) a personagem, local e arco — idealmente um critério partilhado, sem três lógicas divergentes.
- **FR-010**: Isolamento entre campanhas MUST manter-se; pedidos à campanha B MUST NOT revelar locais/arcos da campanha A.
- **FR-011**: Copy de UI nova (badge, «Sem arco», interruptor) MUST existir em pt-BR e en.

### Key Entities

- **Local**: lugar no mapa; ganha visibilidade para todos (default verdadeiro).
- **Arco**: agrupamento narrativo de locais; ganha a mesma visibilidade.
- **Personagem (NPC)**: já tem a flag; passa a respeitar locais ocultos nas associações públicas.
- **Saída / conexão entre locais**: na vista pública, só liga locais que o jogador pode ver.
- **Visibilidade**: tudo-ou-nada por campanha (como NPC hoje) — não por jogador individual.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em verificação automatizada, local oculto com NPC ligado e saída a partir de um local visível: o anónimo obtém **0** menções a esse local (lista, detalhe, saídas do local vizinho, locais do NPC).
- **SC-002**: Em verificação automatizada, arco oculto ligado a local visível: anónimo obtém **0** exposições do título/identificador do arco; o local continua presente com indicação de ausência de arco.
- **SC-003**: Em Modo edição, o mestre identifica locais/arcos ocultos pelo **mesmo** tipo de indicador já usado em NPC oculto (reconhecimento visual sem treino novo).
- **SC-004**: Após activar a funcionalidade numa mesa com conteúdo pré-existente, **100%** dos locais e arcos antigos permanecem visíveis ao jogador sem intervenção manual.
- **SC-005**: Isolamento: local/arco da campanha A nunca aparece em leituras públicas/admin da campanha B no teste de matriz.

## Assumptions

- Visibilidade continua **tudo-ou-nada por campanha** (como NPC); não há ACL por jogador nomeado.
- Ocultar um arco **não** oculta automaticamente os seus locais; cada local tem a sua própria flag.
- Personagens públicos ligados só a locais ocultos **continuam** listáveis (se a flag do personagem permitir); apenas a associação ao local é omitida.
- Ocultar um vínculo isoladamente (sem ocultar personagens) **não** muda nesta fase.
- Waypoints/rotas públicos que referenciem um local oculto tratam esse local como inexistente para o jogador (sem nova flag em waypoint).
- Export/import preserva as flags; ausência do campo em pacotes antigos = visível.

## Out of Scope

- Visibilidade por jogador individual ou por papel além de «público vs mestre».
- Ocultar um vínculo sem ocultar os personagens envolvidos.
- Novos tipos de «névoa de guerra» no mapa além desta flag.
- Alterar o modelo de Sessão para além da consistência de chips com locais ocultos (já coberta como edge case).
