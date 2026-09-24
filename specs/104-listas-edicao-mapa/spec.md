# Feature Specification: Listas e edição no mapa

**Feature Branch**: `104-listas-edicao-mapa`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Listas e edição no mapa. Locais agrupados por arco com seções recolhíveis (sem repetir o rótulo do arco). Linhas compactas no lugar de cards grandes. Editar e Excluir só no Modo edição, no hover ou no menu de três pontos, com ConfirmDialog para excluir e o estilo de perigo só na confirmação. NPCs com avatar e ponto de status. Estados vazios em vez de texto solto. Depende de: UX-2, UX-3. Critério-chave: fora do Modo edição nenhuma ação de mestre aparece; um jogador vê a mesma lista sem botões."

**Depends on**: [101-componentes-base-icones](../101-componentes-base-icones/spec.md) (UX-2); [102-estrutura-navegacao](../102-estrutura-navegacao/spec.md) (UX-3 — Implemented); [103-mapa](../103-mapa/spec.md) (UX-4 — Implemented); RFC ([docs/v2/rfc-ux-redesign.md](../../docs/v2/rfc-ux-redesign.md) fase UX-5); constituição v1.0.0 (III, IV, V). Coordena com o palco do mapa sem redesenhar pinos/popover.

**Phase**: UX-5. Apresentação das **listas** na coluna do mapa (locais, NPCs e afins tocados nesta fase). **MUST NOT** alterar API/dados. Aprofunda o **Modo edição** da UX-3: fora dele, zero acções de mestre nas listas.

## Clarifications

### Session 2026-09-21

- Q: As secções de arco na lista de locais iniciam como? → A: Todas **expandidas**
- Q: Como aparecem Editar / Excluir com Modo edição ligado? → A: Hover na linha (desktop) **e** menu ⋮ (sempre no modo edição; obrigatório no toque)
- Q: Com Modo edição ligado, a coluna de Locais/NPCs usa? → B: Continuar a trocar para listas admin actuais (`LocalAdminList` / `NpcAdminList`), só com visual alinhado
- Q: Quais listas admin entram nesta fase? → A: Locais, NPCs **e** Arcos (`LocalAdminList`, `NpcAdminList`, `ArcoAdminList`)
- Q: O indicador de status do NPC na lista mostra? → A: Ponto colorido **e** rótulo de texto (Vivo / Morto / …)

## Constitution

- Isolamento (I): listas continuam no âmbito da campanha do slug; sem rotas novas de conteúdo.
- Testes primeiro (II): «fora do Modo edição nenhuma acção de mestre» MUST ser verificável (jogador/anónimo vs mestre com edição ligada/desligada).
- Produção legada (III): MUST NOT tocar `/opt/codex-*`.
- Simplicidade (IV): reutilizar ConfirmDialog, DropdownMenu, EmptyState, Chip/Avatar patterns da UX-2; tokens UX-1.
- i18n (V): copy nova (secções, vazios, menus, confirmações) MUST ter pt-BR e en. Conteúdo do mestre MUST NOT ser traduzido.
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Locais por arco, linhas compactas (Priority: P1)

Um jogador ou mestre vê a lista de locais **agrupada por arco**, com **secções recolhíveis**. As secções **começam todas expandidas**. O nome do arco aparece **uma vez** por secção (não repetido em cada linha). Cada local é uma **linha compacta**, não um card grande.

**Why this priority**: Diagnóstico do RFC (rótulo de arco repetido; cards grandes); melhora leitura da coluna.

**Independent Test**: Campanha com vários arcos e locais; secções iniciam expandidas e recolhem/expandem; nenhum card local repete o título do arco; densidade visual é de linhas.

**Acceptance Scenarios**:

1. **Given** locais em mais de um arco, **When** se abre a lista de locais, **Then** estão agrupados por arco com cabeçalho de secção único e **todas** as secções começam **expandidas**.
2. **Given** uma secção de arco, **When** o utilizador a recolhe, **Then** os locais desse arco ocultam-se; ao expandir, voltam.
3. **Given** a lista, **When** se inspecciona cada local, **Then** o rótulo do arco **não** está repetido em cada linha — só no cabeçalho da secção.
4. **Given** a lista, **When** se compara com o padrão antigo de cards grandes, **Then** cada local ocupa uma linha compacta (altura/informação alinhada a «lista», não a «cartão promocional»).

---

### User Story 2 - Acções de mestre só no Modo edição (Priority: P1)

**Editar** e **Excluir** (e demais acções de mestre nas listas desta fase) aparecem **somente** com **Modo edição** ligado, e só para quem pode editar (UX-3/095). Com o modo ligado, a coluna **troca** para as listas admin existentes (`LocalAdminList` / `NpcAdminList`), **reestilizadas** para linhas compactas (agrupamento por arco, hover + ⋮, ConfirmDialog). Com o modo desligado, a lista de leitura (SideMenu) **não** mostra acções de mestre. No desktop admin, Editar/Excluir no **hover**; o **menu ⋮** está disponível (obrigatório no toque). Excluir usa **ConfirmDialog**; perigo **só** na confirmação.

**Why this priority**: Critério-chave da fase e do RFC (divulgação progressiva; um primário/perigo contido).

**Independent Test**: Anónimo / modo edição off → SideMenu sem Editar/Excluir. Modo edição on → listas admin compactas com hover/⋮; excluir pede ConfirmDialog com perigo na confirmação.

**Acceptance Scenarios**:

1. **Given** Modo edição desligado (ou utilizador sem permissão), **When** vê a lista de locais/NPCs na coluna, **Then** **não** há controlos Editar/Excluir nem menu de mestre nessas linhas.
2. **Given** Modo edição ligado e permissão, **When** a coluna mostra Locais, NPCs ou Arcos, **Then** usa as listas admin correspondentes (não a lista de leitura) com visual de linhas compactas e acções no hover (desktop) e/ou ⋮.
3. **Given** Modo edição ligado em viewport de toque, **When** abre o menu ⋮ numa linha, **Then** pode Editar ou Excluir.
4. **Given** Excluir escolhido, **When** confirma, **Then** vê ConfirmDialog; o estilo de perigo está na confirmação (não como botão vermelho permanente na lista). Cancelar não exclui.
5. **Given** a mesma campanha, **When** um jogador e um mestre com modo desligado comparam a lista de leitura, **Then** a estrutura (grupos e linhas) é a mesma — sem acções de mestre.
---

### User Story 3 - NPCs com avatar e estado; vazios claros (Priority: P1)

A lista de NPCs/personagens na coluna do mapa mostra **avatar** (retrato quando existe) e um **ponto de status** com **rótulo textual** (Vivo / Morto / … — i18n). Listas sem itens usam **EmptyState** (ou equivalente UX-2), não uma frase solta sem contexto.

**Why this priority**: Completa a coluna; vazios evitam UI «quebrada».

**Independent Test**: NPC com e sem retrato; status por ponto **e** texto; lista vazia mostra estado vazio convidativo (i18n).

**Acceptance Scenarios**:

1. **Given** personagens na lista, **When** se observam, **Then** cada um tem avatar (retrato ou placeholder discreto) e indicador de status com ponto colorido **e** rótulo de texto.
2. **Given** lista de locais ou NPCs sem itens, **When** o utilizador a abre, **Then** vê um estado vazio compreensível (pt-BR/en), não texto solto tipo erro técnico ou string órfã.

---

### Edge Cases

- Local sem arco: MUST aparecer numa secção «sem arco» / equivalente i18n, sem inventar arco fantasma nos dados.
- Modo edição liga/desliga: acções MUST aparecer/desaparecer de imediato sem recarregar a página.
- Confirmação de exclusão: MUST usar ConfirmDialog da UX-2 (não `window.confirm`).
- Edição abre o formulário/diálogo já existente (ou UX-8 no futuro); esta fase MUST NOT redesenhar o formulário completo — só o ponto de entrada na lista.
- Telemóvel: hover pode não existir — o menu de três pontos MUST bastar para Editar/Excluir no Modo edição.
- `/opt/codex-*` intocado; sem mudança de API.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Lista de locais MUST agrupar por arco em secções recolhíveis; o rótulo do arco MUST aparecer uma vez por secção (não por linha). Secções MUST iniciar **todas expandidas**.
- **FR-002**: Cada local na lista MUST ser apresentado como linha compacta (não card grande).
- **FR-003**: Acções Editar e Excluir (e outras acções de mestre nas listas desta fase) MUST aparecer **somente** com Modo edição activo e permissão de editar. Com o modo ligado, a coluna MUST usar as listas admin existentes **`LocalAdminList`**, **`NpcAdminList`** e **`ArcoAdminList`**, reestilizadas (linhas compactas; Locais com agrupamento por arco). Em desktop: acções no **hover** da linha **e** via menu ⋮. Em viewport sem hover (toque): o menu ⋮ MUST ser suficiente. Com o modo desligado, a lista de leitura MUST NÃO mostrar essas acções.
- **FR-004**: Excluir MUST usar ConfirmDialog; estilo de perigo MUST restringir-se à confirmação.
- **FR-005**: Fora do Modo edição, MUST NOT haver acções de mestre nas listas (critério-chave). Jogador e mestre com modo off vêem a mesma lista de **leitura** sem esses botões.
- **FR-006**: Lista de NPCs/personagens (coluna do mapa, leitura e admin) MUST mostrar avatar e indicador de status com **ponto colorido e rótulo textual** (i18n).
- **FR-007**: Listas vazias MUST usar estado vazio (EmptyState / padrão UX-2), com copy pt-BR e en.
- **FR-008**: MUST NOT alterar contratos de API nem schema. MUST NOT redesenhar o palco do mapa (UX-4) nem o chrome global (UX-3) além de consumir o estado «Modo edição».
- **FR-009**: MUST NOT exigir `/opt/codex-*`.

### Out of Scope

- Redesenho de pinos, zoom, popover do mapa (UX-4).
- Rede de Relações, rotas, drawers de formulário completos (UX-6–UX-8).
- Novos campos de dados, filtros avançados, ou API.
- Contas/login (095).

### Key Entities

- **Secção de arco**: cabeçalho + lista recolhível de linhas de local.
- **Linha de local / personagem**: apresentação compacta; acções condicionadas ao Modo edição.
- **Modo edição**: estado da UX-3; porta das acções de mestre nesta fase.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com Modo edição **desligado**, uma revisão da coluna do mapa encontra **zero** botões/menus de Editar ou Excluir (e equivalentes de mestre) nas listas.
- **SC-002**: Com Modo edição **ligado** (utilizador autorizado), Editar/Excluir estão acessíveis por hover (desktop) e menu ⋮; no toque via ⋮; excluir passa por ConfirmDialog com perigo só na confirmação.
- **SC-003**: Um jogador e um mestre com modo off vêem a **mesma** estrutura de lista (grupos e linhas), sem acções de mestre.
- **SC-004**: Em campanha com vários arcos, o nome de cada arco aparece **uma vez** por secção, não em cada linha de local.
- **SC-005**: Lista vazia mostra estado vazio i18n; não uma string solta sem contexto.

## Assumptions

- «Modo edição» é o controlo único da UX-3 (ex-`isGm` / sessão com permissão).
- ConfirmDialog e DropdownMenu da UX-2 estão disponíveis.
- Abas Locais/NPCs/Arcos existentes mantêm-se; com Modo edição a coluna continua a trocar para `LocalAdminList` / `NpcAdminList` / `ArcoAdminList`, alinhados visualmente a linhas compactas.
- Locais sem `arco_id` → secção dedicada (leitura e admin).
- CHANGELOG `[Unreleased]`; sem `/opt`; SemVer só se o plano exigir.

## Notes

- Diagnóstico RFC: rótulo de arco repetido; Editar/Excluir sempre visíveis; cards grandes.
- Critério-chave: fora do Modo edição, nenhuma acção de mestre; jogador vê a mesma lista sem botões.
- Clarify 2026-09-21 fechado (5/5): secções expandidas; hover+⋮; listas admin reestilizadas (não unificar); Locais+NPCs+Arcos; status ponto+texto.
- Próximo: `/speckit-plan`.
