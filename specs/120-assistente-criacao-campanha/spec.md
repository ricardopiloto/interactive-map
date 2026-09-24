# Feature Specification: Assistente de criação de campanha

**Feature Branch**: `120-assistente-criacao-campanha`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "Assistente de criação de campanha em /painel/novo (4 passos + sucesso), extraindo o formulário único do Painel. Mesma API de criação; pré-visualização ao vivo do género; slug automático e imutável; CTA do Painel navega para a rota nova. Critério-chave: /painel/novo bate com NovoCodexWizard passo a passo; campanha aparece de verdade em /painel e /explorar."

**Depends on**: Spec 110 (tokens); Spec 114 (chrome); Spec **119** (Home / Explorar / Painel — CTA «Criar novo codex» e destino `/explorar` / listagens). *Nota: o pedido referiu «spec 118» para esse CTA; neste repositório a feature das três telas é a **119**.*

**Phase**: Paridade estrutural com o protótipo — criação de campanha.

## Constitution *(constraints; not implementation)*

- Isolation (I): Sem endpoints novos; usa o POST de criação já existente. Matriz isolamento **N/A** (sem superfície HTTP nova).
- Testes primeiro (II): UI de polimento — quickstart MAY; criação continua coberta pelos testes de API já existentes se os houver; sem schema novo.
- Produção legada (III): Só produto Codex; MUST NOT tocar `/opt`.
- Simplicidade (IV): Um fluxo de assistente; MUST NOT duplicar a API de criação nem inventar segundo formulário paralelo no Painel.
- i18n (V): Copy nova do assistente (passos, avisos, sucesso) MUST ter pt-BR e en; nome/sistema digitados pelo mestre MUST NOT ser traduzidos.
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Assistente em `/painel/novo` (Priority: P1) 🎯 MVP

Um mestre autenticado abre **`/painel/novo`** e percorre um **assistente de 4 passos** com indicador de progresso: **Identidade** → **Sistema e género** → **Visibilidade** → **Revisão**. No passo 1, o **endereço (slug)** gera-se automaticamente a partir do nome (editável) com **aviso de imutabilidade**. No passo 2, escolher um **género** **re-skina a própria tela do assistente ao vivo** antes de confirmar. No passo 3 escolhe listada vs só por link. No passo 4 revê o resumo e confirma. Após sucesso, vê ecrã com **Abrir campanha** e **Ir para o painel**. O formulário embutido de criação no Painel **deixa de ser** o caminho principal.

**Why this priority**: Critério-chave visual e de fluxo vs. NovoCodexWizard.

**Independent Test**: Autenticado, abrir `/painel/novo`; percorrer os 4 passos; criar; sucesso; abrir campanha e voltar ao painel; capturar vs. protótipo.

**Acceptance Scenarios**:

1. **Given** mestre autenticado, **When** abre `/painel/novo`, **Then** vê o assistente com os quatro passos e indicador de progresso (não o formulário único inline do Painel).
2. **Given** passo Identidade, **When** digita o nome, **Then** o slug sugere-se automaticamente; pode editar o slug; vê aviso de que o endereço não muda depois.
3. **Given** passo Sistema e género, **When** selecciona um género, **Then** o tema visual do assistente actualiza de imediato (pré-visualização ao vivo).
4. **Given** passo Revisão, **When** confirma criar, **Then** a campanha é criada pela **mesma** API de criação já usada no Painel; segue-se o ecrã de sucesso com Abrir campanha e Ir para o painel.
5. **Given** visitante não autenticado, **When** tenta `/painel/novo`, **Then** é enviado ao login (mesmo padrão de protecção do Painel).

---

### User Story 2 - Entrada a partir do Painel (Priority: P1)

No **`/painel`**, o controlo **«Criar novo codex»** (ou equivalente i18n) **navega** para `/painel/novo` em vez de expandir/mostrar o formulário de criação inline. O Painel deixa de exigir o fieldset de criação embutido como fluxo normal (pode remover-se o formulário inline após o assistente existir).

**Why this priority**: Fecha a extracção do formulário; depende da US1.

**Independent Test**: Em `/painel`, clicar Criar → URL `/painel/novo`; cancelar no passo 1 regressa ao painel.

**Acceptance Scenarios**:

1. **Given** `/painel` autenticado, **When** o mestre activa «Criar novo codex», **Then** navega para `/painel/novo`.
2. **Given** assistente no passo 1, **When** cancela, **Then** regressa a `/painel` sem criar campanha.
3. **Given** assistente disponível, **When** o mestre usa só o Painel, **Then** não depende do formulário inline antigo para criar (formulário inline removido ou inacessível).

---

### User Story 3 - Campanha real nas listagens (Priority: P1)

Após criar com sucesso, a campanha **aparece de verdade** em **`/painel`** (minhas) e, se a visibilidade for listada, em **`/explorar`** (catálogo público), sem regressão face ao comportamento actual da API. Abrir campanha leva a `/c/:slug`.

**Why this priority**: Critério-chave de dados reais, não mock.

**Independent Test**: Criar listada → ver em painel e explorar; criar só por link → ver em painel, não no catálogo público (regras actuais de listagem).

**Acceptance Scenarios**:

1. **Given** criação bem-sucedida com visibilidade listada, **When** o mestre abre `/painel` e `/explorar`, **Then** a campanha aparece onde as regras actuais de listagem o exigem.
2. **Given** criação com «só por link», **When** consulta o catálogo público, **Then** a campanha **não** aparece como listada pública (comportamento actual preservado).
3. **Given** ecrã de sucesso, **When** escolhe Abrir campanha, **Then** navega para `/c/:slug` da campanha criada.

---

### Edge Cases

- Slug já existente: o assistente mostra erro compreensível (i18n) e não avança/cria até corrigir — mesmo tipo de falha que a API já devolve.
- Nome ou slug inválidos / curtos demais: não avança do passo Identidade (validação alinhada ao que o produto já exige).
- Falha de rede no POST: mensagem de erro; permanece no assistente (revisão ou passo actual) sem ecrã de sucesso falso.
- Campo «resumo» do protótipo: a API de criação actual **não** o inclui — MUST NOT inventar campo no backend nesta feature; o passo Identidade MAY omitir resumo ou mostrá-lo só se o contrato já o aceitar (default: **omitir** do payload e da UI persistente).
- Import ZIP / outros atalhos do Painel: fora do assistente; permanecem no Painel se já existirem.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST existir a rota autenticada `/painel/novo` com o fluxo de 4 passos + ecrã de sucesso alinhado ao NovoCodexWizard do protótipo.
- **FR-002**: A criação MUST usar o **mesmo** contrato de API (POST) e os **mesmos** campos que o formulário actual do Painel já envia (nome, slug, sistema, género, visibilidade); MUST NOT alterar o contrato do backend.
- **FR-003**: O passo Identidade MUST gerar slug a partir do nome automaticamente, permitir edição do slug, e avisar que o endereço é imutável depois.
- **FR-004**: O passo Sistema e género MUST aplicar pré-visualização ao vivo do tema do género na própria UI do assistente.
- **FR-005**: O passo Visibilidade MUST oferecer listada vs só por link (valores já suportados).
- **FR-006**: O passo Revisão MUST mostrar resumo das escolhas e o controlo final de criação.
- **FR-007**: Após sucesso, MUST mostrar Abrir campanha e Ir para o painel.
- **FR-008**: O CTA «Criar novo codex» em `/painel` MUST navegar para `/painel/novo`; o formulário inline de criação MUST deixar de ser o fluxo principal (remover ou desactivar).
- **FR-009**: Strings novas MUST existir em pt-BR e en.
- **FR-010**: MUST NOT mudar o que as APIs de catálogo / minhas / criação devolvem além do efeito normal de uma criação bem-sucedida.

### Key Entities

- **Assistente de criação**: Fluxo multi-passo em `/painel/novo` (rascunho local até ao POST).
- **Rascunho de campanha**: nome, slug, sistema, género, visibilidade (e opcionalmente UI-only fields não persistidos).
- **Campanha criada**: Resultado do POST; visível conforme regras de listagem existentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Captura de `/painel/novo` alinhada ao NovoCodexWizard do protótipo em cada passo e no sucesso — sem diferença a olho nu (claro/escuro / géneros).
- **SC-002**: Em 100% das criações bem-sucedidas via assistente, a campanha aparece em `/painel`; se listada, também em `/explorar` segundo as regras actuais.
- **SC-003**: 100% dos CTAs «Criar novo codex» do Painel levam a `/painel/novo` (0 dependência do formulário inline como caminho principal).
- **SC-004**: Pré-visualização de género no passo 2 altera o tema do assistente antes do POST (revisão manual &lt; 1 minuto).
- **SC-005**: Nenhuma alteração de contrato de API; criação falha/sucesso comporta-se como o formulário antigo face ao backend.

## Assumptions

- Spec **119** entrega (ou entregará) `/explorar` e o CTA do Painel; esta feature só muda o destino do CTA para `/painel/novo`.
- Campos enviados = os do `campanhasApi.criar` actual; **resumo** do protótipo fica fora do POST.
- Slugify (normalização) pode seguir a convenção já usada no Painel/produto ou a do protótipo, desde que o valor final seja válido para a API.
- Auth: mesma guarda que `/painel` (redirect para login com `next`).
- Import e gestão pós-criação (capa, unidade, etc.) permanecem no Painel, não no assistente.
