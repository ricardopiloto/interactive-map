# Feature Specification: Crônica de sessões

**Feature Branch**: `112-cronica-sessoes`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "Crônica de sessões. Nova entidade Sessão (número, título, rótulo de data livre, resumo Markdown, N:N com locais e personagens, visível_para_todos). Isolada por campanha. CRUD admin em Modo edição; lista pública cronológica em `/c/:slug/sessoes` com chips e i18n. Numeração sugerida editável. Fora: geração automática de resumo; edição colaborativa em tempo real. Depende de 110. Critério-chave: sessão oculta não aparece ao anónimo; isolamento entre campanhas."

**Depends on**: [110-paridade-tokens-prototipo](../110-paridade-tokens-prototipo/spec.md) (tokens / forma visual); [107-formularios-edicao](../107-formularios-edicao/spec.md) (Drawer / Markdown / ConfirmDialog); [102-estrutura-navegacao](../102-estrutura-navegacao/spec.md) (chrome / Modo edição); [094-roteamento-campanha](../094-roteamento-campanha/spec.md) (campanha.db por slug). Padrão de visibilidade: NPC / `personagem_visibility`. Convenção de rótulo de data: `Local.data_sessao` (texto livre, não data tipada).

**Phase**: Conteúdo de mesa pós-UX. Entrega a **crônica de sessões** pedida na pesquisa: entidade própria (não reutilizar `data_sessao` do local), lista para jogadores, e gestão pelo mestre em Modo edição.

## Clarifications

### Session 2026-09-22

- Q: Onde a crônica entra na navegação da mesa? → A *(default no plano — clarify não respondido)*: **Novo item no chrome** (ao lado de Mapa / Relações) e na **barra inferior móvel**.
- Q: O número da sessão pode repetir-se na mesma campanha? → A *(default no plano)*: **Único por campanha** — gravar duplicado falha com código mapeável (`NUMERO_DUPLICADO`).
- Q: «Não aparece … nos endpoints de local/personagem»? → A *(default no plano)*: Filtragem em **API/lista/detalhe de sessões** apenas; listagens actuais de local/NPC **não mudam**. Se no futuro existirem «sessões deste local/personagem», MUST filtrar da mesma forma (fora do MVP desta fase — não criar esses endpoints agora).

## Constitution

- Isolamento (I): Sessão vive só no SQLite da campanha do slug; rotas novas (`/api/c/{slug}/…`) MUST entrar na matriz — pedido a campanha A MUST NOT devolver Sessão de B (autenticado e anónimo).
- Testes primeiro (II): isolamento entre campanhas; sessão com `visivel_para_todos=false` ausente na superfície pública para anónimo; CRUD admin autenticado — testes a falhar antes da implementação correspondente.
- Produção legada (III): MUST NOT tocar `/opt/codex-*`.
- Simplicidade (IV): uma entidade + ligações N:N; reutilizar Drawer/Markdown/ConfirmDialog/Toast; sem motor de pesquisa nem sync em tempo real.
- i18n (V): copy da lista, formulário, vazios e erros MUST ter pt-BR e en. Título, rótulo de data e resumo do mestre MUST NOT ser traduzidos.
- Migrações (VI): tabelas novas em **campanha.db** MUST ser Alembic `render_as_batch`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lista pública da crônica (Priority: P1)

Jogadores (e anónimos com acesso à campanha) abrem a rota pública da crônica e vêem as sessões **visíveis**, da **mais recente para a mais antiga**, cada uma com número, título, rótulo de data (texto livre), resumo em Markdown renderizado com segurança, e **chips** dos locais e personagens citados. Clicar num chip leva à selecção desse local no Mapa ou desse personagem em Relações (quando aplicável). Sessões marcadas como não visíveis para todos **não** aparecem.

**Why this priority**: Critério-chave de produto — a lacuna da pesquisa; valor imediato para a mesa.

**Independent Test**: Campanha com 3 sessões (uma oculta); anónimo vê 2 na ordem correcta; chips navegam; i18n pt-BR e en na chrome da página.

**Acceptance Scenarios**:

1. **Given** campanha com sessões 1, 2 e 3 (3 oculta), **When** anónimo abre a lista pública, **Then** vê 2 e 1 (mais recente primeiro) e **não** vê a 3.
2. **Given** sessão visível com locais e personagens ligados, **When** a lista renderiza, **Then** aparecem chips com os nomes e a activação navega para Mapa/Relações com esse item seleccionável.
3. **Given** UI em inglês, **When** se abre a crônica, **Then** rótulos de página/vazio/erros estão em en (conteúdo do mestre intacto).
4. **Given** nenhuma sessão visível, **When** se abre a lista, **Then** estado vazio claro (sem erro).

---

### User Story 2 - Mestre gere sessões em Modo edição (Priority: P1)

Em Modo edição, o mestre cria, edita e exclui sessões (confirmação ao excluir). O formulário inclui número (sugerido = maior existente + 1, editável), título, rótulo de data livre, resumo Markdown, selecção de locais e de personagens/NPCs, e o interruptor de visibilidade (padrão: visível para todos). Fora de Modo edição, não há controlos de escrita.

**Why this priority**: Sem CRUD não há crônica sustentável.

**Independent Test**: Criar com número sugerido; editar; ocultar e verificar lista pública; excluir com confirmação; anónimo/co-mestre sem edição não escreve.

**Acceptance Scenarios**:

1. **Given** Modo edição e já existem sessões 1 e 4, **When** o mestre inicia criação, **Then** o número sugerido é **5** (editável antes de gravar).
2. **Given** rascunho válido, **When** grava, **Then** a sessão aparece na lista (se visível) e persiste após recarregar.
3. **Given** sessão existente, **When** o mestre a marca como não visível para todos e grava, **Then** anónimo deixa de a ver na lista pública.
4. **Given** exclusão confirmada, **When** conclui, **Then** a sessão e as suas ligações desaparecem; cancelar no diálogo não apaga.
5. **Given** Modo edição desligado, **When** se visita a crônica, **Then** não há botões de criar/editar/excluir.

---

### User Story 3 - Isolamento e superfície pública segura (Priority: P1)

A Sessão da campanha A nunca aparece em pedidos à campanha B. Endpoints públicos de sessão (e qualquer superfície pública que exponha sessões ligadas a local/personagem, conforme clarificação) respeitam `visivel_para_todos` para quem não é mestre da mesa.

**Why this priority**: Constituição I + critério-chave de ocultação.

**Independent Test**: Matriz isolamento A/B; anónimo vs dono na mesma campanha.

**Acceptance Scenarios**:

1. **Given** sessão só em A, **When** se pede listagem/detalhe em B (auth ou anónimo), **Then** a sessão de A **não** aparece (404/lista vazia sem vazamento).
2. **Given** sessão oculta em A, **When** anónimo pede a superfície pública de sessões de A, **Then** não a recebe; o dono em Modo edição **vê**/edita.
3. **Given** personagem ou local só ligado a sessão oculta, **When** anónimo usa a lista pública de sessões, **Then** essa sessão continua oculta (não há bypass pelos chips).

---

### Edge Cases

- Número sugerido com tabela vazia → 1.
- Título ou resumo vazios → validação clara (mínimo definido no plano; título obrigatório).
- Local/personagem apagado depois de ligado → ligação removida ou chip omitido sem partir a página.
- Personagem oculto ao jogador: na lista pública de sessões, chips de personagem/local MUST omitir entradas que o jogador não poderia ver (`visivel_para_todos=false` no personagem).
- Concorrência de dois mestres com o mesmo número sugerido → segundo create falha com `NUMERO_DUPLICADO`.
- Markdown malicioso no resumo → renderização segura (mesmo padrão dos outros campos Markdown).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST persistir **Sessão** por campanha com: número (inteiro), título, rótulo de data (texto livre, como `data_sessao`), resumo (Markdown), `visivel_para_todos` (bool, default true), e ligações N:N a **Locais** e a **personagens/NPCs** (entidade de personagem já usada na mesa).
- **FR-002**: `Local.data_sessao` MUST permanecer como está (rótulo solto); MUST NOT ser migrado automaticamente para Sessão nesta fase.
- **FR-003**: MUST existir CRUD autenticado de Sessão apenas com permissão de escrita da mesa (Modo edição na UI); exclusão MUST pedir confirmação.
- **FR-004**: MUST existir superfície/API pública de listagem de sessões filtrando `visivel_para_todos` para o jogador anónimo (e equivalentes sem privilégio de mestre), ordenada da mais recente para a mais antiga.
- **FR-005**: A UI pública MUST viver em `/c/:slug/sessoes` (tokens da fase 110+); chips de local/personagem MUST permitir ir ao Mapa/Relações com selecção útil.
- **FR-006**: Ao criar, o sistema MUST sugerir número = (maior número existente na campanha) + 1; o mestre MUST poder alterar o valor antes de gravar.
- **FR-007**: Pedidos HTTP de sessão da campanha A MUST NOT expor dados da campanha B (teste de isolamento obrigatório).
- **FR-008**: Copy de UI (lista, formulário, vazios, erros) MUST existir em pt-BR e en; conteúdo do mestre MUST NOT ser traduzido.
- **FR-009**: A crônica MUST aparecer no chrome da mesa (desktop) e na barra inferior móvel, ao lado de Mapa / Relações.
- **FR-010**: O número da sessão MUST ser único por campanha; conflito → erro claro ao gravar.
- **FR-011**: Chips na lista pública MUST omitir personagens não visíveis ao jogador; MUST NOT alterar os payloads das listagens existentes de local/NPC.

### Key Entities

- **Sessão**: entrada da crônica da campanha; número, título, rótulo de data, resumo, visibilidade; ligações a locais e a personagens.
- **Local** / **Personagem (NPC)**: entidades existentes; referenciadas pela Sessão sem alterar o significado de `data_sessao`.
- **Visibilidade**: mesmo conceito que `NPC.visivel_para_todos` — default público; false = só superfície de mestre.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste automatizado, sessão com `visivel_para_todos=false` aparece **0** vezes na listagem pública para anónimo e **1** vez na superfície de mestre.
- **SC-002**: Em teste de isolamento, **0** sessões da campanha A são devolvidas por pedidos à campanha B.
- **SC-003**: Com N sessões visíveis numeradas, a lista pública mostra-as por ordem decrescente de número em **100%** dos casos de teste.
- **SC-004**: Um mestre completa criar → editar visibilidade → confirmar exclusão sem sair da crônica; jogador vê só o que é público após cada passo.
- **SC-005**: UI da crônica (vazios, acções, erros) está completa em pt-BR e en.

## Assumptions

- «Mais recente» = maior **número** (não parsing do rótulo de data).
- «Personagem» nas ligações = registos da tabela/modelo de NPC/personagem já usado em Relações (PJ e NPC).
- Resumo usa o mesmo componente Markdown seguro dos formulários 107.
- Chips públicos omitem personagens (e, se aplicável, locais) que o jogador não poderia ver por visibilidade — default prudente até clarificar navegação.
- Spec 110 (e 111 se já no ar) fornecem tokens; esta fase não redesenha o sistema visual.
- Fora de escopo: gerar resumo a partir de áudio/transcrição; edição colaborativa em tempo real; substituir `data_sessao` nos locais.

## Out of Scope

- Geração automática de resumo (roadmap «Depois»).
- Edição colaborativa / tempo real.
- Migrar ou sincronizar `Local.data_sessao` → Sessão.
- Feed global entre campanhas; export especial só de crônica (usa export de campanha existente quando houver).
